import {headers} from 'next/headers';
import {getChatGPTUser} from '../../chatgpt-auth';
import {storage} from '../../core-store';
import {OWNER_EMAIL,RequestError,requireAdmin,validBook,validateRating,coverType} from '../../core-service';
import {mayPost,inspectContent} from '../../moderation';
import {readJson,limitRequests,boundedBody} from '../../request-guard';
import {bookCover} from '../../catalogue-service';
export const dynamic='force-dynamic';
async function identity(){const u=await getChatGPTUser();const h=await headers();const id=h.get('oai-authenticated-user-id');if(!u||!id)throw new RequestError(401,'Sign in to continue.');return {id,name:u.fullName||'Reader',admin:u.email.toLowerCase()===OWNER_EMAIL}}
function respond(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}})}
function failure(e:unknown){if(e instanceof RequestError)return respond({error:e.message},e.status);console.error('Core storage operation failed',e);return respond({error:'Could not access saved data. Your form is still here; please retry.'},503)}
export async function GET(request?:Request){try{
 const user=await identity(),{db}=storage();
 const selected=request?new URL(request.url).searchParams.get('book')||'':'';
 await db.prepare('INSERT INTO profiles (id,name,bio) VALUES (?, ?, ?) ON CONFLICT(id) DO NOTHING').bind(user.id,user.name,'').run();
 const profile=await db.prepare('SELECT name,bio FROM profiles WHERE id=?').bind(user.id).first();
 const rows=await db.prepare("SELECT * FROM books WHERE (status<>'approved' AND (owner=? OR ?=1)) OR (status='approved' AND (id=? OR id IN (SELECT book FROM ratings WHERE user=?))) ORDER BY created DESC").bind(user.id,user.admin?1:0,selected,user.id).all();
 const totals=await db.prepare("SELECT r.book,r.chapter,AVG(r.score)/10.0 AS average,COUNT(*) AS count FROM ratings r JOIN books b ON r.book=b.id WHERE b.status='approved' AND r.book=? GROUP BY r.book,r.chapter").bind(selected).all();
 const distribution=await db.prepare("SELECT r.book,CAST((r.score-1)/10 AS INTEGER)+1 AS band,COUNT(*) AS count FROM ratings r JOIN books b ON r.book=b.id WHERE b.status='approved' AND r.book=? GROUP BY r.book,band").bind(selected).all();
 const mine=await db.prepare('SELECT book,chapter,score/10.0 AS score,date FROM ratings WHERE user=?').bind(user.id).all();
 return respond({user:{id:user.id,admin:user.admin,...profile},books:rows.results.map(bookCover),totals:totals.results,distribution:distribution.results,mine:mine.results});
 }catch(e){return failure(e)}}
export async function POST(request:Request){try{
 const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)throw new RequestError(403,'Invalid request origin.');
 const user=await identity(),{db,bucket}=storage();await mayPost(user.id);
 if(request.headers.get('content-type')?.includes('multipart/form-data')){
 if(Number(request.headers.get('content-length')||0)>6*1024*1024)throw new RequestError(413,'Cover must be under 5 MB.');
 await limitRequests(user.id,'book-submission',5,3600);
 const bytesBody=await boundedBody(request,6*1024*1024);const form=await new Response(bytesBody,{headers:{'Content-Type':request.headers.get('content-type')!}}).formData();const {title,author,count}=validBook(Object.fromEntries(form));const file=form.get('cover');
 if(!(file instanceof File)||file.size===0||file.size>5*1024*1024)throw new RequestError(400,'Choose a cover under 5 MB.');
 const bytes=new Uint8Array(await file.arrayBuffer()),mime=coverType(bytes);
 const id=String(form.get('id')||'');if(!/^[a-f0-9-]{36}$/.test(id))throw new RequestError(400,'Invalid submission ID.');
 const existing=await db.prepare('SELECT owner FROM books WHERE id=?').bind(id).first();if(existing){if(existing.owner!==user.id)throw new RequestError(409,'Submission ID already used.');return respond({ok:true,id})}
 const coverKey='covers/'+id;
 await bucket.put(coverKey,bytes,{httpMetadata:{contentType:mime}});
 await db.prepare("INSERT INTO books (id,owner,title,author,chapter_count,cover_key,mime,status,created) VALUES (?,?,?,?,?,?,?,'pending',?)").bind(id,user.id,title,author,count,coverKey,mime,new Date().toISOString()).run();
 return respond({ok:true,id});
 }
 const data=await readJson(request);await limitRequests(user.id,'account-write',180);
 if(data.action==='profile'){const name=String(data.name||'').trim(),bio=String(data.bio||'');if(!name||name.length>80||bio.length>500)throw new RequestError(400,'Use a name under 80 and bio under 500 characters.');const held=await inspectContent(user.id,'profile',user.id,name+'\n'+bio);await db.prepare('INSERT INTO profiles (id,name,bio) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,bio=excluded.bio').bind(user.id,name,bio).run();return respond({ok:true,held})}
 if(data.action==='review'){requireAdmin(user);if(!['approved','rejected'].includes(data.status))throw new RequestError(400,'Invalid decision.');const result=await db.prepare("UPDATE books SET status=? WHERE id=? AND status='pending'").bind(data.status,data.book).run();if(!result.meta.changes)throw new RequestError(409,'This submission has already been reviewed or is missing.');return respond({ok:true})}
 if(data.action==='rate'){const b=await db.prepare("SELECT chapter_count FROM books WHERE id=? AND status='approved'").bind(data.book).first();if(!b)throw new RequestError(404,'Book is not approved.');const score=validateRating(data.chapter,data.score,b.chapter_count);await db.prepare('INSERT INTO ratings (user,book,chapter,score,date) VALUES (?,?,?,?,?) ON CONFLICT(user,book,chapter) DO UPDATE SET score=excluded.score,date=excluded.date').bind(user.id,data.book,data.chapter,score,new Date().toISOString()).run();return respond({ok:true})}
 throw new RequestError(400,'Unknown action.');
 }catch(e){return failure(e)}}
