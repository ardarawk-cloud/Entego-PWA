import core from './api-worker-v56.js';
export {EntegoStore,EntegoAuth,EntegoPayment,EntegoPartner,EntegoChat,EntegoOps,EntegoPresence,EntegoAlerts} from './api-worker-v56.js';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
export default {async fetch(request,env){const url=new URL(request.url);if(url.pathname==='/api/health'&&request.method==='GET'){const response=await core.fetch(request,env);let data={};try{data=await response.json()}catch{};return json({...data,productionTruth:'fail-closed',demoFallback:'blocked-sensitive-routes',bookingFallback:'server-only',offerFallback:'server-only',version:'v57'})}return core.fetch(request,env)}};
