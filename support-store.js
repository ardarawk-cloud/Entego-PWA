import {DurableObject} from 'cloudflare:workers';
const clean=(v,max=2000)=>String(v??'').trim().slice(0,max);
export class EntegoSupport extends DurableObject{
 constructor(ctx,env){super(ctx,env);this.sql=ctx.storage.sql;this.sql.exec(`
  CREATE TABLE IF NOT EXISTS support_cases(
   id TEXT PRIMARY KEY,
   user_id TEXT NOT NULL,
   user_role TEXT NOT NULL,
   category TEXT NOT NULL,
   subject TEXT NOT NULL,
   description TEXT NOT NULL,
   booking_id TEXT NOT NULL DEFAULT '',
   status TEXT NOT NULL DEFAULT 'open',
   resolution TEXT NOT NULL DEFAULT '',
   created_at TEXT NOT NULL,
   updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_support_user ON support_cases(user_id,updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_support_status ON support_cases(status,updated_at DESC);
 `)}
 async createCase(input){const uid=clean(input.userId,100),role=clean(input.userRole,20),category=clean(input.category,40),subject=clean(input.subject,160),description=clean(input.description,3000),bookingId=clean(input.bookingId,120);if(!uid||!role||!category||!subject||description.length<10)throw new Error('SUPPORT_CASE_REQUIRED');const now=new Date().toISOString(),id=`CASE-${Date.now()}-${crypto.randomUUID().slice(0,6).toUpperCase()}`;this.sql.exec(`INSERT INTO support_cases(id,user_id,user_role,category,subject,description,booking_id,status,resolution,created_at,updated_at) VALUES(?,?,?,?,?,?,?,'open','',?,?)`,id,uid,role,category,subject,description,bookingId,now,now);return this.getCase(id)}
 async getCase(id){return this.sql.exec(`SELECT * FROM support_cases WHERE id=? LIMIT 1`,clean(id,120)).toArray()[0]||null}
 async listUser(userId,limit=50){const safe=Math.max(1,Math.min(100,Number(limit)||50));return this.sql.exec(`SELECT * FROM support_cases WHERE user_id=? ORDER BY updated_at DESC LIMIT ?`,clean(userId,100),safe).toArray()}
 async list(status='open',limit=100){const safe=Math.max(1,Math.min(200,Number(limit)||100)),s=clean(status,20);if(s==='all')return this.sql.exec(`SELECT * FROM support_cases ORDER BY updated_at DESC LIMIT ?`,safe).toArray();return this.sql.exec(`SELECT * FROM support_cases WHERE status=? ORDER BY updated_at DESC LIMIT ?`,s,safe).toArray()}
 async updateCase(id,status,resolution=''){const row=await this.getCase(id);if(!row)return null;const next=clean(status,20);if(!['open','in_review','resolved'].includes(next))throw new Error('INVALID_SUPPORT_STATUS');if(next==='resolved'&&clean(resolution,2000).length<5)throw new Error('SUPPORT_RESOLUTION_REQUIRED');const now=new Date().toISOString();this.sql.exec(`UPDATE support_cases SET status=?,resolution=?,updated_at=? WHERE id=?`,next,next==='resolved'?clean(resolution,2000):row.resolution,now,row.id);return this.getCase(row.id)}
}
