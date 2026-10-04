import {EntegoPartner as BasePartner} from './partner-store-v3.js';
const clean=(v,max=500)=>String(v??'').trim().slice(0,max);

export class EntegoPartner extends BasePartner{
 async closeAccount(userId,actorId,reason){
  const uid=clean(userId,100),actor=clean(actorId,100),note=clean(reason,500);if(!uid)throw new Error('ACCOUNT_CLOSURE_USER_REQUIRED');
  const now=new Date().toISOString(),profile=await this.getProfile(uid),identity=await this.getIdentity(uid);
  this.sql.exec(`DELETE FROM booking_holds WHERE owner_user_id=?`,uid);
  if(profile){
   this.sql.exec(`DELETE FROM packages WHERE user_id=?`,uid);
   this.sql.exec(`DELETE FROM availability WHERE user_id=?`,uid);
   this.sql.exec(`DELETE FROM portfolio WHERE user_id=?`,uid);
   this.sql.exec(`DELETE FROM booking_holds WHERE user_id=?`,uid);
   this.sql.exec(`UPDATE profiles SET display_name='Closed Partner',category='',area='',specialty='',bio='',social='',price=0,cover_url='',verified=0,verification_status='closed',verification_note='Account closed',status='restricted',services_json='[]',updated_at=? WHERE user_id=?`,now,uid);
  }
  if(identity){
   this.sql.exec(`UPDATE identity_verifications SET legal_name='',phone='',id_last4='',bank_name='',bank_account_name='',bank_account_last4='',ktp_key='',ktp_content_type='',ktp_size=0,selfie_key='',selfie_content_type='',selfie_size=0,identity_status='closed',payout_enabled=0,reviewed_at=?,reviewer_id=?,review_note=?,updated_at=? WHERE user_id=?`,now,actor,'Account closed; private identity media deleted and KYC metadata minimized.',now,uid);
   await this.logIdentityEvent(uid,'account_closed_identity_deleted',actor,note||'Account closed; private identity media deleted and KYC metadata minimized.');
  }
  return {userId:uid,profileMinimized:Boolean(profile),identityMinimized:Boolean(identity),payoutEnabled:false,closedAt:now};
 }
}
