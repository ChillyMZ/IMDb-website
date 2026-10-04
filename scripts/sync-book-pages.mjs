import {writeFile} from 'node:fs/promises';
const base='https://ysxaabrbngghbhfdfcqy.supabase.co/functions/v1/chillymz-api/catalogue';
const headers={apikey:'sb_publishable_ehLRNJ1i5K6QNKYVfVkOZg_CTmzsXrh',Origin:'https://chillymz.github.io'};
const books=[];let pages=1;
for(let page=1;page<=pages;page++){
 let data;
 for(let attempt=0;attempt<2;attempt++){try{const response=await fetch(base+'?sort=Title&page='+page,{headers,signal:AbortSignal.timeout(45000)});if(!response.ok)throw Error('Catalogue HTTP '+response.status);data=await response.json();break}catch(error){if(attempt===1)throw error}}
 if(!Array.isArray(data.books)||!Number.isInteger(data.pages)||data.pages<1)throw Error('Invalid catalogue response');
 pages=data.pages;books.push(...data.books);
}
if(!books.length)throw Error('Refusing to publish an empty book directory');
const slug=text=>text.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const rows=books.map(b=>({id:b.id,title:b.title,author:b.author,chapter_count:b.chapter_count,cover_key:b.cover||'',source_url:b.source_url||'',chapter_note:b.chapter_note||'',slug:slug(b.title+' '+b.author),cover:b.cover||''}));
if(new Set(rows.map(b=>b.slug)).size!==rows.length)throw Error('Book slugs must be unique');
await writeFile('app/books/catalogue.json',JSON.stringify(rows,null,2)+'\n');
console.log('Prepared '+rows.length+' searchable book pages');
