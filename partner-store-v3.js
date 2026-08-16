import {EntegoPartner as BasePartner} from './partner-store-v2.js';
const clean=(v,max=300)=>String(v??'').trim().slice(0,max);
const money=v=>Math.max(0,Math.round(Number(v)||0));
const normalizeServices=v=>Array.isArray(v)?[...new Set(v.map(x=>clean(x,80)).filter(Boolean))].slice(0,30):[];
const parseServices=v=>{try{const x=JSON.parse(String(v||'[]'));return Array.isArray(x)?x.filter(Boolean).slice(0,30):[]}catch{return []}};

export class EntegoPartner extends BasePartner{
 constructor(ctx,env){
  super(ctx,env);
  try{this.sql.exec(`ALTER TABLE profiles ADD COLUMN services_json TEXT NOT NULL DEFAULT '[]'`)}catch{}
  try{this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_profiles_services ON profiles(services_json)`)}catch{}
 }
 profileRow(r){
  const base=super.profileRow(r);if(!base)return null;
  return {...base,services:parseServices(r.services_json)};
 }
 async saveProfile(user,input,verified=false){
  const saved=await super.saveProfile(user,input,verified);
  const uid=clean(user,100),services=normalizeServices(input?.services);
  this.sql.exec(`UPDATE profiles SET services_json=?,updated_at=? WHERE user_id=?`,JSON.stringify(services),new Date().toISOString(),uid);
  return this.getProfile(uid)||saved;
 }
 async listDirectory(filters={}){
  const q=clean(filters.q,120).toLowerCase(),cat=clean(filters.category,80),area=clean(filters.area,120),max=money(filters.maxPrice),limit=Math.max(1,Math.min(100,Number(filters.limit)||50));
  let sql=`SELECT * FROM profiles WHERE status='active' AND verified=1 AND verification_status='approved'`,args=[];
  if(q){sql+=` AND (lower(display_name) LIKE ? OR lower(category) LIKE ? OR lower(area) LIKE ? OR lower(specialty) LIKE ? OR lower(services_json) LIKE ?)`;const like=`%${q}%`;args.push(like,like,like,like,like)}
  if(cat&&cat!=='all'){sql+=` AND (category=? OR services_json LIKE ?)`;args.push(cat,`%${JSON.stringify(cat).slice(1,-1)}%`)}
  if(area&&area!=='all'){sql+=` AND area LIKE ?`;args.push(`%${area}%`)}
  if(max){sql+=` AND price<=?`;args.push(max)}
  sql+=` ORDER BY updated_at DESC LIMIT ?`;args.push(limit);
  return this.sql.exec(sql,...args).toArray().map(r=>this.profileRow(r));
 }
}
