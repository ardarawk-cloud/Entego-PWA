const ARF_VERSION='72';
const arfRoute=()=>{try{return localStorage.getItem('entego_route')||'home'}catch{return 'home'}};
const arfUser=()=>{try{return JSON.parse(localStorage.getItem('entego_auth_user')||'null')}catch{return null}};
function arfNotice(title,message,detail=''){
 let o=document.querySelector('#entegoAccountRouteNotice');if(o)o.remove();
 o=document.createElement('div');o.id='entegoAccountRouteNotice';o.style='position:fixed;inset:0;z-index:30000;background:rgba(15,23,42,.68);display:flex;align-items:flex-end;justify-content:center;padding:0';
 o.innerHTML=`<div style="width:min(100%,480px);background:#fff;border-radius:24px 24px 0 0;padding:20px 18px calc(22px + env(safe-area-inset-bottom))"><div class="kicker">ENTEGO</div><h2 style="margin:7px 0">${title}</h2><p class="meta">${message}</p>${detail?`<div class="card" style="margin-top:12px"><div class="meta">${detail}</div></div>`:''}<button class="btn primary" id="arfClose" style="width:100%;margin-top:14px">Mengerti</button></div>`;
 document.body.appendChild(o);o.querySelector('#arfClose').onclick=()=>o.remove();o.onclick=e=>{if(e.target===o)o.remove()};
}
function arfProfileCopy(){
 if(arfRoute()!=='profile')return;const main=document.querySelector('main.content');if(!main)return;
 [...main.querySelectorAll('.card')].forEach(card=>{const b=card.querySelector('b');if(!b)return;if(b.textContent.trim()==='Admin Demo')b.textContent='Admin Control Center'});
}
function arfSanitizeAdmin(){
 const route=arfRoute();if(!route.startsWith('admin'))return;const user=arfUser(),app=document.querySelector('#app');
 if(user?.role!=='admin'){
  try{localStorage.setItem('entego_route','profile')}catch{}
  if(app&&app.dataset.arfDenied!=='1'){
   app.dataset.arfDenied='1';app.style.visibility='visible';app.innerHTML=`<div class="phone"><div class="topbar"><div class="brand"><div class="page-title"><span>Admin ENTEGO</span></div></div></div><main class="content"><section class="card"><span class="pill blue">ADMIN REQUIRED</span><h2>Akses Admin dilindungi</h2><p class="meta">Dashboard Admin hanya tersedia untuk akun dengan role Admin. Akun Customer atau Mitra tidak dapat membuka data operasional.</p><button class="btn primary" id="arfBackProfile" style="width:100%;margin-top:12px">Kembali ke Akun</button></section></main></div>`;
   document.querySelector('#entegoBootShield')?.remove();app.querySelector('#arfBackProfile').onclick=()=>location.replace('/?account='+ARF_VERSION);
  }
  return;
 }
 const main=document.querySelector('main.content');if(!main)return;
 if(route==='admin'){
  const stats=main.querySelector('.statgrid');if(stats&&stats.dataset.arfSafe!=='1'){stats.dataset.arfSafe='1';stats.querySelectorAll('.stat b').forEach(b=>b.textContent='—')}
 }
 if(route==='adminPayments'&&main.dataset.arfPaymentSafe!=='1'&&!main.querySelector('#entegoAdminServerBookings')){
  main.dataset.arfPaymentSafe='1';main.innerHTML='<div class="kicker">PAYMENT CONTROL</div><h2>Pembayaran Server</h2><div class="card"><span class="pill">Memuat ledger pembayaran…</span><p class="meta">Tidak ada angka pembayaran demo yang ditampilkan.</p></div>';
 }
}
function arfRun(){arfProfileCopy();arfSanitizeAdmin()}
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-route]');if(!el)return;const route=arfRoute();
 if(route==='profile'&&el.dataset.route==='checkout'&&/Metode pembayaran/i.test(el.textContent||'')){
  e.preventDefault();e.stopImmediatePropagation();arfNotice('Metode Pembayaran','Metode pembayaran dipilih ketika checkout booking yang valid melalui Xendit Hosted Checkout.','Penyimpanan kartu/e-wallet sebagai metode pembayaran tersimpan belum diaktifkan, jadi menu ini tidak lagi diarahkan ke Checkout kosong.');return;
 }
 if(el.dataset.route==='admin'&&arfUser()?.role!=='admin'){
  e.preventDefault();e.stopImmediatePropagation();arfNotice('Akses Admin','Login dengan akun Admin diperlukan untuk membuka Admin Control Center.','Proteksi ini mencegah Customer atau Mitra membuka data booking, payment, refund, verifikasi, dan dispute Admin.');
 }
},true);
let arfScheduled=false;function arfSchedule(){if(arfScheduled)return;arfScheduled=true;requestAnimationFrame(()=>{arfScheduled=false;arfRun()})}
new MutationObserver(arfSchedule).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('load',arfRun);arfRun();
