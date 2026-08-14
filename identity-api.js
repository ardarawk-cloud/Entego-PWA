import {getRequestUser} from './auth-api.js';

const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...extra}});
const clean=(v,max=500)=>String(v??'').trim().slice(0,max);
const MAX_IDENTITY_BYTES=6*1024*1024;
const ALLOWED_IDENTITY_MEDIA=new Map([['image/jpeg','jpg'],['image/png','png'],['image/webp','webp']]);
const authStore=env=>env.ENT_AUTH.getByName('entego-auth-production');
const partnerStore=env=>env.ENT_PARTNER.getByName('entego-partners-production');
export const identityStorageConfigured=env=>Boolean(env.ENT_IDENTITY_MEDIA&&typeof env.ENT_IDENTITY_MEDIA.put==='function'&&typeof env.ENT_IDENTITY_MEDIA.get==='function');
const requirePartner=user=>user?.role==='partner'&&user.status==='active';

function identityError(error){
 const code=String(error?.message||error||'identity_server_error');
 const status=new Map([
  ['IDENTITY_USER_REQUIRED',400],['IDENTITY_DETAILS_REQUIRED',409],['IDENTITY_CONSENT_REQUIRED',409],['IDENTITY_DOCUMENTS_REQUIRED',409],
  ['IDENTITY_SUBMISSION_REQUIRED',409],['IDENTITY_REJECTION_REASON_REQUIRED',400],['INVALID_IDENTITY_ACTION',400],['INVALID_IDENTITY_DOCUMENT_KIND',400],
  ['IDENTITY_DOCUMENT_REQUIRED',400],['FULL_ID_NUMBER_NOT_ACCEPTED',400],['FULL_BANK_NUMBER_NOT_ACCEPTED',400]
 ]).get(code)||500;
 return json({ok:false,error:status===500?'identity_server_error':code.toLowerCase()},status);
}

async function rate(env,user,scope,max,seconds){
 const result=await authStore(env).consumeRateLimit(scope,user.id,max,seconds);
 return result?.ok?null:json({ok:false,error:'rate_limited',retryAfter:result?.retryAfter||60},429,{'retry-after':String(result?.retryAfter||60)});
}

async function partnerIdentity(request,env,user){
 if(!requirePartner(user))return json({ok:false,error:user?'partner_required':'unauthenticated'},user?403:401);
 const s=partnerStore(env);
 if(request.method==='GET')return json({ok:true,identity:await s.getIdentity(user.id),privateDocumentStorageConfigured:identityStorageConfigured(env),dataPolicy:{fullNikStored:false,fullBankAccountStored:false,documentsPublic:false}});
 if(request.method==='PUT'){
  const blocked=await rate(env,user,'identity-details',20,3600);if(blocked)return blocked;
  const body=await request.json().catch(()=>({}));
  try{return json({ok:true,identity:await s.saveIdentity(user.id,body),privateDocumentStorageConfigured:identityStorageConfigured(env)})}catch(e){return identityError(e)}
 }
 return json({ok:false,error:'method_not_allowed'},405);
}

async function uploadDocument(request,env,user){
 if(!requirePartner(user))return json({ok:false,error:user?'partner_required':'unauthenticated'},user?403:401);
 if(!identityStorageConfigured(env))return json({ok:false,error:'identity_private_storage_not_configured'},503);
 const blocked=await rate(env,user,'identity-document',12,3600);if(blocked)return blocked;
 const url=new URL(request.url),kind=clean(url.searchParams.get('kind'),20);if(!['ktp','selfie'].includes(kind))return json({ok:false,error:'invalid_identity_document_kind'},400);
 const form=await request.formData().catch(()=>null),file=form?.get('file');if(!file||typeof file.stream!=='function')return json({ok:false,error:'identity_document_required'},400);
 if(!ALLOWED_IDENTITY_MEDIA.has(file.type))return json({ok:false,error:'unsupported_identity_media_type'},415);
 const size=Number(file.size||0);if(size<=0||size>MAX_IDENTITY_BYTES)return json({ok:false,error:'identity_media_too_large'},413);
 const s=partnerStore(env),old=await s.getIdentityDocumentRef(user.id,kind),ext=ALLOWED_IDENTITY_MEDIA.get(file.type),key=`identity/${user.id}/${kind}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
 try{
  await env.ENT_IDENTITY_MEDIA.put(key,file.stream(),{httpMetadata:{contentType:file.type,cacheControl:'private, no-store'},customMetadata:{owner:user.id,kind,classification:'restricted-identity',originalName:clean(file.name,180)}});
  const identity=await s.setIdentityDocument(user.id,kind,{key,contentType:file.type,size});
  if(old?.key&&old.key!==key)await env.ENT_IDENTITY_MEDIA.delete(old.key).catch(()=>{});
  return json({ok:true,identity,document:{kind,uploaded:true,size,contentType:file.type}},201);
 }catch(e){await env.ENT_IDENTITY_MEDIA.delete(key).catch(()=>{});return identityError(e)}
}

async function submitIdentity(request,env,user){
 if(!requirePartner(user))return json({ok:false,error:user?'partner_required':'unauthenticated'},user?403:401);
 const blocked=await rate(env,user,'identity-submit',5,86400);if(blocked)return blocked;
 try{return json({ok:true,identity:await partnerStore(env).submitIdentity(user.id)},200)}catch(e){return identityError(e)}
}

async function payoutEligibility(request,env,user){
 if(!requirePartner(user))return json({ok:false,error:user?'partner_required':'unauthenticated'},user?403:401);
 return json({ok:true,...await partnerStore(env).payoutEligibility(user.id),payoutFeatureActive:false});
}

async function adminIdentityPartners(request,env,user){
 if(user?.role!=='admin')return json({ok:false,error:'admin_required'},403);
 const accounts=await authStore(env).listPartners(150),s=partnerStore(env),partners=[];
 for(const account of accounts){partners.push({account,profile:await s.getProfile(account.id),identity:await s.getIdentity(account.id)})}
 return json({ok:true,partners,privateDocumentStorageConfigured:identityStorageConfigured(env),policy:{approvalRequiresIdentitySubmission:true,payoutRequiresIdentityApproval:true,fullNikStored:false,fullBankAccountStored:false}});
}

async function adminIdentityEvents(request,env,user,userId){
 if(user?.role!=='admin')return json({ok:false,error:'admin_required'},403);
 return json({ok:true,events:await partnerStore(env).listIdentityEvents(userId,100)});
}

async function adminDocument(request,env,user,userId,kind){
 if(user?.role!=='admin')return json({ok:false,error:'admin_required'},403);
 if(!identityStorageConfigured(env))return json({ok:false,error:'identity_private_storage_not_configured'},503);
 const ref=await partnerStore(env).getIdentityDocumentRef(userId,kind);if(!ref)return json({ok:false,error:'identity_document_not_found'},404);
 const obj=await env.ENT_IDENTITY_MEDIA.get(ref.key);if(!obj)return json({ok:false,error:'identity_document_not_found'},404);
 const headers=new Headers({'content-type':ref.contentType||'application/octet-stream','cache-control':'private, no-store, max-age=0','pragma':'no-cache','x-content-type-options':'nosniff','content-disposition':`inline; filename="entego-${kind}-${clean(userId,40)}"`});
 return new Response(obj.body,{status:200,headers});
}

async function reviewPartnerIdentity(request,env,admin,userId){
 if(admin?.role!=='admin')return json({ok:false,error:'admin_required'},403);
 const auth=authStore(env),s=partnerStore(env),target=await auth.getUser(userId);if(!target||target.role!=='partner')return json({ok:false,error:'partner_not_found'},404);
 const profile=await s.getProfile(userId);if(!profile)return json({ok:false,error:'partner_profile_required'},409);
 const body=await request.json().catch(()=>({})),action=clean(body.action,20),note=clean(body.note,500);if(!['approve','reject','reset'].includes(action))return json({ok:false,error:'invalid_verification_action'},400);
 try{
  let identity=await s.getIdentity(userId);
  if(action==='approve')identity=await s.reviewIdentity(userId,'approve',admin.id,note||'Identitas dan rekening diperiksa Admin ENTEGO.');
  else if(identity)identity=await s.reviewIdentity(userId,action,admin.id,note|| (action==='reset'?'Menunggu pengajuan ulang.':''));
  const updatedProfile=await s.setVerification(userId,action,note),updatedAccount=await auth.setPartnerVerification(userId,action==='approve');
  return json({ok:true,account:updatedAccount,profile:updatedProfile,identity,payoutEligible:Boolean(identity?.payoutEnabled),payoutFeatureActive:false});
 }catch(e){return identityError(e)}
}

async function payoutFailClosed(request,env,user){
 if(!user)return json({ok:false,error:'unauthenticated'},401);
 if(user.role!=='partner')return json({ok:false,error:'partner_required'},403);
 const gate=await partnerStore(env).payoutEligibility(user.id);if(!gate.eligible)return json({ok:false,error:'identity_verification_required',identityStatus:gate.identity?.identityStatus||'not_started',payoutEnabled:false},403);
 return json({ok:false,error:'payout_not_activated',payoutEnabled:true},503);
}

export async function handleIdentityApi(request,env){
 const url=new URL(request.url),path=url.pathname;
 if(path==='/api/identity/config'&&request.method==='GET')return json({ok:true,privateDocumentStorageConfigured:identityStorageConfigured(env),maxBytes:MAX_IDENTITY_BYTES,accept:[...ALLOWED_IDENTITY_MEDIA.keys()],fullNikStored:false,fullBankAccountStored:false,documentsPublic:false,payoutGate:'identity-approved-required'});
 if(!path.startsWith('/api/partner/me/identity')&&!path.startsWith('/api/admin/identity/')&&!/^\/api\/admin\/partners\/[^/]+\/verification$/.test(path)&&!path.startsWith('/api/payouts/'))return null;
 const user=await getRequestUser(request,env);
 if(path==='/api/partner/me/identity'&&['GET','PUT'].includes(request.method))return partnerIdentity(request,env,user);
 if(path==='/api/partner/me/identity/document'&&request.method==='POST')return uploadDocument(request,env,user);
 if(path==='/api/partner/me/identity/submit'&&request.method==='POST')return submitIdentity(request,env,user);
 if(path==='/api/partner/me/identity/payout-eligibility'&&request.method==='GET')return payoutEligibility(request,env,user);
 if(path==='/api/admin/identity/partners'&&request.method==='GET')return adminIdentityPartners(request,env,user);
 let m=path.match(/^\/api\/admin\/identity\/partners\/([^/]+)\/events$/);if(m&&request.method==='GET')return adminIdentityEvents(request,env,user,decodeURIComponent(m[1]));
 m=path.match(/^\/api\/admin\/identity\/partners\/([^/]+)\/document\/(ktp|selfie)$/);if(m&&request.method==='GET')return adminDocument(request,env,user,decodeURIComponent(m[1]),m[2]);
 m=path.match(/^\/api\/admin\/partners\/([^/]+)\/verification$/);if(m&&request.method==='POST')return reviewPartnerIdentity(request,env,user,decodeURIComponent(m[1]));
 if(path.startsWith('/api/payouts/'))return payoutFailClosed(request,env,user);
 return json({ok:false,error:'identity_route_not_found'},404);
}
