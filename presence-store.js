import { DurableObject } from 'cloudflare:workers';
const clean=(v,max=300)=>String(v??'').trim().slice(0,max);
export class EntegoPresence extends DurableObject{
 constructor(ctx,env){super(ctx,env);this.sql=ctx.storage.sql;this.sql.exec(`
  CREATE TABLE IF NOT EXISTS checkins(
   booking_id TEXT NOT NULL,
   actor_role TEXT NOT NULL,
   actor_user_id TEXT NOT NULL,
   checked_in_at TEXT NOT NULL,
   PRIMARY KEY(booking_id,actor_role)
  );
  CREATE INDEX IF NOT EXISTS idx_checkins_booking ON checkins(booking_id,checked_in_at);
 `)}
 async checkIn(bookingId,user){const id=clean(bookingId,120),role=clean(user?.role,20),uid=clean(user?.id,100);if(!id||!uid||!['customer','partner'].includes(role))throw new Error('CHECKIN_ACTOR_REQUIRED');const existing=this.sql.exec(`SELECT * FROM checkins WHERE booking_id=? AND actor_role=? LIMIT 1`,id,role).toArray()[0];if(existing)return this.publicRow(existing);const now=new Date().toISOString();this.sql.exec(`INSERT INTO checkins(booking_id,actor_role,actor_user_id,checked_in_at) VALUES(?,?,?,?)`,id,role,uid,now);return {bookingId:id,role,checkedInAt:now}}
 publicRow(r){return r?{bookingId:r.booking_id,role:r.actor_role,checkedInAt:r.checked_in_at}:null}
 async list(bookingId){return this.sql.exec(`SELECT booking_id,actor_role,checked_in_at FROM checkins WHERE booking_id=? ORDER BY checked_in_at ASC`,clean(bookingId,120)).toArray().map(r=>({bookingId:r.booking_id,role:r.actor_role,checkedInAt:r.checked_in_at}))}
}
