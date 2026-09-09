import {readJson,limitRequests} from '../../request-guard';
import {storage} from '../../core-store';
import {catalogueUser,catalogueResponse,catalogueError} from '../../catalogue-service';
import {requireAdmin,RequestError} from '../../core-service';
import {fantasyBatch} from '../../fantasy-batch';
import {validateImport,previewImport} from '../../import-service';
export const dynamic='force-dynamic';
export async function GET(){try{requireAdmin(await catalogueUser());return catalogueResponse({books:await previewImport(storage().db,fantasyBatch)})}catch(e){return catalogueError(e)}}
export async function POST(request:Request){try{
 if(request.headers.get('origin')!==new URL(request.url).origin)throw new RequestError(403,'Invalid request origin.');
 const user=await catalogueUser();requireAdmin(user);
 const data=await readJson(request,150000);await limitRequests(user.id,'catalogue-import',15);
 const books=validateImport(data.batch==='fantasy-25'?fantasyBatch:data.books),{db}=storage();
 const preview=await previewImport(db,books);
 if(data.action==='preview')return catalogueResponse({books:preview});
 if(data.action!=='import')throw new RequestError(400,'Choose preview or import.');
 const ready=preview.filter(b=>!b.duplicate),now=new Date().toISOString();
 if(!ready.length)return catalogueResponse({added:0,skipped:books.length,books:preview});
 // A single atomic batch and unique catalogue keys make retries safe. No rating writes.
 const writes=ready.map(b=>db.prepare("INSERT INTO books (id,owner,title,author,chapter_count,cover_key,mime,status,created,catalogue_key,source_url,edition,chapter_note) VALUES (?,?,?,?,?,'','','approved',?,?,?,?,?) ON CONFLICT(catalogue_key) DO NOTHING").bind(crypto.randomUUID(),user.id,b.title,b.author,b.chapterCount,now,b.key,b.sourceUrl,b.edition,b.chapterNote));
 writes.push(db.prepare('INSERT INTO moderation_events (id,actor,action,target,reason,created) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),user.id,'catalogue-import',data.batch==='fantasy-25'?'fantasy-25':'custom-batch',`Requested ${ready.length} books with empty ratings.`,now));
 const result=await db.batch(writes),added=result.slice(0,-1).reduce((n:number,r:any)=>n+Number(r.meta.changes||0),0);
 return catalogueResponse({added,skipped:books.length-added,books:await previewImport(db,books)});
 }catch(e){return catalogueError(e)}}
