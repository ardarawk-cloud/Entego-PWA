const ENTEGO_LOGOUT_HOTFIX_VERSION='1.1';
const LOGOUT_USER_KEY='entego_auth_user';
const LOGOUT_AFTER_KEY='entego_after_auth';
const LOGOUT_GUARD_KEY='entego_force_logged_out';
let entegoLogoutBusy=false;

const logoutGuardActive=()=>{try{return Boolean(localStorage.getItem(LOGOUT_GUARD_KEY))}catch{return false}};

function clearVisibleLoggedInPanel(){
  const panel=document.querySelector('#entegoAuthPanel');
  if(!panel)return;
  if(panel.querySelector('#entegoLogout'))panel.remove();
}

function enforceLoggedOutState(){
  if(!logoutGuardActive())return;
  try{
    localStorage.removeItem(LOGOUT_USER_KEY);
    localStorage.removeItem(LOGOUT_AFTER_KEY);
  }catch{}
  clearVisibleLoggedInPanel();
}

function logoutLocalState(){
  try{
    localStorage.setItem(LOGOUT_GUARD_KEY,String(Date.now()));
    localStorage.removeItem(LOGOUT_USER_KEY);
    localStorage.removeItem(LOGOUT_AFTER_KEY);
    localStorage.setItem('entego_route','home');
  }catch{}
  try{sessionStorage.removeItem('entego_identity_form_draft_v79')}catch{}
  enforceLoggedOutState();
}

async function logoutServer(){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),3500);
  try{
    await fetch('/api/auth/logout',{
      method:'POST',
      cache:'no-store',
      credentials:'include',
      headers:{accept:'application/json'},
      signal:controller.signal
    });
  }catch{}finally{clearTimeout(timer)}
}

async function performLogout(button){
  if(entegoLogoutBusy)return;
  entegoLogoutBusy=true;
  if(button){button.disabled=true;button.textContent='Keluar…'}
  logoutLocalState();
  await Promise.race([logoutServer(),new Promise(resolve=>setTimeout(resolve,900))]);
  location.replace('/?logout=1');
}

document.addEventListener('click',event=>{
  const loginIntent=event.target?.closest?.('#authLoginBtn,#authRegisterBtn');
  if(loginIntent){
    try{localStorage.removeItem(LOGOUT_GUARD_KEY)}catch{}
    return;
  }
  const button=event.target?.closest?.('#entegoLogout');
  if(!button)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  void performLogout(button);
},true);

const logoutObserver=new MutationObserver(enforceLoggedOutState);
logoutObserver.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('pageshow',enforceLoggedOutState);
window.addEventListener('load',enforceLoggedOutState);
setTimeout(enforceLoggedOutState,0);
setTimeout(enforceLoggedOutState,750);
setTimeout(enforceLoggedOutState,1800);

window.ENTEGOForceLogout={version:ENTEGO_LOGOUT_HOTFIX_VERSION,run:()=>performLogout(document.querySelector('#entegoLogout'))};
