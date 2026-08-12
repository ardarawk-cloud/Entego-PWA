const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const clean=(v,max=500)=>String(v??'').trim().slice(0,max);
const basic=key=>'Basic '+btoa(`${key}:`);
const authStore=env=>env.ENT_AUTH.getByName('entego-auth-production');
const bookingStore=env=>env.ENT_STORE.getByName('entego-production');
const paymentStore=env=>env.ENT_PAY.getByName('entego-payment-production');

async function canAccess(user,env,bookingId){return user&&bookingId&&authStore(env).canAccessBooking(user.id,user.role,bookingId)}
function configured(env){return Boolean(env.XENDIT_SECRET_KEY&&env.XENDIT_WEBHOOK_TOKEN)}

async function createSession(request,env,user){
 if(!configured(env))return json({ok:false,error:'payment_not_configured'},503);
 const body=await request.json().catch(()=>({})),bookingId=clean(body.bookingId,120);
 if(!(await canAccess(user,env,bookingId)))return json({ok:false,error:'forbidden'},403);
 const booking=await bookingStore(env).getBooking(bookingId);if(!booking)return json({ok:false,error:'booking_not_found'},404);
 if(['dibatalkan','selesai'].includes(booking.status))return json({ok:false,error:'booking_not_payable'},409);
 const amount=Math.max(0,Math.round(Number(booking.total)||0));if(amount<1000)return json({ok:false,error:'invalid_payment_amount'},400);
 const origin=new URL(request.url).origin,referenceId=`ENTEGO-${booking.id}`.slice(0,64);
 const payload={reference_id:referenceId,session_type:'PAY',mode:'PAYMENT_LINK',capture_method:'AUTOMATIC',amount,currency:'IDR',country:'ID',locale:'id',description:`ENTEGO booking ${booking.id}`.slice(0,1000),success_return_url:`${origin}/?entego_payment=success&booking=${encodeURIComponent(booking.id)}`,cancel_return_url:`${origin}/?entego_payment=cancel&booking=${encodeURIComponent(booking.id)}`,metadata:{booking_id:String(booking.id).slice(0,80)}};
 const xr=await fetch('https://api.xendit.co/sessions',{method:'POST',headers:{authorization:basic(env.XENDIT_SECRET_KEY),'content-type':'application/json','accept':'application/json'},body:JSON.stringify(payload)});
 let data={};try{data=await xr.json()}catch{}
 if(!xr.ok||!data.payment_session_id||!data.payment_link_url)return json({ok:false,error:'xendit_session_failed',providerStatus:xr.status,providerCode:clean(data.error_code,80)||null},502);
 const record=await paymentStore(env).saveSession({bookingId:booking.id,sessionId:data.payment_session_id,referenceId,amount,status:data.status||'ACTIVE',paymentLinkUrl:data.payment_link_url,paymentId:data.payment_id||''});
 return json({ok:true,payment:{bookingId:record.booking_id,provider:'xendit',sessionId:record.session_id,status:record.status,paymentLinkUrl:record.payment_link_url,amount:record.amount,currency:record.currency}},201);
}

async function paymentStatus(request,env,user){
 const url=new URL(request.url),bookingId=clean(url.searchParams.get('bookingId'),120);if(!(await canAccess(user,env,bookingId)))return json({ok:false,error:'forbidden'},403);
 const row=await paymentStore(env).getByBooking(bookingId);if(!row)return json({ok:true,payment:null});
 return json({ok:true,payment:{bookingId:row.booking_id,provider:row.provider,sessionId:row.session_id,status:row.status,paymentId:row.payment_id||null,amount:row.amount,currency:row.currency}});
}

async function webhook(request,env){
 if(!env.XENDIT_WEBHOOK_TOKEN)return json({ok:false,error:'webhook_not_configured'},503);
 const token=request.headers.get('x-callback-token')||'';if(token!==env.XENDIT_WEBHOOK_TOKEN)return json({ok:false,error:'invalid_webhook_token'},401);
 const body=await request.json().catch(()=>null);if(!body?.event||!body?.data)return json({ok:false,error:'invalid_webhook'},400);
 const webhookId=request.headers.get('webhook-id')||`${body.event}:${body.data.payment_session_id||''}:${body.created||''}`;
 const fresh=await paymentStore(env).markWebhook(webhookId,body.event);if(!fresh)return json({ok:true,duplicate:true});
 if(!['payment_session.completed','payment_session.expired'].includes(body.event))return json({ok:true,ignored:true});
 const payment=await paymentStore(env).applySessionEvent(body.data,body.event);return json({ok:true,processed:Boolean(payment)});
}

export async function handlePaymentApi(request,env,user){
 const url=new URL(request.url),path=url.pathname;
 if(path==='/api/webhooks/xendit/payment-session'&&request.method==='POST')return webhook(request,env);
 if(path==='/api/payments/config'&&request.method==='GET')return json({ok:true,provider:'xendit',configured:configured(env),mode:'payment_session'});
 if(!user)return json({ok:false,error:'unauthenticated'},401);
 if(path==='/api/payments/session'&&request.method==='POST')return createSession(request,env,user);
 if(path==='/api/payments/status'&&request.method==='GET')return paymentStatus(request,env,user);
 return null;
}
