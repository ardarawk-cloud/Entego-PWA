const PSC_ROUTE=()=>localStorage.getItem('entego_route')||'home';

function pscOpen(path){
  try{ window.location.assign(path); }
  catch{ window.location.href=path; }
}

function mountPlayCompliance(){
  const route=PSC_ROUTE();
  if(!['profile','settings','help'].includes(route))return;
  const main=document.querySelector('main.content');
  if(!main||main.querySelector('#entegoPlayCompliance'))return;

  const section=document.createElement('section');
  section.id='entegoPlayCompliance';
  section.className='card';
  section.style.marginTop='14px';
  section.innerHTML=`
    <div class="kicker">PRIVASI & KONTROL DATA</div>
    <h3 style="margin:6px 0 8px">Data kamu tetap dalam kendali kamu</h3>
    <p class="meta" style="line-height:1.55;margin-bottom:12px">Baca cara ENTEGO menangani data atau ajukan penghapusan akun dan data terkait.</p>
    <div class="row" style="gap:8px;flex-wrap:wrap">
      <button class="btn soft" id="entegoPrivacyPolicyBtn" style="flex:1;min-width:145px">Kebijakan Privasi</button>
      <button class="btn soft" id="entegoDeleteAccountBtn" style="flex:1;min-width:145px">Hapus Akun</button>
    </div>`;
  main.appendChild(section);
  section.querySelector('#entegoPrivacyPolicyBtn').onclick=()=>pscOpen('/privacy-policy.html');
  section.querySelector('#entegoDeleteAccountBtn').onclick=()=>pscOpen('/delete-account.html');
}

const pscObserver=new MutationObserver(mountPlayCompliance);
pscObserver.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',mountPlayCompliance);
window.addEventListener('popstate',mountPlayCompliance);
mountPlayCompliance();
