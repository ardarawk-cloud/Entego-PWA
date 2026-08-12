import {EntegoAuth as BaseAuth} from './auth-store-v2.js';
const clean=(v,max=500)=>String(v??'').trim().slice(0,max);
export class EntegoAuth extends BaseAuth{
 constructor(ctx,env){super(ctx,env);this.sql.exec(`
  CREATE TABLE IF NOT EXISTS account_status_events(
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   user_id TEXT NOT NULL,
   previous_status TEXT NOT NULL,
   new_status TEXT NOT NULL,
   changed_by TEXT NOT NULL,
   reason TEXT NOT NULL,
   created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_account_events_user ON account_status_events(user_id,created_at DESC);
 `)}
 async listUsers(limit=100){const safe=Math.max(1,Math.min(300,Number(limit)||100));return this.sql.exec(`SELECT id,email,display_name,role,status,verified,created_at,updated_at FROM users WHERE role IN ('customer','partner') ORDER BY created_at DESC LIMIT ?`,safe).toArray().map(r=>({id:r.id,email:r.email,displayName:r.display_name,role:r.role,status:r.status,verified:Boolean(r.verified),createdAt:r.created_at,updatedAt:r.updated_at}))}
 async setUserStatus(userId,status,changedBy,reason){const uid=clean(userId,100),next=clean(status,20),admin=clean(changedBy,100),note=clean(reason,1000);if(!['active','restricted'].includes(next))throw new Error('INVALID_ACCOUNT_STATUS');if(!note)throw new Error('ACCOUNT_STATUS_REASON_REQUIRED');const row=this.sql.exec(`SELECT id,role,status FROM users WHERE id=? LIMIT 1`,uid).toArray()[0];if(!row||!['customer','partner'].includes(row.role))return null;if(row.status===next)return this.getUser(uid);const now=new Date().toISOString();this.sql.exec(`UPDATE users SET status=?,updated_at=? WHERE id=?`,next,now,uid);this.sql.exec(`INSERT INTO account_status_events(user_id,previous_status,new_status,changed_by,reason,created_at) VALUES(?,?,?,?,?,?)`,uid,row.status,next,admin,note,now);return this.getUser(uid)}
 async listUserStatusEvents(userId,limit=50){const safe=Math.max(1,Math.min(200,Number(limit)||50));return this.sql.exec(`SELECT previous_status,new_status,changed_by,reason,created_at FROM account_status_events WHERE user_id=? ORDER BY created_at DESC LIMIT ?`,clean(userId,100),safe).toArray().map(r=>({previousStatus:r.previous_status,newStatus:r.new_status,changedBy:r.changed_by,reason:r.reason,createdAt:r.created_at}))}
}
