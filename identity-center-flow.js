const IDENTITY_UI_VERSION='77.1';
const icRoute=()=>localStorage.getItem('entego_route')||'home';
const icUser=()=>{try{return JSON.parse(localStorage.getItem('entego_auth_user')||'null')}catch{return null}};
const icEsc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const icDigits=v=>String(v??'').replace(/\D/g,'').slice(0,4);
let icBusy=false;

async function icJson(url,options={}){
 const r=await fetch(url,{cache:'no-store',headers:{accept:'application/json',...(options.headers||{})},...options});let d={};try{d=await r.json()}catch{};return {r,d};
}

function icError(code){
 return ({
  identity_private_storage_not_configured:'Penyimpanan privat KTP belum aktif. Jangan unggah KTP ke Portfolio atau media publik.',
  identity_details_required:'Lengkapi nama legal, nomor HP, 4 digit terakhir KTP, dan data rekening.',
  identity_consent_required:'Persetujuan pemrosesan data identitas wajib dicentang.',
  identity_documents_required:'Foto KTP dan selfie verifikasi wajib tersedia sebelum dikirim.',
  full_id_number_not_accepted:'Jangan masukkan NIK lengkap. ENTEGO hanya menerima 4 digit terakhir pada form ini.',
  full_bank_number_not_accepted:'Jangan masukkan nomor rekening lengkap. ENTEGO hanya menerima 4 digit terakhir pada form ini.',
  unsupported_identity_media_type:'Gunakan foto JPG, PNG, atau WebP.',
  identity_media_too_large:'Ukuran foto maksimal 6 MB.',
  rate_limited:'Terlalu banyak percobaan. Coba lagi beberapa saat.',
  partner_required:'Identity Center hanya tersedia untuk akun Mitra aktif.'
 })[String(code||'').toLowerCase()]||'Verifikasi identitas belum dapat diproses. Coba lagi.';
}

function icStatus(identity){
 const s=identity?.identityStatus||'not_started';
 if(s==='approved')return {label:'✓ Identitas terverifikasi',pill:'green',desc:'Identitas telah disetujui Admin ENTEGO.'};
 if(s==='submitted')return {label:'Sedang ditinjau',pill:'blue',desc:'KTP, selfie, dan data rekening sedang direview.'};
 if(s==='rejected')return {label:'Perlu diperbaiki',pill:'blue',desc:identity?.reviewNote||'Periksa catatan Admin lalu ajukan ulang.'};
 if(s==='draft')return {label:'Belum dikirim',pill:'blue',desc:'Lengkapi data dan dokumen sebelum mengirim verifikasi.'};
 return {label:'Verifikasi diperlukan',pill:'blue',desc:'Mulai verifikasi identitas untuk mengaktifkan status Mitra penuh.'};
}

function icUpdateAccountBadge(identity){
 const panel=document.querySelector('#entegoAuthPanel');if(!panel)return;
 const badge=[...panel.querySelectorAll('.pill')].find(x=>/Verifikasi mitra|Identitas|Mitra terverifikasi/i.test(x.textContent||''));if(!badge)return;
 const s=identity?.identityStatus||'not_started';
 badge.textContent=s==='approved'?'✓ Identitas terverifikasi':s==='submitted'?'Verifikasi identitas diproses':s==='rejected'?'Verifikasi identitas perlu diperbaiki':'Verifikasi identitas diperlukan';
 badge.classList.toggle('green',s==='approved');badge.classList.toggle('blue',s!=='approved');
}

function icPlacement(main,box){
 if(icRoute()==='profile'){
  const auth=document.querySelector('#entegoAuthPanel');if(!auth)return false;
  if(auth.nextSibling!==box)auth.after(box);return true;
 }
 const profile=document.querySelector('#entegoPartnerProfile');if(profile){profile.after(box);return true}
 main.appendChild(box);return true;
}

function icRender(main,payload){
 const identity=payload.identity||null,configured=Boolean(payload.privateDocumentStorageConfigured),st=icStatus(identity),approved=identity?.identityStatus==='approved',submitted=identity?.identityStatus==='submitted';
 let box=document.querySelector('#entegoIdentityCenter');if(!box){box=document.createElement('section');box.id='entegoIdentityCenter';box.className='card'}
 const value=(k)=>icEsc(identity?.[k]||'');
 box.innerHTML=`
  <div class="kicker">ENTEGO IDENTITY & PAYOUT</div>
  <div class="row between" style="gap:10px;align-items:flex-start"><div><h2 style="margin:6px 0">Verifikasi Identitas</h2><div class="meta">KYC Mitra • Account UI v${IDENTITY_UI_VERSION}</div></div><span class="pill ${st.pill}">${st.label}</span></div>
  <p class="meta" style="margin-top:10px">${icEsc(st.desc)}</p>
  ${identity?.reviewNote&&identity.identityStatus==='rejected'?`<div class="card" style="margin-top:10px;padding:12px"><b>Catatan Admin</b><div class="meta" style="margin-top:4px">${icEsc(identity.reviewNote)}</div></div>`:''}
  <div class="row" style="gap:8px;flex-wrap:wrap;margin:12px 0"><span class="pill ${identity?.ktpUploaded?'green':'blue'}">${identity?.ktpUploaded?'✓':'○'} KTP</span><span class="pill ${identity?.selfieUploaded?'green':'blue'}">${identity?.selfieUploaded?'✓':'○'} Selfie</span><span class="pill ${identity?.payoutEnabled?'green':'blue'}">${identity?.payoutEnabled?'✓ Memenuhi syarat payout':'Payout terkunci'}</span></div>
  <div class="card" style="padding:12px;margin:10px 0;background:#f8fafc"><b>Privasi data</b><div class="meta" style="margin-top:4px">Form ini tidak menerima NIK atau nomor rekening lengkap. Hanya 4 digit terakhir disimpan sebagai metadata. Dokumen identitas tidak pernah dipublikasikan sebagai Portfolio.</div></div>
  ${!configured?`<div class="card" style="padding:12px;margin:10px 0;background:#fff7ed"><b>Upload privat belum aktif</b><div class="meta" style="margin-top:4px;color:#9a3412">Storage privat KTP/selfie belum dikonfigurasi pada deployment. Payout tetap terkunci dan KTP tidak boleh diunggah ke Portfolio.</div></div>`:''}
  <div class="form" style="margin-top:12px">
   <div class="field"><label>Nama sesuai KTP</label><input id="icLegalName" value="${value('legalName')}" autocomplete="name" ${approved||submitted?'disabled':''}></div>
   <div class="field"><label>Nomor HP aktif</label><input id="icPhone" value="${value('phone')}" inputmode="tel" autocomplete="tel" placeholder="08xxxxxxxxxx" ${approved||submitted?'disabled':''}></div>
   <div class="field"><label>4 digit terakhir NIK/KTP</label><input id="icIdLast4" value="${value('idLast4')}" inputmode="numeric" maxlength="4" placeholder="1234" ${approved||submitted?'disabled':''}><div class="meta">Jangan masukkan 16 digit NIK lengkap.</div></div>
   <div class="field"><label>Bank tujuan payout</label><input id="icBankName" value="${value('bankName')}" placeholder="BCA / BRI / Mandiri ..." ${approved||submitted?'disabled':''}></div>
   <div class="field"><label>Nama pemilik rekening</label><input id="icBankAccountName" value="${value('bankAccountName')}" placeholder="Harus sesuai identitas" ${approved||submitted?'disabled':''}></div>
   <div class="field"><label>4 digit terakhir rekening</label><input id="icBankLast4" value="${value('bankAccountLast4')}" inputmode="numeric" maxlength="4" placeholder="5678" ${approved||submitted?'disabled':''}><div class="meta">Nomor rekening lengkap tidak disimpan di form KYC ini.</div></div>
  </div>
  ${!approved&&!submitted?`<label class="meta" style="display:flex;gap:9px;align-items:flex-start;margin:12px 0"><input id="icConsent" type="checkbox" ${identity?.consentRecorded?'checked':''} style="margin-top:3px"> Saya menyetujui pemrosesan data identitas untuk verifikasi Mitra, keamanan transaksi, dan kelayakan payout.</label>`:''}
  <div class="divider"></div>
  <div style="display:grid;gap:10px">
   <div><b>Foto KTP</b><div class="meta">Disimpan privat dan hanya dapat dibuka Admin terautentikasi.</div>${!approved&&!submitted?`<input id="icKtpFile" type="file" accept="image/jpeg,image/png,image/webp" ${configured?'':'disabled'} style="margin-top:8px;width:100%"><button class="btn soft" id="icKtpUpload" type="button" ${configured?'':'disabled'} style="width:100%;margin-top:8px">${identity?.ktpUploaded?'Ganti Foto KTP':'Upload Foto KTP'}</button>`:''}</div>
   <div><b>Selfie verifikasi</b><div class="meta">Selfie digunakan untuk pemeriksaan identitas, bukan foto profil publik.</div>${!approved&&!submitted?`<input id="icSelfieFile" type="file" accept="image/jpeg,image/png,image/webp" ${configured?'':'disabled'} style="margin-top:8px;width:100%"><button class="btn soft" id="icSelfieUpload" type="button" ${configured?'':'disabled'} style="width:100%;margin-top:8px">${identity?.selfieUploaded?'Ganti Selfie':'Upload Selfie'}</button>`:''}</div>
  </div>
  <div id="icStatus" class="meta" role="status" aria-live="polite" style="display:none;margin-top:12px;padding:10px 12px;border-radius:12px;background:#fff7ed;color:#9a3412"></div>
  ${approved?`<button class="btn soft" data-route="help" style="width:100%;margin-top:14px">Perubahan identitas/rekening melalui Support</button>`:submitted?'<div class="meta" style="margin-top:14px">Data dikunci sementara selama review Admin.</div>':`<button class="btn soft" id="icSave" type="button" style="width:100%;margin-top:14px">Simpan Data Identitas</button><button class="btn primary" id="icSubmit" type="button" style="width:100%;margin-top:10px" ${identity?.ktpUploaded&&identity?.selfieUploaded?'':'disabled'}>Kirim untuk Verifikasi</button>`}
 `;
 if(!icPlacement(main,box))return;
 icUpdateAccountBadge(identity);
 const status=box.querySelector('#icStatus'),show=(text,ok=false)=>{if(!status)return;status.textContent=text;status.style.display='block';status.style.background=ok?'#ecfdf5':'#fff7ed';status.style.color=ok?'#166534':'#9a3412';status.scrollIntoView({behavior:'smooth',block:'nearest'})};
 const reload=()=>{box.remove();icBusy=false;void icLoad()};
 const upload=async kind=>{const input=box.querySelector(kind==='ktp'?'#icKtpFile':'#icSelfieFile'),btn=box.querySelector(kind==='ktp'?'#icKtpUpload':'#icSelfieUpload'),file=input?.files?.[0];if(!file){show('Pilih foto terlebih dahulu.');return}const original=btn.textContent;btn.disabled=true;btn.textContent='Mengunggah privat…';try{const fd=new FormData();fd.append('file',file);const x=await icJson(`/api/partner/me/identity/document?kind=${kind}`,{method:'POST',body:fd});if(!x.r.ok||!x.d.ok)throw new Error(x.d.error||'upload_failed');show(kind==='ktp'?'Foto KTP tersimpan privat.':'Selfie tersimpan privat.',true);setTimeout(reload,350)}catch(e){show(icError(e.message))}finally{btn.disabled=false;btn.textContent=original}};
 box.querySelector('#icKtpUpload')?.addEventListener('click',()=>upload('ktp'));box.querySelector('#icSelfieUpload')?.addEventListener('click',()=>upload('selfie'));
 box.querySelector('#icIdLast4')?.addEventListener('input',e=>e.target.value=icDigits(e.target.value));box.querySelector('#icBankLast4')?.addEventListener('input',e=>e.target.value=icDigits(e.target.value));
 box.querySelector('#icSave')?.addEventListener('click',async()=>{const btn=box.querySelector('#icSave'),original=btn.textContent;btn.disabled=true;btn.textContent='Menyimpan…';const payload={legalName:box.querySelector('#icLegalName').value.trim(),phone:box.querySelector('#icPhone').value.trim(),idLast4:icDigits(box.querySelector('#icIdLast4').value),bankName:box.querySelector('#icBankName').value.trim(),bankAccountName:box.querySelector('#icBankAccountName').value.trim(),bankAccountLast4:icDigits(box.querySelector('#icBankLast4').value),consent:Boolean(box.querySelector('#icConsent')?.checked)};try{const x=await icJson('/api/partner/me/identity',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});if(!x.r.ok||!x.d.ok)throw new Error(x.d.error||'save_failed');show('Data identitas tersimpan. NIK dan rekening lengkap tidak disimpan.',true);setTimeout(reload,350)}catch(e){show(icError(e.message))}finally{btn.disabled=false;btn.textContent=original}});
 box.querySelector('#icSubmit')?.addEventListener('click',async()=>{const btn=box.querySelector('#icSubmit'),original=btn.textContent;btn.disabled=true;btn.textContent='Mengirim verifikasi…';try{const x=await icJson('/api/partner/me/identity/submit',{method:'POST'});if(!x.r.ok||!x.d.ok)throw new Error(x.d.error||'submit_failed');show('Verifikasi berhasil dikirim. Payout tetap terkunci sampai Admin menyetujui.',true);setTimeout(reload,500)}catch(e){show(icError(e.message))}finally{btn.disabled=false;btn.textContent=original}});
}

async function icLoad(){
 const route=icRoute(),user=icUser();if(!['profile','partner','partnerOnboarding'].includes(route)||user?.role!=='partner'||icBusy)return;
 const main=document.querySelector('main.content');if(!main)return;if(route==='profile'&&!document.querySelector('#entegoAuthPanel'))return;
 // Keep the active form stable. Native KYC controls mutate this card; re-rendering it
 // on every MutationObserver tick destroys input focus and makes Android typing unusable.
 if(document.querySelector('#entegoIdentityCenter'))return;
 icBusy=true;try{const x=await icJson('/api/partner/me/identity');if(!x.r.ok||!x.d.ok)throw new Error(x.d.error||'identity_load_failed');icRender(main,x.d)}catch(e){let box=document.querySelector('#entegoIdentityCenter');if(!box){box=document.createElement('section');box.id='entegoIdentityCenter';box.className='card';main.appendChild(box)}box.innerHTML=`<div class="kicker">ENTEGO IDENTITY & PAYOUT</div><h2>Verifikasi Identitas</h2><span class="pill blue">Belum dapat dimuat</span><p class="meta">${icEsc(icError(e.message))}</p>`;icPlacement(main,box)}finally{icBusy=false}
}

let icScheduled=false;function icSchedule(){if(icScheduled)return;icScheduled=true;requestAnimationFrame(()=>{icScheduled=false;void icLoad()})}
new MutationObserver(icSchedule).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('load',()=>void icLoad());void icLoad();
