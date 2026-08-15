const premiumSvg=(name,cls='entego-line-icon')=>{
 const icons={
  home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  orders:'<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 4.5V3h6v1.5M8.5 9h7M8.5 13h7M8.5 17h4"/>',
  heart:'<path d="M20.5 8.8c0 5.1-8.5 10.2-8.5 10.2S3.5 13.9 3.5 8.8A4.3 4.3 0 0 1 12 7.7a4.3 4.3 0 0 1 8.5 1.1Z"/>',
  user:'<circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.8-4.1 3-6 6.5-6s5.7 1.9 6.5 6"/>',
  bell:'<path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 6.5 2.5 6.5h-17S6 15 6 9Z"/><path d="M10 19h4"/>',
  dj:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 4v4M20 12h-4M12 20v-4M4 12h4"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"/>',
  music:'<path d="M9 18V6l10-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
  camera:'<rect x="3" y="6.5" width="18" height="13" rx="3"/><path d="m8 6.5 1.5-2h5L16 6.5"/><circle cx="12" cy="13" r="4"/>',
  video:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3Z"/>',
  volume:'<path d="M4 10v4h4l5 4V6L8 10H4Z"/><path d="M16 9c1.5 1.5 1.5 4.5 0 6M18.5 6.5c3 3 3 8 0 11"/>',
  light:'<circle cx="12" cy="10" r="4"/><path d="M12 2v2M12 16v2M4 10H2M22 10h-2M6.3 4.3 7.7 5.7M17.7 14.3l1.4 1.4M17.7 5.7l1.4-1.4M6.3 15.7l1.4-1.4M9 21h6"/>',
  car:'<path d="M4 15V9l2-4h12l2 4v6"/><path d="M4 11h16M7 15v2M17 15v2"/><circle cx="7" cy="14" r="1"/><circle cx="17" cy="14" r="1"/>',
  bike:'<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="m8 17 4-7 3 7M10 10h5M15 10l2-3"/>',
  tent:'<path d="m3 20 9-16 9 16H3Z"/><path d="m12 4 3 16M12 13l-4 7"/>',
  sparkle:'<path d="m12 3 1.3 4.2L17.5 9l-4.2 1.8L12 15l-1.3-4.2L6.5 9l4.2-1.8L12 3Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/>',
  cake:'<path d="M5 11h14v9H5z"/><path d="M4 14c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2M9 11V7M15 11V7M9 7V5M15 7V5"/>',
  briefcase:'<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M9 7V4h6v3M3 12h18M10 12v2h4v-2"/>',
  users:'<circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3.5 20c.7-4 2.5-6 5.5-6s4.8 2 5.5 6M14 15c3.4-.6 5.5 1.1 6.5 5"/>'
 };
 return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name]||icons.sparkle}</svg>`;
};
const iconFor=text=>{const t=String(text||'').toLowerCase();if(t.includes('dj'))return'dj';if(t.includes('fotogra'))return'camera';if(t.includes('video'))return'video';if(t.includes('sound'))return'volume';if(t.includes('light'))return'light';if(t.includes('mobil'))return'car';if(t.includes('motor'))return'bike';if(t.includes('tenda'))return'tent';if(t.includes('dekor'))return'sparkle';if(t.includes('band'))return'music';if(t.includes('singer')||t.includes('mc'))return'mic';if(t.includes('wedding'))return'heart';if(t.includes('birthday'))return'cake';if(t.includes('corporate'))return'briefcase';if(t.includes('private party'))return'users';return'sparkle'};
const brandMark=()=>`<svg class="entego-brand-mark" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 4C20.4 4 11 13.4 11 25c0 14.6 16.6 28.5 21 31.8C36.4 53.5 53 39.6 53 25 53 13.4 43.6 4 32 4Z" fill="#F97316"/><circle cx="32" cy="24" r="14" fill="#102A55"/><path d="M28.5 16.7v14.6c0 1.8 2 2.9 3.5 1.9l11-7.3c1.4-.9 1.4-3 0-3.9l-11-7.3c-1.5-1-3.5.1-3.5 2Z" fill="#F97316"/></svg>`;
function premiumStyles(){if(document.querySelector('#entegoPremiumMonoStyle'))return;const s=document.createElement('style');s.id='entegoPremiumMonoStyle';s.textContent=`
.entego-line-icon{width:24px;height:24px;display:block;color:#111827}
.entego-brand-mark{width:44px;height:44px;display:block}
.cat .emoji{background:#f3f4f6!important;color:#111827!important;border:1px solid #e5e7eb!important}
.cat .emoji .entego-line-icon{width:23px;height:23px}
.quick-card>span{width:42px;height:42px!important;border-radius:13px;background:#f3f4f6;display:grid!important;place-items:center;margin-bottom:10px!important;color:#111827}
.quick-card>span .entego-line-icon{width:22px;height:22px}
.vendor-img{color:#fff!important;font-size:0!important}
.vendor-img .entego-line-icon{width:36px;height:36px;color:#fff;stroke-width:1.6}
.avatar{font-size:0!important;background:#f3f4f6!important;color:#111827!important;border:1px solid #e5e7eb}
.avatar .entego-line-icon{width:24px;height:24px}
.bottom .navbtn{color:#6b7280!important;position:relative}
.bottom .navbtn b{height:27px;display:grid!important;place-items:center;font-size:0!important}
.bottom .navbtn b .entego-line-icon{width:21px;height:21px;color:currentColor}
.bottom .navbtn.active{color:#111827!important}
.bottom .navbtn.active:before{content:"";position:absolute;top:-8px;left:50%;transform:translateX(-50%);width:28px;height:3px;border-radius:999px;background:#f97316}
.iconbtn{font-size:0!important}.iconbtn .entego-line-icon{width:21px;height:21px;color:#fff;margin:auto}
.brand-logo{box-shadow:none!important;border-radius:14px!important;background:transparent!important}
.brand-logo img{display:none!important}
`;
document.head.appendChild(s)}
function applyPremiumUI(){premiumStyles();
 document.querySelectorAll('.brand-logo').forEach(el=>{if(el.dataset.premium==='1')return;el.dataset.premium='1';el.innerHTML=brandMark()});
 document.querySelectorAll('.iconbtn').forEach(el=>{if(el.dataset.premium==='1')return;if((el.textContent||'').includes('🔔')){el.dataset.premium='1';el.innerHTML=premiumSvg('bell')}});
 document.querySelectorAll('.cat .emoji').forEach(el=>{if(el.dataset.premium==='1')return;const label=el.closest('.cat')?.querySelector('span')?.textContent||'';el.dataset.premium='1';el.innerHTML=premiumSvg(iconFor(label))});
 document.querySelectorAll('.quick-card>span').forEach(el=>{if(el.dataset.premium==='1')return;const label=el.closest('.quick-card')?.querySelector('b')?.textContent||'';el.dataset.premium='1';el.innerHTML=premiumSvg(iconFor(label))});
 document.querySelectorAll('.vendor-img').forEach(el=>{if(el.dataset.premium==='1')return;const label=el.closest('.vendor')?.querySelector('.pill')?.textContent||'';el.dataset.premium='1';el.innerHTML=premiumSvg(iconFor(label))});
 document.querySelectorAll('.avatar').forEach(el=>{if(el.dataset.premium==='1')return;const row=el.closest('.row');const text=row?.textContent||el.textContent||'';el.dataset.premium='1';el.innerHTML=premiumSvg(iconFor(text))});
 document.querySelectorAll('.bottom .navbtn').forEach(btn=>{const b=btn.querySelector('b');if(!b||b.dataset.premium==='1')return;const label=(btn.textContent||'').trim().toLowerCase();const name=label.includes('home')?'home':label.includes('cari')?'search':label.includes('order')?'orders':label.includes('favorit')?'heart':'user';b.dataset.premium='1';b.innerHTML=premiumSvg(name)});
}
let premiumQueued=false;const schedulePremium=()=>{if(premiumQueued)return;premiumQueued=true;requestAnimationFrame(()=>{premiumQueued=false;applyPremiumUI()})};
new MutationObserver(schedulePremium).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('load',schedulePremium);schedulePremium();
