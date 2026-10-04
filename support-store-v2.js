import {EntegoSupport as BaseSupport} from './support-store.js';
const clean=(v,max=500)=>String(v??'').trim().slice(0,max);

export class EntegoSupport extends BaseSupport{
 async anonymizeUser(userId,closureCaseId=''){
  const uid=clean(userId,100),keep=clean(closureCaseId,120);if(!uid)return 0;
  const count=this.sql.exec(`SELECT COUNT(*) AS n FROM support_cases WHERE user_id=?`,uid).toArray()[0]?.n||0;
  const now=new Date().toISOString();
  this.sql.exec(`UPDATE support_cases SET subject=CASE WHEN id=? THEN 'Account closure completed' ELSE 'Closed account support record' END,description='',updated_at=? WHERE user_id=?`,keep,now,uid);
  return Number(count)||0;
 }
}
