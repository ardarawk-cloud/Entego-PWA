const RL_VERSION='78';
const rlLoaded=new Set();
let rlRoute='';
const rlCurrent=()=>localStorage.getItem('entego_route')||'home';
async function rlLoad(name){if(rlLoaded.has(name))return;rlLoaded.add(name);const url=`/${name}?v=${RL_VERSION}`;try{await import(/* @vite-ignore */ url)}catch(error){rlLoaded.delete(name);console.error('[ENTEGO lazy-load]',name,error)}}
async function rlLoadMany(names){await Promise.all([...new Set(names)].map(rlLoad))}
function rlIdle(fn,timeout=1000){if('requestIdleCallback'in window)requestIdleCallback(fn,{timeout});else setTimeout(fn,350)}
const CUSTOMER_MARKET=['explore','detail','booking','checkout'];
const CUSTOMER_ORDER=['orders','orderdetail','chatCustomer'];
const PARTNER_BASE=['partner','partnerOnboarding','partnerProfile','partnerPackages','partnerCalendar','partnerPortfolio','partnerOrders','partnerOrderDetail','partnerChat'];
const ADMIN_BASE=['admin','adminBookings','adminPayments','adminVerify','adminDispute','adminUsers','adminAccounts'];
async function rlForRoute(route){
 const modules=['auth-flow.js'];
 if(route!=='home')modules.push('truthful-data-flow.js');
 if(['profile','notifications','orders','partner','partnerOrders','admin','adminBookings','adminPayments','adminVerify'].includes(route))modules.push('action-center-flow.js');
 if(CUSTOMER_MARKET.includes(route))modules.push('server-partner-flow.js','partner-marketplace-flow.js','partner-offer-flow.js','market-booking-flow.js');
 if(['booking','checkout'].includes(route))modules.push('booking-integrity-flow.js','auth-booking-guard-flow.js','server-booking-flow.js','trust-flow.js');
 if(CUSTOMER_ORDER.includes(route)||['partnerOrders','partnerOrderDetail','partnerChat'].includes(route))modules.push('server-orders-flow.js','server-booking-flow.js');
 if(['orderdetail','partnerOrderDetail'].includes(route))modules.push('final-flow.js','reschedule-flow.js','completion-flow.js','ops-flow.js','server-reschedule-flow.js','server-review-flow.js','payment-flow.js','payment-state-guard-flow.js','trust-center-flow.js','participants-flow.js','readiness-flow.js','server-ops-flow.js');
 if(['chatCustomer','partnerChat'].includes(route))modules.push('server-chat-flow.js');
 if(PARTNER_BASE.includes(route))modules.push('server-partner-flow.js');
 if(['partner','partnerOnboarding','partnerProfile'].includes(route))modules.push('partner-category-flow.js','partner-profile-flow.js','partner-marketplace-flow.js');
 if(['profile','partner','partnerOnboarding'].includes(route))modules.push('identity-center-flow.js','identity-submit-hotfix-flow.js');
 if(['partner','partnerPackages','partnerCalendar','detail','booking','checkout'].includes(route))modules.push('partner-offer-flow.js');
 if(route==='partnerPortfolio')modules.push('partner-marketplace-flow.js','portfolio-media-flow.js');
 if(route==='profile')modules.push('security-sessions-flow.js','privacy-center-flow.js');
 if(route==='help')modules.push('support-center-flow.js');
 if(ADMIN_BASE.includes(route))modules.push('admin-route-integrity-flow.js','admin-account-control-flow.js');
 if(['admin','adminVerify'].includes(route))modules.push('admin-verification-flow.js');
 if(['adminPayments','adminBookings'].includes(route))modules.push('admin-payment-flow.js');
 if(route==='adminBookings')modules.push('support-center-flow.js','server-ops-flow.js');
 await rlLoadMany(modules);
 if(route==='home')rlIdle(()=>{if(rlCurrent()==='home')void rlLoad('truthful-data-flow.js')},900);
}
async function rlRun(){const route=rlCurrent();if(route===rlRoute)return;rlRoute=route;await rlForRoute(route)}
let rlScheduled=false;function rlSchedule(){if(rlScheduled)return;rlScheduled=true;requestAnimationFrame(()=>{rlScheduled=false;void rlRun()})}
new MutationObserver(rlSchedule).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('load',()=>void rlRun());void rlRun();
