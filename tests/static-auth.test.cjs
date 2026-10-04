const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
test('Pages export includes public and authentication pages',()=>{
 for(const path of ['index.html','login/index.html','privacy/index.html','terms/index.html','cookies/index.html','404.html'])assert.ok(fs.existsSync('out/'+path),path);
 assert.match(fs.readFileSync('out/login/index.html','utf8'),/Forgot password/);
 assert.doesNotMatch(fs.readFileSync('out/privacy/index.html','utf8'),/example\.invalid|OpenAI Sites/);
});
test('API bridge handles Pages paths, reader tokens and sign-out',async()=>{
 const js=ts.transpileModule(fs.readFileSync('app/live/supabase-browser.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const storage=new Map(),calls=[],handlers={},exports={};
 const location={hostname:'chillymz.github.io',origin:'https://chillymz.github.io',href:'https://chillymz.github.io/IMDb-website/',pathname:'/IMDb-website/'};
 const window={fetch:async(url,init)=>{calls.push({url:String(url),init});return Response.json({ok:true})}};
 vm.runInNewContext(js,{exports,window,location,document:{addEventListener:(event,fn)=>{handlers[event]=fn}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},Headers,URL,Request,Response,Date,JSON});
 exports.installApiProxy();exports.saveSession({access_token:'test-session',expires_in:3600});
 await window.fetch('/api/core?book=gutenberg-11');
 assert.match(calls[0].url,/\/functions\/v1\/chillymz-api\/core\?book=gutenberg-11$/);
 assert.equal(calls[0].init.headers.get('Authorization'),'Bearer test-session');
 await exports.signOut();assert.equal(exports.currentSession(),null);
 location.href='/IMDb-website/login/?return_to=test';
 await handlers.click({defaultPrevented:true,target:{closest:()=>({href:'https://chillymz.github.io/IMDb-website/#sign-in'})},preventDefault:()=>{throw Error('Already handled click intercepted')}});
 assert.equal(location.href,'/IMDb-website/login/?return_to=test');
 location.href='https://chillymz.github.io/IMDb-website/';
 let prevented=false;handlers.click({target:{closest:()=>({href:'https://chillymz.github.io/privacy'})},preventDefault:()=>{prevented=true}});
 assert.equal(location.href,'/IMDb-website/privacy');assert.equal(prevented,true);
});
