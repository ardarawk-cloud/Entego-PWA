const PAY_ORDER_KEY='entego_current_order_v2';
const payRead=()=>{try{return JSON.parse(localStorage.getItem(PAY_ORDER_KEY)||'null')}catch{return null}};
const payRoute=()=>localStorage.getItem('entego_route')||'home';
const payMoney=n=>`Rp${Number(n||0).toLocaleString('id-ID')}`;
const payStatusLabel=s=>({ACTIVE:'Menunggu Pembayaran',COMPLETED:'Pembayaran Berhasil',EXPIRED:'Sesi Kedaluwarsa',CANCELED:'Pembayaran Dibatalkan'})[s]||'Belum Dibayar';

async function payJson(url,options){const r=await fetch(url,{cache:'no-store',headers:{accept:'application/json',...(options?.headers||{})},...options});let d={};try{d=await r.json()}catch{};return {r,d}}
function normalizeLegacyLedger(done=false){const ledger=document.querySelector('#entegoServerLedger');if(!ledger)return;const title=ledger.querySelector('b');if(title)title.textContent='Booking Ledger';const pill=ledger.querySelector('.pill');if(pill){pill.classList.toggle('green',done);pill.classList.toggle('blue',!done);pill.textContent=done?'✓ Payment Verified by Xendit':'Booking Created • Payment Pending'}}

async function renderPaymentCard(){
 if(payRoute()!=='orderdetail')return;const order=payRead(),main=document.querySelector('main.content');if(!order?.id||!main||document.querySelector('#entegoPaymentCard'))return;
 const card=document.createElement('section');card.id='entegoPaymentCard';card.className='card';card.innerHTML='<div class="kicker">PAYMENT</div><div class="meta">Memeriksa payment gateway…</div>';main.appendChild(card);
 try{
  const cfg=await payJson('/api/payments/config');if(!cfg.r.ok||!cfg.d.ok)throw new Error('config');
  const status=await payJson(`/api/payments/status?bookingId=${encodeURIComponent(order.id)}`);if(!status.r.ok||!status.d.ok)throw new Error('status');
  const p=status.d.payment;
  if(!cfg.d.configured){normalizeLegacyLedger(false);card.innerHTML=`<div class="kicker">PAYMENT</div><h3 style="margin:6px 0">${payMoney(order.total)}</h3><span class="pill blue">Xendit Sandbox belum dikonfigurasi</span><p class="meta">Booking tersimpan aman. Pembayaran akan aktif setelah secret Xendit dipasang di Cloudflare.</p>`;return}
  const st=p?.status||'UNPAID',done=st==='COMPLETED';normalizeLegacyLedger(done);
  card.innerHTML=`<div class="row between"><div><div class="kicker">XENDIT PAYMENT</div><h3 style="margin:6px 0">${payMoney(p?.amount||order.total)}</h3></div><span class="pill ${done?'green':'blue'}">${done?'✓ ':''}${payStatusLabel(st)}</span></div><p class="meta">Hosted Checkout • Status dikonfirmasi server melalui webhook.</p>${done?'<div class="meta">Pembayaran sudah terverifikasi.</div>':`<button class="btn primary" id="entegoPayNow" style="width:100%;margin-top:10px">${p?'Buka Pembayaran Lagi':'Lanjut Pembayaran'}</button>`}`;
  card.querySelector('#entegoPayNow')?.addEventListener('click',()=>createPaymentSession(card.querySelector('#entegoPayNow')));
 }catch{normalizeLegacyLedger(false);card.innerHTML='<div class="kicker">PAYMENT</div><span class="pill blue">Gateway belum tersambung</span><p class="meta">Booking tetap tersimpan. Coba pembayaran lagi setelah backend production aktif.</p>'}
}

async function createPaymentSession(button){
 const order=payRead();if(!order?.id)return;const old=button.textContent;button.disabled=true;button.textContent='Membuka Xendit…';
 try{const {r,d}=await payJson('/api/payments/session',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({bookingId:order.id})});if(!r.ok||!d.ok||!d.payment?.paymentLinkUrl)throw new Error(d.error||'payment_failed');location.assign(d.payment.paymentLinkUrl)}catch(e){button.disabled=false;button.textContent=old;alert(e.message==='payment_not_configured'?'Xendit Sandbox belum dikonfigurasi di Cloudflare.':'Sesi pembayaran belum dapat dibuat. Coba lagi.')}
}

function handlePaymentReturn(){
 const url=new URL(location.href),result=url.searchParams.get('entego_payment'),booking=url.searchParams.get('booking');if(!result)return;
 if(booking){const order=payRead();if(order?.id===booking)localStorage.setItem('entego_route','orderdetail')}
 history.replaceState({},'',url.pathname);setTimeout(()=>{document.querySelector('#entegoPaymentCard')?.remove();renderPaymentCard()},1200);
}

const payRun=()=>{normalizeLegacyLedger(false);renderPaymentCard()};new MutationObserver(payRun).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('load',()=>{handlePaymentReturn();payRun()});handlePaymentReturn();payRun();
