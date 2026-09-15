import core from './api-worker-v63.js';
import {getRequestUser} from './auth-api.js';
import {EntegoAuth} from './auth-store-v4.js';
import {EntegoPartner} from './partner-store-v4.js';
import {EntegoChat} from './chat-store-v2.js';
export {EntegoAuth,EntegoPartner,EntegoChat};
export {EntegoStore,EntegoPayment,EntegoOps,EntegoPresence,EntegoAlerts,EntegoSupport} from './api-worker-v63.js';

const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const authStore=env=>env.ENT_AUTH.getByName('entego-auth-production');
const bookingStore=env=>env.ENT_STORE.getByName('entego-production');
const paymentStore=env=>env.ENT_PAY.getByName('entego-payment-production');
const partnerStore=env=>env.ENT_PARTNER.getByName('entego-partners-production');
const chatStore=env=>env.ENT_CHAT.getByName('entego-chat-production');
const opsStore=env=>env.ENT_OPS.getByName('entego-ops-production');
const supportStore=env=>env.ENT_SUPPORT.getByName('entego-support-production');

const safeCase=row=>row?{id:row.id,category:row.category,subject:row.subject,description:row.description,bookingId:row.booking_id||'',status:row.status,resolution:row.resolution||'',createdAt:row.created_at,updatedAt:row.updated_at}:null;

async function closureBlockers(env,user){
 if(!user||user.role==='admin')return[];
 const ids=await authStore(env).listBookingIds(user.id,user.role),blocking=[];
 for(const id of ids.slice(0,100)){
  const booking=await bookingStore(env).getBooking(id);if(!booking)continue;
  const [dispute,refund]=await Promise.all([opsStore(env).getOpenDispute(id),paymentStore(env).getRefund(id)]);
  if(['baru','diterima','berlangsung'].includes(booking.status)||dispute||refund?.status==='PENDING')blocking.push({bookingId:id,status:booking.status,dispute:Boolean(dispute),refundPending:refund?.status==='PENDING'});
 }
 return blocking;
}

async function executeClosure(env,admin,row,resolution){
 if(row.category!=='account_closure')throw new Error('NOT_ACCOUNT_CLOSURE');
 const auth=authStore(env),target=await auth.getUser(row.user_id);
 if(!target||!['customer','partner'].includes(target.role))throw new Error('ACCOUNT_NOT_FOUND');
 const blockers=await closureBlockers(env,target);
 if(blockers.length)return {blocked:true,blockingObligations:blockers};
 const partnerResult=await partnerStore(env).closeAccount(target.id,admin.id,resolution);
 const anonymizedMessages=await chatStore(env).anonymizeUser(target.id);
 const account=await auth.closeAccount(target.id,admin.id,resolution);
 const closedCase=await supportStore(env).updateCase(row.id,'resolved',resolution);
 return {blocked:false,case:closedCase,account,partnerResult,anonymizedMessages};
}

async function adminUpdateCase(request,env,id){
 const admin=await getRequestUser(request,env);if(admin?.role!=='admin')return json({ok:false,error:'admin_required'},403);
 const s=supportStore(env),row=await s.getCase(id);if(!row)return json({ok:false,error:'support_case_not_found'},404);
 const body=await request.json().catch(()=>({})),action=String(body.action||''),resolution=String(body.resolution||'').trim();
 if(action==='review'){
  try{return json({ok:true,case:safeCase(await s.updateCase(id,'in_review',''))})}catch(e){return json({ok:false,error:String(e?.message||'support_update_failed').toLowerCase()},400)}
 }
 if(action!=='resolve'&&action!=='close_account')return json({ok:false,error:'invalid_support_action'},400);
 if(resolution.length<5)return json({ok:false,error:'support_resolution_required'},400);
 if(row.category!=='account_closure'){
  try{return json({ok:true,case:safeCase(await s.updateCase(id,'resolved',resolution))})}catch(e){return json({ok:false,error:String(e?.message||'support_update_failed').toLowerCase()},400)}
 }
 try{
  const result=await executeClosure(env,admin,row,resolution);
  if(result.blocked)return json({ok:false,error:'account_closure_blocked',blockingObligations:result.blockingObligations},409);
  return json({ok:true,case:safeCase(result.case),closure:{status:'closed',account:result.account,partnerDataMinimized:result.partnerResult?.profileMinimized||false,identityRetainedPrivate:result.partnerResult?.identityRetainedPrivate||false,anonymizedMessages:result.anonymizedMessages}});
 }catch(e){
  const code=String(e?.message||'account_closure_failed');
  const status=code==='ACCOUNT_NOT_FOUND'?404:400;
  return json({ok:false,error:status===404?'account_not_found':code.toLowerCase()},status);
 }
}

export default {
 async fetch(request,env){
  const url=new URL(request.url),path=url.pathname;
  if(path==='/api/health'&&request.method==='GET'){
   const response=await core.fetch(request,env);let data={};try{data=await response.json()}catch{}
   return json({...data,accountClosureExecution:'admin-reviewed-anonymize-v1',accountClosureIdentityRetention:'private-minimized-payout-disabled',version:'v64'});
  }
  const m=path.match(/^\/api\/admin\/support\/cases\/([^/]+)$/);
  if(m&&request.method==='POST')return adminUpdateCase(request,env,decodeURIComponent(m[1]));
  return core.fetch(request,env);
 }
};
