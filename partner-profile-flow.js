const PROFILE_KEY='entego_partner_profile';
const readProfile=()=>{try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}')}catch{return {}}};
const saveProfile=p=>localStorage.setItem(PROFILE_KEY,JSON.stringify(p));
function enhancePartnerProfile(){
 if(localStorage.getItem('entego_route')!=='partnerOnboarding')return;
 const main=document.querySelector('main.content'); if(!main||document.querySelector('#entegoPartnerProfile'))return;
 const p=readProfile(); const box=document.createElement('section'); box.id='entegoPartnerProfile'; box.className='card';
 box.innerHTML=`<h2 style="margin-top:0">3. Profil Profesional</h2><p class="meta">Data ini akan tampil di halaman publik mitra ENTEGO.</p><div class="form">
 <div class="field"><label>Nama tampil</label><input data-p="displayName" value="${p.displayName||''}" placeholder="Contoh: ARDMRN"></div>
 <div class="field"><label>Area layanan</label><input data-p="area" value="${p.area||''}" placeholder="Seminyak, Canggu, Denpasar..."></div>
 <div class="field"><label>Harga mulai</label><input data-p="price" inputmode="numeric" value="${p.price||''}" placeholder="1500000"></div>
 <div class="field"><label>Spesialisasi / genre</label><input data-p="specialty" value="${p.specialty||''}" placeholder="Open format, house, wedding, corporate..."></div>
 <div class="field"><label>Instagram / portfolio</label><input data-p="social" value="${p.social||''}" placeholder="@username atau link portfolio"></div>
 <div class="field"><label>Bio singkat</label><textarea data-p="bio" rows="4" placeholder="Ceritakan pengalaman, karakter layanan, dan jenis event yang biasa ditangani.">${p.bio||''}</textarea></div>
 </div><div class="row" style="gap:10px;flex-wrap:wrap"><span class="pill green">✓ Profil publik</span><span class="pill">📍 Area layanan</span><span class="pill">💼 Portfolio</span></div>`;
 const demo=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Masuk Dashboard Mitra Demo')); if(demo)demo.before(box); else main.appendChild(box);
 box.addEventListener('input',e=>{const k=e.target.dataset.p;if(!k)return;const x=readProfile();x[k]=e.target.value.trim();saveProfile(x)});
}
function partnerProfileCard(){
 if(localStorage.getItem('entego_route')!=='partner')return;
 const p=readProfile(); if(!p.displayName)return; const main=document.querySelector('main.content'); if(!main||document.querySelector('#partnerPublicPreview'))return;
 const c=document.createElement('section');c.id='partnerPublicPreview';c.className='card';c.innerHTML=`<div class="kicker">PROFIL MITRA</div><h2>${p.displayName}</h2><div class="meta">${p.specialty||'Entertainment & Event Partner'} • ${p.area||'Bali'}</div>${p.price?`<p><b>Mulai Rp${Number(p.price).toLocaleString('id-ID')}</b></p>`:''}<p>${p.bio||'Lengkapi profil agar pelanggan lebih mudah mengenal layanan kamu.'}</p>${p.social?`<div class="pill">📷 ${p.social}</div>`:''}<div style="margin-top:12px"><span class="pill green">✓ Verifikasi ENTEGO diproses terpisah</span></div>`;main.prepend(c);
}
const run=()=>{enhancePartnerProfile();partnerProfileCard()};new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('load',run);run();