import {storage} from '../../core-store';
import {catalogueUser,catalogueResponse,catalogueError} from '../../catalogue-service';
import {requireAdmin,RequestError} from '../../core-service';
import {readJson,limitRequests} from '../../request-guard';
export const dynamic='force-dynamic';
const views=['books','book','chapter','community','diary','profile','submissions','admin','safety','privacy','terms','cookies','other'];
export async function POST(req:Request){try{
 if(req.headers.get('origin')!==new URL(req.url).origin)throw new RequestError(403,'Invalid request origin.');
 if(!req.headers.get('cookie')?.split(';').some(c=>c.trim()==='chillymz_metrics=allow')||req.headers.get('DNT')==='1'||req.headers.get('Sec-GPC')==='1')return catalogueResponse({recorded:false});
 const user=await catalogueUser(),d=await readJson(req,1000);if(!views.includes(d.view))throw new RequestError(400,'Invalid section.');
 if(d.loadMs!==null&&(!Number.isInteger(d.loadMs)||d.loadMs<0||d.loadMs>60000))throw new RequestError(400,'Invalid timing.');
 await limitRequests(user.id,'analytics',60);const {db}=storage(),day=new Date().toISOString().slice(0,10);
 await db.batch([db.prepare('INSERT INTO usage_daily (day,view,visits,load_count,load_total) VALUES (?,?,1,?,?) ON CONFLICT(day,view) DO UPDATE SET visits=usage_daily.visits+1,load_count=usage_daily.load_count+excluded.load_count,load_total=usage_daily.load_total+excluded.load_total').bind(day,d.view,d.loadMs===null?0:1,d.loadMs||0),db.prepare('DELETE FROM usage_daily WHERE day<?').bind(new Date(Date.now()-90*86400000).toISOString().slice(0,10))]);return catalogueResponse({recorded:true});
 }catch(e){return catalogueError(e)}}
export async function GET(){try{const u=await catalogueUser();requireAdmin(u);const {db}=storage();const totals=await db.prepare("SELECT (SELECT COUNT(*) FROM books WHERE status='approved') AS books,(SELECT COUNT(*) FROM profiles) AS readers,(SELECT COUNT(*) FROM ratings) AS ratings,(SELECT COUNT(*) FROM discussions) AS discussions").first();const daily=await db.prepare('SELECT day,SUM(visits) AS visits,SUM(load_count) AS samples,SUM(load_total) AS load_total FROM usage_daily WHERE day>=? GROUP BY day ORDER BY day DESC').bind(new Date(Date.now()-29*86400000).toISOString().slice(0,10)).all();const sections=await db.prepare('SELECT view,SUM(visits) AS visits FROM usage_daily WHERE day>=? GROUP BY view ORDER BY visits DESC').bind(new Date(Date.now()-29*86400000).toISOString().slice(0,10)).all();return catalogueResponse({totals,daily:daily.results,sections:sections.results});}catch(e){return catalogueError(e)}}
