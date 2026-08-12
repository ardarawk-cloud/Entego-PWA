import { DurableObject } from "cloudflare:workers";

const clean=(v,max=500)=>String(v??"").trim().slice(0,max);

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
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
   );
   CREATE TABLE IF NOT EXISTS webhook_events (
    webhook_id TEXT PRIMARY KEY,
    event TEXT NOT NULL,
    received_at TEXT NOT NULL
   );
   CREATE INDEX IF NOT EXISTS idx_payment_session ON payment_sessions(session_id);
  `);
 }
 async saveSession(input){
  const now=new Date().toISOString();
  this.sql.exec(`INSERT INTO payment_sessions (booking_id,provider,session_id,reference_id,amount,currency,status,payment_link_url,payment_id,created_at,updated_at)
   VALUES (?,?,?,?,?,?,?,?,?,?,?)
   ON CONFLICT(booking_id) DO UPDATE SET provider=excluded.provider,session_id=excluded.session_id,reference_id=excluded.reference_id,amount=excluded.amount,currency=excluded.currency,status=excluded.status,payment_link_url=excluded.payment_link_url,payment_id=excluded.payment_id,updated_at=excluded.updated_at`,
   clean(input.bookingId,120),"xendit",clean(input.sessionId,120),clean(input.referenceId,120),Math.max(0,Math.round(Number(input.amount)||0)),"IDR",clean(input.status||"ACTIVE",40),clean(input.paymentLinkUrl,1000),clean(input.paymentId,120),now,now);
  return this.getByBooking(input.bookingId);
 }
 async getByBooking(bookingId){return this.sql.exec(`SELECT * FROM payment_sessions WHERE booking_id=? LIMIT 1`,clean(bookingId,120)).toArray()[0]||null}
 async markWebhook(webhookId,event){
  const id=clean(webhookId,200);if(!id)return true;
  const exists=this.sql.exec(`SELECT webhook_id FROM webhook_events WHERE webhook_id=? LIMIT 1`,id).toArray()[0];if(exists)return false;
  this.sql.exec(`INSERT INTO webhook_events (webhook_id,event,received_at) VALUES (?,?,?)`,id,clean(event,120),new Date().toISOString());return true;
 }
 async applySessionEvent(data,event){
  const sessionId=clean(data.payment_session_id,120),referenceId=clean(data.reference_id,120),status=clean(data.status||((event||'').endsWith('completed')?'COMPLETED':'EXPIRED'),40),paymentId=clean(data.payment_id,120),now=new Date().toISOString();
  let row=this.sql.exec(`SELECT booking_id FROM payment_sessions WHERE session_id=? OR reference_id=? LIMIT 1`,sessionId,referenceId).toArray()[0];if(!row)return null;
  this.sql.exec(`UPDATE payment_sessions SET status=?,payment_id=?,updated_at=? WHERE booking_id=?`,status,paymentId,now,row.booking_id);return this.getByBooking(row.booking_id);
 }
}
