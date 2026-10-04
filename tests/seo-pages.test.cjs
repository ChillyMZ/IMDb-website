const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const books=JSON.parse(fs.readFileSync('app/books/catalogue.json','utf8'));
test('every approved book exports readable content and a canonical page',()=>{
 assert.ok(books.length>=52);const sitemap=fs.readFileSync('out/sitemap.xml','utf8');
 for(const b of books){const html=fs.readFileSync('out/books/'+b.slug+'/index.html','utf8');assert.ok(html.includes('chapter ratings'));assert.ok(html.includes('rel="canonical"'));assert.ok(html.includes('/books/'+b.slug+'/'));assert.ok(html.replace(/<!--.*?-->/g,'').includes('Chapter '+b.chapter_count));assert.match(html,/<meta name="robots" content="index, follow"/);assert.ok(sitemap.includes('/books/'+b.slug+'/'));assert.match(html,/application\/ld\+json/)}
});
test('public pages allow indexing while authentication pages do not',()=>{
 assert.match(fs.readFileSync('out/index.html','utf8'),/<meta name="robots" content="index, follow"/);
 assert.match(fs.readFileSync('out/login/index.html','utf8'),/<meta name="robots" content="noindex, follow"/);
 assert.match(fs.readFileSync('out/robots.txt','utf8'),/Sitemap: https:\/\/chillymz.github.io\/IMDb-website\/sitemap.xml/);
});
