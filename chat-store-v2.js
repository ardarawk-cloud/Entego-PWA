import {EntegoChat as BaseChat} from './chat-store.js';
const clean=(v,max=500)=>String(v??'').trim().slice(0,max);

export class EntegoChat extends BaseChat{
 async anonymizeUser(userId){
  const uid=clean(userId,100);if(!uid)return 0;
  const count=this.sql.exec(`SELECT COUNT(*) AS n FROM messages WHERE sender_user_id=?`,uid).toArray()[0]?.n||0;
  this.sql.exec(`UPDATE messages SET sender_name='Deleted Account' WHERE sender_user_id=?`,uid);
  return Number(count)||0;
 }
}
