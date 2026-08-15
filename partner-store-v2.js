import {EntegoPartner as BasePartner} from './partner-store.js';
const clean=(v,max=300)=>String(v??'').trim().slice(0,max);
const ID_TYPES=new Set(['KTP','SIM','PASSPORT']);
const normalizeIdType=v=>{const t=(clean(v,20)||'KTP').toUpperCase();if(!ID_TYPES.has(t))throw new Error('INVALID_IDENTITY_TYPE');return t};
const onlyIdSuffix=(v,type='KTP')=>{const raw=String(v??'').toUpperCase();const s=type==='PASSPORT'?raw.replace(/[^A-Z0-9]/g,''):raw.replace(/\D/g,'');return s.length===4?s:''};
const onlyLast4=v=>{const s=String(v??'').replace(/\D/g,'');return s.length===4?s:''};
const safeDetail=v=>clean(v,500);

export class EntegoPartner extends BasePartner{
 constructor(ctx,env){
  super(ctx,env);
  this.sql.exec(`
   CREATE TABLE IF NOT EXISTS identity_verifications(
    user_id TEXT PRIMARY KEY,
    legal_name TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    id_type TEXT NOT NULL DEFAULT 'KTP',
    id_last4 TEXT NOT NULL DEFAULT '',
    bank_name TEXT NOT NULL DEFAULT '',
    bank_account_name TEXT NOT NULL DEFAULT '',
    bank_account_last4 TEXT NOT NULL DEFAULT '',
    ktp_key TEXT NOT NULL DEFAULT '',
    ktp_content_type TEXT NOT NULL DEFAULT '',
    ktp_size INTEGER NOT NULL DEFAULT 0,
    selfie_key TEXT NOT NULL DEFAULT '',
    selfie_content_type TEXT NOT NULL DEFAULT '',
    selfie_size INTEGER NOT NULL DEFAULT 0,
    identity_status TEXT NOT NULL DEFAULT 'draft',
    payout_enabled INTEGER NOT NULL DEFAULT 0,
    consent_at TEXT NOT NULL DEFAULT '',
    submitted_at TEXT NOT NULL DEFAULT '',
    reviewed_at TEXT NOT NULL DEFAULT '',
    reviewer_id TEXT NOT NULL DEFAULT '',
    review_note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
   );
   CREATE TABLE IF NOT EXISTS identity_events(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    actor_id TEXT NOT NULL DEFAULT '',
    detail TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
   );
   CREATE INDEX IF NOT EXISTS idx_identity_status ON identity_verifications(identity_status,payout_enabled,updated_at DESC);
   CREATE INDEX IF NOT EXISTS idx_identity_events_user ON identity_events(user_id,created_at DESC);
  `);
 }

 identityRow(r){
  return r?{
   userId:r.user_id,
   legalName:r.legal_name||'',
   phone:r.phone||'',
   idType:r.id_type||'KTP',
   idLast4:r.id_last4||'',
   bankName:r.bank_name||'',
   bankAccountName:r.bank_account_name||'',
   bankAccountLast4:r.bank_account_last4||'',
   ktpUploaded:Boolean(r.ktp_key),
   selfieUploaded:Boolean(r.selfie_key),
   identityStatus:r.identity_status||'draft',
   payoutEnabled:Boolean(r.payout_enabled),
   consentRecorded:Boolean(r.consent_at),
   submittedAt:r.submitted_at||'',
   reviewedAt:r.reviewed_at||'',
   reviewNote:r.review_note||'',
   createdAt:r.created_at,
   updatedAt:r.updated_at
  }:null;
 }

 async logIdentityEvent(userId,action,actorId='',detail=''){
  this.sql.exec(`INSERT INTO identity_events(user_id,action,actor_id,detail,created_at) VALUES(?,?,?,?,?)`,clean(userId,100),clean(action,80),clean(actorId,100),safeDetail(detail),new Date().toISOString());
 }

 async listIdentityEvents(userId,limit=50){
  const safe=Math.max(1,Math.min(200,Number(limit)||50));
  return this.sql.exec(`SELECT action,actor_id,detail,created_at FROM identity_events WHERE user_id=? ORDER BY id DESC LIMIT ?`,clean(userId,100),safe).toArray().map(r=>({action:r.action,actorId:r.actor_id,detail:r.detail,createdAt:r.created_at}));
 }

 async getIdentity(userId){
  return this.identityRow(this.sql.exec(`SELECT * FROM identity_verifications WHERE user_id=? LIMIT 1`,clean(userId,100)).toArray()[0]);
 }

 async getIdentityDocumentRef(userId,kind){
  const uid=clean(userId,100),column=(kind==='ktp'||kind==='identity')?'ktp':kind==='selfie'?'selfie':'';
  if(!column)return null;
  const r=this.sql.exec(`SELECT ${column}_key AS object_key,${column}_content_type AS content_type,${column}_size AS size FROM identity_verifications WHERE user_id=? LIMIT 1`,uid).toArray()[0];
  return r?.object_key?{key:r.object_key,contentType:r.content_type||'application/octet-stream',size:Number(r.size)||0}:null;
 }

 async saveIdentity(userId,input={}){
  const uid=clean(userId,100);if(!uid)throw new Error('IDENTITY_USER_REQUIRED');
  if(clean(input.nik||input.idNumber||input.simNumber||input.passportNumber,80))throw new Error('FULL_ID_NUMBER_NOT_ACCEPTED');
  if(clean(input.bankAccountNumber,80))throw new Error('FULL_BANK_NUMBER_NOT_ACCEPTED');
  const now=new Date().toISOString(),existing=await this.getIdentity(uid),raw=this.sql.exec(`SELECT * FROM identity_verifications WHERE user_id=? LIMIT 1`,uid).toArray()[0];
  const idType=normalizeIdType(input.idType||existing?.idType||'KTP');
  const next={
   legalName:clean(input.legalName,160),phone:clean(input.phone,40),idType,idLast4:onlyIdSuffix(input.idLast4,idType),
   bankName:clean(input.bankName,100),bankAccountName:clean(input.bankAccountName,160),bankAccountLast4:onlyLast4(input.bankAccountLast4)
  };
  const changed=Boolean(existing)&&['legalName','phone','idType','idLast4','bankName','bankAccountName','bankAccountLast4'].some(k=>String(existing[k]||'')!==String(next[k]||''));
  const previousStatus=existing?.identityStatus||'draft';
  const nextStatus=(changed&&['submitted','approved','rejected'].includes(previousStatus))?'draft':previousStatus;
  const consentAt=input.consent===true?(raw?.consent_at||now):(raw?.consent_at||'');
  const payoutEnabled=nextStatus==='approved'&&!changed?1:0;
  if(!raw){
   this.sql.exec(`INSERT INTO identity_verifications(user_id,legal_name,phone,id_type,id_last4,bank_name,bank_account_name,bank_account_last4,identity_status,payout_enabled,consent_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,uid,next.legalName,next.phone,next.idType,next.idLast4,next.bankName,next.bankAccountName,next.bankAccountLast4,nextStatus,payoutEnabled,consentAt,now,now);
  }else{
   this.sql.exec(`UPDATE identity_verifications SET legal_name=?,phone=?,id_type=?,id_last4=?,bank_name=?,bank_account_name=?,bank_account_last4=?,identity_status=?,payout_enabled=?,consent_at=?,submitted_at=CASE WHEN ?='draft' THEN '' ELSE submitted_at END,reviewed_at=CASE WHEN ?='draft' THEN '' ELSE reviewed_at END,reviewer_id=CASE WHEN ?='draft' THEN '' ELSE reviewer_id END,updated_at=? WHERE user_id=?`,next.legalName,next.phone,next.idType,next.idLast4,next.bankName,next.bankAccountName,next.bankAccountLast4,nextStatus,payoutEnabled,consentAt,nextStatus,nextStatus,nextStatus,now,uid);
  }
  await this.logIdentityEvent(uid,'identity_details_saved',uid,changed?`${next.idType} identity metadata changed; approval reset if needed.`:`${next.idType} identity metadata saved.`);
  return this.getIdentity(uid);
 }

 async setIdentityDocument(userId,kind,document={}){
  const uid=clean(userId,100);if(!uid)throw new Error('IDENTITY_USER_REQUIRED');
  const column=(kind==='ktp'||kind==='identity')?'ktp':kind==='selfie'?'selfie':'';if(!column)throw new Error('INVALID_IDENTITY_DOCUMENT_KIND');
  let existing=await this.getIdentity(uid),now=new Date().toISOString();
  if(!existing){this.sql.exec(`INSERT INTO identity_verifications(user_id,created_at,updated_at) VALUES(?,?,?)`,uid,now,now);existing=await this.getIdentity(uid)}
  const key=clean(document.key,800),contentType=clean(document.contentType,100),size=Math.max(0,Math.round(Number(document.size)||0));if(!key)throw new Error('IDENTITY_DOCUMENT_REQUIRED');
  this.sql.exec(`UPDATE identity_verifications SET ${column}_key=?,${column}_content_type=?,${column}_size=?,identity_status='draft',payout_enabled=0,submitted_at='',reviewed_at='',reviewer_id='',updated_at=? WHERE user_id=?`,key,contentType,size,now,uid);
  await this.logIdentityEvent(uid,`${column}_document_uploaded`,uid,`Private ${column==='ktp'?'identity':'selfie'} document replaced.`);
  return this.getIdentity(uid);
 }

 async submitIdentity(userId){
  const uid=clean(userId,100),row=this.sql.exec(`SELECT * FROM identity_verifications WHERE user_id=? LIMIT 1`,uid).toArray()[0];if(!row)throw new Error('IDENTITY_DETAILS_REQUIRED');
  if(!ID_TYPES.has(String(row.id_type||'KTP').toUpperCase())||!row.legal_name||!row.phone||String(row.id_last4||'').length!==4||!row.bank_name||!row.bank_account_name||row.bank_account_last4.length!==4)throw new Error('IDENTITY_DETAILS_REQUIRED');
  if(!row.consent_at)throw new Error('IDENTITY_CONSENT_REQUIRED');
  if(!row.ktp_key||!row.selfie_key)throw new Error('IDENTITY_DOCUMENTS_REQUIRED');
  const now=new Date().toISOString();this.sql.exec(`UPDATE identity_verifications SET identity_status='submitted',payout_enabled=0,submitted_at=?,reviewed_at='',reviewer_id='',review_note='',updated_at=? WHERE user_id=?`,now,now,uid);
  await this.logIdentityEvent(uid,'identity_submitted',uid,`${String(row.id_type||'KTP').toUpperCase()} identity package submitted for admin review.`);
  return this.getIdentity(uid);
 }

 async reviewIdentity(userId,action,reviewerId,note=''){
  const uid=clean(userId,100),a=clean(action,20),reviewer=clean(reviewerId,100),row=this.sql.exec(`SELECT * FROM identity_verifications WHERE user_id=? LIMIT 1`,uid).toArray()[0];if(!row)throw new Error('IDENTITY_SUBMISSION_REQUIRED');
  if(!['approve','reject','reset'].includes(a))throw new Error('INVALID_IDENTITY_ACTION');
  if(a==='approve'&&row.identity_status!=='submitted')throw new Error('IDENTITY_SUBMISSION_REQUIRED');
  if(a==='reject'&&clean(note,500).length<5)throw new Error('IDENTITY_REJECTION_REASON_REQUIRED');
  const now=new Date().toISOString(),status=a==='approve'?'approved':a==='reject'?'rejected':'draft',payout=a==='approve'?1:0;
  this.sql.exec(`UPDATE identity_verifications SET identity_status=?,payout_enabled=?,reviewed_at=?,reviewer_id=?,review_note=?,submitted_at=CASE WHEN ?='draft' THEN '' ELSE submitted_at END,updated_at=? WHERE user_id=?`,status,payout,a==='reset'?'':now,a==='reset'?'':reviewer,clean(note,500),status,now,uid);
  await this.logIdentityEvent(uid,`identity_${status}`,reviewer,clean(note,500)||`Identity ${status}.`);
  return this.getIdentity(uid);
 }

 async payoutEligibility(userId){
  const identity=await this.getIdentity(userId);
  if(!identity)return {eligible:false,reason:'identity_not_started',identity:null};
  if(identity.identityStatus!=='approved'||!identity.payoutEnabled)return {eligible:false,reason:`identity_${identity.identityStatus}`,identity};
  return {eligible:true,reason:'identity_approved',identity};
 }

 async setOperationalStatus(userId,status){const uid=clean(userId,100),next=clean(status,20);if(!['active','restricted'].includes(next))throw new Error('INVALID_PARTNER_STATUS');const profile=await this.getProfile(uid);if(!profile)return null;this.sql.exec(`UPDATE profiles SET status=?,updated_at=? WHERE user_id=?`,next,new Date().toISOString(),uid);return this.getProfile(uid)}
}
