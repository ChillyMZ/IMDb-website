import {storage} from '../../core-store';
import {catalogueUser,catalogueResponse,catalogueError} from '../../catalogue-service';
import {requireAdmin,validBook,coverType,RequestError} from '../../core-service';
import {boundedBody,limitRequests} from '../../request-guard';
export async function POST(req:Request){try{
 if(req.headers.get('origin')!==new URL(req.url).origin)throw new RequestError(403,'Invalid request origin.');
 const u=await catalogueUser();requireAdmin(u);await limitRequests(u.id,'book-edit',30);
 if(!req.headers.get('content-type')?.includes('multipart/form-data'))throw new RequestError(415,'Send a book form.');
 const bytes=await boundedBody(req,6*1024*1024),f=await new Response(bytes,{headers:{'Content-Type':req.headers.get('content-type')!}}).formData();
 const {title,author,count}=validBook(Object.fromEntries(f)),id=String(f.get('id')||''),{db,bucket}=storage();
 const old=await db.prepare('SELECT * FROM books WHERE id=?').bind(id).first();if(!old)throw new RequestError(404,'Book not found.');
 let key=old.cover_key,mime=old.mime;const cover=f.get('cover');
 if(cover instanceof File&&cover.size){if(cover.size>5*1024*1024)throw new RequestError(400,'Cover must be under 5 MB.');const image=new Uint8Array(await cover.arrayBuffer());mime=coverType(image);key='covers/'+id+'/'+crypto.randomUUID();await bucket.put(key,image,{httpMetadata:{contentType:mime}})}
 const result=await db.prepare('UPDATE books SET title=?,author=?,chapter_count=?,cover_key=?,mime=?,catalogue_key=NULL WHERE id=? AND NOT EXISTS (SELECT 1 FROM ratings WHERE book=? AND chapter>?) AND NOT EXISTS (SELECT 1 FROM chapter_reviews WHERE book=? AND (chapter>? OR spoiler>?))').bind(title,author,count,key,mime,id,id,count,id,count,count).run();
 if(!result.meta.changes)throw new RequestError(409,'Cannot remove chapters referenced by ratings or reviews. Existing reader data has been preserved.');
 return catalogueResponse({ok:true});
 }catch(e){return catalogueError(e)}}
