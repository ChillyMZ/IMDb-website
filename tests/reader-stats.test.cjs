const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');

// Minimal TS/TSX loader: transpiles app modules to CommonJS and resolves relative imports.
const cache={};
function load(file){
 file=path.resolve(file);if(cache[file])return cache[file].exports;
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const mod={exports:{}};cache[file]=mod;
 const req=id=>{if(!id.startsWith('.'))return require(id);const base=path.resolve(path.dirname(file),id);for(const ext of ['','.ts','.tsx'])if(fs.existsSync(base+ext)&&fs.statSync(base+ext).isFile())return load(base+ext);throw Error('Cannot resolve '+id)};
 new Function('require','module','exports',out)(req,mod,mod.exports);return mod.exports;
}
const stats=load('app/live/stats.ts');

test('comparison removes the reader’s own vote from the community average',()=>{
 // Two readers: this reader 9, another 7 → API average 8 over 2 votes.
 const c=stats.compareRating(4,9,{average:8,count:2});
 assert.equal(c.others,7);assert.equal(c.othersCount,1);
 assert.equal(stats.verdict(c),'Way kinder than other readers.');
 assert.equal(stats.verdict(stats.compareRating(4,7.2,{average:7.1,count:3})),'Right in step with other readers.');
 assert.equal(stats.verdict(stats.compareRating(4,6,{average:7,count:3})),'A little tougher than other readers.');
});

test('first reader on a chapter sees the estimate, never their own score as consensus',()=>{
 const c=stats.compareRating(2,8.5,{average:8.5,count:1},7);
 assert.equal(c.others,undefined);assert.equal(c.othersCount,0);assert.equal(c.estimate,7);
 assert.match(stats.verdict(c),/first reader/);
});

test('streaks count consecutive local days and survive until the end of today',()=>{
 const day=(d,h=12)=>new Date(2026,10,d,h).toISOString();
 const today=new Date(2026,10,18,9);
 assert.deepEqual(stats.streaks([day(17),day(16),day(16,20),day(10),day(11),day(12),day(13)],today),{current:2,best:4});
 assert.deepEqual(stats.streaks([day(18)],today),{current:1,best:1});
 assert.deepEqual(stats.streaks([day(15)],today),{current:0,best:1});
 assert.deepEqual(stats.streaks([],today),{current:0,best:0});
});

test('reader stats summarise ratings and ignore unavailable books',()=>{
 const books=[{id:'a',title:'Alpha',author:'X',chapter_count:2},{id:'b',title:'Beta',author:'Y',chapter_count:10}];
 const mine=[{book:'a',chapter:1,score:9.8,date:'2026-11-10T10:00:00Z'},{book:'a',chapter:2,score:4,date:'2026-11-11T10:00:00Z'},{book:'b',chapter:3,score:7.5,date:'2026-11-12T10:00:00Z'},{book:'gone',chapter:1,score:1,date:'2026-11-12T10:00:00Z'}];
 const s=stats.readerStats(mine,books,new Date(2026,10,18));
 assert.equal(s.total,3);assert.equal(s.books,2);assert.equal(s.finished,1);
 assert.equal(s.average.toFixed(2),'7.10');
 assert.equal(s.kindest.title,'Alpha');assert.equal(s.kindest.chapter,1);
 assert.equal(s.harshest.score,4);
 assert.deepEqual(s.favourites.map(r=>r.score),[9.8,7.5,4]);
 assert.equal(s.recent[0].book,'b');assert.equal(s.progress[0].book.id,'b');
 const count=label=>s.bands.find(b=>b.label.includes(label)).count;
 assert.equal(count('Cinema'),1);assert.equal(count('Mid'),1);assert.equal(count('Garbage'),1);
 assert.equal(stats.readerStats([mine[0]],books).harshest,undefined);
});

test('comparison card and stats page render',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const Compare=load('app/live/rating-compare.tsx').default,Stats=load('app/live/reader-stats.tsx').default;
 const card=renderToStaticMarkup(React.createElement(Compare,{result:stats.compareRating(5,8.5,{average:7.85,count:3}),title:'Alpha',onClose(){}}));
 assert.match(card,/Chapter 5 · Alpha/);assert.match(card,/8\.5/);assert.match(card,/7\.5/);assert.match(card,/\+1\.0/);assert.match(card,/2 other readers/);
 const page=renderToStaticMarkup(React.createElement(Stats,{name:'Mia',mine:[{book:'a',chapter:1,score:9,date:'2026-11-10T10:00:00Z'}],books:[{id:'a',title:'Alpha',author:'X',chapter_count:3}],onOpen(){},onBrowse(){}}));
 assert.match(page,/Mia’s chapter story/);assert.match(page,/Download stats card/);assert.match(page,/Continue · Chapter 2/);
 const empty=renderToStaticMarkup(React.createElement(Stats,{name:'Mia',mine:[],books:[],onOpen(){},onBrowse(){}}));
 assert.match(empty,/Rate your first chapter/);
});

const progress=load('migration/supabase/functions/chillymz-api/progress.ts');
const rate=(book,chapter,date)=>({book,chapter,date});

test('levels start at 0, 100, 250, 450 XP',()=>{
 assert.deepEqual([1,2,3,4,5].map(progress.levelStart),[0,100,250,450,700]);
 assert.equal(progress.levelOf(0),1);assert.equal(progress.levelOf(99),1);assert.equal(progress.levelOf(100),2);assert.equal(progress.levelOf(449),3);assert.equal(progress.levelOf(450),4);
});

test('XP caps ratings at 20 and reviews at 5 per day, and counts finished books once',()=>{
 const books=new Map([['big',80],['short',2]]);
 // 30 chapters of one book in a day: only 20 earn XP. The next day's 5 all count.
 const binge=[...Array.from({length:30},(_,i)=>rate('big',i+1,'2026-11-20T10:00:00Z')),...Array.from({length:5},(_,i)=>rate('big',31+i,'2026-11-21T09:00:00Z'))];
 const p=progress.readerProgress(binge,[],books,'2026-11-21T12:00:00Z');
 assert.equal(p.xp,25*10);assert.equal(p.ratingsToday,5);assert.equal(p.finished,0);
 // Finishing the 2-chapter book adds the 50 XP bonus; ratings on unapproved/removed books earn nothing.
 const done=progress.readerProgress([rate('short',1,'2026-11-01T00:00:00Z'),rate('short',2,'2026-11-01T00:00:00Z'),rate('gone',1,'2026-11-01T00:00:00Z')],[],books,'2026-11-21T12:00:00Z');
 assert.equal(done.xp,2*10+50);assert.equal(done.finished,1);assert.equal(done.level,1);
 // 7 reviews on one day: 5 count.
 const reviews=Array.from({length:7},()=>({updated:'2026-11-21T08:00:00Z'}));
 assert.equal(progress.readerProgress([],reviews,books).xp,5*25);
});

test('comparison card reports XP gained, level-ups and the daily limit',()=>{
 const before={xp:90,level:1,levelXp:0,nextXp:100,ratingsToday:3,ratingCap:20,finished:0};
 const up=stats.xpGain(before,{...before,xp:100,level:2,levelXp:100,nextXp:250,ratingsToday:4},true);
 assert.equal(stats.xpLine(up),'+10 XP · Level up! You’re now Level 2.');
 assert.equal(stats.xpLine(stats.xpGain(before,{...before,xp:150,level:2},true)).startsWith('+60 XP'),true);
 assert.equal(stats.xpLine(stats.xpGain(before,before,false)),'',"re-rating shows nothing");
 assert.match(stats.xpLine(stats.xpGain({...before,ratingsToday:20},{...before,ratingsToday:20},true)),/Daily XP limit reached/);
 assert.equal(stats.xpGain(undefined,before,true),undefined);
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const Compare=load('app/live/rating-compare.tsx').default,Stats=load('app/live/reader-stats.tsx').default;
 const card=renderToStaticMarkup(React.createElement(Compare,{result:{...stats.compareRating(5,8.5,{average:7.85,count:3}),xp:up},onClose(){}}));
 assert.match(card,/Level up! You’re now Level 2/);
 const page=renderToStaticMarkup(React.createElement(Stats,{name:'Mia',progress:{xp:320,level:3,levelXp:250,nextXp:450,ratingsToday:4,ratingCap:20,finished:1},mine:[{book:'a',chapter:1,score:9,date:'2026-11-10T10:00:00Z'}],books:[{id:'a',title:'Alpha',author:'X',chapter_count:3}],onOpen(){},onBrowse(){}}));
 assert.match(page,/Level 3/);assert.match(page,/320 XP/);assert.match(page,/130 XP to Level 4/);assert.match(page,/4 of 20 chapters earning XP/);
});
