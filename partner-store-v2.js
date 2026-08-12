import {EntegoPartner as BasePartner} from './partner-store.js';
const clean=(v,max=300)=>String(v??'').trim().slice(0,max);
export class EntegoPartner extends BasePartner{
 async setOperationalStatus(userId,status){const uid=clean(userId,100),next=clean(status,20);if(!['active','restricted'].includes(next))throw new Error('INVALID_PARTNER_STATUS');const profile=await this.getProfile(uid);if(!profile)return null;this.sql.exec(`UPDATE profiles SET status=?,updated_at=? WHERE user_id=?`,next,new Date().toISOString(),uid);return this.getProfile(uid)}
}
