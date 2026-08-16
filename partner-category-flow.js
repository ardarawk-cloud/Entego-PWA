const PARTNER_CATEGORY_GROUPS=[
 {key:'talent',label:'Talent',items:['DJ','MC / Host','Live Band / Musisi','Singer / Vocalist','Dancer / Performer']},
 {key:'production',label:'Production',items:['Sound System','Lighting','Stage / Tenda','LED / Visual','Dekorasi','Tenda & Peralatan Event','Security / Event Crew']},
 {key:'services',label:'Services',items:['Fotografer','Videografer','Makeup Artist / Stylist','Catering','Transport','Mobil / Transport','Motor / Transport']},
 {key:'organizer',label:'Organizer',items:['Event Organizer','Wedding Organizer','Party Planner','Corporate Event Planner']},
 {key:'venue',label:'Venue',items:['Club','Villa','Hotel / Ballroom','Beach Venue','Venue Lainnya']},
 {key:'other',label:'Lainnya',items:['Lainnya']}
];
const CATEGORIES=PARTNER_CATEGORY_GROUPS.flatMap(g=>g.items);
const groupForCategory=value=>PARTNER_CATEGORY_GROUPS.find(g=>g.items.includes(value))||PARTNER_CATEGORY_GROUPS[5];
function enhancePartnerCategory(){
  if(localStorage.getItem('entego_route')!=='partnerOnboarding') return;
  const selects=[...document.querySelectorAll('select')];
  const select=selects.find(s=>s.closest('.field')?.textContent?.toLowerCase().includes('kategori'))||selects[0];
  if(!select||select.dataset.entegoExpanded==='2') return;
  select.dataset.entegoExpanded='2';
  const saved=localStorage.getItem('entego_partner_category')||select.value||'DJ';
  select.innerHTML=PARTNER_CATEGORY_GROUPS.map(g=>`<optgroup label="${g.label}">${g.items.map(c=>`<option value="${c}">${c}</option>`).join('')}</optgroup>`).join('');
  select.value=CATEGORIES.includes(saved)?saved:'Lainnya';
  const field=select.closest('.field')||select.parentElement;
  const intro=document.createElement('div');intro.className='meta';intro.style.cssText='margin:7px 0 0;line-height:1.45';intro.textContent='Pilih tipe Professional Partner ENTEGO: Talent, Production, Services, Organizer, atau Venue.';field.appendChild(intro);
  const groupCard=document.createElement('div');groupCard.id='entegoPartnerGroupCard';groupCard.className='card';groupCard.style.cssText='margin-top:12px;padding:12px';field.appendChild(groupCard);
  const custom=document.createElement('div');
  custom.id='entegoCustomCategory';
  custom.style.cssText='margin-top:14px;display:none';
  custom.innerHTML='<label style="display:block;font-weight:800;margin-bottom:8px">Pekerjaan / layanan kamu</label><input id="entegoCustomCategoryInput" type="text" maxlength="60" placeholder="Contoh: Fire dancer, saxophonist, florist..." style="width:100%;box-sizing:border-box" autocomplete="organization-title"><small style="display:block;margin-top:7px;color:#64748b;line-height:1.4">Belum ada di daftar? Tulis jenis pekerjaan atau layanan yang kamu tawarkan.</small>';
  field.appendChild(custom);
  const input=custom.querySelector('input');
  input.value=localStorage.getItem('entego_partner_custom_category')||'';
  const sync=()=>{const other=select.value==='Lainnya',g=groupForCategory(select.value);custom.style.display=other?'block':'none';localStorage.setItem('entego_partner_category',select.value);localStorage.setItem('entego_partner_group',g.key);groupCard.innerHTML=`<div class="kicker">PROFESSIONAL PARTNER</div><b>${g.label}</b><div class="meta">${g.key==='organizer'?'EO/WO dan planner adalah partner ENTEGO, bukan kompetitor default.':g.key==='venue'?'Profil venue untuk kebutuhan event dan booking marketplace.':'Kategori ini menjadi bagian ekosistem event ENTEGO.'}</div>`;if(!other)localStorage.removeItem('entego_partner_custom_category')};
  select.addEventListener('change',sync);
  input.addEventListener('input',()=>localStorage.setItem('entego_partner_custom_category',input.value.trim()));
  sync();
}
new MutationObserver(enhancePartnerCategory).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',enhancePartnerCategory);
enhancePartnerCategory();
