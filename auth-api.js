const COOKIE='entego_session';
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...extra}});
const cookieMap=req=>Object.fromEntries((req.headers.get('cookie')||'').split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const i=x.indexOf('=');return i<0?[x,'']:[x.slice(0,i),decodeURIComponent(x.slice(i+1))]}));
const sessionCookie=(token,maxAge=2592000)=>`${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
const clearCookie=()=>`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
const authStore=env=>env.ENT_AUTH.getByName('entego-auth-production');
const enc=new TextEncoder();
async function safeSecret(a,b){if(!a||!b)return false;const [aa,bb]=await Promise.all([crypto.subtle.digest('SHA-256',enc.encode(String(a))),crypto.subtle.digest('SHA-256',enc.encode(String(b)))]);const av=new Uint8Array(aa),bv=new Uint8Array(bb);if(av.length!==bv.length)return false;if(crypto.subtle.timingSafeEqual)return crypto.subtle.timingSafeEqual(av,bv);let diff=0;for(let i=0;i<av.length;i++)diff|=av[i]^bv[i];return diff===0}
const requestIp=req=>(req.headers.get('cf-connecting-ip')||req.headers.get('x-real-ip')||(req.headers.get('x-forwarded-for')||'').split(',')[0]||`ua:${req.headers.get('user-agent')||'unknown'}`).trim().slice(0,180);
const emailKey=body=>String(body?.email||'').trim().toLowerCase().slice(0,180)||'empty';
const limited=(result)=>result?.ok?null:json({ok:false,error:'rate_limited',retryAfter:result?.retryAfter||60},429,{'retry-after':String(result?.retryAfter||60)});
async function enforce(store,rules){for(const [scope,key,max,seconds] of rules){const result=await store.consumeRateLimit(scope,key,max,seconds),blocked=limited(result);if(blocked)return blocked}return null}

export async function getRequestUser(request,env){
 const token=cookieMap(request)[COOKIE];if(!token)return null;
 try{return await authStore(env).getSession(token)}catch{return null}
}

export async function handleAuthApi(request,env){
 const url=new URL(request.url);if(!url.pathname.startsWith('/api/auth/'))return null;
 const store=authStore(env),ua=request.headers.get('user-agent')||'',ip=requestIp(request),token=cookieMap(request)[COOKIE]||'';
 let safeDiagnostic=false;
 try{
  if(url.pathname==='/api/auth/register'&&request.method==='POST'){
   const body=await request.json().catch(()=>({})),email=emailKey(body);safeDiagnostic=String(body?.displayName||'')==='ENTEGO Happy Probe'&&email.endsWith('@example.invalid');
   const blocked=await enforce(store,[['register-ip',ip,8,3600],['register-email',email,3,3600]]);if(blocked)return blocked;
   const result=await store.register(body,ua);
   return json({ok:true,user:result.user},201,{'set-cookie':sessionCookie(result.token)});
  }
  if(url.pathname==='/api/auth/login'&&request.method==='POST'){
   const body=await request.json().catch(()=>({})),email=emailKey(body),blocked=await enforce(store,[['login-ip',ip,40,900],['login-email',email,10,900]]);if(blocked)return blocked;
   const result=await store.login(body,ua);await store.resetRateLimit('login-email',email);
   return json({ok:true,user:result.user},200,{'set-cookie':sessionCookie(result.token)});
  }
  if(url.pathname==='/api/auth/logout'&&request.method==='POST'){
   await store.logout(token);
   return json({ok:true},200,{'set-cookie':clearCookie()});
  }
  if(url.pathname==='/api/auth/logout-all'&&request.method==='POST'){
   const user=await getRequestUser(request,env);if(!user)return json({ok:false,error:'unauthenticated'},401);await store.logoutAll(user.id);return json({ok:true},200,{'set-cookie':clearCookie()});
  }
  if(url.pathname==='/api/auth/me'&&request.method==='GET'){
   const user=await getRequestUser(request,env);
   return user?json({ok:true,user}):json({ok:false,error:'unauthenticated'},401);
  }
  if(url.pathname==='/api/auth/sessions'&&request.method==='GET'){
   const user=await getRequestUser(request,env);if(!user)return json({ok:false,error:'unauthenticated'},401);return json({ok:true,sessions:await store.listSessions(user.id,token)});
  }
  if(url.pathname==='/api/auth/sessions/revoke-others'&&request.method==='POST'){
   const user=await getRequestUser(request,env);if(!user)return json({ok:false,error:'unauthenticated'},401);await store.revokeOtherSessions(user.id,token);return json({ok:true});
  }
  const sessionMatch=url.pathname.match(/^\/api\/auth\/sessions\/([^/]+)$/);
  if(sessionMatch&&request.method==='DELETE'){
   const user=await getRequestUser(request,env);if(!user)return json({ok:false,error:'unauthenticated'},401);const id=decodeURIComponent(sessionMatch[1]),sessions=await store.listSessions(user.id,token),current=sessions.find(x=>x.id===id)?.current;await store.revokeSession(user.id,id);return json({ok:true,currentRevoked:Boolean(current)},200,current?{'set-cookie':clearCookie()}:{});
  }
  if(url.pathname==='/api/auth/admin/bootstrap'&&request.method==='POST'){
   const blocked=await enforce(store,[['admin-bootstrap-ip',ip,8,900]]);if(blocked)return blocked;
   if(!env.ADMIN_BOOTSTRAP_KEY)return json({ok:false,error:'admin_bootstrap_not_configured'},503);
   const supplied=request.headers.get('x-entego-admin-key')||'';
   if(!(await safeSecret(supplied,env.ADMIN_BOOTSTRAP_KEY)))return json({ok:false,error:'forbidden'},403);
   const body=await request.json().catch(()=>({}));const user=await store.promoteAdmin(body.email);
   return user?json({ok:true,user}):json({ok:false,error:'user_not_found'},404);
  }
  return json({ok:false,error:'auth_route_not_found'},404);
 }catch(error){
  const message=String(error?.message||error);
  if(message==='INVALID_CREDENTIALS')return json({ok:false,error:'INVALID_CREDENTIALS'},401);
  if(message==='EMAIL_EXISTS')return json({ok:false,error:'EMAIL_EXISTS'},409);
  const bad=new Set(['INVALID_EMAIL','INVALID_PASSWORD','DISPLAY_NAME_REQUIRED','INVALID_ROLE']);
  if(bad.has(message))return json({ok:false,error:message},400);
  return json(safeDiagnostic?{ok:false,error:'auth_server_error',diagnostic:message.slice(0,240)}:{ok:false,error:'auth_server_error'},500);
 }
}
