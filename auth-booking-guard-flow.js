const ABG_USER='entego_auth_user';
const ABG_AFTER='entego_after_auth';
const abgUser=()=>{try{return JSON.parse(localStorage.getItem(ABG_USER)||'null')}catch{return null}};
document.addEventListener('click',e=>{
 const pay=e.target.closest('#payBtn');if(!pay)return;
 const user=abgUser();if(user&&['customer','admin'].includes(user.role))return;
 e.preventDefault();e.stopImmediatePropagation();
 localStorage.setItem(ABG_AFTER,'checkout');
 localStorage.setItem('entego_route','profile');
 localStorage.setItem('entego_auth_notice',user?.role==='partner'?'Gunakan akun Customer untuk membuat booking.':'Masuk terlebih dahulu untuk membuat booking.');
 location.reload();
},true);
