// Streak reminder timing (migration/supabase/functions/chillymz-reminders/streak.ts).
const test=require('node:test'),assert=require('node:assert');const fs=require('fs'),path=require('path'),ts=require('typescript');
const src=fs.readFileSync(path.join(__dirname,'../migration/supabase/functions/chillymz-reminders/streak.ts'),'utf8');
const mod={exports:{}};new Function('module','exports',ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(mod,mod.exports);
const {shouldRemind,localDay,streakToYesterday}=mod.exports;
const at=(iso)=>Date.parse(iso);
test('reminds at 7pm local when yesterday was active and today is not',()=>{
 const days=new Set(['2026-11-23','2026-11-24']);
 assert.deepEqual(shouldRemind({now:at('2026-11-25T19:10:00Z'),tz:0,days,lastSent:null}),{today:'2026-11-25',streak:2});
 assert.equal(shouldRemind({now:at('2026-11-25T18:10:00Z'),tz:0,days,lastSent:null}),null,'too early');
 assert.equal(shouldRemind({now:at('2026-11-25T19:10:00Z'),tz:0,days,lastSent:'2026-11-25'}),null,'already sent');
 assert.equal(shouldRemind({now:at('2026-11-25T19:10:00Z'),tz:0,days:new Set([...days,'2026-11-25']),lastSent:null}),null,'already active today');
 assert.equal(shouldRemind({now:at('2026-11-25T19:10:00Z'),tz:0,days:new Set(['2026-11-20']),lastSent:null}),null,'no streak to lose');
});
test('uses the reader’s time zone',()=>{
 // 00:30 UTC on the 26th is 7:30pm on the 25th in New York (UTC-5).
 assert.equal(localDay('2026-11-26T00:30:00Z',-300),'2026-11-25');
 assert.deepEqual(shouldRemind({now:at('2026-11-26T00:30:00Z'),tz:-300,days:new Set(['2026-11-24']),lastSent:null}),{today:'2026-11-25',streak:1});
 assert.equal(streakToYesterday(new Set(['2026-11-22','2026-11-23','2026-11-24']),'2026-11-25'),3);
});
