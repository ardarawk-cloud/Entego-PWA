const IDENTITY_SUBMIT_HOTFIX_VERSION='79';
const ISH_DRAFT_KEY='entego_identity_form_draft_v79';

const ishEsc=v=>String(v??'').trim();
const ishDigits=v=>String(v??'').replace(/\D/g,'').slice(0,4);
const ishIdSuffix=(v,type='KTP')=>{
  const raw=String(v??'').toUpperCase();
  return type==='PASSPORT'?raw.replace(/[^A-Z0-9]/g,'').slice(0,4):ishDigits(raw);
};

function ishStatus(box,text,ok=false){
  const el=box?.querySelector('#icStatus');
  if(!el)return;
  el.textContent=text;
  el.style.display='block';
  el.style.background=ok?'#ecfdf5':'#fff7ed';
  el.style.color=ok?'#166534':'#9a3412';
  el.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function ishMessage(code){
  return ({
    identity_details_required:'Lengkapi data identitas yang masih kosong.',
    identity_consent_required:'Centang persetujuan pemrosesan data identitas sebelum mengirim.',
    identity_documents_required:'Upload foto identitas dan selfie terlebih dahulu.',
    invalid_identity_type:'Pilih jenis identitas KTP, SIM, atau Paspor.',
    rate_limited:'Batas percobaan verifikasi tercapai. Coba kembali setelah masa pembatasan berakhir.',
    partner_required:'Verifikasi identitas hanya tersedia untuk akun Mitra aktif.',
    unauthenticated:'Sesi login berakhir. Silakan login kembali.'
  })[String(code||'').toLowerCase()]||'Verifikasi belum dapat dikirim. Periksa data lalu coba lagi.';
}

async function ishJson(url,options={}){
  const response=await fetch(url,{cache:'no-store',headers:{accept:'application/json',...(options.headers||{})},...options});
  let data={};
  try{data=await response.json()}catch{}
  return {response,data};
}

function ishPayload(box){
  const idType=box.querySelector('#icIdType')?.value||'KTP';
  return {
    legalName:ishEsc(box.querySelector('#icLegalName')?.value),
    phone:ishEsc(box.querySelector('#icPhone')?.value),
    idType,
    idLast4:ishIdSuffix(box.querySelector('#icIdLast4')?.value,idType),
    bankName:ishEsc(box.querySelector('#icBankName')?.value),
    bankAccountName:ishEsc(box.querySelector('#icBankAccountName')?.value),
    bankAccountLast4:ishDigits(box.querySelector('#icBankLast4')?.value),
    consent:Boolean(box.querySelector('#icConsent')?.checked)
  };
}

function ishReadDraft(){
  try{return JSON.parse(sessionStorage.getItem(ISH_DRAFT_KEY)||'null')}catch{return null}
}
function ishWriteDraft(payload){
  try{sessionStorage.setItem(ISH_DRAFT_KEY,JSON.stringify(payload))}catch{}
}
function ishClearDraft(){
  try{sessionStorage.removeItem(ISH_DRAFT_KEY)}catch{}
}

function ishCaptureDraft(box){
  if(!box)return;
  ishWriteDraft(ishPayload(box));
}

function ishRestoreDraft(box){
  const d=ishReadDraft();if(!box||!d)return;
  const pairs=[
    ['#icLegalName','legalName'],['#icPhone','phone'],['#icIdLast4','idLast4'],
    ['#icBankName','bankName'],['#icBankAccountName','bankAccountName'],['#icBankLast4','bankAccountLast4']
  ];
  const type=box.querySelector('#icIdType');
  if(type&&!type.disabled&&d.idType&&!type.value)type.value=d.idType;
  for(const [selector,key] of pairs){const el=box.querySelector(selector);if(el&&!el.disabled&&!String(el.value||'').trim()&&d[key])el.value=d[key]}
  const consent=box.querySelector('#icConsent');if(consent&&!consent.checked&&d.consent)consent.checked=true;
}

function ishTuneBox(box){
  if(!box)return;
  const bankLast4=box.querySelector('#icBankLast4');
  if(bankLast4){
    bankLast4.placeholder='Masukkan 4 digit terakhir';
    bankLast4.setAttribute('aria-label','4 digit terakhir rekening');
    bankLast4.setAttribute('autocomplete','off');
  }
  ishRestoreDraft(box);
  if(box.dataset.entegoKyc79==='1')return;
  box.dataset.entegoKyc79='1';
  box.addEventListener('input',()=>ishCaptureDraft(box),true);
  box.addEventListener('change',()=>ishCaptureDraft(box),true);
}

function ishInvalid(payload){
  if(!['KTP','SIM','PASSPORT'].includes(payload.idType))return {code:'invalid_identity_type',field:'#icIdType',message:'Pilih jenis identitas KTP, SIM, atau Paspor.'};
  if(!payload.legalName)return {code:'identity_details_required',field:'#icLegalName',message:'Nama sesuai identitas belum diisi.'};
  if(!payload.phone)return {code:'identity_details_required',field:'#icPhone',message:'Nomor HP aktif belum diisi.'};
  if(payload.idLast4.length!==4)return {code:'identity_details_required',field:'#icIdLast4',message:`Isi tepat 4 ${payload.idType==='PASSPORT'?'karakter':'digit'} terakhir identitas.`};
  if(!payload.bankName)return {code:'identity_details_required',field:'#icBankName',message:'Bank tujuan payout belum diisi.'};
  if(!payload.bankAccountName)return {code:'identity_details_required',field:'#icBankAccountName',message:'Nama pemilik rekening belum diisi.'};
  if(payload.bankAccountLast4.length!==4)return {code:'identity_details_required',field:'#icBankLast4',message:'Isi 4 digit terakhir rekening. Teks abu-abu sebelumnya hanya contoh, bukan data yang sudah tersimpan.'};
  if(!payload.consent)return {code:'identity_consent_required',field:'#icConsent',message:'Centang persetujuan pemrosesan data identitas sebelum mengirim.'};
  return null;
}

function ishFocusInvalid(box,invalid){
  ishStatus(box,invalid.message||ishMessage(invalid.code));
  const field=box.querySelector(invalid.field);
  if(!field)return;
  field.scrollIntoView({behavior:'smooth',block:'center'});
  try{field.focus({preventScroll:true})}catch{try{field.focus()}catch{}}
  const old=field.style.boxShadow;
  field.style.boxShadow='0 0 0 3px rgba(249,115,22,.28)';
  setTimeout(()=>{if(field.isConnected)field.style.boxShadow=old},1800);
}

async function ishSubmit(button,box){
  if(button.dataset.entegoSubmitting==='1')return;
  ishTuneBox(box);
  const payload=ishPayload(box),invalid=ishInvalid(payload);
  if(invalid){ishFocusInvalid(box,invalid);return}
  ishWriteDraft(payload);
  const original=button.textContent;
  button.dataset.entegoSubmitting='1';
  button.disabled=true;
  button.textContent='Menyimpan & mengirim…';
  try{
    const saved=await ishJson('/api/partner/me/identity',{
      method:'PUT',
      headers:{'content-type':'application/json'},
      body:JSON.stringify(payload)
    });
    if(!saved.response.ok||!saved.data.ok)throw new Error(saved.data.error||'identity_save_failed');
    const identity=saved.data.identity;
    if(!identity?.ktpUploaded||!identity?.selfieUploaded)throw new Error('identity_documents_required');

    const submitted=await ishJson('/api/partner/me/identity/submit',{method:'POST'});
    if(!submitted.response.ok||!submitted.data.ok)throw new Error(submitted.data.error||'identity_submit_failed');

    ishClearDraft();
    ishStatus(box,'Verifikasi berhasil dikirim. Data identitas sekarang menunggu pemeriksaan Admin ENTEGO.',true);
    button.textContent='Verifikasi Terkirim';
    setTimeout(()=>{if(box.isConnected)box.remove()},650);
  }catch(error){
    const code=String(error?.message||'');
    ishStatus(box,ishMessage(code));
    button.disabled=false;
    button.textContent=original;
  }finally{
    delete button.dataset.entegoSubmitting;
  }
}

document.addEventListener('click',event=>{
  const button=event.target?.closest?.('#icSubmit');
  if(!button)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const box=button.closest('#entegoIdentityCenter');
  if(!box)return;
  ishTuneBox(box);
  if(button.disabled){ishStatus(box,'Upload foto identitas dan selfie terlebih dahulu.');return}
  void ishSubmit(button,box);
},true);

const ishObserver=new MutationObserver(()=>{const box=document.querySelector('#entegoIdentityCenter');if(box)ishTuneBox(box)});
ishObserver.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',()=>{const box=document.querySelector('#entegoIdentityCenter');if(box)ishTuneBox(box)});
const ishInitial=document.querySelector('#entegoIdentityCenter');if(ishInitial)ishTuneBox(ishInitial);
