import { defineConfig } from 'vite';

function entegoCoreCatalogPlugin(){
  const legacyCatalog='["Entertainment",["DJ","MC","Live Band","Singer"]]';
  const services='function services(){const groups=[["Talent",[["🎧","DJ"],["🎤","MC"],["🎸","Live Band"],["🎙️","Singer"],["★","Dancer / Performer"]]],["Production",[["🔊","Sound System"],["💡","Lighting"],["🎪","Stage / Tenda"],["▣","LED / Visual"],["✨","Dekorasi"]]],["Services",[["📸","Fotografer"],["🎥","Videografer"],["💄","Makeup Artist / Stylist"],["🍽️","Catering"],["🚐","Transport"]]],["Organizer",[["🧭","Event Organizer"],["💍","Wedding Organizer"],["📋","Party Planner"],["🏢","Corporate Event Planner"]]],["Venue",[["♬","Club"],["🏡","Villa"],["🏨","Hotel / Ballroom"],["🏝️","Beach Venue"],["⌂","Venue Lainnya"]]]];return `<div class="phone">${topbar("Semua Layanan",true,true,"home")}<main class="content"><div class="kicker">ENTEGO PROFESSIONAL PARTNER</div><p class="meta">Talent • Production • Services • Organizer • Venue</p>${groups.map(g=>`<section class="section"><h2>${g[0]}</h2><div class="service-list">${g[1].map(x=>`<div class="service-item clickable" data-category="${x[1]}"><span>${x[0]}</span><b>${x[1]}</b><em>›</em></div>`).join("")}</div></section>`).join("")}</main>${bottom("explore")}</div>`}';
  return {
    name: 'entego-core-catalog-v2',
    enforce: 'pre',
    transform(code,id){
      const normalized=String(id||'').replaceAll('\\','/');
      const cleanId=normalized.split('?')[0].split('#')[0];
      if(!cleanId.endsWith('/main.js')) return null;
      let next=code;
      let replacements=0;
      while(next.includes(legacyCatalog)){
        const start=next.indexOf('function services(){');
        const end=next.indexOf('\nfunction partner(){',start);
        if(start<0||end<0) throw new Error(`ENTEGO legacy catalog found but services renderer boundaries missing: ${id}`);
        next=next.slice(0,start)+services+next.slice(end);
        replacements++;
        if(replacements>4) throw new Error(`ENTEGO unexpected duplicate services renderers: ${id}`);
      }
      if(replacements===0 && !next.includes('ENTEGO PROFESSIONAL PARTNER')) throw new Error(`ENTEGO main entry was not upgraded to Event Ecosystem: ${id}`);
      if(!next.includes('globalThis.ENTEGO_CORE_CATALOG_VERSION')) next=next.replace('import "./styles.css";','import "./styles.css";\nglobalThis.ENTEGO_CORE_CATALOG_VERSION="2.2";');
      next=next.replaceAll('price:900000','price:1000000');
      next=next.replaceAll('Cari DJ, sound, mobil, MC...','Cari DJ, EO, WO, venue, sound...');
      next=next.replaceAll('ENTEGO • Entertainment & Rental Marketplace','ENTEGO • Event Ecosystem Platform');
      next=next.replaceAll('Booking talent & rental event, semudah pesan transportasi.','Semua kebutuhan event, dalam satu ekosistem.');
      next=next.replaceAll('Temukan mitra terverifikasi, harga transparan, booking aman, dan semua kebutuhan acara dalam satu aplikasi.','Temukan talent, production, services, EO/WO, venue, dan mitra event terverifikasi dalam satu aplikasi.');
      next=next.replaceAll('Paket & harga','Menu Layanan & Harga');
      next=next.replaceAll('<select><option>DJ</option><option>Live Band</option><option>Sound System</option><option>Rental</option></select>','<select><option>DJ</option><option>MC</option><option>Live Band</option><option>Sound System</option><option>Fotografer</option><option>Videografer</option><option>Event Organizer</option><option>Wedding Organizer</option><option>Party Planner</option><option>Corporate Event Planner</option><option>Venue</option></select>');
      const oldBind='document.querySelectorAll("[data-category]").forEach(el=>el.onclick=()=>{state.exploreTab=["Mobil","Motor","Sound System","Lighting","Tenda","Dekorasi"].includes(el.dataset.category)?"rental":"ent";go("explore")});';
      const newBind='document.querySelectorAll("[data-category]").forEach(el=>el.onclick=()=>{localStorage.setItem("entego_event_category",el.dataset.category);state.exploreTab="all";go("explore")});';
      if(next.includes(oldBind)) next=next.replaceAll(oldBind,newBind);
      if(next.includes(legacyCatalog)) throw new Error(`ENTEGO legacy Entertainment/Creative/Rental catalog survived transform: ${id}`);
      if(!next.includes('Event Organizer')||!next.includes('Wedding Organizer')) throw new Error(`ENTEGO Organizer catalog missing after transform: ${id}`);
      return {code:next,map:null};
    }
  };
}

export default defineConfig({
  plugins: [entegoCoreCatalogPlugin()],
  build: {
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-v85.js',
        chunkFileNames: 'assets/[name]-v85.js',
        assetFileNames: 'assets/[name]-v85[extname]'
      }
    }
  }
});
