import {DurableObject} from 'cloudflare:workers';
const clean=(v,max=300)=>String(v??'').trim().slice(0,max);
export class EntegoAlerts extends DurableObject{
 constructor(ctx,env){super(ctx,env);this.sql=ctx.storage.sql;this.sql.exec(`
  CREATE TABLE IF NOT EXISTS alert_reads(
   user_id TEXT NOT NULL,
   alert_key TEXT NOT NULL,
   read_at TEXT NOT NULL,
   PRIMARY KEY(user_id,alert_key)
  );
  CREATE INDEX IF NOT EXISTS idx_alert_reads_user ON alert_reads(user_id,read_at DESC);
 `)}
 async markRead(userId,key){const uid=clean(userId,100),alertKey=clean(key,240);if(!uid||!alertKey)throw new Error('ALERT_READ_REQUIRED');const now=new Date().toISOString();this.sql.exec(`INSERT INTO alert_reads(user_id,alert_key,read_at) VALUES(?,?,?) ON CONFLICT(user_id,alert_key) DO UPDATE SET read_at=excluded.read_at`,uid,alertKey,now);return {key:alertKey,readAt:now}}
 async markMany(userId,keys=[]){const out=[];for(const key of Array.from(new Set(keys)).slice(0,100))out.push(await this.markRead(userId,key));return out}
 async listRead(userId,limit=500){const safe=Math.max(1,Math.min(1000,Number(limit)||500));return this.sql.exec(`SELECT alert_key,read_at FROM alert_reads WHERE user_id=? ORDER BY read_at DESC LIMIT ?`,clean(userId,100),safe).toArray().map(r=>({key:r.alert_key,readAt:r.read_at}))}
 async clearOld(days=120){const cutoff=new Date(Date.now()-Math.max(30,Math.min(365,Number(days)||120))*86400000).toISOString();this.sql.exec(`DELETE FROM alert_reads WHERE read_at<?`,cutoff);return true}
}
