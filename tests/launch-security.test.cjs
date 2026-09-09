const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),{DatabaseSync}=require('node:sqlite');
test('consent, owner analytics, bounded bodies, request limits and HTTPS',async()=>{
 const sql=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 let current={id:'reader',email:'reader@example.test',name:'Reader'};
 const db={prepare(q){const make=(args=[])=>({bind(...v){return make(v)},async all(){return {results:sql.prepare(q).all(...args)}},async first(){return sql.prepare(q).get(...args)||null},async run(){const r=sql.prepare(q).run(...args);return {meta:{changes:Number(r.changes)}}}});return make()},async batch(commands){sql.exec('BEGIN');try{const out=[];for(const c of commands)out.push(await c.run());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}};
 const cache={};function load(file){file=path.resolve(file);if(cache[file])return cache[file];const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,module={exports:{}};const req=s=>{if(s==='next/headers')return {headers:async()=>new Headers(current?{'oai-authenticated-user-id':current.id}:{})};if(s.endsWith('chatgpt-auth'))return {getChatGPTUser:async()=>current?{email:current.email,fullName:current.name}:null};if(s.endsWith('core-store'))return {storage:()=>({db,bucket:{}})};if(s.startsWith('.'))return load(path.resolve(path.dirname(file),s)+'.ts');throw Error(s)};new Function('require','module','exports',output)(req,module,module.exports);return cache[file]=module.exports}
 const api=load('app/api/analytics/route.ts'),guard=load('app/request-guard.ts'),security=load('app/security.ts');
 const post=(headers={},body=JSON.stringify({view:'books',loadMs:1000}))=>api.POST(new Request('https://example.test/api/analytics',{method:'POST',headers:{origin:'https://example.test','content-type':'application/json',...headers},body}));
 assert.equal((await (await post()).json()).recorded,false);
 assert.equal((await (await post({cookie:'chillymz_metrics=allow','Sec-GPC':'1'})).json()).recorded,false);
 assert.equal(sql.prepare('SELECT COUNT(*) n FROM usage_daily').get().n,0);
 assert.equal((await post({cookie:'chillymz_metrics=allow'})).status,200);
 assert.equal(sql.prepare('SELECT visits FROM usage_daily').get().visits,1);
 assert.equal((await api.GET()).status,403);
 current={id:'owner',email:'owner@example.invalid',name:'Owner'};
 assert.equal((await api.GET()).status,200);
 assert.equal((await post({cookie:'chillymz_metrics=allow'},'{')).status,400);
 assert.equal((await post({cookie:'chillymz_metrics=allow'},JSON.stringify({view:'books',extra:'x'.repeat(1100)}))).status,413);
 await guard.limitRequests('test','writes',2);await guard.limitRequests('test','writes',2);
 await assert.rejects(()=>guard.limitRequests('test','writes',2),e=>e.status===429);
 sql.prepare('UPDATE request_limits SET expires=0 WHERE key=?').run('test:writes');
 await guard.limitRequests('test','writes',2);
 assert.equal(security.httpsRedirect(new Request('http://chillymz.example.invalid/')).status,308);
 assert.equal(security.httpsRedirect(new Request('http://localhost:4173/')),null);
 assert.equal(security.secureResponse(new Request('https://example.test'),new Response('ok')).headers.get('X-Robots-Tag'),'noindex, nofollow');
 sql.close();
});
