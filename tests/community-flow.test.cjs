const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),ts=require('typescript'),{DatabaseSync}=require('node:sqlite');
test('community posts, replies and unique votes survive reload; unauthorized deletion denied',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'chapterd-test-'));const filename=path.join(dir,'data.sqlite');let sql=new DatabaseSync(filename);
 sql.exec(fs.readFileSync('drizzle/0000_secret_taskmaster.sql','utf8'));sql.exec(fs.readFileSync('drizzle/0001_chilly_bushwacker.sql','utf8'));
 sql.exec(fs.readFileSync('drizzle/0004_natural_medusa.sql','utf8'));
 sql.exec(fs.readFileSync('drizzle/0006_volatile_rhodey.sql','utf8'));
 let current={id:'reader-1',email:'reader@example.test',name:'Reader'};const objects=new Map();
 const db={prepare(q){return {bind(...args){return {async run(){const r=sql.prepare(q).run(...args);return {meta:{changes:Number(r.changes)}}},async first(){return sql.prepare(q).get(...args)||null},async all(){return {results:sql.prepare(q).all(...args)}}}},async all(){return {results:sql.prepare(q).all()}}}}};
 const bucket={async put(key,bytes,meta){objects.set(key,{body:bytes,meta})},async get(key){return objects.get(key)||null}};
 const cache={};function load(file){if(cache[file])return cache[file];const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const module={exports:{}};const req=(s)=>{if(s==='next/headers')return {headers:async()=>new Headers(current?{'oai-authenticated-user-id':current.id}: {})};if(s.endsWith('chatgpt-auth'))return {getChatGPTUser:async()=>current?{email:current.email,fullName:current.name}:null};if(s.endsWith('core-store'))return {storage:()=>({db,bucket})};if(s.endsWith('catalogue-service'))return load('app/catalogue-service.ts');if(s.endsWith('core-service'))return load('app/core-service.ts');if(s.endsWith('request-guard'))return load('app/request-guard.ts');if(s.endsWith('moderation'))return load('app/moderation.ts');throw Error(s)};new Function('require','module','exports',output)(req,module,module.exports);cache[file]=module.exports;return module.exports}
 const api=load('app/api/community/route.ts');
 const post=body=>api.POST(new Request('https://example.test/api/community',{method:'POST',headers:{origin:'https://example.test','content-type':'application/json'},body:JSON.stringify(body)}));
 current=null;assert.equal((await api.GET()).status,401);
 current={id:'reader-1',email:'reader@example.test',name:'Reader'};
 assert.equal((await post({action:'post',title:'',body:'test',topic:'Book talk'})).status,400);
 const created=await post({action:'post',title:'What are you reading?',body:'Share a recommendation.',topic:'Recommendations',spoiler:true});
 assert.equal(created.status,200);const {id}=await created.json();
 assert.equal((await post({action:'vote',post:id,value:true})).status,200);
 assert.equal((await post({action:'vote',post:id,value:true})).status,200);
 assert.equal((await post({action:'comment',post:id,body:'A new fantasy novel.'})).status,200);
 current={id:'other',email:'other@example.test',name:'Other'};
 assert.equal((await post({action:'delete',post:id})).status,403);
 sql.close();sql=new DatabaseSync(filename);
 const saved=await (await api.GET()).json();assert.equal(saved.posts.length,1);assert.equal(saved.posts[0].votes,1);assert.equal(saved.posts[0].replies,1);assert.equal(saved.posts[0].spoiler,1);assert.equal(saved.comments[0].body,'A new fantasy novel.');assert.equal(saved.posts[0].voted,0);
 sql.close();
});
