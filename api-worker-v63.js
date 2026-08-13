import core from './api-worker-v62.js';
import {getRequestUser} from './auth-api.js';
import {EntegoSupport} from './support-store.js';
export {EntegoStore,EntegoAuth,EntegoPayment,EntegoPartner,EntegoChat,EntegoOps,EntegoPresence,EntegoAlerts} from './api-worker-v62.js';
export {EntegoSupport} from './support-store.js';

const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const authStore=env=>env.ENT_AUTH.getByName('entego-auth-production');
const bookingStore=env=>env.ENT_STORE.getByName('entego-production');
const paymentStore=env=>env.ENT_PAY.getByName('entego-payment-production');
const opsStore=env=>env.ENT_OPS.getByName('entego-ops-production');
const alertStore=env=>env.ENT_ALERTS.getByName('entego-alerts-production');
const supportStore=env=>env.ENT_SUPPORT.getByName('entego-support-production');
const CATEGORIES=new Set(['account','account_closure','safety','fraud','privacy','technical','booking_help','other']);

async function closureBlockers(env,user){
  if(user.role==='admin')return[];
  const ids=await authStore(env).listBookingIds(user.id,user.role),blocking=[];
  for(const id of ids.slice(0,100)){
    const b=await bookingStore(env).getBooking(id);
    if(!b)continue;
    const [dispute,refund]=await Promise.all([opsStore(env).getOpenDispute(id),paymentStore(env).getRefund(id)]);
    if(['baru','diterima','berlangsung'].includes(b.status)||dispute||refund?.status==='PENDING')blocking.push({bookingId:id,status:b.status,dispute:Boolean(dispute),refundPending:refund?.status==='PENDING'});
  }
  return blocking;
}

function safeCase(row){
  return row?{id:row.id,category:row.category,subject:row.subject,description:row.description,bookingId:row.booking_id||'',status:row.status,resolution:row.resolution||'',createdAt:row.created_at,updatedAt:row.updated_at}:null;
}

async function createCase(request,env){
  const user=await getRequestUser(request,env);
  if(!user)return json({ok:false,error:'unauthenticated'},401);
  const rate=await authStore(env).consumeRateLimit('support-case',user.id,10,3600);
  if(!rate.ok)return json({ok:false,error:'support_rate_limited',retryAfter:rate.retryAfter},429);
  const body=await request.json().catch(()=>({})),category=String(body.category||''),subject=String(body.subject||'').trim(),description=String(body.description||'').trim(),bookingId=String(body.bookingId||'').trim();
  if(!CATEGORIES.has(category)||subject.length<3||description.length<10)return json({ok:false,error:'support_case_required'},400);
  if(bookingId&&!(await authStore(env).canAccessBooking(user.id,user.role,bookingId)))return json({ok:false,error:'booking_access_required'},403);
  if(category==='account_closure'){
    const blockers=await closureBlockers(env,user);
    if(blockers.length)return json({ok:false,error:'account_closure_blocked',blockingObligations:blockers},409);
    const existing=(await supportStore(env).listUser(user.id,50)).find(x=>x.category==='account_closure'&&x.status!=='resolved');
    if(existing)return json({ok:true,case:safeCase(existing),existing:true});
  }
  try{
    const row=await supportStore(env).createCase({userId:user.id,userRole:user.role,category,subject,description,bookingId});
    return json({ok:true,case:safeCase(row)},201);
  }catch(e){
    return json({ok:false,error:String(e?.message||'support_case_failed').toLowerCase()},400);
  }
}

async function userCases(request,env){
  const user=await getRequestUser(request,env);
  if(!user)return json({ok:false,error:'unauthenticated'},401);
  return json({ok:true,cases:(await supportStore(env).listUser(user.id,50)).map(safeCase)});
}

async function adminCases(request,env){
  const admin=await getRequestUser(request,env);
  if(admin?.role!=='admin')return json({ok:false,error:'admin_required'},403);
  const url=new URL(request.url),rows=await supportStore(env).list(url.searchParams.get('status')||'all',150),cases=[];
  for(const row of rows){
    const u=await authStore(env).getUser(row.user_id);
    cases.push({...safeCase(row),user:u?{displayName:u.displayName,role:u.role,status:u.status}:null});
  }
  return json({ok:true,cases});
}

async function updateCase(request,env,id){
  const admin=await getRequestUser(request,env);
  if(admin?.role!=='admin')return json({ok:false,error:'admin_required'},403);
  const body=await request.json().catch(()=>({})),action=String(body.action||''),resolution=String(body.resolution||'').trim(),status=action==='review'?'in_review':action==='resolve'?'resolved':'';
  if(!status)return json({ok:false,error:'invalid_support_action'},400);
  try{
    const row=await supportStore(env).updateCase(id,status,resolution);
    return row?json({ok:true,case:safeCase(row)}):json({ok:false,error:'support_case_not_found'},404);
  }catch(e){
    return json({ok:false,error:String(e?.message||'support_update_failed').toLowerCase()},400);
  }
}

async function augmentActionCenter(request,env){
  const user=await getRequestUser(request,env);
  if(!user)return core.fetch(request,env);
  const response=await core.fetch(request,env);
  if(!response.ok)return response;
  let data={};
  try{data=await response.json()}catch{return response}
  const support=user.role==='admin'?(await supportStore(env).list('all',100)).filter(x=>x.status!=='resolved'):(await supportStore(env).listUser(user.id,20)).filter(x=>x.status==='in_review'||x.status==='resolved');
  if(!support.length)return json(data);
  const readMap=new Map((await alertStore(env).listRead(user.id,500)).map(x=>[x.key,x.readAt]));
  const extra=support.map(row=>{
    const key=user.role==='admin'?`admin-support:${row.id}:${row.status}:${row.updated_at}`:`support-update:${row.id}:${row.status}:${row.updated_at}`;
    return {key,type:'support',severity:row.category==='safety'||row.category==='fraud'?'high':'medium',title:user.role==='admin'?`Support case ${row.status==='open'?'baru':'ditinjau'}`:`Case ${row.status==='resolved'?'selesai':'sedang ditinjau'}`,body:`${row.id} • ${row.subject}`,route:user.role==='admin'?'adminBookings':'help',read:readMap.has(key),readAt:readMap.get(key)||null};
  });
  const items=[...extra,...(data.items||[])],order={high:0,medium:1,info:2};
  items.sort((a,b)=>(order[a.severity]??9)-(order[b.severity]??9));
  return json({...data,items:items.slice(0,120),unreadCount:items.filter(x=>!x.read).length});
}

function clientRecovery(request){
  const url=new URL(request.url),stay=url.searchParams.get('stay')==='1';
  const html=`<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0f172a"><title>ENTEGO Recovery</title><style>html,body{margin:0;background:#0f172a;color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box}.card{width:min(100%,420px);text-align:center}.mark{width:64px;height:64px;margin:0 auto 18px;border-radius:18px;background:#f97316;display:grid;place-items:center;font-size:28px;font-weight:800}h1{font-size:24px;margin:0 0 10px}p{color:#cbd5e1;line-height:1.55;margin:0}.status{margin-top:18px;padding:12px 14px;border:1px solid #334155;border-radius:14px;color:#e2e8f0;font-size:13px}</style></head><body><main><div class="card"><div class="mark">E</div><h1>Memulihkan ENTEGO</h1><p>Membersihkan Service Worker dan cache ENTEGO lama tanpa menghapus akun Anda.</p><div class="status" id="entegoRecoveryStatus">Menyiapkan pemulihan…</div></div></main><script>(async()=>{const status=document.getElementById('entegoRecoveryStatus');try{if('serviceWorker'in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.unregister()))}}catch{}try{if('caches'in window){const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('entego-')).map(k=>caches.delete(k)))}}catch{}try{localStorage.setItem('entego_route','home')}catch{}status.textContent='Pemulihan selesai. Memuat ENTEGO v75…';if(!${stay?'true':'false'})setTimeout(()=>location.replace('/?client-recovered=75&t='+Date.now()),250)})();</script></body></html>`;
  return new Response(html,{status:200,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store, no-cache, must-revalidate','pragma':'no-cache','expires':'0','x-content-type-options':'nosniff'}});
}

export default {
  async fetch(request,env){
    const url=new URL(request.url),path=url.pathname;
    if(path==='/api/client-recovery'&&request.method==='GET')return clientRecovery(request);
    if(path==='/api/health'&&request.method==='GET'){
      const response=await core.fetch(request,env);let data={};
      try{data=await response.json()}catch{}
      return json({...data,supportCenter:'server-case-management',accountClosureRequest:'obligation-guarded',clientRecovery:'v75-sw-escape',version:'v63'});
    }
    if(path==='/api/action-center'&&request.method==='GET')return augmentActionCenter(request,env);
    if(path==='/api/support/cases'&&request.method==='GET')return userCases(request,env);
    if(path==='/api/support/cases'&&request.method==='POST')return createCase(request,env);
    if(path==='/api/admin/support/cases'&&request.method==='GET')return adminCases(request,env);
    const m=path.match(/^\/api\/admin\/support\/cases\/([^/]+)$/);
    if(m&&request.method==='POST')return updateCase(request,env,decodeURIComponent(m[1]));
    return core.fetch(request,env);
  }
};