(()=>{
  const API_ORIGIN='https://entego-pwa.ardarawk.workers.dev';
  const VERSION='1.1';
  const cap=window.Capacitor;
  const native=Boolean(cap?.isNativePlatform?.());
  window.__ENTEGO_NATIVE_RUNTIME__={version:VERSION,native,apiOrigin:API_ORIGIN};
  if(!native)return;

  const originalFetch=window.fetch.bind(window);
  const mapUrl=input=>{
    if(typeof input==='string'){
      if(/^\/(api|media)\//.test(input))return API_ORIGIN+input;
      return input;
    }
    if(input instanceof URL){
      if(input.origin===location.origin&&/^\/(api|media)\//.test(input.pathname))return new URL(input.pathname+input.search+input.hash,API_ORIGIN);
      return input;
    }
    return input;
  };

  window.fetch=(input,init={})=>{
    const mapped=mapUrl(input);
    if(mapped!==input)return originalFetch(mapped,{...init,credentials:'include'});
    return originalFetch(input,init);
  };

  const cameraPlugin=()=>cap?.Plugins?.Camera||null;
  const normalizeMime=(blob,result)=>{
    if(blob?.type&&/^image\/(jpeg|png|webp)$/i.test(blob.type))return blob.type.toLowerCase();
    const fmt=String(result?.metadata?.format||'jpeg').toLowerCase();
    if(fmt==='jpg'||fmt==='jpeg')return 'image/jpeg';
    if(fmt==='png')return 'image/png';
    if(fmt==='webp')return 'image/webp';
    return 'image/jpeg';
  };
  const extensionFor=mime=>mime==='image/png'?'png':mime==='image/webp'?'webp':'jpg';

  async function captureIdentity(kind){
    const camera=cameraPlugin();
    if(!camera?.takePhoto)throw new Error('native_camera_unavailable');
    const isSelfie=kind==='selfie';
    const result=await camera.takePhoto({
      quality:82,
      targetWidth:isSelfie?1200:1600,
      targetHeight:isSelfie?1600:1200,
      correctOrientation:true,
      saveToGallery:false,
      editable:'no',
      includeMetadata:true
    });
    if(!result?.webPath)throw new Error('native_camera_empty_result');
    const response=await originalFetch(result.webPath,{cache:'no-store'});
    if(!response.ok)throw new Error('native_camera_read_failed');
    const raw=await response.blob();
    const mime=normalizeMime(raw,result);
    const blob=raw.type===mime?raw:new Blob([raw],{type:mime});
    if(blob.size>6*1024*1024)throw new Error('identity_media_too_large');
    const file=new File([blob],`entego-${isSelfie?'selfie':'ktp'}-${Date.now()}.${extensionFor(mime)}`,{type:mime,lastModified:Date.now()});
    return {file,metadata:result.metadata||null};
  }

  window.ENTEGONativeCamera={
    get available(){return Boolean(cameraPlugin()?.takePhoto)},
    captureIdentity
  };

  document.documentElement.dataset.entegoNative='android-release-v1';
  window.dispatchEvent(new CustomEvent('entego:native-ready',{detail:{version:VERSION,platform:cap?.getPlatform?.()||'android',camera:Boolean(cameraPlugin()?.takePhoto)}}));
})();
