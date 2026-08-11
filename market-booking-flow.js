const ENTEGO_BOOKING_DRAFT='entego_booking_draft';
const ENTEGO_CURRENT_ORDER='entego_current_order_v2';
const ENTEGO_SEARCH_FILTERS='entego_search_filters';

const mbRead=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
const mbSave=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const mbRoute=()=>localStorage.getItem('entego_route')||'home';
const mbMoney=value=>`Rp${Number(value||0).toLocaleString('id-ID')}`;
const mbEsc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const mbProfile=()=>mbRead('entego_partner_profile',{});
const mbPackages=()=>mbRead('entego_partner_packages',[{id:'standard',name:'Standard Package',duration:'3 jam',price:1500000,description:''}]);
const mbSelectedPackage=()=>{const id=localStorage.getItem('entego_selected_package');return mbPackages().find(x=>x.id===id)||mbPackages()[0]};
const mbVendorPrice=id=>{const defaults={1:1500000,2:2800000,3:900000,4:1200000};if(Number(id)===1){const p=Number(mbProfile().price||0);if(p)return p}return defaults[Number(id)]||0};

function addSearchFilters(){
 if(mbRoute()!=='explore')return;
 const main=document.querySelector('main.content');if(!main||document.querySelector('#entegoSearchFilters'))return;
 const saved=mbRead(ENTEGO_SEARCH_FILTERS,{q:'',cat:'all',area:'all',max:''});
 const box=document.createElement('section');box.id='entegoSearchFilters';box.className='card';
 box.innerHTML=`<div class="kicker">SEARCH & FILTER</div><div class="form"><div class="field"><label>Kategori</label><select id="entegoFilterCat"><option value="all">Semua kategori</option><option value="DJ">DJ</option><option value="Live Band">Live Band</option><option value="Sound System">Sound System</option><option value="Fotografer">Fotografer</option></select></div><div class="field"><label>Area</label><select id="entegoFilterArea"><option value="all">Semua area</option><option value="Seminyak">Seminyak</option><option value="Canggu">Canggu</option><option value="Denpasar">Denpasar</option><option value="Kuta">Kuta</option></select></div><div class="field"><label>Harga maksimal</label><input id="entegoFilterMax" inputmode="numeric" placeholder="Contoh: 2000000" value="${mbEsc(saved.max||'')}"></div></div><div class="row between"><span class="meta" id="entegoResultCount"></span><button class="btn soft mini" id="entegoResetFilter">Reset</button></div>`;
 const tab=main.querySelector('.tabbar');if(tab)tab.after(box);else main.prepend(box);
 const search=document.querySelector('#searchInput');if(search&&!search.value)search.value=saved.q||'';
 box.querySelector('#entegoFilterCat').value=saved.cat||'all';box.querySelector('#entegoFilterArea').value=saved.area||'all';
 const apply=()=>{
  const q=(document.querySelector('#searchInput')?.value||'').trim().toLowerCase(),cat=box.querySelector('#entegoFilterCat').value,area=box.querySelector('#entegoFilterArea').value,max=Number((box.querySelector('#entegoFilterMax').value||'').replace(/\D/g,''))||0;
  mbSave(ENTEGO_SEARCH_FILTERS,{q,cat,area,max:max||''});let visible=0;
  main.querySelectorAll('[data-vendor]').forEach(card=>{const text=card.textContent.toLowerCase(),meta=card.querySelector('.meta')?.textContent||'',priceText=[...card.querySelectorAll('b')].find(el=>/^Rp/.test(el.textContent.trim()))?.textContent||'',price=Number(priceText.replace(/\D/g,''))||mbVendorPrice(card.dataset.vendor);const okQ=!q||text.includes(q),okCat=cat==='all'||text.includes(cat.toLowerCase()),okArea=area==='all'||meta.includes(area),okPrice=!max||price<=max;card.style.display=okQ&&okCat&&okArea&&okPrice?'':'none';if(okQ&&okCat&&okArea&&okPrice)visible++});
  box.querySelector('#entegoResultCount').textContent=`${visible} mitra ditemukan`;
 };
 ['change','input'].forEach(evt=>{box.addEventListener(evt,e=>{if(['entegoFilterCat','entegoFilterArea','entegoFilterMax'].includes(e.target.id))apply()})});if(search)search.addEventListener('input',apply);
 box.querySelector('#entegoResetFilter').onclick=()=>{mbSave(ENTEGO_SEARCH_FILTERS,{q:'',cat:'all',area:'all',max:''});if(search)search.value='';box.querySelector('#entegoFilterCat').value='all';box.querySelector('#entegoFilterArea').value='all';box.querySelector('#entegoFilterMax').value='';apply()};
 apply();
}

function bookingFields(){
 const main=document.querySelector('main.content');if(!main)return{};const map={};main.querySelectorAll('.field').forEach(field=>{const label=field.querySelector('label')?.textContent.trim().toLowerCase();const control=field.querySelector('input,select,textarea');if(label&&control)map[label]=control});return map;
}

function saveBookingDraft(){
 if(mbRoute()!=='booking')return;
 const f=bookingFields(),pkg=mbSelectedPackage(),p=mbProfile();
 const draft={vendorId:Number(localStorage.getItem('entego_vendor')||1),vendorName:p.displayName||'DJ Raka Bali',packageId:pkg.id,packageName:pkg.name,packagePrice:Number(pkg.price||0),duration:f['durasi']?.value||pkg.duration||'',date:f['tanggal acara']?.value||'',time:f['jam mulai']?.value||'',location:f['lokasi acara']?.value||'',note:f['catatan']?.value||'',updatedAt:new Date().toISOString()};
 mbSave(ENTEGO_BOOKING_DRAFT,draft);
}

function hydrateBooking(){
 if(mbRoute()!=='booking')return;
 const main=document.querySelector('main.content');if(!main||main.dataset.entegoBookingPersist==='1')return;main.dataset.entegoBookingPersist='1';
 const draft=mbRead(ENTEGO_BOOKING_DRAFT,{}),f=bookingFields();
 if(draft.date&&f['tanggal acara'])f['tanggal acara'].value=draft.date;if(draft.time&&f['jam mulai'])f['jam mulai'].value=draft.time;if(draft.duration&&f['durasi'])f['durasi'].value=draft.duration;if(draft.location&&f['lokasi acara'])f['lokasi acara'].value=draft.location;if(draft.note&&f['catatan'])f['catatan'].value=draft.note;
 Object.values(f).forEach(el=>{el.addEventListener('input',saveBookingDraft);el.addEventListener('change',saveBookingDraft)});saveBookingDraft();
}

function createOrderFromDraft(){
 const draft=mbRead(ENTEGO_BOOKING_DRAFT,{}),pkg=mbSelectedPackage(),fee=75000,promo=150000;const stamp=Date.now();
 const order={id:`ENT-${new Date().getFullYear()}-${String(stamp).slice(-6)}`,vendorId:draft.vendorId||1,vendorName:draft.vendorName||mbProfile().displayName||'Mitra ENTEGO',packageId:pkg.id,packageName:pkg.name,packagePrice:Number(pkg.price||draft.packagePrice||0),duration:draft.duration||pkg.duration,date:draft.date,time:draft.time,location:draft.location,note:draft.note,paymentMethod:localStorage.getItem('entego_pay')||'QRIS',fee,promo,total:Number(pkg.price||draft.packagePrice||0)+fee-promo,status:'baru',createdAt:new Date().toISOString()};
 mbSave(ENTEGO_CURRENT_ORDER,order);return order;
}

function checkoutPersist(){
 if(mbRoute()!=='checkout')return;
 const main=document.querySelector('main.content');if(!main||main.dataset.entegoBookingCheckout==='1')return;main.dataset.entegoBookingCheckout='1';const draft=mbRead(ENTEGO_BOOKING_DRAFT,{}),pkg=mbSelectedPackage(),first=main.querySelector('.card');if(!first)return;
 const h3=first.querySelector('h3');if(h3)h3.textContent=`${draft.vendorName||mbProfile().displayName||'Mitra ENTEGO'} — ${pkg.name}`;const meta=h3?.nextElementSibling;if(meta?.classList.contains('meta'))meta.textContent=`${formatDate(draft.date)} • ${draft.time||'-'} • ${draft.duration||pkg.duration}`;
 const rows=[...first.querySelectorAll('.row.between')];const service=rows.find(r=>r.firstElementChild?.textContent.includes('Harga layanan'));if(service)service.lastElementChild.textContent=mbMoney(pkg.price);const total=rows.find(r=>r.firstElementChild?.textContent.trim()==='Total');if(total)total.lastElementChild.textContent=mbMoney(Number(pkg.price||0)+75000-150000);
}

function formatDate(value){if(!value)return'Tanggal belum dipilih';try{return new Date(value+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}catch{return value}}

function hydrateOrderViews(){
 const r=mbRoute();if(!['orders','orderdetail','partnerOrders','partnerOrderDetail'].includes(r))return;const order=mbRead(ENTEGO_CURRENT_ORDER,null);if(!order)return;const main=document.querySelector('main.content');if(!main||main.dataset.entegoOrderHydrated==='1')return;main.dataset.entegoOrderHydrated='1';
 if(r==='orders'){const card=main.querySelector('.card');if(card){const id=card.querySelector('.pill.blue');if(id)id.textContent=`#${order.id}`;const h3=card.querySelector('h3');if(h3)h3.textContent=`🎧 ${order.vendorName}`;const meta=h3?.nextElementSibling;if(meta?.classList.contains('meta'))meta.textContent=`${formatDate(order.date)} • ${order.time||'-'} • ${order.location||'-'}`}}
 if(r==='orderdetail'){const cards=main.querySelectorAll('.card');const first=cards[0];if(first){const b=first.querySelector('b');if(b)b.textContent=`#${order.id}`;const bold=[...first.querySelectorAll('b')][1];if(bold)bold.textContent=order.vendorName;const meta=first.querySelector('.meta');if(meta)meta.textContent=`${formatDate(order.date)} • ${order.time||'-'} • ${order.duration||'-'}`}const loc=[...cards].find(c=>c.querySelector('b')?.textContent==='Lokasi');if(loc){const p=loc.querySelector('p');if(p)p.textContent=order.location||'-'}const pay=[...cards].find(c=>c.querySelector('b')?.textContent==='Pembayaran');if(pay){const row=pay.querySelector('.row');if(row){row.firstElementChild.textContent=order.paymentMethod;row.lastElementChild.textContent=mbMoney(order.total)}}}
 if(r==='partnerOrders'){const card=main.querySelector('.card');if(card){const b=card.querySelector('b');if(b)b.textContent=`${order.packageName}`;const meta=card.querySelector('.meta');if(meta)meta.textContent=`${formatDate(order.date)} • ${order.location||'-'} • ${mbMoney(order.packagePrice)}`}}
 if(r==='partnerOrderDetail'){const cards=main.querySelectorAll('.card');const first=cards[0];if(first){const b=first.querySelector('b');if(b)b.textContent=`#${order.id}`;const meta=first.querySelector('.meta');if(meta)meta.textContent=`${order.packageName} • ${formatDate(order.date)} • ${order.time||'-'}`}const pkg=[...cards].find(c=>c.querySelector('b')?.textContent==='Paket');if(pkg){const p=pkg.querySelector('p');if(p)p.textContent=order.packageName;const row=pkg.querySelector('.row');if(row)row.lastElementChild.textContent=mbMoney(order.packagePrice)}}
}

document.addEventListener('click',e=>{
 const target=e.target.closest('#searchBtn');if(target&&mbRoute()==='explore'){e.preventDefault();e.stopImmediatePropagation();const input=document.querySelector('#searchInput');input?.dispatchEvent(new Event('input',{bubbles:true}));return}
 const checkout=e.target.closest('[data-route="checkout"]');if(checkout&&mbRoute()==='booking')saveBookingDraft();
 const pay=e.target.closest('#payBtn');if(pay&&mbRoute()==='checkout')createOrderFromDraft();
},true);

const mbRun=()=>{addSearchFilters();hydrateBooking();checkoutPersist();hydrateOrderViews()};
new MutationObserver(mbRun).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('load',mbRun);mbRun();
