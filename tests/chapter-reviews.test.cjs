const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),ts=require('typescript'),{DatabaseSync}=require('node:sqlite');
test('chapter review edits persist and deletion is author-only',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'chapterd-test-'));const filename=path.join(dir,'data.sqlite');let sql=new DatabaseSync(filename);
 sql.exec(fs.readFileSync('drizzle/0000_secret_taskmaster.sql','utf8'));sql.exec(fs.readFileSync('drizzle/0001_chilly_bushwacker.sql','utf8'));sql.exec(fs.readFileSync('drizzle/0002_starter_books.sql','utf8'));sql.exec(fs.readFileSync('drizzle/0003_wonderful_sleeper.sql','utf8'));
 sql.exec(fs.readFileSync('drizzle/0004_natural_medusa.sql','utf8'));
 sql.exec(fs.readFileSync('drizzle/0006_volatile_rhodey.sql','utf8'));
 let current={id:'reader-1',email:'reader@example.test',name:'Reader'};const objects=new Map();
 const db={prepare(q){return {bind(...args){return {async run(){const r=sql.prepare(q).run(...args);return {meta:{changes:Number(r.changes)}}},async first(){return sql.prepare(q).get(...args)||null},async all(){return {results:sql.prepare(q).all(...args)}}}},async all(){return {results:sql.prepare(q).all()}}}}};
 const bucket={async put(key,bytes,meta){objects.set(key,{body:bytes,meta})},async get(key){return objects.get(key)||null}};
 const cache={};function load(file){if(cache[file])return cache[file];const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const module={exports:{}};const req=(s)=>{if(s==='next/headers')return {headers:async()=>new Headers(current?{'oai-authenticated-user-id':current.id}: {})};if(s.endsWith('chatgpt-auth'))return {getChatGPTUser:async()=>current?{email:current.email,fullName:current.name}:null};if(s.endsWith('core-store'))return {storage:()=>({db,bucket})};if(s.endsWith('catalogue-service'))return load('app/catalogue-service.ts');if(s.endsWith('core-service'))return load('app/core-service.ts');if(s.endsWith('request-guard'))return load('app/request-guard.ts');if(s.endsWith('moderation'))return load('app/moderation.ts');throw Error(s)};new Function('require','module','exports',output)(req,module,module.exports);cache[file]=module.exports;return module.exports}
 const api=load('app/api/chapter-reviews/route.ts');
 const post=body=>api.POST(new Request('https://example.test/api/chapter-reviews',{method:'POST',headers:{origin:'https://example.test','content-type':'application/json'},body:JSON.stringify(body)}));
 const get=()=>api.GET(new Request('https://example.test/api/chapter-reviews?book=gutenberg-11&chapter=1'));
 current=null;assert.equal((await get()).status,401);
 current={id:'reader-1',email:'reader@example.test',name:'Reader'};
 const review={action:'save',book:'gutenberg-11',chapter:1,body:'A strong opening.',spoiler:3};
 assert.equal((await post(review)).status,200);
 assert.equal((await post({...review,body:'Updated review.'})).status,200);
 assert.equal((await post({...review,spoiler:13})).status,400);
 assert.equal((await post({...review,chapter:13})).status,404);
 current={id:'other',email:'other@example.test',name:'Other'};
 assert.equal((await post({action:'delete',book:'gutenberg-11',chapter:1,user:'reader-1'})).status,403);
 sql.close();sql=new DatabaseSync(filename);
 const saved=await (await get()).json();assert.equal(saved.reviews.length,1);assert.equal(saved.reviews[0].body,'Updated review.');assert.equal(saved.reviews[0].spoiler,3);
 current={id:'reader-1',email:'reader@example.test',name:'Reader'};
 assert.equal((await post({action:'delete',book:'gutenberg-11',chapter:1})).status,200);assert.equal((await (await get()).json()).reviews.length,0);
 sql.close();
});
