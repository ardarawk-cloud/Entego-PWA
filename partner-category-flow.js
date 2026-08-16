const ENTEGO_PARTNER_CATEGORY_VERSION='2.1';
const PARTNER_CATEGORY_GROUPS=[
 {key:'talent',label:'Talent',items:['DJ','MC','Live Band','Singer','Dancer','Performer','Acoustic','Saxophone / Violin','Traditional Performer','Magician','Host / Presenter']},
 {key:'production',label:'Production',items:['Sound System','Lighting','DJ Equipment / CDJ','LED Screen','Stage','Rigging','Tenda','Genset','Special Effects','Livestream / Broadcast Equipment']},
 {key:'photo',label:'Photo & Creative',items:['Photographer','Videographer','Drone','Photo Booth','Event Content Creator','Livestream Crew']},
 {key:'beauty',label:'Beauty & Styling',items:['MUA','Bridal MUA','Hair Stylist','Traditional Bridal Stylist','Nail Artist','Groom Styling']},
 {key:'food',label:'Food & Hospitality',items:['Catering','Wedding Catering','Cake / Dessert','Coffee / Barista','Beverage Service','Food Stall / Event Booth']},
 {key:'organizer',label:'Organizer',items:['Event Organizer','Wedding Organizer','Party Planner','Corporate Event Planner','Birthday Planner','Conference / MICE Planner']},
 {key:'venue',label:'Venue',items:['Club','Beach Club','Villa','Hotel / Ballroom','Restaurant Venue','Rooftop','Beach / Garden Venue','Convention / Event Hall']},
 {key:'rental',label:'Rental & Transport',items:['Mobil','Wedding Car','VIP Van','Bus / Minibus','Motor','Furniture','Table / Chair','Equipment Rental']},
 {key:'decor',label:'Decoration & Event Support',items:['Wedding Decoration','Florist','Backdrop','Balloon Decoration','Table Styling','Signage','Security','Event Crew','Usher','Parking Crew','Cleaning Crew']},
 {key:'other',label:'Lainnya',items:['Lainnya']}
];
const CATEGORIES=PARTNER_CATEGORY_GROUPS.flatMap(g=>g.items);
const groupForCategory=value=>PARTNER_CATEGORY_GROUPS.find(g=>g.items.includes(value))||PARTNER_CATEGORY_GROUPS[PARTNER_CATEGORY_GROUPS.length-1];
const pcEsc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const readServices=()=>{try{const x=JSON.parse(localStorage.getItem('entego_partner_services')||'[]');return Array.isArray(x)?x.filter(Boolean):[]}catch{return []}};
const saveServices=x=>localStorage.setItem('entego_partner_services',JSON.stringify([...new Set(x.filter(Boolean))].slice(0,30)));
function enhancePartnerCategory(){
  if(localStorage.getItem('entego_route')!=='partnerOnboarding') return;
  const selects=[...document.querySelectorAll('select')];
  const select=selects.find(s=>s.closest('.field')?.textContent?.toLowerCase().includes('kategori'))||selects[0];
  if(!select||select.dataset.entegoExpanded==='3') return;
  select.dataset.entegoExpanded='3';
  const saved=localStorage.getItem('entego_partner_category')||select.value||'DJ';
  select.innerHTML=PARTNER_CATEGORY_GROUPS.map(g=>`<optgroup label="${pcEsc(g.label)}">${g.items.map(c=>`<option value="${pcEsc(c)}">${pcEsc(c)}</option>`).join('')}</optgroup>`).join('');
  select.value=CATEGORIES.includes(saved)?saved:'Lainnya';
  const field=select.closest('.field')||select.parentElement;
  const oldIntro=field.querySelector('[data-entego-category-intro]');if(oldIntro)oldIntro.remove();
  const intro=document.createElement('div');intro.dataset.entegoCategoryIntro='1';intro.className='meta';intro.style.cssText='margin:7px 0 0;line-height:1.45';intro.textContent='Pilih layanan utama. Satu akun mitra tetap boleh menawarkan banyak layanan lain.';field.appendChild(intro);
  const groupCard=document.createElement('div');groupCard.id='entegoPartnerGroupCard';groupCard.className='card';groupCard.style.cssText='margin-top:12px;padding:12px';field.appendChild(groupCard);
  const multi=document.createElement('section');multi.id='entegoPartnerMultiServices';multi.className='card';multi.style.cssText='margin-top:12px;padding:14px';field.appendChild(multi);
  const custom=document.createElement('div');custom.id='entegoCustomCategory';custom.style.cssText='margin-top:14px;display:none';custom.innerHTML='<label style="display:block;font-weight:800;margin-bottom:8px">Pekerjaan / layanan kamu</label><input id="entegoCustomCategoryInput" type="text" maxlength="60" placeholder="Contoh: Fire dancer, saxophonist, florist..." style="width:100%;box-sizing:border-box" autocomplete="organization-title"><small style="display:block;margin-top:7px;color:#64748b;line-height:1.4">Belum ada di daftar? Tulis jenis pekerjaan atau layanan yang kamu tawarkan.</small>';field.appendChild(custom);
  const input=custom.querySelector('input');input.value=localStorage.getItem('entego_partner_custom_category')||'';
  const renderMulti=()=>{const selected=new Set(readServices());selected.add(select.value);multi.innerHTML=`<div class="kicker">LAYANAN YANG KAMU SEDIAKAN</div><b>Satu profil, banyak layanan</b><p class="meta" style="margin:6px 0 10px">Centang semua layanan yang benar-benar tersedia. Customer dapat menemukan profil kamu dari setiap layanan tersebut.</p>${PARTNER_CATEGORY_GROUPS.filter(g=>g.key!=='other').map(g=>`<details ${g.items.includes(select.value)||g.items.some(x=>selected.has(x))?'open':''} style="border-top:1px solid #edf0f4;padding:9px 0"><summary style="font-weight:800;cursor:pointer">${pcEsc(g.label)}</summary><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:9px;align-items:stretch">${g.items.map(item=>`<label style="display:grid;grid-template-columns:20px minmax(0,1fr);align-items:center;gap:8px;min-height:48px;height:100%;padding:8px 9px;border:1px solid #edf0f4;border-radius:12px;font-size:13px;line-height:1.25;box-sizing:border-box;background:#fff"><input type="checkbox" data-partner-service="${pcEsc(item)}" ${selected.has(item)?'checked':''} ${item===select.value?'disabled':''} style="width:18px;height:18px;margin:0;justify-self:center;align-self:center"><span style="min-width:0;overflow-wrap:anywhere">${pcEsc(item)}${item===select.value?' <small style="color:#64748b">(utama)</small>':''}</span></label>`).join('')}</div></details>`).join('')}`;multi.querySelectorAll('[data-partner-service]').forEach(cb=>cb.addEventListener('change',()=>{const next=new Set(readServices());if(cb.checked)next.add(cb.dataset.partnerService);else next.delete(cb.dataset.partnerService);next.add(select.value);saveServices([...next]);multi.dispatchEvent(new CustomEvent('entego:services-changed',{bubbles:true}))}))};
  const sync=()=>{const other=select.value==='Lainnya',g=groupForCategory(select.value);custom.style.display=other?'block':'none';localStorage.setItem('entego_partner_category',select.value);localStorage.setItem('entego_partner_group',g.key);const next=new Set(readServices());next.add(select.value);saveServices([...next]);groupCard.innerHTML=`<div class="kicker">PRIMARY SERVICE</div><b>${pcEsc(g.label)} • ${pcEsc(select.value)}</b><div class="meta">${g.key==='organizer'?'EO/WO dan planner adalah Professional Partner ENTEGO.':g.key==='venue'?'Profil venue tetap satu dan dapat menawarkan layanan tambahan yang relevan.':'Kategori dipakai untuk discovery customer; akun mitra tidak dibatasi hanya satu layanan.'}</div>`;if(!other)localStorage.removeItem('entego_partner_custom_category');renderMulti()};
  select.addEventListener('change',sync);input.addEventListener('input',()=>localStorage.setItem('entego_partner_custom_category',input.value.trim()));sync();
}
new MutationObserver(enhancePartnerCategory).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',enhancePartnerCategory);enhancePartnerCategory();
