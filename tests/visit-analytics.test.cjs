const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm');
function compile(path){return ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText}
function load(path,extra={}){const module={exports:{}};vm.runInNewContext(compile(path),{module,exports:module.exports,...extra});return module.exports}
test('return visits connect signed-in devices and distinguish guests; immature cohorts stay empty',()=>{
 const {summarizeVisits}=load('migration/supabase/functions/chillymz-analytics/summary.ts');
 const e=(session,visitor,created,view,event='view',reader=null)=>({session,visitor,created,view,event,reader,durationMs:1000,device:'mobile',source:'instagram'});
 const s=summarizeVisits([e('a','v1','2026-01-01T10:00:00Z','books'),e('a','v1','2026-01-01T10:01:00Z','chapter','rating_saved','r'),e('b','v2','2026-01-02T10:00:00Z','chapter','view','r'),e('c','guest','2026-01-10T10:00:00Z','books')],Date.parse('2026-02-05T00:00:00Z'));
 assert.equal(s.totals.visits,3);assert.equal(s.totals.visitors,2);assert.equal(s.totals.returning,1);assert.equal(s.totals.ratingVisits,1);assert.equal(s.retention[0].returned,1);assert.equal(s.retention[0].eligible,2);assert.equal(s.sections.reduce((n,x)=>n+x.visibleMs,0),4000);
 assert.equal(summarizeVisits([e('a','b',new Date().toISOString(),'books')]).retention[0].eligible,0);
});
test('analytics requires renewed consent, respects privacy signals and clears identifiers on withdrawal',()=>{
 const values=new Map(),listeners={},sent=[];
 const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 const document={cookie:'chillymz_metrics=allow',visibilityState:'visible',referrer:'',addEventListener:()=>{}};
 const navigator={doNotTrack:'0',globalPrivacyControl:false};
 const api=load('app/analytics-client.ts',{document,navigator,localStorage:storage,sessionStorage:storage,crypto:require('node:crypto').webcrypto,performance:{now:()=>100,getEntriesByType:()=>[]},location:{pathname:'/',hostname:'chillymz.github.io'},matchMedia:()=>({matches:true}),window:{addEventListener:(n,fn)=>listeners[n]=fn},setInterval:()=>0,fetch:(_u,o)=>{sent.push(JSON.parse(o.body));return Promise.resolve()}});
 api.trackView('books');assert.equal(sent.length,0);assert.equal(values.size,0);
 document.cookie+='; chillymz_metrics_version=2';api.trackView('book',{book:'00000000-0000-4000-8000-000000000001'});assert.equal(sent.length,1);assert.equal(values.size,2);assert.ok(sent[0].visitor);assert.equal(sent[0].consent,2);
 navigator.globalPrivacyControl=true;api.trackEvent('view');assert.equal(sent.length,1);
 navigator.globalPrivacyControl=false;api.installAnalytics();document.cookie='chillymz_metrics=deny; chillymz_metrics_version=2';listeners['chillymz-consent']();assert.equal(values.size,0);
});
