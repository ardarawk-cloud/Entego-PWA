import {EntegoAuth as BaseAuth} from './auth-store-v3.js';
const clean=(v,max=500)=>String(v??'').trim().slice(0,max);
const randomHex=()=>crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');

export class EntegoAuth extends BaseAuth{
 async setUserStatus(userId,status,changedBy,reason){
  const uid=clean(userId,100),row=this.sql.exec(`SELECT status FROM users WHERE id=? LIMIT 1`,uid).toArray()[0];
  if(row?.status==='closed')throw new Error('ACCOUNT_CLOSED');
  return super.setUserStatus(userId,status,changedBy,reason);
 }

 async closeAccount(userId,changedBy,reason){
  const uid=clean(userId,100),admin=clean(changedBy,100),note=clean(reason,1000);
  if(!uid||!admin||note.length<5)throw new Error('ACCOUNT_CLOSURE_REASON_REQUIRED');
  const row=this.sql.exec(`SELECT id,role,status FROM users WHERE id=? LIMIT 1`,uid).toArray()[0];
  if(!row||!['customer','partner'].includes(row.role))return null;
  if(row.status==='closed')return {id:row.id,role:row.role,status:'closed',alreadyClosed:true};
  const now=new Date().toISOString(),anonymousEmail=`closed-${crypto.randomUUID()}@deleted.entego.invalid`;
  this.sql.exec(`DELETE FROM sessions WHERE user_id=?`,uid);
  this.sql.exec(`UPDATE users SET email=?,password_hash=?,password_salt=?,display_name='Deleted Account',status='closed',verified=0,updated_at=? WHERE id=?`,anonymousEmail,randomHex(),randomHex().slice(0,32),now,uid);
  this.sql.exec(`INSERT INTO account_status_events(user_id,previous_status,new_status,changed_by,reason,created_at) VALUES(?,?,?,?,?,?)`,uid,row.status,'closed',admin,note,now);
  return {id:row.id,role:row.role,status:'closed',closedAt:now,alreadyClosed:false};
 }
}
