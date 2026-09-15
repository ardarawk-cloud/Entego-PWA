const ENTEGO_PLAY_PRIVACY_LINKS_VERSION='1.0';
const pplRoute=()=>localStorage.getItem('entego_route')||'home';
function pplRender(){
 if(pplRoute()!=='profile')return;
 const main=document.querySelector('main.content');
 if(!main||document.querySelector('#entegoPlayPrivacyLinks'))return;
 const privacy=document.querySelector('#entegoPrivacyCenter');
 const section=document.createElement('section');
 section.id='entegoPlayPrivacyLinks';
 section.className='card';
 section.innerHTML=`<div class="kicker">PRIVASI & DATA</div><h3 style="margin:5px 0 10px">Kebijakan & Penghapusan Akun</h3><p class="meta">Baca cara ENTEGO memproses data dan jalur untuk meminta penutupan/penghapusan akun.</p><div class="row" style="gap:8px;margin-top:12px"><a class="btn soft" href="/privacy.html" target="_blank" rel="noopener" style="flex:1;text-decoration:none;text-align:center">Kebijakan Privasi</a><a class="btn soft" href="/account-removal.html" target="_blank" rel="noopener" style="flex:1;text-decoration:none;text-align:center">Penghapusan Akun</a></div><button class="btn primary" id="pplSupport" style="width:100%;margin-top:8px">Buka Support & Safety</button>`;
 (privacy||main.lastElementChild)?.after?.(section)||main.appendChild(section);
 section.querySelector('#pplSupport').onclick=()=>{localStorage.setItem('entego_route','help');location.reload()};
}
let pplScheduled=false;function pplSchedule(){if(pplScheduled)return;pplScheduled=true;requestAnimationFrame(()=>{pplScheduled=false;pplRender()})}
new MutationObserver(pplSchedule).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',pplRender);pplRender();
window.ENTEGOPlayPrivacyLinks={version:ENTEGO_PLAY_PRIVACY_LINKS_VERSION};
