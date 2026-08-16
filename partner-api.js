const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...extra}});
const clean=(v,max=500)=>String(v??'').trim().slice(0,max);
const store=env=>env.ENT_PARTNER.getByName('entego-partners-production');
const requirePartner=user=>user&&['partner','admin'].includes(user.role);
const MIN_SERVICE_PRICE=1000000;
const belowFloor=v=>{const n=Math.max(0,Math.round(Number(v)||0));return n>0&&n<MIN_SERVICE_PRICE};
export async function handlePartnerApi(request,env,user){
 const url=new URL(request.url),path=url.pathname,method=request.method,s=store(env);
 if(path==='/api/directory'&&method==='GET'){
  const started=performance.now();
  const partners=await s.listDirectory({q:url.searchParams.get('q')||'',category:url.searchParams.get('category')||'',area:url.searchParams.get('area')||'',maxPrice:url.searchParams.get('maxPrice')||0,limit:url.searchParams.get('limit')||50});
  const duration=Math.max(0,performance.now()-started).toFixed(1);
  return json({ok:true,partners},200,{'server-timing':`entego_partner_do;dur=${duration}`,'x-entego-directory-do-ms':duration});
 }
 let m=path.match(/^\/api\/partners\/([^/]+)$/);if(m&&method==='GET'){const bundle=await s.publicBundle(decodeURIComponent(m[1]));return bundle?json({ok:true,...bundle}):json({ok:false,error:'partner_not_found'},404)}
 if(path==='/api/partner/me/profile'){
  if(!requirePartner(user))return json({ok:false,error:'partner_required'},403);
  if(method==='GET')return json({ok:true,profile:await s.getProfile(user.id)});
  if(method==='PUT'){const body=await request.json().catch(()=>({}));if(belowFloor(body.price))return json({ok:false,error:'minimum_service_price',minimumPrice:MIN_SERVICE_PRICE},400);try{return json({ok:true,profile:await s.saveProfile(user.id,body,user.verified)},200)}catch(e){return json({ok:false,error:String(e.message)==='PROFILE_REQUIRED'?'PROFILE_REQUIRED':'partner_server_error'},400)}}
 }
 if(path==='/api/partner/me/packages'){
  if(!requirePartner(user))return json({ok:false,error:'partner_required'},403);
  if(method==='GET')return json({ok:true,packages:await s.getPackages(user.id)});
  if(method==='PUT'){const body=await request.json().catch(()=>({})),items=Array.isArray(body.packages)?body.packages:[];if(items.some(x=>belowFloor(x?.price)))return json({ok:false,error:'minimum_service_price',minimumPrice:MIN_SERVICE_PRICE},400);return json({ok:true,packages:await s.savePackages(user.id,items)})}
 }
 if(path==='/api/partner/me/availability'){
  if(!requirePartner(user))return json({ok:false,error:'partner_required'},403);
  if(method==='GET')return json({ok:true,availability:await s.getAvailability(user.id)});
  if(method==='PUT'){const body=await request.json().catch(()=>({}));return json({ok:true,availability:await s.saveAvailability(user.id,Array.isArray(body.availability)?body.availability:[])})}
 }
 if(path==='/api/partner/me/portfolio'){
  if(!requirePartner(user))return json({ok:false,error:'partner_required'},403);
  if(method==='GET')return json({ok:true,portfolio:await s.getPortfolio(user.id)});
  if(method==='PUT'){const body=await request.json().catch(()=>({}));return json({ok:true,portfolio:await s.savePortfolio(user.id,Array.isArray(body.portfolio)?body.portfolio:[])})}
 }
 return null;
}