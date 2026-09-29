const ENTEGO_LEGAL_COMPANY_VERSION='1.0';
const ELC_COMPANY='PT NADMO STUDIO INDONESIA';
const ELC_NIB='2809260089771';
const ELC_AHU='AHU-A126270.AH.01.30.Tahun 2026';
const elcRoute=()=>{try{return localStorage.getItem('entego_route')||'home'}catch{return 'home'}};
function elcFooter(){
 const route=elcRoute();if(!['home','profile','help'].includes(route))return;
 const main=document.querySelector('main.content');if(!main||document.querySelector('#entegoLegalCompanyFooter'))return;
 const section=document.createElement('section');section.id='entegoLegalCompanyFooter';section.className='section';
 section.innerHTML=`<div class="card" style="text-align:center;padding:14px 16px"><div style="font-size:11px;font-weight:850;letter-spacing:.06em;color:#64748b">OPERATED BY</div><b style="display:block;margin-top:4px;font-size:13px">${ELC_COMPANY}</b><div class="meta" style="margin-top:4px">NIB ${ELC_NIB} · Denpasar, Bali</div><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:9px"><a href="/legal.html" style="font-size:12px;font-weight:800;color:#f97316;text-decoration:none">Legal & Company</a><a href="/privacy.html" style="font-size:12px;font-weight:800;color:#64748b;text-decoration:none">Privasi</a></div></div>`;
 main.appendChild(section);
}
function elcAuthDisclosure(){
 const panel=document.querySelector('#entegoAuthPanel');if(!panel||document.querySelector('#entegoAuthLegalDisclosure'))return;
 let user=null;try{user=JSON.parse(localStorage.getItem('entego_auth_user')||'null')}catch{}
 if(user)return;
 const box=document.createElement('div');box.id='entegoAuthLegalDisclosure';
 box.style='margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0;text-align:center';
 box.innerHTML=`<div class="meta" style="line-height:1.5">ENTEGO dioperasikan oleh <b>${ELC_COMPANY}</b><br>NIB ${ELC_NIB}</div><div style="margin-top:7px"><a href="/legal.html" style="font-size:11px;font-weight:800;color:#f97316;text-decoration:none">Informasi Legal</a> · <a href="/privacy.html" style="font-size:11px;font-weight:800;color:#64748b;text-decoration:none">Kebijakan Privasi</a></div>`;
 panel.appendChild(box);
}
function elcRun(){elcFooter();elcAuthDisclosure()}
let elcScheduled=false;function elcSchedule(){if(elcScheduled)return;elcScheduled=true;requestAnimationFrame(()=>{elcScheduled=false;elcRun()})}
new MutationObserver(elcSchedule).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',elcRun);elcRun();
window.ENTEGOLegalCompany={version:ENTEGO_LEGAL_COMPANY_VERSION,company:ELC_COMPANY,nib:ELC_NIB,ahu:ELC_AHU};
