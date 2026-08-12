import core from './api-worker-v50.js';
import {getRequestUser} from './auth-api.js';
export {EntegoStore,EntegoAuth,EntegoPayment,EntegoPartner,EntegoChat,EntegoOps} from './api-worker-v50.js';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const authStore=env=>env.ENT_AUTH.getByName('entego-auth-production');
const partnerStore=env=>env.ENT_PARTNER.getByName('entego-partners-production');
async function participants(request,env,bookingId){
 const user=await getRequestUser(request,env);if(!user)return json({ok:false,error:'unauthenticated'},401);
 if(!(await authStore(env).canAccessBooking(user.id,user.role,bookingId)))return json({ok:false,error:'forbidden'},403);
 const rows=await authStore(env).getBookingParticipants(bookingId),safe=[];
 for(const row of rows){
  let verifiedPartner=false;
  if(row.accessRole==='partner'){const profile=await partnerStore(env).getProfile(row.id);verifiedPartner=Boolean(row.verified&&row.status==='active'&&profile?.verified&&profile?.verificationStatus==='approved'&&profile?.status==='active')}
  safe.push({displayName:row.displayName,role:row.role,accessRole:row.accessRole,accountStatus:row.status==='active'?'active':'restricted',accountCreatedAt:row.createdAt,verifiedPartner});
 }
 return json({ok:true,participants:safe});
}
export default {async fetch(request,env){const url=new URL(request.url),path=url.pathname;if(path==='/api/health'&&request.method==='GET'){const response=await core.fetch(request,env);let data={};try{data=await response.json()}catch{};return json({...data,authStore:'v2-clean',bookingParticipants:'privacy-safe',legacyCancelUi:'disabled',version:'v52'})}const m=path.match(/^\/api\/bookings\/([^/]+)\/participants$/);if(m&&request.method==='GET')return participants(request,env,decodeURIComponent(m[1]));return core.fetch(request,env)}};
