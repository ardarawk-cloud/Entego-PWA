import { defineConfig } from 'vite';

function entegoCoreCatalogPlugin(){
  return {
    name: 'entego-core-catalog-v2',
    enforce: 'pre',
    transform(code,id){
      const normalized=String(id||'').replaceAll('\\','/');
      if(!normalized.endsWith('/main.js')) return null;
      let next=code;
      const start=next.indexOf('function services(){');
      const end=next.indexOf('\nfunction partner(){',start);
      if(start<0||end<0) throw new Error('ENTEGO core services renderer not found');
      const services='function services(){const groups=[["Talent",[["🎧","DJ"],["🎤","MC"],["🎸","Live Band"],["🎙️","Singer"],["★","Dancer / Performer"]]],["Production",[["🔊","Sound System"],["💡","Lighting"],["🎪","Stage / Tenda"],["▣","LED / Visual"],["✨","Dekorasi"]]],["Services",[["📸","Fotografer"],["🎥","Videografer"],["💄","Makeup Artist / Stylist"],["🍽️","Catering"],["🚐","Transport"]]],["Organizer",[["🧭","Event Organizer"],["💍","Wedding Organizer"],["📋","Party Planner"],["🏢","Corporate Event Planner"]]],["Venue",[["♬","Club"],["🏡","Villa"],["🏨","Hotel / Ballroom"],["🏝️","Beach Venue"],["⌂","Venue Lainnya"]]]];return `<div class="phone">${topbar("Semua Layanan",true,true,"home")}<main class="content"><div class="kicker">ENTEGO PROFESSIONAL PARTNER</div><p class="meta">Talent • Production • Services • Organizer • Venue</p>${groups.map(g=>`<section class="section"><h2>${g[0]}</h2><div class="service-list">${g[1].map(x=>`<div class="service-item clickable" data-category="${x[1]}"><span>${x[0]}</span><b>${x[1]}</b><em>›</em></div>`).join("")}</div></section>`).join("")}</main>${bottom("explore")}</div>`}';
      next=next.slice(0,start)+services+next.slice(end);
      next=next.replace('import "./styles.css";','import "./styles.css";\nglobalThis.ENTEGO_CORE_CATALOG_VERSION="2.1";');
      next=next.replace('price:900000','price:1000000');
      next=next.replace('Cari DJ, sound, mobil, MC...','Cari DJ, EO, WO, venue, sound...');
      next=next.replace('ENTEGO • Entertainment & Rental Marketplace','ENTEGO • Event Ecosystem Platform');
      next=next.replace('Booking talent & rental event, semudah pesan transportasi.','Semua kebutuhan event, dalam satu ekosistem.');
      next=next.replace('Temukan mitra terverifikasi, harga transparan, booking aman, dan semua kebutuhan acara dalam satu aplikasi.','Temukan talent, production, services, EO/WO, venue, dan mitra event terverifikasi dalam satu aplikasi.');
      next=next.replace('Paket & harga','Menu Layanan & Harga');
      next=next.replace('<select><option>DJ</option><option>Live Band</option><option>Sound System</option><option>Rental</option></select>','<select><option>DJ</option><option>MC</option><option>Live Band</option><option>Sound System</option><option>Fotografer</option><option>Videografer</option><option>Event Organizer</option><option>Wedding Organizer</option><option>Party Planner</option><option>Corporate Event Planner</option><option>Venue</option></select>');
      const oldBind='document.querySelectorAll("[data-category]").forEach(el=>el.onclick=()=>{state.exploreTab=["Mobil","Motor","Sound System","Lighting","Tenda","Dekorasi"].includes(el.dataset.category)?"rental":"ent";go("explore")});';
      const newBind='document.querySelectorAll("[data-category]").forEach(el=>el.onclick=()=>{localStorage.setItem("entego_event_category",el.dataset.category);state.exploreTab="all";go("explore")});';
      if(!next.includes(oldBind)) throw new Error('ENTEGO category click binding not found');
      next=next.replace(oldBind,newBind);
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
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  }
});
