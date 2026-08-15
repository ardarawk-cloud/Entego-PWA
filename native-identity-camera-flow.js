(()=>{
  const nativeCamera=()=>window.ENTEGONativeCamera;
  const status=(box,text,ok=false)=>{
    const el=box?.querySelector('#icStatus');
    if(!el)return;
    el.textContent=text;
    el.style.display='block';
    el.style.background=ok?'#ecfdf5':'#fff7ed';
    el.style.color=ok?'#166534':'#9a3412';
    el.scrollIntoView({behavior:'smooth',block:'nearest'});
  };
  const assignFile=(input,file)=>{
    const transfer=new DataTransfer();
    transfer.items.add(file);
    input.files=transfer.files;
    input.dispatchEvent(new Event('change',{bubbles:true}));
  };
  const makeButton=(kind,input,uploadButton,box)=>{
    const id=kind==='ktp'?'icKtpCamera':'icSelfieCamera';
    if(box.querySelector(`#${id}`))return;
    const btn=document.createElement('button');
    btn.id=id;
    btn.type='button';
    btn.className='btn primary';
    btn.style.cssText='width:100%;margin-top:8px';
    btn.textContent=kind==='ktp'?'Ambil Foto KTP dengan Kamera':'Ambil Selfie dengan Kamera';
    input.before(btn);
    if(kind==='selfie'){
      const hint=document.createElement('div');
      hint.className='meta';
      hint.style.marginTop='6px';
      hint.textContent='Gunakan kamera depan dan pastikan wajah terlihat jelas.';
      btn.after(hint);
    }
    btn.addEventListener('click',async()=>{
      const camera=nativeCamera();
      if(!camera?.available){status(box,'Kamera native belum tersedia pada build ini.');return}
      const original=btn.textContent;
      btn.disabled=true;
      btn.textContent=kind==='ktp'?'Membuka kamera KTP…':'Membuka kamera selfie…';
      try{
        const captured=await camera.captureIdentity(kind);
        if(!captured?.file)throw new Error('native_camera_empty_result');
        assignFile(input,captured.file);
        status(box,kind==='ktp'?'Foto KTP siap diunggah privat.':'Selfie siap diunggah privat.',true);
        uploadButton.click();
      }catch(error){
        const code=String(error?.code||error?.message||'').toLowerCase();
        if(code.includes('cancel'))status(box,'Pengambilan foto dibatalkan.');
        else if(code.includes('identity_media_too_large'))status(box,'Ukuran foto terlalu besar. Coba ulang dengan kondisi cahaya yang baik.');
        else status(box,'Kamera belum dapat mengambil foto. Coba lagi atau gunakan pilihan file.');
      }finally{
        if(btn.isConnected){btn.disabled=false;btn.textContent=original}
      }
    });
  };
  const enhance=()=>{
    const camera=nativeCamera();
    if(!camera?.available)return;
    const box=document.querySelector('#entegoIdentityCenter');
    if(!box)return;
    const ktpInput=box.querySelector('#icKtpFile'),ktpUpload=box.querySelector('#icKtpUpload');
    const selfieInput=box.querySelector('#icSelfieFile'),selfieUpload=box.querySelector('#icSelfieUpload');
    if(ktpInput&&ktpUpload)makeButton('ktp',ktpInput,ktpUpload,box);
    if(selfieInput&&selfieUpload)makeButton('selfie',selfieInput,selfieUpload,box);
  };
  let queued=false;
  const schedule=()=>{
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;enhance()});
  };
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('entego:native-ready',schedule);
  window.addEventListener('load',schedule);
  schedule();
})();
