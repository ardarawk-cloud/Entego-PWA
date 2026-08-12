import { DurableObject } from "cloudflare:workers";

const clean=(v,max=500)=>String(v??"").trim().slice(0,max);
const money=v=>Math.max(0,Math.round(Number(v)||0));

export class EntegoPayment extends DurableObject {
 constructor(ctx,env){
  super(ctx,env);this.sql=ctx.storage.sql;
  this.sql.exec(`
   CREATE TABLE IF NOT EXISTS payment_sessions (
    booking_id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    session_id TEXT NOT NULL,
    reference_id TEXT NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'IDR',
    status TEXT NOT NULL,
    payment_link_url TEXT NOT NULL DEFAULT '',
    payment_id TEXT NOT NULL DEFAULT '',
    payment_request_id TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
   );
   CREATE TABLE IF NOT EXISTS webhook_events (
    webhook_id TEXT PRIMARY KEY,
    event TEXT NOT NULL,
    received_at TEXT NOT NULL
   );
   CREATE TABLE IF NOT EXISTS refunds (
    booking_id TEXT PRIMARY KEY,
    refund_id TEXT NOT NULL DEFAULT '',
    reference_id TEXT NOT NULL DEFAULT '',
    payment_request_id TEXT NOT NULL DEFAULT '',
    amount INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'IDR',
    status TEXT NOT NULL DEFAULT 'NONE',
    reason TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
   );
   CREATE INDEX IF NOT EXISTS idx_payment_session ON payment_sessions(session_id);
  `);
  try{this.sql.exec(`ALTER TABLE payment_sessions ADD COLUMN payment_request_id TEXT NOT NULL DEFAULT ''`)}catch{}
 }
 async saveSession(input){
  const now=new Date().toISOString();
  this.sql.exec(`INSERT INTO payment_sessions (booking_id,provider,session_id,reference_id,amount,currency,status,payment_link_url,payment_id,payment_request_id,created_at,updated_at)
   VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
   ON CONFLICT(booking_id) DO UPDATE SET provider=excluded.provider,session_id=excluded.session_id,reference_id=excluded.reference_id,amount=excluded.amount,currency=excluded.currency,status=excluded.status,payment_link_url=excluded.payment_link_url,payment_id=excluded.payment_id,payment_request_id=excluded.payment_request_id,updated_at=excluded.updated_at`,
   clean(input.bookingId,120),"xendit",clean(input.sessionId,120),clean(input.referenceId,120),money(input.amount),clean(input.currency||"IDR",12),clean(input.status||"ACTIVE",40),clean(input.paymentLinkUrl,1000),clean(input.paymentId,120),clean(input.paymentRequestId,120),now,now);
  return this.getByBooking(input.bookingId);
 }
 async getByBooking(bookingId){return this.sql.exec(`SELECT * FROM payment_sessions WHERE booking_id=? LIMIT 1`,clean(bookingId,120)).toArray()[0]||null}
 async getBySession(sessionId){return this.sql.exec(`SELECT * FROM payment_sessions WHERE session_id=? LIMIT 1`,clean(sessionId,120)).toArray()[0]||null}
 async markWebhook(webhookId,event){
  const id=clean(webhookId,200);if(!id)return true;
  const exists=this.sql.exec(`SELECT webhook_id FROM webhook_events WHERE webhook_id=? LIMIT 1`,id).toArray()[0];if(exists)return false;
  this.sql.exec(`INSERT INTO webhook_events (webhook_id,event,received_at) VALUES (?,?,?)`,id,clean(event,120),new Date().toISOString());return true;
 }
 async applySessionEvent(data,event){
  const sessionId=clean(data.payment_session_id,120);if(!sessionId)return {ok:false,error:"session_id_missing"};
  const row=await this.getBySession(sessionId);if(!row)return {ok:false,error:"session_not_found"};
  const referenceId=clean(data.reference_id,120),currency=clean(data.currency,12),amount=money(data.amount);
  if(referenceId!==row.reference_id)return {ok:false,error:"reference_mismatch"};
  if(currency!==row.currency)return {ok:false,error:"currency_mismatch"};
  if(amount!==Number(row.amount))return {ok:false,error:"amount_mismatch"};
  const eventStatus=(event||'').endsWith('completed')?'COMPLETED':(event||'').endsWith('expired')?'EXPIRED':clean(data.status,40);
  const status=clean(data.status||eventStatus,40);const paymentId=clean(data.payment_id,120),paymentRequestId=clean(data.payment_request_id,120),now=new Date().toISOString();
  this.sql.exec(`UPDATE payment_sessions SET status=?,payment_id=?,payment_request_id=?,updated_at=? WHERE booking_id=?`,status,paymentId,paymentRequestId,now,row.booking_id);
  return {ok:true,payment:await this.getByBooking(row.booking_id)};
 }
 async saveRefund(input){
  const now=new Date().toISOString(),bookingId=clean(input.bookingId,120);
  this.sql.exec(`INSERT INTO refunds (booking_id,refund_id,reference_id,payment_request_id,amount,currency,status,reason,created_at,updated_at)
   VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(booking_id) DO UPDATE SET refund_id=excluded.refund_id,reference_id=excluded.reference_id,payment_request_id=excluded.payment_request_id,amount=excluded.amount,currency=excluded.currency,status=excluded.status,reason=excluded.reason,updated_at=excluded.updated_at`,
   bookingId,clean(input.refundId,120),clean(input.referenceId,120),clean(input.paymentRequestId,120),money(input.amount),clean(input.currency||'IDR',12),clean(input.status||'PENDING',40),clean(input.reason||'CANCELLATION',80),now,now);
  return this.getRefund(bookingId);
 }
 async getRefund(bookingId){return this.sql.exec(`SELECT * FROM refunds WHERE booking_id=? LIMIT 1`,clean(bookingId,120)).toArray()[0]||null}
 async applyRefundEvent(data,event){
  const refundId=clean(data.id||data.refund_id,120);if(!refundId)return {ok:false,error:'refund_id_missing'};
  const row=this.sql.exec(`SELECT * FROM refunds WHERE refund_id=? LIMIT 1`,refundId).toArray()[0];if(!row)return {ok:false,error:'refund_not_found'};
  const status=clean(data.status||((event||'').endsWith('succeeded')?'SUCCEEDED':(event||'').endsWith('failed')?'FAILED':'PENDING'),40);
  this.sql.exec(`UPDATE refunds SET status=?,updated_at=? WHERE booking_id=?`,status,new Date().toISOString(),row.booking_id);
  return {ok:true,refund:await this.getRefund(row.booking_id)};
 }
}
