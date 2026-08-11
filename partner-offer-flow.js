const ENTEGO_PACKAGES_KEY='entego_partner_packages';
const ENTEGO_AVAIL_KEY='entego_partner_availability';
const ENTEGO_SELECTED_PACKAGE='entego_selected_package';

const offerRead=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
const offerSave=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const offerEsc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const offerMoney=value=>`Rp${Number(value||0).toLocaleString('id-ID')}`;
const offerRoute=()=>localStorage.getItem('entego_route')||'home';

function getPackages(){
 let items=offerRead(ENTEGO_PACKAGES_KEY,[]);
 if(!items.length){items=[{id:'standard',name:'Standard Package',duration:'3 jam',price:1500000,description:'Perlengkapan dasar & layanan profesional',featured:true},{id:'premium',name:'Premium Package',duration:'5 jam',price:3500000,description:'Prioritas, durasi lebih panjang & add-on',featured:false}];offerSave(ENTEGO_PACKAGES_KEY,items)}
 return items;
}
const getAvailability=()=>offerRead(ENTEGO_AVAIL_KEY,[{date:'2026-08-15',status:'booked',note:'Birthday Party • 19:00'}]);
const selectedPackage=()=>{const id=localStorage.getItem(ENTEGO_SELECTED_PACKAGE);return getPackages().find(x=>x.id===id)||getPackages()[0]};

function packageManager(){
 if(offerRoute()!=='partnerPackages')return;
 const main=document.querySelector('main.content');if(!main||main.dataset.entegoPackagesReady==='1')return;main.dataset.entegoPackagesReady='1';
 let editing='';
 const draw=()=>{
  const items=getPackages();const current=items.find(x=>x.id===editing)||{};
  main.innerHTML=`<div class="kicker">PAKET & HARGA</div><h2>Kelola penawaran</h2><p class="meta">Paket yang aktif otomatis tampil di profil publik dan dapat dipilih saat booking.</p><div class="card"><div class="field"><label>Nama paket</label><input id="pkgName" value="${offerEsc(current.name||'')}" placeholder="Standard Package"></div><div class="field"><label>Durasi</label><input id="pkgDuration" value="${offerEsc(current.duration||'')}" placeholder="3 jam / Full day"></div><div class="field"><label>Harga</label><input id="pkgPrice" inputmode="numeric" value="${offerEsc(current.price||'')}" placeholder="1500000"></div><div class="field"><label>Deskripsi</label><textarea id="pkgDesc" rows="3" placeholder="Apa saja yang termasuk dalam paket?">${offerEsc(current.description||'')}</textarea></div><button class="btn primary" id="savePackage" style="width:100%">${editing?'Simpan Perubahan':'+ Tambah Paket'}</button>${editing?'<button class="btn soft" id="cancelPackageEdit" style="width:100%;margin-top:8px">Batal Edit</button>':''}</div>${items.map(item=>`<div class="card"><div class="row between"><div><span class="pill ${item.featured?'green':''}">${item.featured?'★ Paket Utama':'Paket'}</span><h3 style="margin-bottom:4px">${offerEsc(item.name)}</h3><div class="meta">${offerEsc(item.duration)} • ${offerMoney(item.price)}</div></div><div class="price">${offerMoney(item.price)}</div></div><p class="meta">${offerEsc(item.description||'')}</p><div class="row" style="gap:8px"><button class="btn soft mini" data-edit-package="${offerEsc(item.id)}" style="flex:1">Edit</button><button class="btn soft mini" data-feature-package="${offerEsc(item.id)}" style="flex:1">${item.featured?'Utama ✓':'Jadi Utama'}</button><button class="btn soft mini" data-delete-package="${offerEsc(item.id)}">Hapus</button></div></div>`).join('')}`;
  main.querySelector('#savePackage').onclick=()=>{const name=main.querySelector('#pkgName').value.trim(),duration=main.querySelector('#pkgDuration').value.trim(),price=Number(main.querySelector('#pkgPrice').value.replace(/\D/g,'')),description=main.querySelector('#pkgDesc').value.trim();if(!name||!duration||!price){alert('Nama paket, durasi, dan harga wajib diisi.');return}let next=getPackages();if(editing){next=next.map(x=>x.id===editing?{...x,name,duration,price,description}:x)}else{next.push({id:`pkg-${Date.now()}`,name,duration,price,description,featured:next.length===0})}offerSave(ENTEGO_PACKAGES_KEY,next);editing='';draw()};
  const cancel=main.querySelector('#cancelPackageEdit');if(cancel)cancel.onclick=()=>{editing='';draw()};
  main.querySelectorAll('[data-edit-package]').forEach(btn=>btn.onclick=()=>{editing=btn.dataset.editPackage;draw();scrollTo(0,0)});
  main.querySelectorAll('[data-feature-package]').forEach(btn=>btn.onclick=()=>{offerSave(ENTEGO_PACKAGES_KEY,getPackages().map(x=>({...x,featured:x.id===btn.dataset.featurePackage})));draw()});
  main.querySelectorAll('[data-delete-package]').forEach(btn=>btn.onclick=()=>{const items=getPackages();if(items.length<=1){alert('Minimal satu paket harus tersedia.');return}offerSave(ENTEGO_PACKAGES_KEY,items.filter(x=>x.id!==btn.dataset.deletePackage));draw()});
 };
 draw();
}

function availabilityManager(){
 if(offerRoute()!=='partnerCalendar')return;
 const main=document.querySelector('main.content');if(!main||main.dataset.entegoAvailabilityReady==='1')return;main.dataset.entegoAvailabilityReady='1';
 const draw=()=>{
  const slots=getAvailability().sort((a,b)=>a.date.localeCompare(b.date));
  main.innerHTML=`<div class="kicker">AVAILABILITY</div><h2>Kalender & ketersediaan</h2><p class="meta">Tandai tanggal sibuk agar pelanggan tidak dapat booking pada waktu yang bentrok.</p><div class="card"><div class="field"><label>Tanggal</label><input id="availDate" type="date"></div><div class="field"><label>Status</label><select id="availStatus"><option value="unavailable">Tidak tersedia</option><option value="booked">Sudah dibooking</option><option value="available">Tersedia</option></select></div><div class="field"><label>Catatan</label><input id="availNote" placeholder="Contoh: Wedding • 19:00"></div><button class="btn primary" id="saveAvailability" style="width:100%">Simpan Tanggal</button></div>${slots.length?slots.map(slot=>`<div class="card row between"><div><b>${new Date(slot.date+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</b><div class="meta">${offerEsc(slot.note||'Tanpa catatan')}</div></div><div style="text-align:right"><span class="pill ${slot.status==='available'?'green':'blue'}">${slot.status==='available'?'Tersedia':slot.status==='booked'?'Booked':'Tidak tersedia'}</span><br><button class="link" data-remove-availability="${offerEsc(slot.date)}" style="margin-top:8px">Hapus</button></div></div>`).join(''):'<div class="card"><b>Belum ada pengecualian jadwal.</b></div>'}`;
  main.querySelector('#saveAvailability').onclick=()=>{const date=main.querySelector('#availDate').value,status=main.querySelector('#availStatus').value,note=main.querySelector('#availNote').value.trim();if(!date){alert('Pilih tanggal terlebih dahulu.');return}const next=getAvailability().filter(x=>x.date!==date);next.push({date,status,note});offerSave(ENTEGO_AVAIL_KEY,next);draw()};
  main.querySelectorAll('[data-remove-availability]').forEach(btn=>btn.onclick=()=>{offerSave(ENTEGO_AVAIL_KEY,getAvailability().filter(x=>x.date!==btn.dataset.removeAvailability));draw()});
 };
 draw();
}

function publicPackages(){
 if(offerRoute()!=='detail'||Number(localStorage.getItem('entego_vendor')||1)!==1)return;
 const main=document.querySelector('main.content');if(!main)return;
 const sections=[...main.querySelectorAll('section.section')];const section=sections.find(s=>s.querySelector('h2')?.textContent.includes('Paket populer'));if(!section||section.dataset.entegoOfferReady==='1')return;section.dataset.entegoOfferReady='1';
 const items=getPackages();section.innerHTML=`<h2>Paket & Harga</h2>${items.map(item=>`<div class="card"><div class="row between"><div><span class="pill ${item.featured?'green':''}">${item.featured?'★ Populer':'Paket'}</span><h3>${offerEsc(item.name)}</h3><div class="meta">${offerEsc(item.duration)}</div></div><div class="price">${offerMoney(item.price)}</div></div><p class="meta">${offerEsc(item.description||'')}</p><button class="btn ${item.featured?'primary':'soft'}" data-select-package="${offerEsc(item.id)}" style="width:100%">Pilih Paket</button></div>`).join('')}`;
 section.querySelectorAll('[data-select-package]').forEach(btn=>btn.onclick=()=>{localStorage.setItem(ENTEGO_SELECTED_PACKAGE,btn.dataset.selectPackage);localStorage.setItem('entego_route','booking');location.reload()});
}

function bookingAvailability(){
 if(offerRoute()!=='booking')return;
 const main=document.querySelector('main.content');if(!main)return;
 const pkg=selectedPackage();
 if(!document.querySelector('#entegoSelectedPackage')){const card=document.createElement('section');card.id='entegoSelectedPackage';card.className='card';card.innerHTML=`<div class="kicker">PAKET DIPILIH</div><div class="row between"><div><b>${offerEsc(pkg.name)}</b><div class="meta">${offerEsc(pkg.duration)}</div></div><div class="price">${offerMoney(pkg.price)}</div></div><p class="meta">${offerEsc(pkg.description||'')}</p>`;main.prepend(card)}
 const dateInput=main.querySelector('input[type="date"]');if(!dateInput||dateInput.dataset.entegoAvailability==='1')return;dateInput.dataset.entegoAvailability='1';
 const status=document.createElement('div');status.id='entegoAvailabilityStatus';status.className='card';dateInput.closest('.field')?.after(status);
 const check=()=>{const slot=getAvailability().find(x=>x.date===dateInput.value);const blocked=slot&&slot.status!=='available';status.innerHTML=blocked?`<b>⛔ Tanggal tidak tersedia</b><div class="meta">${offerEsc(slot.note||'Mitra tidak menerima booking pada tanggal ini.')}</div>`:`<b>✅ Tanggal tersedia</b><div class="meta">Kamu dapat melanjutkan booking.</div>`;const next=document.querySelector('.sticky-cta [data-route="checkout"]');if(next){next.disabled=!!blocked;next.style.opacity=blocked?'.45':'1'}};
 dateInput.addEventListener('change',check);check();
}

function checkoutPackage(){
 if(offerRoute()!=='checkout')return;
 const pkg=selectedPackage();const main=document.querySelector('main.content');if(!main||main.dataset.entegoCheckoutPackage==='1')return;main.dataset.entegoCheckoutPackage='1';
 const first=main.querySelector('.card');if(!first)return;const h3=first.querySelector('h3');if(h3)h3.textContent=`${profileName()} — ${pkg.name}`;const rows=[...first.querySelectorAll('.row.between')];const service=rows.find(r=>r.firstElementChild?.textContent.includes('Harga layanan'));if(service)service.lastElementChild.textContent=offerMoney(pkg.price);const total=rows.find(r=>r.firstElementChild?.textContent.trim()==='Total');if(total)total.lastElementChild.textContent=offerMoney(pkg.price+75000-150000);
}
function profileName(){try{return JSON.parse(localStorage.getItem('entego_partner_profile')||'{}').displayName||'Mitra ENTEGO'}catch{return'Mitra ENTEGO'}}

const offerRun=()=>{packageManager();availabilityManager();publicPackages();bookingAvailability();checkoutPackage()};
new MutationObserver(offerRun).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',offerRun);offerRun();
