
import "./styles.css";

const DB = {
  categories: [
    ["🎧","DJ"],["🎤","MC"],["🎸","Live Band"],["🎙️","Singer"],["📸","Fotografer"],["🎥","Videografer"],
    ["🔊","Sound System"],["💡","Lighting"],["🚘","Mobil"],["🛵","Motor"],["🎪","Tenda"],["✨","Dekorasi"]
  ],
  vendors: [
    {id:1,emoji:"🎧",name:"DJ Raka Bali",cat:"DJ",price:1500000,rating:"4.9",loc:"Seminyak • 3,2 km"},
    {id:2,emoji:"🎸",name:"Sunset Groove",cat:"Live Band",price:2800000,rating:"4.8",loc:"Canggu • 5,1 km"},
    {id:3,emoji:"🔊",name:"Bali Pro Sound",cat:"Sound System",price:900000,rating:"4.7",loc:"Denpasar • 7,4 km"},
    {id:4,emoji:"📸",name:"Nusa Visual",cat:"Fotografer",price:1200000,rating:"4.9",loc:"Kuta • 4,6 km"},
  ]
};

const state = {
  route: localStorage.getItem("entego_route") || "home",
  vendorId: Number(localStorage.getItem("entego_vendor")) || 1,
  bookingStatus: localStorage.getItem("entego_booking_status") || "baru",
  eventStarted: localStorage.getItem("entego_event_started") === "1",
  completed: localStorage.getItem("entego_completed") === "1",
  paymentMethod: localStorage.getItem("entego_pay") || "QRIS"
};
const app = document.querySelector("#app");
const rupiah = n => "Rp" + Number(n).toLocaleString("id-ID");
const vendor = () => DB.vendors.find(v=>v.id===state.vendorId) || DB.vendors[0];

function save(){
  localStorage.setItem("entego_route",state.route);
  localStorage.setItem("entego_vendor",String(state.vendorId));
  localStorage.setItem("entego_booking_status",state.bookingStatus);
  localStorage.setItem("entego_event_started",state.eventStarted?"1":"0");
  localStorage.setItem("entego_completed",state.completed?"1":"0");
  localStorage.setItem("entego_pay",state.paymentMethod);
}
function go(route){ state.route=route; save(); window.scrollTo(0,0); render(); }

function topbar(title="ENTEGO",search=true,back=false,backRoute="home"){
  return `<div class="topbar"><div class="brand">
    <div class="${back?"page-title":"brandmark"}">
      ${back?`<button class="back" data-route="${backRoute}">‹</button>`:`<div class="logo brand-logo"><img src="/icon-192.png" alt="ENTEGO"></div>`}
      <span>${title}</span>
    </div>
    <button class="iconbtn" data-route="notifications">🔔</button>
  </div>${search?`<div class="search"><input id="searchInput" placeholder="Cari DJ, sound, mobil, MC..."><button data-route="explore">Cari</button></div>`:""}</div>`;
}
function bottom(active){
  return `<nav class="bottom">${[
    ["⌂","home","Home"],["⌕","explore","Cari"],["▣","orders","Order"],["♥","favorites","Favorit"],["☺","profile","Akun"]
  ].map(([i,r,l])=>`<button class="navbtn ${active===r?"active":""}" data-route="${r}"><b>${i}</b>${l}</button>`).join("")}</nav>`;
}
function cardRow(icon,title,sub,route,badge=""){
  return `<div class="card row between clickable" ${route?`data-route="${route}"`:""}><div class="row"><div class="avatar">${icon}</div><div><b>${title}</b><div class="meta">${sub||""}</div></div></div><div>${badge||"›"}</div></div>`;
}
function vendorCard(v){
  return `<div class="vendor clickable" data-vendor="${v.id}">
    <div class="vendor-img">${v.emoji}</div>
    <div class="vendor-body">
      <div class="row between"><span class="pill">${v.cat}</span><span class="rating">★ ${v.rating}</span></div>
      <h3>${v.name}</h3><div class="meta">${v.loc}</div>
      <div class="row between" style="margin-top:10px"><b>${rupiah(v.price)}</b><span class="pill green">✓ Terverifikasi</span></div>
    </div></div>`;
}

function home(){
  return `<div class="phone">${topbar()}
  <main class="content">
    <section class="hero premium-hero">
<div class="hero-badge">LIVE IN BALI</div>
<small>ENTEGO • Entertainment & Rental Marketplace</small>
<h1>Booking talent & rental event, semudah pesan transportasi.</h1>
<p>Temukan mitra terverifikasi, harga transparan, booking aman, dan semua kebutuhan acara dalam satu aplikasi.</p>
<div class="row hero-actions"><button class="btn primary" data-route="explore">Jelajahi Layanan</button><button class="btn glass" data-route="partnerOnboarding">Daftar Mitra</button></div>
<div class="trust-row"><span>✓ Verified Partner</span><span>✓ ENTEGO Protection</span><span>✓ Secure Booking</span></div>
</section>
    <section class="section"><div class="section-head"><h2>Kategori</h2><button class="link" data-route="explore">Lihat semua</button></div>
      <div class="grid4">${DB.categories.slice(0,12).map(c=>`<div class="cat clickable" data-route="explore"><div class="emoji">${c[0]}</div><span>${c[1]}</span></div>`).join("")}</div>
    </section>
    <section class="section">
<div class="section-head"><h2>Paket cepat</h2><button class="link" data-route="explore">Lihat semua</button></div>
<div class="quick-grid">
<div class="quick-card clickable" data-route="explore"><span>💍</span><b>Wedding</b><small>Talent + rental</small></div>
<div class="quick-card clickable" data-route="explore"><span>🎉</span><b>Birthday</b><small>MC + DJ + decor</small></div>
<div class="quick-card clickable" data-route="explore"><span>🏢</span><b>Corporate</b><small>Full event support</small></div>
<div class="quick-card clickable" data-route="explore"><span>🌴</span><b>Private Party</b><small>Villa & beach event</small></div>
</div></section><section class="section"><div class="section-head"><h2>Rekomendasi</h2><button class="link" data-route="explore">Lihat semua</button></div><div class="hscroll">${DB.vendors.map(vendorCard).join("")}</div></section>
    <section class="section banner"><b>🎉 Diskon booking pertama 10%</b><div class="meta">Gunakan kode ENTEGO10 saat checkout.</div></section>
  </main>${bottom("home")}</div>`;
}
function explore(){
  return `<div class="phone">${topbar("Jelajahi ENTEGO",true,true,"home")}
  <main class="content">
    <div class="tabbar"><button class="tab active">Semua</button><button class="tab">Entertainment</button><button class="tab">Rental</button><button class="tab">Terdekat</button></div>
    ${DB.vendors.map(v=>cardRow(v.emoji,v.name,`${v.cat} • ${v.loc}`,null,`<span class="rating">★ ${v.rating}</span>`).replace('class="card row between clickable"','class="card row between clickable" data-vendor="'+v.id+'"')).join("")}
  </main>${bottom("explore")}</div>`;
}
function detail(){
  const v=vendor();
  return `<div class="phone">${topbar(v.name,false,true,"explore")}
  <main class="content">
    <div class="hero" style="height:220px;display:flex;align-items:flex-end"><div style="font-size:72px">${v.emoji}</div></div>
    <div class="section"><div class="row between"><div><span class="pill">${v.cat}</span><h2 style="margin:8px 0 4px">${v.name}</h2><div class="meta">${v.loc}</div></div><div class="rating">★ ${v.rating}</div></div>
      <div class="divider"></div><div class="row between"><div><div class="meta">Mulai dari</div><div class="price">${rupiah(v.price)}</div></div><span class="pill green">✓ Mitra terverifikasi</span></div>
    </div>
    <section class="section"><h2>Tentang layanan</h2><p class="meta">Paket profesional untuk wedding, private party, corporate event dan kebutuhan entertainment lainnya.</p></section>
    <section class="section"><h2>Paket populer</h2><div class="card"><div class="row between"><div><b>Standard Package</b><div class="meta">3 jam • perlengkapan dasar</div></div><b>${rupiah(v.price)}</b></div></div><div class="card"><div class="row between"><div><b>Premium Package</b><div class="meta">5 jam • prioritas & add-on</div></div><b>Rp3.500.000</b></div></div></section>
    <section class="section"><h2>Ulasan</h2><div class="card">⭐⭐⭐⭐⭐ <b>Profesional & tepat waktu.</b><div class="meta">Kadek • 2 hari lalu</div></div></section>
  </main><div class="sticky-cta"><button class="btn soft" data-route="chatCustomer">Chat</button><button class="btn primary" data-route="booking">Booking Sekarang</button></div></div>`;
}
function booking(){
  const v=vendor();
  return `<div class="phone">${topbar("Booking",false,true,"detail")}<main class="content">
    <div class="card row"><div class="avatar">${v.emoji}</div><div><b>${v.name}</b><div class="meta">${v.cat}</div></div></div>
    <div class="form">
      <div class="field"><label>Tanggal acara</label><input type="date" value="2026-08-15"></div>
      <div class="field"><label>Jam mulai</label><input type="time" value="19:00"></div>
      <div class="field"><label>Durasi</label><select><option>3 jam</option><option>5 jam</option><option>Full day</option></select></div>
      <div class="field"><label>Lokasi acara</label><input value="Seminyak, Bali"></div>
      <div class="field"><label>Catatan</label><textarea rows="4" placeholder="Detail acara, dress code, request khusus..."></textarea></div>
    </div>
  </main><div class="sticky-cta"><button class="btn primary" data-route="checkout">Lanjut Checkout</button></div></div>`;
}
function checkout(){
  const v=vendor(), fee=75000, promo=150000, total=v.price+fee-promo;
  return `<div class="phone">${topbar("Checkout",false,true,"booking")}<main class="content">
    <div class="card"><div class="kicker">RINGKASAN BOOKING</div><h3>${v.name} — Standard Package</h3><div class="meta">15 Agustus 2026 • 19:00 • 3 jam</div><div class="divider"></div>
      <div class="row between"><span>Harga layanan</span><b>${rupiah(v.price)}</b></div>
      <div class="row between"><span>Biaya platform</span><b>${rupiah(fee)}</b></div>
      <div class="row between"><span>Promo ENTEGO10</span><b style="color:var(--green)">-${rupiah(promo)}</b></div>
      <div class="divider"></div><div class="row between"><b>Total</b><span class="price">${rupiah(total)}</span></div>
    </div>
    <div class="card"><b>Metode pembayaran</b><div class="divider"></div>
      ${["QRIS","GoPay","OVO","DANA","Transfer Bank"].map(m=>`<div class="row between pay-row clickable" data-pay="${m}" style="padding:10px 0"><span>${m}</span><span class="pill ${state.paymentMethod===m?"green":""}">${state.paymentMethod===m?"Dipilih":"Pilih"}</span></div>`).join("")}
    </div>
    <div class="banner"><b>🛡️ ENTEGO Protection</b><div class="meta">Pembayaran diteruskan ke mitra setelah layanan selesai sesuai kebijakan platform.</div></div>
  </main><div class="sticky-cta"><button class="btn primary" id="payBtn">Bayar & Buat Order</button></div></div>`;
}
function orders(){
  const status = state.completed?"Selesai":state.bookingStatus==="diterima"?"Dikonfirmasi":"Menunggu";
  const badge = state.completed?"green":state.bookingStatus==="diterima"?"green":"blue";
  return `<div class="phone">${topbar("Order Saya",false,false)}<main class="content">
    <div class="tabbar"><button class="tab active">Aktif</button><button class="tab">Selesai</button><button class="tab">Dibatalkan</button></div>
    <div class="card">
      <div class="row between"><span class="pill blue">#ENT-260815-001</span><span class="pill ${badge}">${status}</span></div>
      <h3>${vendor().emoji} ${vendor().name}</h3><div class="meta">15 Agu 2026 • 19:00 • Seminyak</div><div class="divider"></div>
      <div class="timeline">
        <div class="step"><b>Booking dibuat</b><div class="meta">Pembayaran berhasil</div></div>
        <div class="step"><b>${state.bookingStatus==="diterima"?"Mitra dikonfirmasi":"Menunggu konfirmasi mitra"}</b><div class="meta">${state.bookingStatus==="diterima"?"Mitra menerima booking":"Mitra belum merespons"}</div></div>
        ${state.eventStarted?`<div class="step"><b>Acara dimulai</b><div class="meta">Mitra sedang memberikan layanan</div></div>`:""}
        ${state.completed?`<div class="step"><b>Selesai</b><div class="meta">Layanan selesai</div></div>`:""}
      </div>
      <div class="row"><button class="btn soft" data-route="chatCustomer">Chat Mitra</button><button class="btn primary" data-route="orderdetail">Detail</button></div>
    </div>
  </main>${bottom("orders")}</div>`;
}
function orderdetail(){
  const v=vendor(), total=v.price+75000-150000;
  return `<div class="phone">${topbar("Detail Order",false,true,"orders")}<main class="content">
    <div class="card"><div class="row between"><b>#ENT-260815-001</b><span class="pill green">${state.completed?"Selesai":state.bookingStatus==="diterima"?"Dikonfirmasi":"Menunggu"}</span></div><div class="divider"></div><b>${v.name}</b><div class="meta">15 Agustus 2026 • 19:00 • 3 jam</div></div>
    <div class="card"><b>Lokasi</b><p>Seminyak, Bali</p><button class="btn soft" id="mapsBtn">Buka Maps</button></div>
    <div class="card"><b>Rincian pembayaran</b><div class="divider"></div>
      <div class="row between"><span>Harga jasa</span><b>${rupiah(v.price)}</b></div>
      <div class="row between"><span>Biaya platform</span><b>Rp75.000</b></div>
      <div class="row between"><span>Promo</span><b style="color:var(--green)">-Rp150.000</b></div>
      <div class="divider"></div><div class="row between"><b>Total</b><b>${rupiah(total)}</b></div><div class="meta" style="margin-top:8px">Metode: ${state.paymentMethod}</div>
    </div>
    ${state.completed?`<div class="card"><b>Beri ulasan</b><p class="meta">Bagaimana pengalaman kamu?</p><div style="font-size:30px">☆ ☆ ☆ ☆ ☆</div><button class="btn primary" style="margin-top:10px">Kirim Ulasan</button></div>`:""}
  </main></div>`;
}
function chatCustomer(){
  return `<div class="phone">${topbar("Chat • Mitra",false,true,state.route==="chatCustomer"?"detail":"detail")}<main class="content">
    <div class="msg">Halo 👋 Terima kasih sudah booking. Ada request lagu atau dress code khusus?</div>
    <div class="msg me">Untuk birthday party. Musik house & commercial ya.</div>
    <div class="msg">Siap. Bisa kirim rundown acaranya di sini nanti.</div>
  </main><div class="sticky-cta"><input id="chatInput" style="flex:1;border:1px solid var(--line);border-radius:14px;padding:12px" placeholder="Tulis pesan..."><button class="btn primary" id="sendChat">Kirim</button></div></div>`;
}
function favorites(){ return `<div class="phone">${topbar("Favorit",false,false)}<main class="content">${DB.vendors.slice(0,2).map(v=>cardRow(v.emoji,v.name,`${v.cat} • ${v.loc}`,"detail","♥").replace('data-route="detail"','data-vendor="'+v.id+'"')).join("")}</main>${bottom("favorites")}</div>`; }
function profile(){
  return `<div class="phone">${topbar("Akun",false,false)}<main class="content">
    <div class="card row"><div class="avatar">👤</div><div><b>Arda</b><div class="meta">Customer • Bali</div></div></div>
    ${[
      ["🧾","Riwayat transaksi","orders"],["💳","Metode pembayaran","checkout"],["📍","Alamat tersimpan","addresses"],["🎁","Voucher & promo","vouchers"],
      ["💰","ENTEGO Wallet","wallet"],["🤝","Jadi Mitra ENTEGO","partnerOnboarding"],["⚙️","Pengaturan","settings"],["🛡️","Bantuan & keamanan","help"],["🧰","Admin Demo","admin"]
    ].map(x=>cardRow(x[0],x[1],"",x[2])).join("")}
  </main>${bottom("profile")}</div>`;
}
function notifications(){ return `<div class="phone">${topbar("Notifikasi",false,true,"home")}<main class="content">${cardRow("✅","Booking dikonfirmasi","DJ Raka menerima order kamu.","orders")}${cardRow("🎁","Promo 10%","Gunakan ENTEGO10 untuk transaksi pertama.","vouchers")}</main></div>`; }
function simplePage(title, items, back="profile"){
  return `<div class="phone">${topbar(title,false,true,back)}<main class="content">${items.map(x=>`<div class="card"><b>${x[0]}</b><div class="meta">${x[1]}</div></div>`).join("")}</main></div>`;
}

function partner(){
  return `<div class="phone">${topbar("ENTEGO Mitra",false,true,"profile")}<main class="content">
    <div class="hero"><small>DASHBOARD MITRA</small><h1>Rp12.450.000</h1><p>Pendapatan bulan ini</p><button class="btn primary" data-route="partnerWallet">Tarik Saldo</button></div>
    <div class="section statgrid"><div class="stat"><span class="meta">Order Aktif</span><b>8</b></div><div class="stat"><span class="meta">Rating</span><b>4.9 ★</b></div><div class="stat"><span class="meta">Views</span><b>1.284</b></div><div class="stat"><span class="meta">Conversion</span><b>18%</b></div></div>
    <section class="section"><div class="section-head"><h2>Order terbaru</h2><button class="link" data-route="partnerOrders">Semua</button></div>
      <div class="card clickable" data-route="partnerOrderDetail"><div class="row between"><b>Birthday Party</b><span class="pill green">${state.bookingStatus==="diterima"?"Diterima":"Baru"}</span></div><div class="meta">15 Agu • Seminyak • Rp1.500.000</div></div>
    </section>
    <section class="section"><h2>Kelola Bisnis</h2>
      ${[
        ["📅","Kalender & ketersediaan","partnerCalendar"],["💼","Paket & harga","partnerPackages"],["🖼️","Portofolio","partnerPortfolio"],
        ["⭐","Ulasan","partnerReviews"],["💰","Dompet & pencairan","partnerWallet"],["📊","Analitik","partnerAnalytics"]
      ].map(x=>cardRow(x[0],x[1],"",x[2])).join("")}
    </section>
  </main></div>`;
}
function partnerOrders(){
  return `<div class="phone">${topbar("Order Mitra",false,true,"partner")}<main class="content">
    <div class="tabbar"><button class="tab active">Baru</button><button class="tab">Diterima</button><button class="tab">Selesai</button></div>
    ${cardRow("🎉","Birthday Party","15 Agu • Seminyak • Rp1.500.000","partnerOrderDetail",`<span class="pill ${state.bookingStatus==="diterima"?"green":"blue"}">${state.bookingStatus==="diterima"?"Diterima":"Baru"}</span>`)}
  </main></div>`;
}
function partnerOrderDetail(){
  return `<div class="phone">${topbar("Detail Order Mitra",false,true,"partner")}<main class="content">
    <div class="card"><div class="row between"><b>#ENT-260815-001</b><span class="pill ${state.bookingStatus==="diterima"?"green":"blue"}">${state.completed?"Selesai":state.bookingStatus==="diterima"?"Diterima":"Baru"}</span></div><div class="divider"></div><b>Birthday Party</b><div class="meta">15 Agustus 2026 • 19:00 • 3 jam</div></div>
    <div class="card"><b>Pelanggan</b><div class="row" style="margin-top:10px"><div class="avatar">👤</div><div><b>Arda</b><div class="meta">Seminyak, Bali</div></div></div></div>
    <div class="card"><b>Paket</b><p>Standard Package</p><div class="row between"><span>Nilai booking</span><b>Rp1.500.000</b></div></div>
    <div class="card"><b>Catatan pelanggan</b><p class="meta">Birthday party, house & commercial. Mohon datang 30 menit sebelum acara.</p></div>
    ${state.bookingStatus!=="diterima" ? `<div class="row"><button class="btn soft" id="rejectOrder" style="flex:1">Tolak</button><button class="btn primary" id="acceptOrder" style="flex:1">Terima Order</button></div>` :
      `<div class="card"><b>Status pekerjaan</b><div class="divider"></div>
        <button class="btn soft" data-route="partnerChat" style="width:100%;margin-bottom:10px">Chat Pelanggan</button>
        ${!state.eventStarted?`<button class="btn primary" id="startEvent" style="width:100%">Mulai Pekerjaan</button>`:!state.completed?`<button class="btn primary" id="completeEvent" style="width:100%">Selesaikan Pekerjaan</button>`:`<span class="pill green">✓ Pekerjaan selesai</span>`}
      </div>`}
  </main></div>`;
}
function partnerChat(){
  return `<div class="phone">${topbar("Chat • Arda",false,true,"partnerOrderDetail")}<main class="content">
    <div class="msg me">Halo Kak, saya DJ Raka. Booking sudah saya terima 🙌</div>
    <div class="msg">Siap kak, untuk birthday party. House & commercial ya.</div>
    <div class="msg me">Siap. Saya tiba 30 menit sebelum acara.</div>
  </main><div class="sticky-cta"><input style="flex:1;border:1px solid var(--line);border-radius:14px;padding:12px" placeholder="Tulis pesan..."><button class="btn primary">Kirim</button></div></div>`;
}
function partnerCalendar(){ return simplePage("Kalender & Ketersediaan",[["15 Agustus 2026","19:00 — Birthday Party (Booked)"],["16 Agustus 2026","Tersedia"],["17 Agustus 2026","Tersedia"]],"partner"); }
function partnerPackages(){ return `<div class="phone">${topbar("Paket & Harga",false,true,"partner")}<main class="content">${cardRow("🎧","Standard Package","3 jam • Rp1.500.000",null,"Edit")}${cardRow("🔥","Premium Package","5 jam • Rp3.500.000",null,"Edit")}<button class="btn primary" style="width:100%">+ Tambah Paket</button></main></div>`; }
function partnerPortfolio(){ return simplePage("Portofolio",[["Wedding at Seminyak","12 foto • 3 video"],["Corporate Party","8 foto • 2 video"],["Beach Club Event","15 foto • 4 video"]],"partner"); }
function partnerReviews(){ return simplePage("Ulasan Mitra",[["★★★★★ 4.9","127 ulasan pelanggan"],["Kadek","Profesional dan tepat waktu."],["Nina","Komunikatif dan set list bagus."]],"partner"); }
function partnerWallet(){ return `<div class="phone">${topbar("Dompet Mitra",false,true,"partner")}<main class="content"><div class="hero"><small>SALDO TERSEDIA</small><h1>Rp8.750.000</h1><p>Siap dicairkan</p><button class="btn primary" id="withdrawBtn">Tarik Saldo</button></div>${cardRow("↗","Pendapatan order","Birthday Party • Rp1.500.000",null,"Masuk")}${cardRow("🏦","Rekening pencairan","BCA •••• 8890",null,"Edit")}</main></div>`; }
function partnerAnalytics(){ return `<div class="phone">${topbar("Analitik Mitra",false,true,"partner")}<main class="content"><div class="statgrid"><div class="stat"><span class="meta">Views</span><b>1.284</b></div><div class="stat"><span class="meta">Booking</span><b>231</b></div><div class="stat"><span class="meta">Conversion</span><b>18%</b></div><div class="stat"><span class="meta">Revenue</span><b>12.4jt</b></div></div><div class="card"><b>Performa 30 hari</b><p class="meta">Views +18% • Booking +12% • Rating stabil 4.9</p></div></main></div>`; }

function admin(){
  return `<div class="phone">${topbar("ENTEGO Admin",false,true,"profile")}<main class="content"><div class="kicker">ADMIN CONTROL CENTER</div><h2>Overview</h2>
    <div class="statgrid"><div class="stat"><span class="meta">Users</span><b>5.240</b></div><div class="stat"><span class="meta">Mitra</span><b>486</b></div><div class="stat"><span class="meta">GMV</span><b>1,2B</b></div><div class="stat"><span class="meta">Booking</span><b>2.084</b></div></div>
    <section class="section"><h2>Operasional</h2>
      ${[
        ["✅","Verifikasi Mitra","adminVerify"],["⚖️","Booking & Dispute","adminBookings"],["💳","Pembayaran","adminPayments"],
        ["🎯","Promo & Banner","adminPromo"],["👥","User Management","adminUsers"],["📊","Reports & Analytics","adminReports"],["🧩","CMS & Kategori","adminCMS"]
      ].map(x=>cardRow(x[0],x[1],"",x[2])).join("")}
    </section>
  </main></div>`;
}
function adminVerify(){ return `<div class="phone">${topbar("Verifikasi Mitra",false,true,"admin")}<main class="content">${cardRow("🎧","DJ Raka Bali","KTP • Portfolio • Bank • Menunggu review",null,`<button class="btn primary mini" id="verifyBtn">Verifikasi</button>`)}${cardRow("🔊","Bali Pro Sound","Dokumen lengkap • Terverifikasi",null,'<span class="pill green">Verified</span>')}</main></div>`; }
function adminBookings(){return `<div class="phone">${topbar("Booking & Dispute",false,true,"admin")}<main class="content">${cardRow("🎉","#ENT-260815-001","Birthday Party • Dikonfirmasi","orderdetail")}${cardRow("💍","#ENT-260816-004","Wedding Band • Menunggu",null)}${cardRow("⚖️","Dispute Center","1 demo case","adminDispute")}</main></div>`}
function adminPayments(){ return simplePage("Pembayaran",[["GMV bulan ini","Rp1.200.000.000"],["Payout pending","Rp84.500.000"],["Refund pending","Rp2.400.000"]],"admin"); }
function adminPromo(){ return simplePage("Promo & Banner",[["ENTEGO10","Diskon 10% • Aktif"],["WELCOME25","Diskon Rp25.000 • Draft"],["Home Banner","Summer Event Bali • Aktif"]],"admin"); }
function adminUsers(){ return simplePage("User Management",[["Total User","5.240"],["User aktif 30 hari","3.812"],["Suspended","12"]],"admin"); }
function adminReports(){ return simplePage("Reports & Analytics",[["GMV","Rp1,2 miliar"],["Net Revenue","Rp84 juta"],["Booking selesai","1.774"],["Conversion platform","12,8%"]],"admin"); }
function adminCMS(){ return simplePage("CMS & Kategori",[["Entertainment","10 kategori aktif"],["Rental","9 kategori aktif"],["Homepage Sections","6 section aktif"]],"admin"); }


function wallet(){return `<div class="phone">${topbar("ENTEGO Wallet",false,true,"profile")}<main class="content"><div class="hero"><small>SALDO ENTEGO</small><h1>Rp325.000</h1><p>Saldo refund, promo dan cashback</p><button class="btn primary" id="topupBtn">Top Up</button></div><section class="section"><h2>Aktivitas</h2>${cardRow("↗","Cashback booking","+Rp25.000 • 10 Agu",null,"Masuk")}${cardRow("↙","Booking DJ Raka","-Rp150.000 • 8 Agu",null,"Keluar")}</section></main></div>`}
function partnerOnboarding(){return `<div class="phone">${topbar("Daftar Mitra",false,true,"profile")}<main class="content"><div class="kicker">ENTEGO PARTNER</div><h2>Mulai bisnis bersama ENTEGO</h2><div class="card"><b>1. Data Usaha / Talent</b><div class="form" style="margin-top:12px"><div class="field"><label>Nama bisnis / talent</label><input value="DJ Raka Bali"></div><div class="field"><label>Kategori</label><select><option>DJ</option><option>Live Band</option><option>Sound System</option><option>Rental</option></select></div></div></div><div class="card"><b>2. Verifikasi</b><p class="meta">Identitas, rekening, portfolio dan kontak.</p><span class="pill green">Dokumen demo siap</span></div><div class="card"><b>3. Profil & Harga</b><p class="meta">Atur paket, area layanan, kalender dan harga.</p></div><button class="btn primary" style="width:100%" data-route="partner">Masuk Dashboard Mitra Demo</button></main></div>`}
function supportChat(){return `<div class="phone">${topbar("ENTEGO Support",false,true,"help")}<main class="content"><div class="msg">Halo 👋 Ada yang bisa kami bantu terkait booking, pembayaran, atau akun?</div><div class="msg me">Saya ingin cek status booking.</div><div class="msg">Siap. Order #ENT-260815-001 tercatat di sistem.</div></main><div class="sticky-cta"><input style="flex:1;border:1px solid var(--line);border-radius:14px;padding:12px" placeholder="Tulis pesan..."><button class="btn primary">Kirim</button></div></div>`}
function adminDispute(){return `<div class="phone">${topbar("Detail Dispute",false,true,"adminBookings")}<main class="content"><div class="card"><div class="row between"><b>#DSP-001</b><span class="pill blue">Review</span></div><p class="meta">Perubahan jadwal dilaporkan customer.</p></div><div class="card"><b>Bukti & kronologi</b><p class="meta">Chat, waktu booking dan status pembayaran tersedia untuk review.</p></div><div class="row"><button class="btn soft" style="flex:1">Refund</button><button class="btn primary" style="flex:1">Selesaikan</button></div></main></div>`}


function services(){
  const groups=[
    ["Entertainment",["DJ","MC","Live Band","Penyanyi","Dancer","Talent","Event Organizer"]],
    ["Creative",["Fotografer","Videografer","Makeup Artist","Kamera","Drone"]],
    ["Rental",["Rental Mobil","Rental Motor","Sound System","Lighting","Videotron","Tenda","Dekorasi","Generator"]]
  ];
  return `<div class="phone">${topbar("Semua Layanan",true,true,"home")}<main class="content">
    ${groups.map(g=>`<section class="section"><h2>${g[0]}</h2><div class="service-list">${g[1].map(x=>`<div class="service-item clickable" data-route="explore"><span>${DB.categories.find(c=>c[1]===x)?.[0]||"•"}</span><b>${x}</b><em>›</em></div>`).join("")}</div></section>`).join("")}
  </main>${bottom("explore")}</div>`;
}

const routes = {
  home,services,explore,detail,booking,checkout,orders,orderdetail,chatCustomer,favorites,profile,notifications,wallet,partnerOnboarding,supportChat,adminDispute,
  addresses:()=>simplePage("Alamat Tersimpan",[["Rumah","Denpasar, Bali"],["Venue Favorit","Seminyak, Bali"]]),
  vouchers:()=>simplePage("Voucher & Promo",[["ENTEGO10","Diskon 10% booking pertama"],["BALI25","Diskon Rp25.000 area Bali"]]),
  settings:()=>simplePage("Pengaturan",[["Notifikasi","Aktif"],["Bahasa","Indonesia"],["Keamanan","PIN & biometrik"]]),
  help:()=>`<div class="phone">${topbar("Bantuan & Keamanan",false,true,"profile")}<main class="content">${cardRow("💬","Chat Support","Booking & pembayaran","supportChat")}${cardRow("❓","Pusat Bantuan","FAQ & panduan",null)}${cardRow("🔐","Keamanan Akun","Perangkat & sesi login","settings")}</main></div>`,
  partner,partnerOrders,partnerOrderDetail,partnerChat,partnerCalendar,partnerPackages,partnerPortfolio,partnerReviews,partnerWallet,partnerAnalytics,
  admin,adminVerify,adminBookings,adminPayments,adminPromo,adminUsers,adminReports,adminCMS
};

function bind(){
  document.querySelectorAll("[data-route]").forEach(el=>el.onclick=()=>go(el.dataset.route));
  document.querySelectorAll("[data-vendor]").forEach(el=>el.onclick=()=>{state.vendorId=Number(el.dataset.vendor);go("detail")});
  document.querySelectorAll("[data-pay]").forEach(el=>el.onclick=()=>{state.paymentMethod=el.dataset.pay;save();render()});
  const pay=document.querySelector("#payBtn"); if(pay) pay.onclick=()=>{state.bookingStatus="baru";state.eventStarted=false;state.completed=false;save();go("orders")};
  const acc=document.querySelector("#acceptOrder"); if(acc) acc.onclick=()=>{state.bookingStatus="diterima";save();go("partnerOrderDetail")};
  const rej=document.querySelector("#rejectOrder"); if(rej) rej.onclick=()=>{state.bookingStatus="ditolak";save();alert("Order ditolak (demo)");go("partnerOrders")};
  const start=document.querySelector("#startEvent"); if(start) start.onclick=()=>{state.eventStarted=true;save();go("partnerOrderDetail")};
  const comp=document.querySelector("#completeEvent"); if(comp) comp.onclick=()=>{state.completed=true;save();go("partnerOrderDetail")};
  const maps=document.querySelector("#mapsBtn"); if(maps) maps.onclick=()=>window.open("https://www.google.com/maps/search/?api=1&query=Seminyak%2C+Bali","_blank");
  const send=document.querySelector("#sendChat"); if(send) send.onclick=()=>{const i=document.querySelector("#chatInput"); if(i&&i.value.trim()){alert("Pesan terkirim (demo)");i.value=""}};
  const wd=document.querySelector("#withdrawBtn"); if(wd) wd.onclick=()=>alert("Permintaan pencairan dibuat (demo)");
  const ver=document.querySelector("#verifyBtn"); if(ver) ver.onclick=()=>alert("Mitra terverifikasi (demo)"); const topup=document.querySelector("#topupBtn"); if(topup) topup.onclick=()=>alert("Top Up Wallet — demo");
}
function render(){ app.innerHTML=(routes[state.route]||home)(); bind(); }
render();
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));
