const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),{DatabaseSync}=require('node:sqlite');
test('book requests require verification and owner edits preserve reader data',async()=>{
 const sql=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 let current={id:'reader',email:'reader@example.test',name:'Reader'};
 const db={prepare(q){const make=(args=[])=>({bind(...v){return make(v)},async all(){return {results:sql.prepare(q).all(...args)}},async first(){return sql.prepare(q).get(...args)||null},async run(){const r=sql.prepare(q).run(...args);return {meta:{changes:Number(r.changes)}}}});return make()},async batch(commands){sql.exec('BEGIN');try{const out=[];for(const c of commands)out.push(await c.run());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}};
 const cache={};function load(file){file=path.resolve(file);if(cache[file])return cache[file];const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,module={exports:{}};const req=s=>{if(s==='next/headers')return {headers:async()=>new Headers(current?{'oai-authenticated-user-id':current.id}:{})};if(s.endsWith('chatgpt-auth'))return {getChatGPTUser:async()=>current?{email:current.email,fullName:current.name}:null};if(s.endsWith('core-store'))return {storage:()=>({db,bucket:{}})};if(s.startsWith('.'))return load(path.resolve(path.dirname(file),s)+'.ts');throw Error(s)};new Function('require','module','exports',output)(req,module,module.exports);return cache[file]=module.exports}
 const core=load('app/api/core/route.ts'),edit=load('app/api/book-edit/route.ts'),links=load('app/live/reading-links.ts');
 const post=body=>core.POST(new Request('https://example.test/api/core',{method:'POST',headers:{origin:'https://example.test','content-type':'application/json'},body:JSON.stringify(body)}));
 const update=(id,count)=>{const f=new FormData();f.set('id',id);f.set('title','Corrected title');f.set('author','Corrected author');f.set('chapterCount',String(count));return edit.POST(new Request('https://example.test/api/book-edit',{method:'POST',headers:{origin:'https://example.test'},body:f}))};
 assert.equal((await update('gutenberg-11',20)).status,403);
 const requested=await post({action:'request-book',title:'Missing title'});assert.equal(requested.status,200);const {id}=await requested.json();
 assert.equal((await post({action:'request-book',title:'Missing title'})).status,409);
 assert.equal(sql.prepare('SELECT chapter_count FROM books WHERE id=?').get(id).chapter_count,0);
 current={id:'owner',email:'owner@example.invalid',name:'Owner'};
 assert.equal((await post({action:'review',book:id,status:'approved'})).status,409);
 assert.equal((await update(id,20)).status,200);
 assert.equal((await post({action:'review',book:id,status:'approved'})).status,200);
 current={id:'reader',email:'reader@example.test',name:'Reader'};
 assert.equal((await post({action:'rate',book:id,chapter:20,score:9.7})).status,200);
 current={id:'owner',email:'owner@example.invalid',name:'Owner'};
 assert.equal((await update(id,19)).status,409);
 assert.equal((await update(id,25)).status,200);
 assert.equal(sql.prepare('SELECT score FROM ratings WHERE book=?').get(id).score,97);
 assert.equal(sql.prepare('SELECT chapter_count FROM books WHERE id=?').get(id).chapter_count,25);
 assert.equal(links.nextUnrated(3,[{chapter:1},{chapter:3}]),2);assert.equal(links.nextUnrated(2,[{chapter:1},{chapter:2}]),0);
 global.window={location:{href:'https://example.test/?old=1'}};assert.equal(links.readingLink('book space',25),'https://example.test/?book=book+space&chapter=25');delete global.window;
 sql.close();
});
