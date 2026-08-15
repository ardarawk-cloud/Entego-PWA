const IDENTITY_SUBMIT_HOTFIX_VERSION='78';

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
    identity_details_required:'Lengkapi nama sesuai identitas, nomor HP, 4 karakter terakhir identitas, bank, nama pemilik rekening, dan 4 digit terakhir rekening.',
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

function ishValidate(payload){
  if(!['KTP','SIM','PASSPORT'].includes(payload.idType))return 'invalid_identity_type';
  if(!payload.legalName||!payload.phone||payload.idLast4.length!==4||!payload.bankName||!payload.bankAccountName||payload.bankAccountLast4.length!==4)return 'identity_details_required';
  if(!payload.consent)return 'identity_consent_required';
  return '';
}

async function ishSubmit(button,box){
  if(button.dataset.entegoSubmitting==='1')return;
  const payload=ishPayload(box),invalid=ishValidate(payload);
  if(invalid){ishStatus(box,ishMessage(invalid));return}
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

    ishStatus(box,'Verifikasi berhasil dikirim. Data identitas sekarang menunggu pemeriksaan Admin ENTEGO.',true);
    button.textContent='Verifikasi Terkirim';
    setTimeout(()=>{if(box.isConnected)box.remove()},650);
  }catch(error){
    ishStatus(box,ishMessage(error?.message));
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
  if(button.disabled){ishStatus(box,'Upload foto identitas dan selfie terlebih dahulu.');return}
  void ishSubmit(button,box);
},true);
