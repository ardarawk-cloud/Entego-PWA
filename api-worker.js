import bookingWorker from './worker.js';
import {handleAuthApi,getRequestUser} from './auth-api.js';
export {EntegoStore} from './worker.js';
export {EntegoAuth} from './auth-store.js';

const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const authStore=env=>env.ENT_AUTH.getByName('entego-auth-production');
const bookingStore=env=>env.ENT_STORE.getByName('entego-production');
const bookingIdFromPath=path=>decodeURIComponent((path.match(/^\/api\/bookings\/([^/]+)/)||[])[1]||'');

async function requireUser(request,env){return getRequestUser(request,env)}
async function canAccess(user,env,bookingId){return user&&bookingId&&authStore(env).canAccessBooking(user.id,user.role,bookingId)}

async function handleProtected(request,env){
 const url=new URL(request.url),path=url.pathname,method=request.method;
 if(path==='/api/health')return null;
 if(!path.startsWith('/api/'))return null;
 if(path.startsWith('/api/auth/'))return null;
 const user=await requireUser(request,env);
 if(!user)return json({ok:false,error:'unauthenticated'},401);

 if(path==='/api/bookings'&&method==='POST'){
  if(!['customer','admin'].includes(user.role))return json({ok:false,error:'customer_role_required'},403);
  const response=await bookingWorker.fetch(request,env);
  if(response.ok){try{const data=await response.clone().json();if(data?.booking?.id&&user.role==='customer')await authStore(env).bindBooking(user.id,data.booking.id,'customer')}catch{}}
  return response;
 }
 if(path==='/api/bookings'&&method==='GET'){
  if(user.role==='admin')return bookingWorker.fetch(request,env);
  const ids=await authStore(env).listBookingIds(user.id,user.role);const store=bookingStore(env);const bookings=[];
  for(const id of ids.slice(0,100)){const b=await store.getBooking(id);if(b)bookings.push(b)}
  return json({ok:true,bookings});
 }
 if(path==='/api/transactions'&&method==='GET'){
  const id=url.searchParams.get('bookingId')||'';
  if(!(await canAccess(user,env,id)))return json({ok:false,error:'forbidden'},403);
  return bookingWorker.fetch(request,env);
 }

 const id=bookingIdFromPath(path);
 if(id){
  if(!(await canAccess(user,env,id)))return json({ok:false,error:'forbidden'},403);
  const isBase=new RegExp(`^/api/bookings/[^/]+$`).test(path);
  const isReschedule=new RegExp(`^/api/bookings/[^/]+/reschedule$`).test(path);
  const isReview=new RegExp(`^/api/bookings/[^/]+/review$`).test(path);
  if(isBase&&method==='GET')return bookingWorker.fetch(request,env);
  if(isBase&&method==='PATCH'){
   const body=await request.clone().json().catch(()=>({}));const status=String(body.status||'');
   if(user.role==='customer'&&status!=='dibatalkan')return json({ok:false,error:'forbidden_status_change'},403);
   if(user.role==='partner'&&!['diterima','ditolak','berlangsung','selesai'].includes(status))return json({ok:false,error:'forbidden_status_change'},403);
   return bookingWorker.fetch(request,env);
  }
  if(isReschedule){
   if(method==='GET')return bookingWorker.fetch(request,env);
   if(method==='POST'&&['customer','admin'].includes(user.role))return bookingWorker.fetch(request,env);
   if(method==='PATCH'){
    const body=await request.clone().json().catch(()=>({}));const action=String(body.action||'');
    if(user.role==='customer'&&action!=='cancel')return json({ok:false,error:'forbidden_reschedule_action'},403);
    if(user.role==='partner'&&!['approve','reject'].includes(action))return json({ok:false,error:'forbidden_reschedule_action'},403);
    if(user.role==='admin'||user.role==='customer'||user.role==='partner')return bookingWorker.fetch(request,env);
   }
  }
  if(isReview){
   if(method==='GET')return bookingWorker.fetch(request,env);
   if(method==='POST'&&['customer','admin'].includes(user.role))return bookingWorker.fetch(request,env);
   return json({ok:false,error:'forbidden_review_action'},403);
  }
 }

 const assign=path.match(/^\/api\/admin\/bookings\/([^/]+)\/assign-partner$/);
 if(assign&&method==='POST'){
  if(user.role!=='admin')return json({ok:false,error:'admin_required'},403);
  const body=await request.json();const ok=await authStore(env).assignPartner(decodeURIComponent(assign[1]),body.partnerUserId);
  return ok?json({ok:true}):json({ok:false,error:'partner_not_found'},404);
 }

 return bookingWorker.fetch(request,env);
}

export default {
 async fetch(request,env){
  const auth=await handleAuthApi(request,env);if(auth)return auth;
  const protectedResponse=await handleProtected(request,env);if(protectedResponse)return protectedResponse;
  return bookingWorker.fetch(request,env);
 }
};
