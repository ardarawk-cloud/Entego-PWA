const ENTEGO_HOME_COPY_VERSION='1.0';
const TITLE='Semua Kebutuhan Event, Satu Aplikasi';
const LABELS=new Map([
 ['talent','Talent'],['production','Production'],['photo & creative','Photo & Creative'],['beauty & styling','Beauty & Styling'],['food & hospitality','Food & Hospitality'],['organizer','Organizer'],['venue','Venue'],['rental & transport','Rental & Transport'],['decoration & event support','Decoration & Event Support'],['event support','Event Support']
]);
function titleCaseCategory(text){const key=String(text||'').trim().toLowerCase();return LABELS.get(key)||String(text||'').replace(/\b\p{L}/gu,m=>m.toUpperCase())}
function polishHomeCopy(){
 const route=localStorage.getItem('entego_route')||'home';if(route!=='home')return;
 const hero=document.querySelector('.v109-hero h1');
 if(hero){hero.textContent=TITLE;hero.style.fontSize='clamp(24px,7vw,28px)';hero.style.lineHeight='1.12';hero.style.maxWidth='330px';hero.style.letterSpacing='-.02em'}
 const shell=document.querySelector('#entegoStaticShell .ess-card h1');if(shell){shell.textContent=TITLE;shell.style.fontSize='24px';shell.style.lineHeight='1.15'}
 document.querySelectorAll('.v109-cat b,.ess-chip').forEach(el=>{el.textContent=titleCaseCategory(el.textContent);el.style.textTransform='none'});
}
let hcfScheduled=false;function hcfSchedule(){if(hcfScheduled)return;hcfScheduled=true;requestAnimationFrame(()=>{hcfScheduled=false;polishHomeCopy()})}
new MutationObserver(hcfSchedule).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('load',polishHomeCopy);polishHomeCopy();
window.ENTEGOHomeCopy={version:ENTEGO_HOME_COPY_VERSION,title:TITLE};
