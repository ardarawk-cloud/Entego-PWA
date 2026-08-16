import { defineConfig } from 'vite';

const ENTEGO_GROUPS_V109=[
 {key:'talent',label:'Talent',icon:'talent',items:['DJ','MC','Live Band','Singer','Dancer','Performer','Acoustic','Saxophone / Violin','Traditional Performer','Magician','Host / Presenter']},
 {key:'production',label:'Production',icon:'production',items:['Sound System','Lighting','DJ Equipment / CDJ','LED Screen','Stage','Rigging','Tenda','Genset','Special Effects','Livestream / Broadcast Equipment']},
 {key:'photo',label:'Photo & Creative',icon:'photo',items:['Photographer','Videographer','Drone','Photo Booth','Event Content Creator','Livestream Crew']},
 {key:'beauty',label:'Beauty & Styling',icon:'beauty',items:['MUA','Bridal MUA','Hair Stylist','Traditional Bridal Stylist','Nail Artist','Groom Styling']},
 {key:'food',label:'Food & Hospitality',icon:'food',items:['Catering','Wedding Catering','Cake / Dessert','Coffee / Barista','Beverage Service','Food Stall / Event Booth']},
 {key:'organizer',label:'Organizer',icon:'organizer',items:['Event Organizer','Wedding Organizer','Party Planner','Corporate Event Planner','Birthday Planner','Conference / MICE Planner']},
 {key:'venue',label:'Venue',icon:'venue',items:['Club','Beach Club','Villa','Hotel / Ballroom','Restaurant Venue','Rooftop','Beach / Garden Venue','Convention / Event Hall']},
 {key:'rental',label:'Rental & Transport',icon:'rental',items:['Mobil','Wedding Car','VIP Van','Bus / Minibus','Motor','Furniture','Table / Chair','Equipment Rental']},
 {key:'decor',label:'Decoration & Event Support',icon:'decor',items:['Wedding Decoration','Florist','Backdrop','Balloon Decoration','Table Styling','Signage','Security','Event Crew','Usher','Parking Crew','Cleaning Crew']}
];

function entegoIconV109(key,small=false){
 const common=`viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`;
 const body={
  talent:'<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6"/><path d="m18.2 4 .6 1.4L20.2 6l-1.4.6-.6 1.4-.6-1.4L16.2 6l1.4-.6.6-1.4Z"/>',
  production:'<rect x="4" y="3.5" width="12" height="17" rx="2"/><circle cx="10" cy="8" r="2"/><circle cx="10" cy="15" r="3.2"/><path d="M19 6v8M21 8v4"/>',
  photo:'<path d="M4 7h3l1.2-2h7.6L17 7h3v12H4Z"/><circle cx="12" cy="13" r="4"/><path d="M17.5 9.5h.01"/>',
  beauty:'<circle cx="15" cy="9" r="5"/><path d="M15 14v7M12 21h6M4 20l5.5-5.5M5.5 13.5l5 5"/>',
  food:'<path d="M4 17h16M6 15a6 6 0 0 1 12 0H6ZM12 7V5M10 5h4"/><path d="M3 19h18"/>',
  organizer:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M8 9h8M8 13h4"/><path d="m13.5 16 1.5 1.5 3-3"/>',
  venue:'<path d="M5 21V8l7-5 7 5v13M9 21v-6h6v6M8 10h.01M12 10h.01M16 10h.01"/><path d="M3 21h18"/>',
  rental:'<path d="M5 16h14l-1.2-5.1a2 2 0 0 0-2-1.5H8.2a2 2 0 0 0-2 1.5L5 16Z"/><path d="M3 16v3h2M21 16v3h-2"/><circle cx="7" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/><path d="M8 12h8"/>',
  decor:'<path d="M5 21V11a7 7 0 0 1 14 0v10M8 21V11a4 4 0 0 1 8 0v10"/><path d="M5 8c-2-2 0-5 2-3 0-3 4-3 4 0M19 8c2-2 0-5-2-3 0-3-4-3-4 0"/>'
 }[key]||'<circle cx="12" cy="12" r="8"/>';
 return `<svg ${common} style="width:${small?22:32}px;height:${small?22:32}px;display:block">${body}</svg>`;
}

function entegoHomeV109(){
 const popular=[['DJ','talent'],['MUA','beauty'],['Sound System','production'],['Photographer','photo'],['Wedding Organizer','organizer'],['Villa','venue']];
 return `<div class="phone">${topbar()}<main class="content v109-home"><style id="entegoHomeV109Style">
 .v109-home{padding-top:18px}.v109-hero{position:relative;overflow:hidden;background:linear-gradient(145deg,#071225 0%,#0f172a 62%,#4a2315 100%);color:#fff;border-radius:26px;padding:22px 20px 21px;box-shadow:0 16px 36px rgba(15,23,42,.18)}.v109-hero:after{content:"";position:absolute;width:180px;height:180px;border-radius:50%;right:-65px;top:-70px;background:rgba(249,115,22,.24)}.v109-hero>*{position:relative;z-index:1}.v109-eyebrow{display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(249,115,22,.48);background:rgba(249,115,22,.08);border-radius:999px;padding:7px 10px;font-size:11px;font-weight:850;letter-spacing:.12em;color:#fed7aa}.v109-hero h1{font-size:30px;line-height:1.08;margin:14px 0 10px;max-width:310px}.v109-hero p{margin:0;color:#cbd5e1;line-height:1.5;font-size:14px;max-width:330px}.v109-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:17px}.v109-actions .btn{min-height:46px}.v109-trust{display:flex;gap:7px;flex-wrap:wrap;margin-top:16px}.v109-trust span{border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.06);border-radius:999px;padding:7px 9px;font-size:10px;font-weight:800;color:#e2e8f0}.v109-section{margin-top:23px}.v109-head{display:flex;align-items:end;justify-content:space-between;gap:10px;margin-bottom:11px}.v109-head h2{margin:0;font-size:21px}.v109-head p{margin:3px 0 0;color:#64748b;font-size:12px}.v109-link{border:0;background:transparent;color:#f97316;font-weight:850;font-size:12px;padding:7px}.v109-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.v109-cat{border:1px solid #e9edf2;background:#fff;border-radius:20px;min-height:126px;padding:13px 7px 11px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;text-align:center;color:#111827;box-shadow:0 8px 22px rgba(15,23,42,.065)}.v109-cat:active{transform:scale(.98)}.v109-icon{width:55px;height:55px;border-radius:17px;background:#f6f3ee;display:flex;align-items:center;justify-content:center;color:#111827}.v109-cat b{font-size:12px;line-height:1.18}.v109-pop{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.v109-pop button{border:1px solid #e8ecf1;background:#fff;border-radius:17px;padding:12px;text-align:left;display:flex;align-items:center;gap:10px;min-height:68px;color:#111827;box-shadow:0 5px 16px rgba(15,23,42,.05)}.v109-pop-ico{width:40px;height:40px;min-width:40px;border-radius:13px;background:#f6f3ee;display:flex;align-items:center;justify-content:center}.v109-pop b{font-size:12px;line-height:1.2}@media(max-width:380px){.v109-grid{gap:8px}.v109-cat{min-height:116px}.v109-cat b{font-size:11px}}
 </style><section class="v109-hero"><div class="v109-eyebrow">EVENT ECOSYSTEM • BALI</div><h1>Semua kebutuhan event, satu tempat.</h1><p>Talent, production, MUA, creative, catering, organizer, venue, rental, dan event support dalam satu ekosistem.</p><div class="v109-actions"><button class="btn primary" data-route="services">Jelajahi Layanan</button><button class="btn glass" data-route="partnerOnboarding">Daftar Mitra</button></div><div class="v109-trust"><span>✓ Verified Partner</span><span>✓ ENTEGO Protection</span><span>✓ Secure Booking</span></div></section><section class="v109-section"><div class="v109-head"><div><h2>Jelajahi Kategori</h2><p>Pilih kebutuhan event kamu.</p></div><button class="v109-link" type="button" onclick="localStorage.setItem('entego_event_group','all');localStorage.setItem('entego_route','services');location.reload()">Semua</button></div><div class="v109-grid">${ENTEGO_SERVICE_GROUPS_V109.map(g=>`<button class="v109-cat" type="button" onclick="localStorage.setItem('entego_event_group','${g.key}');localStorage.setItem('entego_route','services');location.reload()"><span class="v109-icon">${entegoIconV109(g.icon)}</span><b>${g.label}</b></button>`).join('')}</div></section><section class="v109-section"><div class="v109-head"><div><h2>Layanan Populer</h2><p>Langsung cari layanan yang sering dibutuhkan.</p></div></div><div class="v109-pop">${popular.map(([label,key])=>`<button type="button" onclick="localStorage.setItem('entego_event_category','${label}');localStorage.setItem('entego_route','explore');location.reload()"><span class="v109-pop-ico">${entegoIconV109(ENTEGO_SERVICE_GROUPS_V109.find(g=>g.key===key)?.icon||key,true)}</span><b>${label}</b></button>`).join('')}</div></section><div style="height:14px"></div></main>${bottom("home")}</div>`
}

function entegoServicesV109(){
 const active=localStorage.getItem('entego_event_group')||'all';
 const selected=ENTEGO_SERVICE_GROUPS_V109.find(g=>g.key===active);
 const groups=selected?[selected]:ENTEGO_SERVICE_GROUPS_V109;
 const filters=[{key:'all',label:'Semua'},...ENTEGO_SERVICE_GROUPS_V109];
 return `<div class="phone">${topbar("Semua Layanan",true,true,"home")}<main class="content"><style>.v109-filters{display:flex;gap:8px;overflow-x:auto;padding:2px 0 11px;scrollbar-width:none}.v109-filters::-webkit-scrollbar{display:none}.v109-filter{white-space:nowrap;border:1px solid #e2e8f0;background:#fff;color:#0f172a;border-radius:999px;padding:9px 14px;font-size:12px;font-weight:800}.v109-filter.active{background:#0f172a;color:#fff;border-color:#0f172a}.v109-services{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.v109-service{border:1px solid #e8ecf1;background:#fff;border-radius:17px;padding:12px;min-height:72px;text-align:left;display:flex;align-items:center;gap:10px;color:#0f172a}.v109-service span{width:40px;height:40px;min-width:40px;border-radius:13px;background:#f6f3ee;display:flex;align-items:center;justify-content:center}.v109-service b{font-size:12px;line-height:1.2}.v109-services-title{margin:5px 0 3px}.v109-note{color:#64748b;font-size:12px;margin-bottom:12px}</style><div class="kicker">ENTEGO EVENT ECOSYSTEM</div><h2 class="v109-services-title">Semua Layanan</h2><div class="v109-note">Tekan Semua untuk melihat seluruh layanan, atau pilih kategori untuk menyaring.</div><div class="v109-filters">${filters.map(g=>`<button class="v109-filter ${active===g.key||(active==='all'&&g.key==='all')?'active':''}" type="button" onclick="localStorage.setItem('entego_event_group','${g.key}');location.reload()">${g.label}</button>`).join('')}</div>${groups.map(g=>`<section class="section"><div class="section-head"><div><h2>${selected?'Jenis ':''}${g.label}</h2><div class="meta">${g.items.length} jenis layanan</div></div></div><div class="v109-services">${g.items.map(label=>`<div class="v109-service clickable" data-category="${label}"><span>${entegoIconV109(g.icon,true)}</span><b>${label}</b></div>`).join('')}</div></section>`).join('')}</main>${bottom("explore")}</div>`
}

function entegoCoreCatalogPlugin(){
 return {
  name:'entego-core-home-v109',
  enforce:'pre',
  transform(code,id){
   const normalized=String(id||'').replaceAll('\\','/');
   const cleanId=normalized.split('?')[0].split('#')[0];
   if(!cleanId.endsWith('/main.js'))return null;
   let next=code;
   const helper=`\nconst ENTEGO_SERVICE_GROUPS_V109=${JSON.stringify(ENTEGO_GROUPS_V109)};\n${entegoIconV109.toString()}\n`;
   if(!next.includes('ENTEGO_SERVICE_GROUPS_V109'))next=next.replace('import "./styles.css";','import "./styles.css";'+helper+'\nglobalThis.ENTEGO_CORE_CATALOG_VERSION="3.1";\nglobalThis.ENTEGO_HOME_VERSION="1.0.9";');
   const homeStart=next.indexOf('function home(){');
   const homeEnd=next.indexOf('\nfunction filteredVendors',homeStart);
   if(homeStart<0||homeEnd<0)throw new Error(`ENTEGO home renderer boundary missing: ${id}`);
   const homeFn=entegoHomeV109.toString().replace('function entegoHomeV109','function home');
   next=next.slice(0,homeStart)+homeFn+next.slice(homeEnd);
   const servicesStart=next.indexOf('function services(){');
   const servicesEnd=next.indexOf('\nfunction partner(){',servicesStart);
   if(servicesStart<0||servicesEnd<0)throw new Error(`ENTEGO services renderer boundary missing: ${id}`);
   const servicesFn=entegoServicesV109.toString().replace('function entegoServicesV109','function services');
   next=next.slice(0,servicesStart)+servicesFn+next.slice(servicesEnd);
   next=next.replaceAll('price:900000','price:1000000');
   next=next.replaceAll('Cari DJ, sound, mobil, MC...','Cari DJ, MUA, EO, WO, venue, sound...');
   next=next.replaceAll('/logo-header.png?v=14','/logo-header.png?v=87');
   next=next.replaceAll('Paket & harga','Menu Layanan & Harga');
   for(const marker of ['globalThis.ENTEGO_HOME_VERSION="1.0.9"','Jelajahi Kategori','MUA','Wedding Organizer','Decoration & Event Support'])if(!next.includes(marker))throw new Error(`ENTEGO v1.0.9 marker missing: ${marker}`);
   return {code:next,map:null};
  }
 };
}

export default defineConfig({
 plugins:[entegoCoreCatalogPlugin()],
 build:{
  emptyOutDir:true,
  rollupOptions:{output:{entryFileNames:'assets/[name]-v87.js',chunkFileNames:'assets/[name]-v87.js',assetFileNames:'assets/[name]-v87[extname]'}}
 }
});
