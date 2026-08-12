const AUTH_USER_KEY='entego_auth_user';
const AUTH_AFTER_KEY='entego_after_auth';
const authRead=()=>{try{return JSON.parse(localStorage.getItem(AUTH_USER_KEY)||'null')}catch{return null}};
const authWrite=user=>user?localStorage.setItem(AUTH_USER_KEY,JSON.stringify(user)):localStorage.removeItem(AUTH_USER_KEY);
const authRoute=()=>localStorage.getItem('entego_route')||'home';
const authEsc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const authRoleLabel=r=>r==='partner'?'Mitra':r==='admin'?'Admin':'Customer';

async function authMe(){
 try{const r=await fetch('/api/auth/me',{cache:'no-store',headers:{accept:'application/json'}});const d=await r.json();if(r.ok&&d.ok&&d.user){authWrite(d.user);return d.user}}catch{}
 authWrite(null);return null;
}
async function authPost(path,body){
 const r=await fetch(path,{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:body?JSON.stringify(body):undefined});
 let d={};try{d=await r.json()}catch{};if(!r.ok||!d.ok){const e=new Error(d.error||'request_failed');e.retryAfter=Number(d.retryAfter||r.headers.get('retry-after')||0);throw e}return d;
}
function authMessage(code,retryAfter=0){if(code==='rate_limited')return `Terlalu banyak percobaan. Coba lagi dalam ${Math.max(1,Math.ceil(Number(retryAfter||60)/60))} menit.`;return ({INVALID_EMAIL:'Email tidak valid.',INVALID_PASSWORD:'Password minimal 8 karakter.',DISPLAY_NAME_REQUIRED:'Nama wajib diisi.',EMAIL_EXISTS:'Email sudah terdaftar.',INVALID_CREDENTIALS:'Email atau password salah.',customer_role_required:'Gunakan akun Customer untuk membuat booking.'})[code]||'Proses belum berhasil. Periksa data lalu coba lagi.'}

function authPanel(){
 if(authRoute()!=='profile')return;const main=document.querySelector('main.content');if(!main||document.querySelector('#entegoAuthPanel'))return;
 const user=authRead(),box=document.createElement('section');box.id='entegoAuthPanel';box.className='card';
 if(user){
  box.innerHTML=`<div class="kicker">AKUN ENTEGO</div><div class="row between"><div><h2 style="margin:6px 0">${authEsc(user.displayName)}</h2><div class="meta">${authEsc(user.email)}</div></div><span class="pill green">${authRoleLabel(user.role)}</span></div><div style="margin-top:10px"><span class="pill ${user.verified?'green':'blue'}">${user.role==='partner'?(user.verified?'✓ Mitra terverifikasi':'Verifikasi mitra diproses'):'✓ Akun aktif'}</span></div><button class="btn soft" id="entegoLogout" style="width:100%;margin-top:14px">Keluar</button>`;
  main.prepend(box);box.querySelector('#entegoLogout').onclick=async()=>{try{await authPost('/api/auth/logout')}catch{}authWrite(null);localStorage.setItem('entego_route','home');location.reload()};return;
 }
 box.innerHTML=`<div class="kicker">ENTEGO ACCOUNT</div><h2 style="margin:6px 0 4px">Masuk atau buat akun</h2><p class="meta">Akun diperlukan untuk booking dan dashboard mitra.</p><div class="tabbar" style="margin:12px 0"><button class="tab active" id="authLoginTab">Masuk</button><button class="tab" id="authRegisterTab">Daftar</button></div><div id="authError" class="meta" style="display:none;margin-bottom:10px"></div><div id="authLoginForm" class="form"><div class="field"><label>Email</label><input id="authLoginEmail" type="email" autocomplete="email" placeholder="nama@email.com"></div><div class="field"><label>Password</label><input id="authLoginPassword" type="password" autocomplete="current-password" placeholder="Minimal 8 karakter"></div><button class="btn primary" id="authLoginBtn" style="width:100%">Masuk ENTEGO</button></div><div id="authRegisterForm" class="form" style="display:none"><div class="field"><label>Nama</label><input id="authDisplayName" autocomplete="name" placeholder="Nama kamu / nama talent"></div><div class="field"><label>Email</label><input id="authRegisterEmail" type="email" autocomplete="email" placeholder="nama@email.com"></div><div class="field"><label>Password</label><input id="authRegisterPassword" type="password" autocomplete="new-password" placeholder="Minimal 8 karakter"></div><div class="field"><label>Jenis akun</label><select id="authRegisterRole"><option value="customer">Customer</option><option value="partner">Mitra ENTEGO</option></select></div><button class="btn primary" id="authRegisterBtn" style="width:100%">Buat Akun</button></div>`;
 main.prepend(box);
 const login=box.querySelector('#authLoginForm'),reg=box.querySelector('#authRegisterForm'),lt=box.querySelector('#authLoginTab'),rt=box.querySelector('#authRegisterTab'),err=box.querySelector('#authError');
 const mode=m=>{const isLogin=m==='login';login.style.display=isLogin?'':'none';reg.style.display=isLogin?'none':'';lt.classList.toggle('active',isLogin);rt.classList.toggle('active',!isLogin);err.style.display='none'};lt.onclick=()=>mode('login');rt.onclick=()=>mode('register');
 const finish=user=>{authWrite(user);const after=localStorage.getItem(AUTH_AFTER_KEY);localStorage.removeItem(AUTH_AFTER_KEY);localStorage.setItem('entego_route',after||(user.role==='partner'?'partner':'profile'));location.reload()};
 const fail=e=>{err.textContent=authMessage(e.message,e.retryAfter);err.style.display='block'};
 box.querySelector('#authLoginBtn').onclick=async()=>{const b=box.querySelector('#authLoginBtn');b.disabled=true;try{const d=await authPost('/api/auth/login',{email:box.querySelector('#authLoginEmail').value,password:box.querySelector('#authLoginPassword').value});finish(d.user)}catch(e){fail(e)}finally{b.disabled=false}};
 box.querySelector('#authRegisterBtn').onclick=async()=>{const b=box.querySelector('#authRegisterBtn');b.disabled=true;try{const d=await authPost('/api/auth/register',{displayName:box.querySelector('#authDisplayName').value,email:box.querySelector('#authRegisterEmail').value,password:box.querySelector('#authRegisterPassword').value,role:box.querySelector('#authRegisterRole').value});finish(d.user)}catch(e){fail(e)}finally{b.disabled=false}};
}

function authGuardClick(e){
 const el=e.target.closest('[data-route]');if(!el)return;const target=el.dataset.route,user=authRead();
 const partnerRoutes=new Set(['partner','partnerOrders','partnerOrderDetail','partnerChat','partnerCalendar','partnerPackages','partnerPortfolio','partnerReviews','partnerWallet','partnerAnalytics']);
 if(partnerRoutes.has(target)&&(!user||!['partner','admin'].includes(user.role))){e.preventDefault();e.stopImmediatePropagation();localStorage.setItem(AUTH_AFTER_KEY,target);localStorage.setItem('entego_route','profile');location.reload();return}
 if(target==='admin'&&(!user||user.role!=='admin')){e.preventDefault();e.stopImmediatePropagation();localStorage.setItem(AUTH_AFTER_KEY,'admin');localStorage.setItem('entego_route','profile');location.reload()}
}
document.addEventListener('click',authGuardClick,true);

const authRun=()=>authPanel();new MutationObserver(authRun).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('load',async()=>{await authMe();authRun()});authMe().then(authRun);authRun();
