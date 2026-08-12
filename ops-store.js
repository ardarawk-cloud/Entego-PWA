import { DurableObject } from "cloudflare:workers";
const clean=(v,max=1000)=>String(v??'').trim().slice(0,max);
const jsonText=(value,max=12000)=>{try{return JSON.stringify(value??{}).slice(0,max)}catch{return '{}'}};
const parseJson=value=>{try{return JSON.parse(value||'{}')}catch{return {}}};
export class EntegoOps extends DurableObject{
 constructor(ctx,env){super(ctx,env);this.sql=ctx.storage.sql;this.sql.exec(`
  CREATE TABLE IF NOT EXISTS booking_completion(
   booking_id TEXT PRIMARY KEY,
   partner_completed_at TEXT NOT NULL DEFAULT '',
   customer_confirmed_at TEXT NOT NULL DEFAULT '',
   customer_confirmed_by TEXT NOT NULL DEFAULT '',
   status TEXT NOT NULL DEFAULT 'pending_service',
   updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS disputes(
   id TEXT PRIMARY KEY,
   booking_id TEXT NOT NULL,
   opened_by TEXT NOT NULL,
   opener_role TEXT NOT NULL,
   note TEXT NOT NULL,
   status TEXT NOT NULL DEFAULT 'open',
   resolution TEXT NOT NULL DEFAULT '',
   created_at TEXT NOT NULL,
   updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS booking_agreements(
   booking_id TEXT PRIMARY KEY,
   policy_version TEXT NOT NULL,
   customer_user_id TEXT NOT NULL,
   partner_user_id TEXT NOT NULL,
   snapshot_json TEXT NOT NULL,
   customer_accepted_at TEXT NOT NULL,
   partner_accepted_at TEXT NOT NULL DEFAULT '',
   partner_accepted_by TEXT NOT NULL DEFAULT '',
   created_at TEXT NOT NULL,
   updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS booking_audit(
   id TEXT PRIMARY KEY,
   booking_id TEXT NOT NULL,
   actor_user_id TEXT NOT NULL DEFAULT '',
   actor_role TEXT NOT NULL DEFAULT 'system',
   action TEXT NOT NULL,
   detail_json TEXT NOT NULL DEFAULT '{}',
   created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_disputes_booking ON disputes(booking_id,created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status,created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_booking_audit_booking ON booking_audit(booking_id,created_at ASC);
 `);try{this.sql.exec(`ALTER TABLE disputes ADD COLUMN category TEXT NOT NULL DEFAULT 'other'`)}catch{}try{this.sql.exec(`ALTER TABLE disputes ADD COLUMN requested_action TEXT NOT NULL DEFAULT 'review'`)}catch{}}
 async getCompletion(bookingId){const id=clean(bookingId,120);return this.sql.exec(`SELECT * FROM booking_completion WHERE booking_id=? LIMIT 1`,id).toArray()[0]||null}
 async markPartnerCompleted(bookingId){const id=clean(bookingId,120),now=new Date().toISOString(),row=await this.getCompletion(id);if(row?.partner_completed_at)return row;this.sql.exec(`INSERT INTO booking_completion(booking_id,partner_completed_at,customer_confirmed_at,customer_confirmed_by,status,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(booking_id) DO UPDATE SET partner_completed_at=CASE WHEN booking_completion.partner_completed_at='' THEN excluded.partner_completed_at ELSE booking_completion.partner_completed_at END,status=CASE WHEN booking_completion.customer_confirmed_at='' THEN 'awaiting_customer' ELSE booking_completion.status END,updated_at=excluded.updated_at`,id,now,'','','awaiting_customer',now);return this.getCompletion(id)}
 async confirmCustomer(bookingId,userId){const id=clean(bookingId,120),uid=clean(userId,100),now=new Date().toISOString(),row=await this.getCompletion(id);if(!row?.partner_completed_at)throw new Error('PARTNER_NOT_COMPLETED');const dispute=await this.getOpenDispute(id);if(dispute)throw new Error('DISPUTE_OPEN');this.sql.exec(`UPDATE booking_completion SET customer_confirmed_at=?,customer_confirmed_by=?,status='confirmed',updated_at=? WHERE booking_id=?`,now,uid,now,id);return this.getCompletion(id)}
 async createAgreement(bookingId,data={}){const id=clean(bookingId,120),existing=await this.getAgreement(id);if(existing)return existing;const now=new Date().toISOString(),policy=clean(data.policyVersion,80),customer=clean(data.customerUserId,100),partner=clean(data.partnerUserId,100);if(!id||!policy||!customer||!partner)throw new Error('AGREEMENT_REQUIRED');this.sql.exec(`INSERT INTO booking_agreements(booking_id,policy_version,customer_user_id,partner_user_id,snapshot_json,customer_accepted_at,partner_accepted_at,partner_accepted_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)`,id,policy,customer,partner,jsonText(data.snapshot),now,'','',now,now);return this.getAgreement(id)}
 async acceptPartnerAgreement(bookingId,userId){const id=clean(bookingId,120),uid=clean(userId,100),row=this.sql.exec(`SELECT partner_user_id,partner_accepted_at FROM booking_agreements WHERE booking_id=? LIMIT 1`,id).toArray()[0];if(!row)throw new Error('AGREEMENT_NOT_FOUND');if(row.partner_user_id!==uid)throw new Error('AGREEMENT_PARTNER_MISMATCH');if(!row.partner_accepted_at){const now=new Date().toISOString();this.sql.exec(`UPDATE booking_agreements SET partner_accepted_at=?,partner_accepted_by=?,updated_at=? WHERE booking_id=?`,now,uid,now,id)}return this.getAgreement(id)}
 async getAgreement(bookingId){const r=this.sql.exec(`SELECT * FROM booking_agreements WHERE booking_id=? LIMIT 1`,clean(bookingId,120)).toArray()[0];return r?{bookingId:r.booking_id,policyVersion:r.policy_version,customerUserId:r.customer_user_id,partnerUserId:r.partner_user_id,snapshot:parseJson(r.snapshot_json),customerAcceptedAt:r.customer_accepted_at,partnerAcceptedAt:r.partner_accepted_at,partnerAcceptedBy:r.partner_accepted_by,createdAt:r.created_at,updatedAt:r.updated_at}:null}
 async logEvent(bookingId,actor={},action='',detail={}){const id=clean(bookingId,120),act=clean(action,100);if(!id||!act)return null;const eventId=`AUD-${crypto.randomUUID()}`,now=new Date().toISOString();this.sql.exec(`INSERT INTO booking_audit(id,booking_id,actor_user_id,actor_role,action,detail_json,created_at) VALUES(?,?,?,?,?,?,?)`,eventId,id,clean(actor?.id,100),clean(actor?.role||'system',20),act,jsonText(detail,5000),now);return {id:eventId,bookingId:id,actorUserId:clean(actor?.id,100),actorRole:clean(actor?.role||'system',20),action:act,detail,createdAt:now}}
 async listAudit(bookingId,limit=100){const n=Math.max(1,Math.min(200,Number(limit)||100));return this.sql.exec(`SELECT * FROM booking_audit WHERE booking_id=? ORDER BY created_at ASC LIMIT ?`,clean(bookingId,120),n).toArray().map(r=>({id:r.id,bookingId:r.booking_id,actorUserId:r.actor_user_id,actorRole:r.actor_role,action:r.action,detail:parseJson(r.detail_json),createdAt:r.created_at}))}
 async openDispute(bookingId,user){const id=clean(bookingId,120),uid=clean(user?.id,100),role=clean(user?.role,20),note=clean(user?.note,2000),category=clean(user?.category||'other',40),requested=clean(user?.requestedAction||'review',40);if(!id||!uid||!note)throw new Error('DISPUTE_REQUIRED');const current=await this.getOpenDispute(id);if(current)return current;const now=new Date().toISOString(),disputeId=`DSP-${Date.now()}-${crypto.randomUUID().slice(0,6).toUpperCase()}`;this.sql.exec(`INSERT INTO disputes(id,booking_id,opened_by,opener_role,note,status,resolution,created_at,updated_at,category,requested_action) VALUES(?,?,?,?,?,'open','',?,?,?,?,?)`,disputeId,id,uid,role,note,now,now,category,requested);const c=await this.getCompletion(id);if(c)this.sql.exec(`UPDATE booking_completion SET status='disputed',updated_at=? WHERE booking_id=?`,now,id);return this.getDispute(disputeId)}
 async getDispute(id){return this.sql.exec(`SELECT * FROM disputes WHERE id=? LIMIT 1`,clean(id,120)).toArray()[0]||null}
 async getOpenDispute(bookingId){return this.sql.exec(`SELECT * FROM disputes WHERE booking_id=? AND status='open' ORDER BY created_at DESC LIMIT 1`,clean(bookingId,120)).toArray()[0]||null}
 async listBookingDisputes(bookingId){return this.sql.exec(`SELECT * FROM disputes WHERE booking_id=? ORDER BY created_at DESC LIMIT 20`,clean(bookingId,120)).toArray()}
 async listDisputes(status='open',limit=100){const s=clean(status,20),safe=Math.max(1,Math.min(200,Number(limit)||100));if(s==='all')return this.sql.exec(`SELECT * FROM disputes ORDER BY created_at DESC LIMIT ?`,safe).toArray();return this.sql.exec(`SELECT * FROM disputes WHERE status=? ORDER BY created_at DESC LIMIT ?`,s,safe).toArray()}
 async resolveDispute(id,resolution){const dispute=await this.getDispute(id);if(!dispute)return null;if(dispute.status!=='open')return dispute;const now=new Date().toISOString();this.sql.exec(`UPDATE disputes SET status='resolved',resolution=?,updated_at=? WHERE id=?`,clean(resolution,2000),now,dispute.id);const open=await this.getOpenDispute(dispute.booking_id),completion=await this.getCompletion(dispute.booking_id);if(!open&&completion)this.sql.exec(`UPDATE booking_completion SET status=CASE WHEN customer_confirmed_at<>'' THEN 'confirmed' WHEN partner_completed_at<>'' THEN 'awaiting_customer' ELSE 'pending_service' END,updated_at=? WHERE booking_id=?`,now,dispute.booking_id);return this.getDispute(dispute.id)}
}
