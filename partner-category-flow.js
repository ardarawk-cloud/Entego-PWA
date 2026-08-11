const CATEGORIES=['DJ','MC / Host','Live Band / Musisi','Singer / Vocalist','Dancer / Performer','Sound System','Lighting','Fotografer','Videografer','Event Organizer','Dekorasi','Venue','Mobil / Transport','Motor / Transport','Tenda & Peralatan Event','Security / Event Crew','Makeup Artist / Stylist','Catering','Wedding Organizer','Lainnya'];
function enhancePartnerCategory(){
  if(localStorage.getItem('entego_route')!=='partnerOnboarding') return;
  const selects=[...document.querySelectorAll('select')];
  const select=selects.find(s=>s.closest('.field')?.textContent?.toLowerCase().includes('kategori'))||selects[0];
  if(!select||select.dataset.entegoExpanded==='1') return;
  select.dataset.entegoExpanded='1';
  const saved=localStorage.getItem('entego_partner_category')||select.value||'DJ';
  select.innerHTML=CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join('');
  select.value=CATEGORIES.includes(saved)?saved:'Lainnya';
  const field=select.closest('.field')||select.parentElement;
  const custom=document.createElement('div');
  custom.id='entegoCustomCategory';
  custom.style.cssText='margin-top:14px;display:none';
  custom.innerHTML='<label style="display:block;font-weight:800;margin-bottom:8px">Pekerjaan / layanan kamu</label><input id="entegoCustomCategoryInput" type="text" maxlength="60" placeholder="Contoh: Fire dancer, saxophonist, florist..." style="width:100%;box-sizing:border-box" autocomplete="organization-title"><small style="display:block;margin-top:7px;color:#64748b;line-height:1.4">Belum ada di daftar? Tulis jenis pekerjaan atau layanan yang kamu tawarkan.</small>';
  field.appendChild(custom);
  const input=custom.querySelector('input');
  input.value=localStorage.getItem('entego_partner_custom_category')||'';
  const sync=()=>{const other=select.value==='Lainnya';custom.style.display=other?'block':'none';localStorage.setItem('entego_partner_category',select.value);if(!other)localStorage.removeItem('entego_partner_custom_category')};
  select.addEventListener('change',sync);
  input.addEventListener('input',()=>localStorage.setItem('entego_partner_custom_category',input.value.trim()));
  sync();
}
new MutationObserver(enhancePartnerCategory).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',enhancePartnerCategory);
enhancePartnerCategory();
