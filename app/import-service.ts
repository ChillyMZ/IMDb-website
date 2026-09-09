import {RequestError,validBook} from './core-service';
import type {ImportBook} from './fantasy-batch';
export function importKey(title:string,author:string){const clean=(s:string)=>s.toLowerCase().normalize('NFKD').replace(/\p{M}/gu,'').replace(/[^\p{L}\p{N}]/gu,'');return clean(title).replace('sorcerersstone','philosophersstone')+'|'+clean(author)}
export function validateImport(input:unknown):ImportBook[]{
 if(!Array.isArray(input)||!input.length||input.length>50)throw new RequestError(400,'Choose between 1 and 50 books per batch.');
 return input.map((raw,i)=>{if(!raw||typeof raw!=='object')throw new RequestError(400,`Row ${i+1}: enter book details.`);const b=validBook(raw),sourceUrl=String(raw.sourceUrl||'').trim(),edition=String(raw.edition||'Unabridged English novel').trim(),chapterNote=String(raw.chapterNote||'Numbered narrative chapters only.').trim();
 let url:URL;try{url=new URL(sourceUrl)}catch{throw new RequestError(400,`Row ${i+1}: add a chapter-count source URL.`)}
 if(url.protocol!=='https:'||url.username||url.password||sourceUrl.length>1000)throw new RequestError(400,`Row ${i+1}: use a valid HTTPS source URL.`);
 if(edition.length>200||chapterNote.length>600)throw new RequestError(400,`Row ${i+1}: edition or chapter note is too long.`);
 return {title:b.title,author:b.author,chapterCount:b.count,sourceUrl,edition,chapterNote};});
}
export async function previewImport(db:any,books:ImportBook[]){
 const existing=await db.prepare('SELECT id,title,author,status FROM books').all();
 const keys=new Map<string,any>(existing.results.map((b:any)=>[importKey(b.title,b.author),b]));
 const seen=new Set<string>();
 return books.map(b=>{const key=importKey(b.title,b.author),match=keys.get(key),duplicate=!!match||seen.has(key);seen.add(key);return {...b,key,duplicate,existingId:match?.id||null,status:match?`Already ${match.status}`:duplicate?'Repeated in this batch':'Ready to import'};});
}
