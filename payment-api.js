const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const clean=(v,max=500)=>String(v??'').trim().slice(0,max);
const basic=key=>'Basic '+btoa(`${key}:`);
const authStore=env=>env.ENT_AUTH.getByName('entego-auth-production');
const bookingStore=env=>env.ENT_STORE.getByName('entego-production');
const paymentStore=env=>env.ENT_PAY.getByName('entego-payment-production');

async function canAccess(user,env,bookingId){return user&&bookingId&&authStore(env).canAccessBooking(user.id,user.role,bookingId)}
function configured(env){return Boolean(env.XENDIT_SECRET_KEY&&env.XENDIT_WEBHOOK_TOKEN)}
function publicPayment(row){return row?{bookingId:row.booking_id,provider:row.provider,sessionId:row.session_id,status:row.status,paymentId:row.payment_id||null,paymentRequestId:row.payment_request_id||null,paymentLinkUrl:row.payment_link_url||null,amount:row.amount,currency:row.currency}:null}

async function xenditGetSession(env,sessionId){
 const r=await fetch(`https://api.xendit.co/sessions/${encodeURIComponent(sessionId)}`,{headers:{authorization:basic(env.XENDIT_SECRET_KEY),accept:'application/json'}});let d={};try{d=await r.json()}catch{};return {r,d};
}

async function refreshExisting(env,row){
 if(!row?.session_id||row.status!=='ACTIVE')return row;
 try{
  const {r,d}=await xenditGetSession(env,row.session_id);if(!r.ok)return row;
  if(['COMPLETED','EXPIRED'].includes(d.status)){
   const event=d.status==='COMPLETED'?'payment_session.completed':'payment_session.expired';
   const result=await paymentStore(env).applySessionEvent(d,event);if(result?.ok)return result.payment;
  }
  if(d.status==='ACTIVE'&&d.payment_link_url&&d.payment_link_url!==row.payment_link_url){
   return paymentStore(env).saveSession({bookingId:row.booking_id,sessionId:d.payment_session_id,referenceId:d.reference_id,amount:d.amount,currency:d.currency,status:d.status,paymentLinkUrl:d.payment_link_url,paymentId:d.payment_id||'',paymentRequestId:d.payment_request_id||''});
  }
 }catch{}
 return row;
}

async function createSession(request,env,user){
 if(!configured(env))return json({ok:false,error:'payment_not_configured'},503);
 const body=await request.json().catch(()=>({})),bookingId=clean(body.bookingId,120);
 if(!(await canAccess(user,env,bookingId)))return json({ok:false,error:'forbidden'},403);
 const booking=await bookingStore(env).getBooking(bookingId);if(!booking)return json({ok:false,error:'booking_not_found'},404);
 if(['dibatalkan','selesai'].includes(booking.status))return json({ok:false,error:'booking_not_payable'},409);
 let existing=await paymentStore(env).getByBooking(bookingId);existing=await refreshExisting(env,existing);
 if(existing?.status==='COMPLETED')return json({ok:true,payment:publicPayment(existing),reused:true});
 if(existing?.status==='ACTIVE'&&existing.payment_link_url)return json({ok:true,payment:publicPayment(existing),reused:true});
 const amount=Math.max(0,Math.round(Number(booking.total)||0));if(amount<1000)return json({ok:false,error:'invalid_payment_amount'},400);
 const origin=new URL(request.url).origin,referenceId=`ENTEGO-${booking.id}-${Date.now().toString(36)}`.slice(0,64);
 const payload={reference_id:referenceId,session_type:'PAY',mode:'PAYMENT_LINK',capture_method:'AUTOMATIC',amount,currency:'IDR',country:'ID',locale:'id',description:`ENTEGO booking ${booking.id}`.slice(0,1000),success_return_url:`${origin}/?entego_payment=success&booking=${encodeURIComponent(booking.id)}`,cancel_return_url:`${origin}/?entego_payment=cancel&booking=${encodeURIComponent(booking.id)}`,metadata:{booking_id:String(booking.id).slice(0,80)}};
 const xr=await fetch('https://api.xendit.co/sessions',{method:'POST',headers:{authorization:basic(env.XENDIT_SECRET_KEY),'content-type':'application/json','accept':'application/json'},body:JSON.stringify(payload)});
 let data={};try{data=await xr.json()}catch{}
 if(!xr.ok||!data.payment_session_id||!data.payment_link_url)return json({ok:false,error:'xendit_session_failed',providerStatus:xr.status,providerCode:clean(data.error_code,80)||null},502);
 const record=await paymentStore(env).saveSession({bookingId:booking.id,sessionId:data.payment_session_id,referenceId,amount,status:data.status||'ACTIVE',currency:data.currency||'IDR',paymentLinkUrl:data.payment_link_url,paymentId:data.payment_id||'',paymentRequestId:data.payment_request_id||''});
 return json({ok:true,payment:publicPayment(record)},201);
}

async function paymentStatus(request,env,user){
 const url=new URL(request.url),bookingId=clean(url.searchParams.get('bookingId'),120);if(!(await canAccess(user,env,bookingId)))return json({ok:false,error:'forbidden'},403);
 let row=await paymentStore(env).getByBooking(bookingId);if(row&&configured(env))row=await refreshExisting(env,row);
 const refund=await paymentStore(env).getRefund(bookingId);
 return json({ok:true,payment:publicPayment(row),refund:refund?{id:refund.refund_id||null,status:refund.status,amount:refund.amount,currency:refund.currency,reason:refund.reason}:null});
}

async function createRefund(request,env,user){
 if(!configured(env))return json({ok:false,error:'payment_not_configured'},503);
 if(user?.role!=='admin')return json({ok:false,error:'admin_required'},403);
 const body=await request.json().catch(()=>({})),bookingId=clean(body.bookingId,120);const booking=await bookingStore(env).getBooking(bookingId);if(!booking)return json({ok:false,error:'booking_not_found'},404);
 let payment=await paymentStore(env).getByBooking(bookingId);payment=await refreshExisting(env,payment);
 if(!payment||payment.status!=='COMPLETED'||!payment.payment_request_id)return json({ok:false,error:'payment_not_refundable'},409);
 const existing=await paymentStore(env).getRefund(bookingId);if(existing&&['PENDING','SUCCEEDED'].includes(existing.status))return json({ok:true,refund:existing,reused:true});
 const referenceId=`RF-${booking.id}-${Date.now().toString(36)}`.slice(0,64),amount=Number(payment.amount)||0;
 const xr=await fetch('https://api.xendit.co/refunds',{method:'POST',headers:{authorization:basic(env.XENDIT_SECRET_KEY),'content-type':'application/json','accept':'application/json'},body:JSON.stringify({reference_id:referenceId,payment_request_id:payment.payment_request_id,currency:payment.currency||'IDR',amount,reason:'CANCELLATION',metadata:{booking_id:booking.id}})});
 let data={};try{data=await xr.json()}catch{};if(!xr.ok||!data.id)return json({ok:false,error:'xendit_refund_failed',providerStatus:xr.status,providerCode:clean(data.error_code,80)||null},502);
 const refund=await paymentStore(env).saveRefund({bookingId,refundId:data.id,referenceId,paymentRequestId:payment.payment_request_id,amount:data.amount??amount,currency:data.currency||payment.currency||'IDR',status:data.status||'PENDING',reason:data.reason||'CANCELLATION'});
 if(refund.status==='SUCCEEDED')await bookingStore(env).updateStatus(bookingId,'dibatalkan');
 return json({ok:true,refund},201);
}

async function webhook(request,env){
 if(!env.XENDIT_WEBHOOK_TOKEN)return json({ok:false,error:'webhook_not_configured'},503);
 const token=request.headers.get('x-callback-token')||'';if(token!==env.XENDIT_WEBHOOK_TOKEN)return json({ok:false,error:'invalid_webhook_token'},401);
 const body=await request.json().catch(()=>null);if(!body?.event||!body?.data)return json({ok:false,error:'invalid_webhook'},400);
 const event=String(body.event),webhookId=request.headers.get('webhook-id')||`${event}:${body.data.payment_session_id||body.data.id||body.data.refund_id||''}:${body.created||''}`;
 let applied=null;
 if(['payment_session.completed','payment_session.expired'].includes(event))applied=await paymentStore(env).applySessionEvent(body.data,event);
 else if(['refund.succeeded','refund.failed'].includes(event))applied=await paymentStore(env).applyRefundEvent(body.data,event);
 else return json({ok:true,ignored:true});
 if(!applied?.ok)return json({ok:false,error:applied?.error||'reconciliation_failed'},409);
 const fresh=await paymentStore(env).markWebhook(webhookId,event);if(!fresh)return json({ok:true,duplicate:true});
 if(event==='refund.succeeded'&&applied.refund?.booking_id)await bookingStore(env).updateStatus(applied.refund.booking_id,'dibatalkan');
 return json({ok:true,processed:true});
}

export async function handlePaymentApi(request,env,user){
 const url=new URL(request.url),path=url.pathname;
 if((path==='/api/webhooks/xendit/payment-session'||path==='/api/webhooks/xendit')&&request.method==='POST')return webhook(request,env);
 if(path==='/api/payments/config'&&request.method==='GET')return json({ok:true,provider:'xendit',configured:configured(env),mode:'payment_session',refunds:true});
 if(!user)return json({ok:false,error:'unauthenticated'},401);
 if(path==='/api/payments/session'&&request.method==='POST')return createSession(request,env,user);
 if(path==='/api/payments/status'&&request.method==='GET')return paymentStatus(request,env,user);
 if(path==='/api/payments/refund'&&request.method==='POST')return createRefund(request,env,user);
 return null;
}
