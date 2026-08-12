import { DurableObject } from "cloudflare:workers";

const clean=(v,max=500)=>String(v??"").trim().slice(0,max);
const money=v=>Math.max(0,Math.round(Number(v)||0));
const upper=v=>clean(v,40).toUpperCase();

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
   CREATE TABLE IF NOT EXISTS payment_attempts (
    session_id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
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
   CREATE TABLE IF NOT EXISTS refund_attempts (
    refund_id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    reference_id TEXT NOT NULL DEFAULT '',
    payment_request_id TEXT NOT NULL DEFAULT '',
    amount INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'IDR',
    status TEXT NOT NULL DEFAULT 'PENDING',
    reason TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
   );
   CREATE INDEX IF NOT EXISTS idx_payment_session ON payment_sessions(session_id);
   CREATE INDEX IF NOT EXISTS idx_payment_attempt_booking ON payment_attempts(booking_id,created_at DESC);
   CREATE INDEX IF NOT EXISTS idx_refund_attempt_booking ON refund_attempts(booking_id,created_at DESC);
  `);
  try{this.sql.exec(`ALTER TABLE payment_sessions ADD COLUMN payment_request_id TEXT NOT NULL DEFAULT ''`)}catch{}
 }
 async saveSession(input){
  const now=new Date().toISOString(),bookingId=clean(input.bookingId,120),sessionId=clean(input.sessionId,120),referenceId=clean(input.referenceId,120),amount=money(input.amount),currency=upper(input.currency||'IDR'),status=upper(input.status||'ACTIVE'),link=clean(input.paymentLinkUrl,1000),paymentId=clean(input.paymentId,120),paymentRequestId=clean(input.paymentRequestId,120);
  if(!bookingId||!sessionId||!referenceId)throw new Error('INVALID_PAYMENT_SESSION');
  this.sql.exec(`INSERT INTO payment_attempts (session_id,booking_id,reference_id,amount,currency,status,payment_link_url,payment_id,payment_request_id,created_at,updated_at)
   VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(session_id) DO UPDATE SET status=CASE WHEN payment_attempts.status='COMPLETED' THEN 'COMPLETED' ELSE excluded.status END,payment_link_url=excluded.payment_link_url,payment_id=CASE WHEN excluded.payment_id<>'' THEN excluded.payment_id ELSE payment_attempts.payment_id END,payment_request_id=CASE WHEN excluded.payment_request_id<>'' THEN excluded.payment_request_id ELSE payment_attempts.payment_request_id END,updated_at=excluded.updated_at`,sessionId,bookingId,referenceId,amount,currency,status,link,paymentId,paymentRequestId,now,now);
  const existing=await this.getByBooking(bookingId);if(existing?.status==='COMPLETED')return existing;
  this.sql.exec(`INSERT INTO payment_sessions (booking_id,provider,session_id,reference_id,amount,currency,status,payment_link_url,payment_id,payment_request_id,created_at,updated_at)
   VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
   ON CONFLICT(booking_id) DO UPDATE SET provider=excluded.provider,session_id=excluded.session_id,reference_id=excluded.reference_id,amount=excluded.amount,currency=excluded.currency,status=excluded.status,payment_link_url=excluded.payment_link_url,payment_id=excluded.payment_id,payment_request_id=excluded.payment_request_id,updated_at=excluded.updated_at`,bookingId,"xendit",sessionId,referenceId,amount,currency,status,link,paymentId,paymentRequestId,now,now);
  return this.getByBooking(bookingId);
 }
 async getByBooking(bookingId){return this.sql.exec(`SELECT * FROM payment_sessions WHERE booking_id=? LIMIT 1`,clean(bookingId,120)).toArray()[0]||null}
 async getBySession(sessionId){return this.sql.exec(`SELECT * FROM payment_sessions WHERE session_id=? LIMIT 1`,clean(sessionId,120)).toArray()[0]||null}
 async getAttemptBySession(sessionId){return this.sql.exec(`SELECT * FROM payment_attempts WHERE session_id=? LIMIT 1`,clean(sessionId,120)).toArray()[0]||null}
 async ensurePaymentAttempt(sessionId){let attempt=await this.getAttemptBySession(sessionId);if(attempt)return attempt;const legacy=await this.getBySession(sessionId);if(!legacy)return null;const now=legacy.updated_at||legacy.created_at||new Date().toISOString();this.sql.exec(`INSERT OR IGNORE INTO payment_attempts(session_id,booking_id,reference_id,amount,currency,status,payment_link_url,payment_id,payment_request_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,legacy.session_id,legacy.booking_id,legacy.reference_id,legacy.amount,legacy.currency,legacy.status,legacy.payment_link_url,legacy.payment_id,legacy.payment_request_id||'',legacy.created_at||now,now);return this.getAttemptBySession(sessionId)}
 async auditBooking(bookingId){const id=clean(bookingId,120),payments=this.sql.exec(`SELECT session_id,status,amount,currency,payment_id,payment_request_id,created_at,updated_at FROM payment_attempts WHERE booking_id=? ORDER BY created_at DESC`,id).toArray(),refunds=this.sql.exec(`SELECT refund_id,status,amount,currency,payment_request_id,created_at,updated_at FROM refund_attempts WHERE booking_id=? ORDER BY created_at DESC`,id).toArray(),completed=payments.filter(x=>x.status==='COMPLETED');return {paymentAttemptCount:payments.length,completedPaymentCount:completed.length,duplicatePayment:completed.length>1,refundAttemptCount:refunds.length,paymentAttempts:payments,refundAttempts:refunds}}
 async markWebhook(webhookId,event){
  const id=clean(webhookId,200);if(!id)return true;
  const exists=this.sql.exec(`SELECT webhook_id FROM webhook_events WHERE webhook_id=? LIMIT 1`,id).toArray()[0];if(exists)return false;
  this.sql.exec(`INSERT INTO webhook_events (webhook_id,event,received_at) VALUES (?,?,?)`,id,clean(event,120),new Date().toISOString());return true;
 }
 async applySessionEvent(data,event){
  const sessionId=clean(data.payment_session_id,120);if(!sessionId)return {ok:false,error:'session_id_missing'};
  const attempt=await this.ensurePaymentAttempt(sessionId);if(!attempt)return {ok:false,error:'session_not_found'};
  const referenceId=clean(data.reference_id,120),currency=upper(data.currency),amount=money(data.amount);
  if(referenceId!==attempt.reference_id)return {ok:false,error:'reference_mismatch'};
  if(currency!==attempt.currency)return {ok:false,error:'currency_mismatch'};
  if(amount!==Number(attempt.amount))return {ok:false,error:'amount_mismatch'};
  const expected=(event||'').endsWith('completed')?'COMPLETED':(event||'').endsWith('expired')?'EXPIRED':'';if(!expected)return {ok:false,error:'unsupported_payment_event'};
  const providerStatus=upper(data.status);if(providerStatus&&providerStatus!==expected)return {ok:false,error:'payment_status_mismatch'};
  const paymentId=clean(data.payment_id,120),paymentRequestId=clean(data.payment_request_id,120),now=new Date().toISOString();
  this.sql.exec(`UPDATE payment_attempts SET status=?,payment_id=CASE WHEN ?<>'' THEN ? ELSE payment_id END,payment_request_id=CASE WHEN ?<>'' THEN ? ELSE payment_request_id END,updated_at=? WHERE session_id=?`,expected,paymentId,paymentId,paymentRequestId,paymentRequestId,now,sessionId);
  const current=await this.getByBooking(attempt.booking_id);
  if(expected==='COMPLETED'){
   if(current?.status==='COMPLETED'&&current.session_id!==sessionId)return {ok:true,payment:current,duplicatePayment:true,completedAttempt:await this.getAttemptBySession(sessionId)};
   const completed=await this.getAttemptBySession(sessionId);this.sql.exec(`UPDATE payment_sessions SET session_id=?,reference_id=?,amount=?,currency=?,status='COMPLETED',payment_link_url=?,payment_id=?,payment_request_id=?,updated_at=? WHERE booking_id=?`,completed.session_id,completed.reference_id,completed.amount,completed.currency,completed.payment_link_url,completed.payment_id,completed.payment_request_id,now,attempt.booking_id);return {ok:true,payment:await this.getByBooking(attempt.booking_id)};
  }
  if(current?.status==='COMPLETED'||current?.session_id!==sessionId)return {ok:true,payment:current,ignoredTerminal:true};
  this.sql.exec(`UPDATE payment_sessions SET status='EXPIRED',updated_at=? WHERE booking_id=?`,now,attempt.booking_id);return {ok:true,payment:await this.getByBooking(attempt.booking_id)};
 }
 async saveRefund(input){
  const now=new Date().toISOString(),bookingId=clean(input.bookingId,120),refundId=clean(input.refundId,120),referenceId=clean(input.referenceId,120),paymentRequestId=clean(input.paymentRequestId,120),amount=money(input.amount),currency=upper(input.currency||'IDR'),status=upper(input.status||'PENDING'),reason=clean(input.reason||'CANCELLATION',80);if(!bookingId||!refundId)throw new Error('INVALID_REFUND');
  this.sql.exec(`INSERT INTO refund_attempts(refund_id,booking_id,reference_id,payment_request_id,amount,currency,status,reason,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(refund_id) DO UPDATE SET status=CASE WHEN refund_attempts.status='SUCCEEDED' THEN 'SUCCEEDED' ELSE excluded.status END,updated_at=excluded.updated_at`,refundId,bookingId,referenceId,paymentRequestId,amount,currency,status,reason,now,now);
  const existing=await this.getRefund(bookingId);if(existing?.status==='SUCCEEDED')return existing;
  this.sql.exec(`INSERT INTO refunds (booking_id,refund_id,reference_id,payment_request_id,amount,currency,status,reason,created_at,updated_at)
   VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(booking_id) DO UPDATE SET refund_id=excluded.refund_id,reference_id=excluded.reference_id,payment_request_id=excluded.payment_request_id,amount=excluded.amount,currency=excluded.currency,status=excluded.status,reason=excluded.reason,updated_at=excluded.updated_at`,bookingId,refundId,referenceId,paymentRequestId,amount,currency,status,reason,now,now);
  return this.getRefund(bookingId);
 }
 async getRefund(bookingId){return this.sql.exec(`SELECT * FROM refunds WHERE booking_id=? LIMIT 1`,clean(bookingId,120)).toArray()[0]||null}
 async getRefundAttempt(refundId){return this.sql.exec(`SELECT * FROM refund_attempts WHERE refund_id=? LIMIT 1`,clean(refundId,120)).toArray()[0]||null}
 async ensureRefundAttempt(refundId){let attempt=await this.getRefundAttempt(refundId);if(attempt)return attempt;const legacy=this.sql.exec(`SELECT * FROM refunds WHERE refund_id=? LIMIT 1`,clean(refundId,120)).toArray()[0];if(!legacy)return null;const now=legacy.updated_at||legacy.created_at||new Date().toISOString();this.sql.exec(`INSERT OR IGNORE INTO refund_attempts(refund_id,booking_id,reference_id,payment_request_id,amount,currency,status,reason,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)`,legacy.refund_id,legacy.booking_id,legacy.reference_id,legacy.payment_request_id,legacy.amount,legacy.currency,legacy.status,legacy.reason,legacy.created_at||now,now);return this.getRefundAttempt(refundId)}
 async applyRefundEvent(data,event){
  const refundId=clean(data.id||data.refund_id,120);if(!refundId)return {ok:false,error:'refund_id_missing'};
  const attempt=await this.ensureRefundAttempt(refundId);if(!attempt)return {ok:false,error:'refund_not_found'};
  const referenceId=clean(data.reference_id,120),paymentRequestId=clean(data.payment_request_id,120),currency=upper(data.currency),amount=money(data.amount);
  if(referenceId&&referenceId!==attempt.reference_id)return {ok:false,error:'refund_reference_mismatch'};
  if(paymentRequestId&&paymentRequestId!==attempt.payment_request_id)return {ok:false,error:'refund_payment_request_mismatch'};
  if(currency&&currency!==attempt.currency)return {ok:false,error:'refund_currency_mismatch'};
  if(data.amount!==undefined&&amount!==Number(attempt.amount))return {ok:false,error:'refund_amount_mismatch'};
  const expected=(event||'').endsWith('succeeded')?'SUCCEEDED':(event||'').endsWith('failed')?'FAILED':'';if(!expected)return {ok:false,error:'unsupported_refund_event'};
  const providerStatus=upper(data.status);if(providerStatus&&providerStatus!==expected)return {ok:false,error:'refund_status_mismatch'};
  const now=new Date().toISOString();this.sql.exec(`UPDATE refund_attempts SET status=?,updated_at=? WHERE refund_id=?`,expected,now,refundId);
  const current=await this.getRefund(attempt.booking_id);
  if(expected==='SUCCEEDED'){
   this.sql.exec(`UPDATE refunds SET refund_id=?,reference_id=?,payment_request_id=?,amount=?,currency=?,status='SUCCEEDED',reason=?,updated_at=? WHERE booking_id=?`,attempt.refund_id,attempt.reference_id,attempt.payment_request_id,attempt.amount,attempt.currency,attempt.reason,now,attempt.booking_id);return {ok:true,refund:await this.getRefund(attempt.booking_id)};
  }
  if(current?.status==='SUCCEEDED'||current?.refund_id!==refundId)return {ok:true,refund:current,ignoredTerminal:true};
  this.sql.exec(`UPDATE refunds SET status='FAILED',updated_at=? WHERE booking_id=?`,now,attempt.booking_id);return {ok:true,refund:await this.getRefund(attempt.booking_id)};
 }
}
