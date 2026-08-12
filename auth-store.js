import { DurableObject } from "cloudflare:workers";

const enc = new TextEncoder();
const clean = (v, max = 300) => String(v ?? "").trim().slice(0, max);
const hex = bytes => Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
const unhex = value => new Uint8Array((String(value).match(/.{1,2}/g) || []).map(x => parseInt(x, 16)));
const randomHex = (n = 32) => { const b = new UintArray?new Uint8Array(n):new Uint8Array(n); crypto.getRandomValues(b); return hex(b); };
const sha256Hex = async value => hex(new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(String(value)))));
const publicUser = row => row ? ({id:row.id,email:row.email,displayName:row.display_name,role:row.role,status:row.status,verified:Boolean(row.verified),createdAt:row.created_at}) : null;
const DUMMY_SALT='d4a956ba3fe05dcf71c1bdb319266c9a';

async function passwordHash(password, saltHex) {
  const key = await crypto.subtle.importKey("raw", enc.encode(String(password).slice(0,128)), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({name:"PBKDF2",salt:unhex(saltHex),iterations:210000,hash:"SHA-256"}, key, 256);
  return hex(new Uint8Array(bits));
}
async function safeHexEqual(a, b) {
  const aa = unhex(a), bb = unhex(b);
  if (!aa.length || aa.length !== bb.length) return false;
  if(crypto.subtle.timingSafeEqual)return crypto.subtle.timingSafeEqual(aa,bb);
  let diff=0;for(let i=0;i<aa.length;i++)diff|=aa[i]^bb[i];return diff===0;
}

export class EntegoAuth extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        display_name TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        verified INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        user_agent TEXT NOT NULL DEFAULT ''
      );
      CREATE TABLE IF NOT EXISTS booking_access (
        booking_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        access_role TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (booking_id,user_id)
      );
      CREATE TABLE IF NOT EXISTS rate_limits (
        bucket TEXT PRIMARY KEY,
        hits INTEGER NOT NULL DEFAULT 0,
        reset_at INTEGER NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
      CREATE INDEX IF NOT EXISTS idx_booking_access_user ON booking_access(user_id);
      CREATE INDEX IF NOT EXISTS idx_users_role_verified ON users(role,verified);
      CREATE INDEX IF NOT EXISTS idx_rate_limit_reset ON rate_limits(reset_at);
    `);
  }

  async consumeRateLimit(scope,key,limit,windowSeconds){const safeLimit=Math.max(1,Math.min(1000,Number(limit)||1)),window=Math.max(1,Math.min(86400,Number(windowSeconds)||60)),bucket=await sha256Hex(`${clean(scope,80)}:${String(key||'unknown').slice(0,300)}`),now=Date.now();this.sql.exec(`DELETE FROM rate_limits WHERE reset_at<?`,now);const row=this.sql.exec(`SELECT hits,reset_at FROM rate_limits WHERE bucket=? LIMIT 1`,bucket).toArray()[0];if(!row||Number(row.reset_at)<=now){const reset=now+window*1000;this.sql.exec(`INSERT INTO rate_limits(bucket,hits,reset_at,updated_at) VALUES(?,1,?,?) ON CONFLICT(bucket) DO UPDATE SET hits=1,reset_at=excluded.reset_at,updated_at=excluded.updated_at`,bucket,reset,new Date().toISOString());return {ok:true,remaining:safeLimit-1,retryAfter:window}}if(Number(row.hits)>=safeLimit)return {ok:false,remaining:0,retryAfter:Math.max(1,Math.ceil((Number(row.reset_at)-now)/1000))};this.sql.exec(`UPDATE rate_limits SET hits=hits+1,updated_at=? WHERE bucket=?`,new Date().toISOString(),bucket);return {ok:true,remaining:Math.max(0,safeLimit-Number(row.hits)-1),retryAfter:Math.max(1,Math.ceil((Number(row.reset_at)-now)/1000))}}
  async resetRateLimit(scope,key){const bucket=await sha256Hex(`${clean(scope,80)}:${String(key||'unknown').slice(0,300)}`);this.sql.exec(`DELETE FROM rate_limits WHERE bucket=?`,bucket);return true}

  async createSession(userId, userAgent = "") {
    const rawToken = randomHex(32);
    const tokenHash = await sha256Hex(rawToken);
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    this.sql.exec(`DELETE FROM sessions WHERE expires_at <= ?`, now.toISOString());
    this.sql.exec(`INSERT INTO sessions (token_hash,user_id,expires_at,created_at,user_agent) VALUES (?,?,?,?,?)`, tokenHash, userId, expires.toISOString(), now.toISOString(), clean(userAgent, 300));
    return {token:rawToken,expiresAt:expires.toISOString()};
  }

  async register(input, userAgent = "") {
    const email = clean(input.email, 160).toLowerCase();
    const password = String(input.password || "");
    const displayName = clean(input.displayName, 100);
    const role = clean(input.role || "customer", 20);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("INVALID_EMAIL");
    if (password.length < 8 || password.length > 128) throw new Error("INVALID_PASSWORD");
    if (!displayName) throw new Error("DISPLAY_NAME_REQUIRED");
    if (!["customer","partner"].includes(role)) throw new Error("INVALID_ROLE");
    const exists = this.sql.exec(`SELECT id FROM users WHERE email = ? LIMIT 1`, email).toArray()[0];
    if (exists) throw new Error("EMAIL_EXISTS");
    const id = `USR-${crypto.randomUUID()}`;
    const salt = randomHex(16);
    const hash = await passwordHash(password, salt);
    const now = new Date().toISOString();
    this.sql.exec(`INSERT INTO users (id,email,password_hash,password_salt,display_name,role,status,verified,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`, id,email,hash,salt,displayName,role,"active",role === "customer" ? 1 : 0,now,now);
    const session = await this.createSession(id, userAgent);
    return {user:await this.getUser(id),...session};
  }

  async login(input, userAgent = "") {
    const email = clean(input.email, 160).toLowerCase();
    const password = String(input.password || "");
    const row = this.sql.exec(`SELECT * FROM users WHERE email = ? LIMIT 1`, email).toArray()[0];
    if (!row || row.status !== "active" || password.length<1 || password.length>128){await passwordHash(password,DUMMY_SALT);throw new Error("INVALID_CREDENTIALS")}
    const hash = await passwordHash(password, row.password_salt);
    if (!(await safeHexEqual(hash, row.password_hash))) throw new Error("INVALID_CREDENTIALS");
    const session = await this.createSession(row.id, userAgent);
    return {user:publicUser(row),...session};
  }

  async getUser(id) {
    return publicUser(this.sql.exec(`SELECT * FROM users WHERE id = ? LIMIT 1`, clean(id, 100)).toArray()[0]);
  }

  async getSession(rawToken) {
    if (!rawToken) return null;
    const tokenHash = await sha256Hex(rawToken);
    const row = this.sql.exec(`SELECT s.expires_at,u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash = ? LIMIT 1`, tokenHash).toArray()[0];
    if (!row) return null;
    if (row.expires_at <= new Date().toISOString()) { this.sql.exec(`DELETE FROM sessions WHERE token_hash = ?`, tokenHash); return null; }
    return publicUser(row);
  }

  async listSessions(userId,currentRawToken=''){const uid=clean(userId,100),currentHash=currentRawToken?await sha256Hex(currentRawToken):'';this.sql.exec(`DELETE FROM sessions WHERE expires_at<=?`,new Date().toISOString());return this.sql.exec(`SELECT token_hash,expires_at,created_at,user_agent FROM sessions WHERE user_id=? ORDER BY created_at DESC`,uid).toArray().map(r=>({id:r.token_hash.slice(0,16),expiresAt:r.expires_at,createdAt:r.created_at,userAgent:r.user_agent,current:r.token_hash===currentHash}))}
  async revokeSession(userId,sessionId){const uid=clean(userId,100),sid=clean(sessionId,32);if(!uid||sid.length<8)return false;this.sql.exec(`DELETE FROM sessions WHERE user_id=? AND substr(token_hash,1,?)=?`,sid.length,uid,sid);return true}
  async revokeOtherSessions(userId,currentRawToken){const uid=clean(userId,100),currentHash=currentRawToken?await sha256Hex(currentRawToken):'';if(!currentHash)return false;this.sql.exec(`DELETE FROM sessions WHERE user_id=? AND token_hash<>?`,uid,currentHash);return true}
  async logout(rawToken) {
    if (!rawToken) return true;
    this.sql.exec(`DELETE FROM sessions WHERE token_hash = ?`, await sha256Hex(rawToken));
    return true;
  }
  async logoutAll(userId){this.sql.exec(`DELETE FROM sessions WHERE user_id=?`,clean(userId,100));return true}

  async bindBooking(userId, bookingId, accessRole = "customer") {
    const uid=clean(userId,100),bid=clean(bookingId,120),role=clean(accessRole,20);
    if(!uid||!bid||!["customer","partner"].includes(role))throw new Error("INVALID_BOOKING_ACCESS");
    this.sql.exec(`INSERT INTO booking_access (booking_id,user_id,access_role,created_at) VALUES (?,?,?,?) ON CONFLICT(booking_id,user_id) DO UPDATE SET access_role=excluded.access_role`,bid,uid,role,new Date().toISOString());
    return true;
  }

  async canAccessBooking(userId, role, bookingId) {
    if(role==="admin")return true;
    const row=this.sql.exec(`SELECT access_role FROM booking_access WHERE booking_id=? AND user_id=? LIMIT 1`,clean(bookingId,120),clean(userId,100)).toArray()[0];
    return Boolean(row && row.access_role===role);
  }

  async listBookingIds(userId, role) {
    if(role==="admin")return [];
    return this.sql.exec(`SELECT booking_id FROM booking_access WHERE user_id=? AND access_role=? ORDER BY created_at DESC`,clean(userId,100),clean(role,20)).toArray().map(x=>x.booking_id);
  }

  async getBookingParticipants(bookingId) {
    return this.sql.exec(`SELECT u.id,u.display_name,u.role,u.status,u.verified,u.created_at,ba.access_role FROM booking_access ba JOIN users u ON u.id=ba.user_id WHERE ba.booking_id=? ORDER BY CASE ba.access_role WHEN 'customer' THEN 0 WHEN 'partner' THEN 1 ELSE 2 END`,clean(bookingId,120)).toArray().map(r=>({id:r.id,displayName:r.display_name,role:r.role,accessRole:r.access_role,status:r.status,verified:Boolean(r.verified),createdAt:r.created_at}));
  }

  async assignPartner(bookingId, partnerUserId) {
    const user=await this.getUser(partnerUserId);
    if(!user||user.role!=="partner"||user.status!=="active")return false;
    return this.bindBooking(user.id,bookingId,"partner");
  }

  async listPartners(limit=100) {
    const safeLimit=Math.max(1,Math.min(200,Number(limit)||100));
    return this.sql.exec(`SELECT * FROM users WHERE role='partner' ORDER BY verified ASC,created_at DESC LIMIT ?`,safeLimit).toArray().map(publicUser);
  }

  async setPartnerVerification(userId, verified) {
    const uid=clean(userId,100),row=this.sql.exec(`SELECT * FROM users WHERE id=? AND role='partner' LIMIT 1`,uid).toArray()[0];
    if(!row)return null;
    this.sql.exec(`UPDATE users SET verified=?,updated_at=? WHERE id=?`,verified?1:0,new Date().toISOString(),uid);
    return this.getUser(uid);
  }

  async promoteAdmin(email) {
    const safeEmail = clean(email, 160).toLowerCase();
    const row = this.sql.exec(`SELECT id FROM users WHERE email = ? LIMIT 1`, safeEmail).toArray()[0];
    if (!row) return null;
    const now = new Date().toISOString();
    this.sql.exec(`UPDATE users SET role='admin', verified=1, updated_at=? WHERE id=?`, now, row.id);
    return this.getUser(row.id);
  }
}
