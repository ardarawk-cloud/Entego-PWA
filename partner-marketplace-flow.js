const ENTEGO_PROFILE_KEY='entego_partner_profile';
const ENTEGO_PORTFOLIO_KEY='entego_partner_portfolio';

const readJSON=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
const saveJSON=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const profile=()=>readJSON(ENTEGO_PROFILE_KEY,{});
const portfolio=()=>readJSON(ENTEGO_PORTFOLIO_KEY,[]);
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const money=value=>`Rp${Number(value||0).toLocaleString('id-ID')}`;
const route=()=>localStorage.getItem('entego_route')||'home';
const ownVendor=()=>Number(localStorage.getItem('entego_vendor')||1)===1;

function openPublicProfile(){
 localStorage.setItem('entego_vendor','1');
 localStorage.setItem('entego_route','detail');
 location.reload();
}

function syncVendorCards(){
 const p=profile();
 if(!p.displayName)return;
 document.querySelectorAll('[data-vendor="1"]').forEach(card=>{
  const name=card.querySelector('h3')||card.querySelector('b');
  if(name)name.textContent=p.displayName;
  const metas=[...card.querySelectorAll('.meta')];
  if(metas[0])metas[0].textContent=`${p.specialty||'Entertainment & Event Partner'} • ${p.area||'Bali'}`;
  const price=[...card.querySelectorAll('b')].find(el=>/^Rp/.test(el.textContent.trim()));
  if(price&&p.price)price.textContent=money(p.price);
 });
}

function enhancePartnerDashboard(){
 if(route()!=='partner')return;
 const main=document.querySelector('main.content');
 if(!main)return;
 const p=profile();
 let card=document.querySelector('#partnerPublicPreview');
 if(!card){
  card=document.createElement('section');
  card.id='partnerPublicPreview';
  card.className='card';
  main.prepend(card);
 }
 if(card.dataset.marketplaceReady==='1')return;
 card.dataset.marketplaceReady='1';
 const items=portfolio();
 const cover=p.cover||items[0]?.src||'';
 card.innerHTML=`${cover?`<img src="${esc(cover)}" alt="Cover profil" style="width:100%;height:180px;object-fit:cover;border-radius:16px;margin-bottom:14px">`:''}<div class="kicker">PROFIL PUBLIK MITRA</div><h2>${esc(p.displayName||'Profil Mitra ENTEGO')}</h2><div class="meta">${esc(p.specialty||'Entertainment & Event Partner')} • ${esc(p.area||'Bali')}</div>${p.price?`<p><b>Mulai ${money(p.price)}</b></p>`:''}<p>${esc(p.bio||'Lengkapi profil profesional agar pelanggan lebih mudah mengenal layanan kamu.')}</p><div class="row" style="gap:8px;flex-wrap:wrap"><span class="pill green">✓ Profil publik</span><span class="pill">🖼️ ${items.length} portfolio</span></div><div class="row" style="gap:10px;margin-top:14px"><button class="btn soft" id="managePortfolioBtn" style="flex:1">Kelola Portfolio</button><button class="btn primary" id="viewPublicProfileBtn" style="flex:1">Lihat Profil Publik</button></div>`;
 card.querySelector('#managePortfolioBtn').onclick=()=>{localStorage.setItem('entego_route','partnerPortfolio');location.reload()};
 card.querySelector('#viewPublicProfileBtn').onclick=openPublicProfile;
}

function imageToDataURL(file){
 return new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onerror=reject;
  reader.onload=()=>{
   const img=new Image();
   img.onerror=reject;
   img.onload=()=>{
    const max=900,scale=Math.min(1,max/Math.max(img.width,img.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
    canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
    resolve(canvas.toDataURL('image/jpeg',0.72));
   };
   img.src=reader.result;
  };
  reader.readAsDataURL(file);
 });
}

function renderPortfolioManager(){
 if(route()!=='partnerPortfolio')return;
 const main=document.querySelector('main.content');
 if(!main||main.dataset.entegoPortfolioReady==='1')return;
 main.dataset.entegoPortfolioReady='1';
 const draw=()=>{
  const items=portfolio();
  main.innerHTML=`<div class="kicker">PORTFOLIO MITRA</div><h2>Foto & karya terbaik</h2><p class="meta">Tambahkan foto dari HP atau URL. Portfolio ini otomatis tampil di profil publik pelanggan.</p><div class="card"><div class="field"><label>Judul karya/event</label><input id="portfolioTitle" placeholder="Contoh: Wedding at Seminyak"></div><div class="field"><label>Tambah dari HP</label><input id="portfolioFiles" type="file" accept="image/*" multiple></div><div class="field"><label>Atau URL foto</label><input id="portfolioUrl" inputmode="url" placeholder="https://..."></div><button class="btn primary" id="addPortfolioUrl" style="width:100%">+ Tambah Portfolio</button></div><div class="section-head"><h2>Portfolio (${items.length}/12)</h2><button class="link" id="previewPublicPortfolio">Lihat publik</button></div>${items.length?`<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">${items.map((item,i)=>`<article class="card" style="padding:8px;margin:0"><img src="${esc(item.src)}" alt="${esc(item.title||'Portfolio')}" style="width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:12px"><b style="display:block;margin:9px 2px 3px">${esc(item.title||`Portfolio ${i+1}`)}</b><div class="row" style="gap:6px"><button class="btn soft mini" data-cover="${esc(item.id)}" style="flex:1">${profile().cover===item.src?'✓ Cover':'Jadi Cover'}</button><button class="btn soft mini" data-remove="${esc(item.id)}">Hapus</button></div></article>`).join('')}</div>`:`<div class="card"><b>Belum ada foto portfolio.</b><p class="meta">Tambahkan karya terbaik agar profil publik lebih meyakinkan.</p></div>`}`;
  const addItem=(src,title)=>{
   const current=portfolio();
   if(current.length>=12){alert('Maksimal 12 foto portfolio untuk versi ini.');return}
   current.unshift({id:`pf-${Date.now()}-${Math.random().toString(16).slice(2)}`,title:(title||'Portfolio ENTEGO').trim(),src});
   try{saveJSON(ENTEGO_PORTFOLIO_KEY,current)}catch{alert('Penyimpanan foto di perangkat penuh. Hapus beberapa foto lalu coba lagi.');return}
   const p=profile();if(!p.cover){p.cover=src;saveJSON(ENTEGO_PROFILE_KEY,p)}
   draw();
  };
  main.querySelector('#addPortfolioUrl').onclick=()=>{const url=main.querySelector('#portfolioUrl').value.trim();const title=main.querySelector('#portfolioTitle').value.trim();if(!/^https?:\/\//i.test(url)){alert('Masukkan URL foto yang valid.');return}addItem(url,title)};
  main.querySelector('#portfolioFiles').onchange=async e=>{
   const files=[...e.target.files].filter(f=>f.type.startsWith('image/'));
   const title=main.querySelector('#portfolioTitle').value.trim();
   for(const file of files.slice(0,Math.max(0,12-portfolio().length))){try{addItem(await imageToDataURL(file),title||file.name.replace(/\.[^.]+$/,''))}catch{alert(`Foto ${file.name} gagal diproses.`)}}
  };
  main.querySelector('#previewPublicPortfolio').onclick=openPublicProfile;
  main.querySelectorAll('[data-remove]').forEach(btn=>btn.onclick=()=>{const current=portfolio();const target=current.find(x=>x.id===btn.dataset.remove);saveJSON(ENTEGO_PORTFOLIO_KEY,current.filter(x=>x.id!==btn.dataset.remove));const p=profile();if(target&&p.cover===target.src){p.cover=portfolio()[0]?.src||'';saveJSON(ENTEGO_PROFILE_KEY,p)}draw()});
  main.querySelectorAll('[data-cover]').forEach(btn=>btn.onclick=()=>{const item=portfolio().find(x=>x.id===btn.dataset.cover);if(!item)return;const p=profile();p.cover=item.src;saveJSON(ENTEGO_PROFILE_KEY,p);draw()});
 };
 draw();
}

function enrichPublicDetail(){
 if(route()!=='detail'||!ownVendor())return;
 const main=document.querySelector('main.content');
 if(!main||document.querySelector('#entegoPartnerPublicExtra'))return;
 const p=profile();const items=portfolio();if(!p.displayName&&!items.length)return;
 const title=document.querySelector('.page-title span');if(title&&p.displayName)title.textContent=p.displayName;
 const firstSection=main.querySelector(':scope > .section');
 if(firstSection&&p.displayName){const h2=firstSection.querySelector('h2');if(h2)h2.textContent=p.displayName;const meta=firstSection.querySelector('.meta');if(meta)meta.textContent=`${p.specialty||'Entertainment & Event Partner'} • ${p.area||'Bali'}`;const price=firstSection.querySelector('.price');if(price&&p.price)price.textContent=money(p.price)}
 const extra=document.createElement('section');extra.id='entegoPartnerPublicExtra';extra.className='section';
 extra.innerHTML=`${p.cover?`<img src="${esc(p.cover)}" alt="${esc(p.displayName||'Mitra ENTEGO')}" style="width:100%;height:220px;object-fit:cover;border-radius:18px;margin-bottom:14px">`:''}<div class="kicker">PROFIL PUBLIK</div><h2>${esc(p.displayName||'Mitra ENTEGO')}</h2><div class="meta">${esc(p.specialty||'Entertainment & Event Partner')} • ${esc(p.area||'Bali')}</div><p>${esc(p.bio||'Mitra profesional ENTEGO untuk kebutuhan event dan entertainment.')}</p>${p.social?`<span class="pill">📷 ${esc(p.social)}</span>`:''}${items.length?`<h3 style="margin-top:18px">Portfolio</h3><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">${items.slice(0,6).map(item=>`<img src="${esc(item.src)}" alt="${esc(item.title||'Portfolio')}" style="width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:12px">`).join('')}</div>`:''}`;
 if(firstSection)firstSection.after(extra);else main.prepend(extra);
}

const run=()=>{syncVendorCards();enhancePartnerDashboard();renderPortfolioManager();enrichPublicDetail()};
new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',run);
run();
