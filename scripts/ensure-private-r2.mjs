import {execFileSync} from 'node:child_process';

const BUCKET='entego-identity-private';

if(process.env.WORKERS_CI!=='1'){
  console.log('[ENTEGO] Skip remote R2 provisioning outside Cloudflare Workers Builds.');
  process.exit(0);
}

const run=(args,stdio='pipe')=>execFileSync('npx',['--yes','wrangler@latest',...args],{encoding:'utf8',stdio});

try{
  run(['r2','bucket','info',BUCKET,'--json']);
  console.log(`[ENTEGO] Private identity bucket exists: ${BUCKET}`);
}catch{
  console.log(`[ENTEGO] Creating private identity bucket: ${BUCKET}`);
  run(['r2','bucket','create',BUCKET],'inherit');
  run(['r2','bucket','info',BUCKET,'--json']);
  console.log(`[ENTEGO] Private identity bucket created: ${BUCKET}`);
}
