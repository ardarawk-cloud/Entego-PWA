const COOKIE='entego_session';
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...extra}});
const cookieMap=req=>Object.fromEntries((req.headers.get('cookie')||'').split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const i=x.indexOf('=');return i<0?[x,'']:[x.slice(0,i),decodeURIComponent(x.slice(i+1))]}));
const sessionCookie=(token,maxAge=2592000)=>`${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
const clearCookie=()=>`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
const authStore=env=>env.ENT_AUTH.getByName('entego-auth-production');
const enc=new TextEncoder();
async function safeSecret(a,b){if(!a||!b)return false;const [aa,bb]=await Promise.all([crypto.subtle.digest('SHA-256',enc.encode(String(a))),crypto.subtle.digest('SHA-256',enc.encode(String(b)))]);return crypto.subtle.timingSafeEqual?crypto.subtle.timingSafeEqual(new Uint8Array(aa),new Uint8Array(bb)):false}

export async function getRequestUser(request,env){
 const token=cookieMap(request)[COOKIE];if(!token)return null;
 try{return await authStore(env).getSession(token)}catch{return null}
}

export async function handleAuthApi(request,env){
 const url=new URL(request.url);if(!url.pathname.startsWith('/api/auth/'))return null;
 const store=authStore(env),ua=request.headers.get('user-agent')||'';
 try{
  if(url.pathname==='/api/auth/register'&&request.method==='POST'){
   const result=await store.register(await request.json(),ua);
   return json({ok:true,user:result.user},201,{'set-cookie':sessionCookie(result.token)});
  }
  if(url.pathname==='/api/auth/login'&&request.method==='POST'){
   const result=await store.login(await request.json(),ua);
   return json({ok:true,user:result.user},200,{'set-cookie':sessionCookie(result.token)});
  }
  if(url.pathname==='/api/auth/logout'&&request.method==='POST'){
   const token=cookieMap(request)[COOKIE];await store.logout(token);
   return json({ok:true},200,{'set-cookie':clearCookie()});
  }
  if(url.pathname==='/api/auth/me'&&request.method==='GET'){
   const user=await getRequestUser(request,env);
   return user?json({ok:true,user}):json({ok:false,error:'unauthenticated'},401);
  }
  if(url.pathname==='/api/auth/admin/bootstrap'&&request.method==='POST'){
   if(!env.ADMIN_BOOTSTRAP_KEY)return json({ok:false,error:'admin_bootstrap_not_configured'},503);
   const supplied=request.headers.get('x-entego-admin-key')||'';
   if(!(await safeSecret(supplied,env.ADMIN_BOOTSTRAP_KEY)))return json({ok:false,error:'forbidden'},403);
   const body=await request.json();const user=await store.promoteAdmin(body.email);
   return user?json({ok:true,user}):json({ok:false,error:'user_not_found'},404);
  }
  return json({ok:false,error:'auth_route_not_found'},404);
 }catch(error){
  const message=String(error?.message||error);
  const bad=new Set(['INVALID_EMAIL','INVALID_PASSWORD','DISPLAY_NAME_REQUIRED','INVALID_ROLE','EMAIL_EXISTS','INVALID_CREDENTIALS']);
  return json({ok:false,error:bad.has(message)?message:'auth_server_error'},bad.has(message)?400:500);
 }
}
