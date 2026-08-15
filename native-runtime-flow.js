(()=>{
  const API_ORIGIN='https://entego-pwa.ardarawk.workers.dev';
  const VERSION='1';
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

  document.documentElement.dataset.entegoNative='android-v1';
  window.dispatchEvent(new CustomEvent('entego:native-ready',{detail:{version:VERSION,platform:cap?.getPlatform?.()||'android'}}));
})();
