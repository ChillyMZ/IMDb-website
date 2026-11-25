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
 assert.match(page,/Reading stats/);assert.match(page,/Mia/);assert.match(page,/Download stats card/);assert.match(page,/Continue · Chapter 2/);
 const empty=renderToStaticMarkup(React.createElement(Stats,{name:'Mia',mine:[],books:[],onOpen(){},onBrowse(){}}));
 assert.match(empty,/Rate your first chapter/);
});

const progress=load('migration/supabase/functions/chillymz-api/progress.ts');
const rate=(book,chapter,date)=>({book,chapter,date});

test('levels start at 0, 100, 250, 450 XP',()=>{
 assert.deepEqual([1,2,3,4,5].map(progress.levelStart),[0,100,250,450,700]);
 assert.equal(progress.levelOf(0),1);assert.equal(progress.levelOf(99),1);assert.equal(progress.levelOf(100),2);assert.equal(progress.levelOf(449),3);assert.equal(progress.levelOf(450),4);
});

test('XP caps ratings at 20 per day, gives reviews no XP, and counts finished books once',()=>{
 const books=new Map([['big',80],['short',2]]);
 // 30 chapters of one book in a day: only 20 earn XP. The next day's 5 all count.
 const binge=[...Array.from({length:30},(_,i)=>rate('big',i+1,'2026-11-20T10:00:00Z')),...Array.from({length:5},(_,i)=>rate('big',31+i,'2026-11-21T09:00:00Z'))];
 const p=progress.readerProgress(binge,[],books,'2026-11-21T12:00:00Z');
 assert.equal(p.xp,25*100);assert.equal(p.ratingsToday,5);assert.equal(p.finished,0);
 // Finishing the 2-chapter book adds the 50 XP bonus; ratings on unapproved/removed books earn nothing.
 const done=progress.readerProgress([rate('short',1,'2026-11-01T00:00:00Z'),rate('short',2,'2026-11-01T00:00:00Z'),rate('gone',1,'2026-11-01T00:00:00Z')],[],books,'2026-11-21T12:00:00Z');
 assert.equal(done.xp,2*100+500);assert.equal(done.finished,1);assert.equal(done.level,5);
 // 7 reviews on one day: 5 count.
 const reviews=Array.from({length:7},()=>({updated:'2026-11-21T08:00:00Z'}));
 assert.equal(progress.readerProgress([],reviews,books).xp,0); // reviews earn no XP
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

test('without API progress the browser works out rating XP itself; API progress wins when present',()=>{
 const d={mine:[{book:'a',chapter:1,date:'2026-11-20T10:00:00Z'},{book:'a',chapter:2,date:'2026-11-20T10:00:00Z'},{book:'p',chapter:1,date:'2026-11-20T10:00:00Z'}],books:[{id:'a',chapter_count:2,status:'approved'},{id:'p',chapter_count:5,status:'pending'}]};
 const p=stats.progressOf(d);
 assert.equal(p.xp,2*100+500+100+1000+50); // + First Page, Finisher, 1-day streakassert.equal(p.finished,1);assert.equal(p.partial,true); // + First Page and Finisher badge XP
 const server={xp:999,level:6,levelXp:900,nextXp:1300,ratingsToday:0,ratingCap:20,finished:3};
 assert.equal(stats.progressOf({...d,progress:server}),server);
 assert.equal(stats.progressOf(null),undefined);
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),Stats=load('app/live/reader-stats.tsx').default;
 const page=renderToStaticMarkup(React.createElement(Stats,{name:'Mia',progress:p,mine:[{book:'a',chapter:1,score:9,date:'2026-11-20T10:00:00Z'}],books:[{id:'a',title:'Alpha',author:'X',chapter_count:2}],onOpen(){},onBrowse(){}}));
 assert.match(page,/100 XP per chapter, 500 for finishing/);assert.doesNotMatch(page,/per review/);
});

const {readerBadges}=load('migration/supabase/functions/chillymz-api/badges.ts');
const byId=list=>Object.fromEntries(list.map(b=>[b.id,b]));
const at=d=>`2026-11-${String(d).padStart(2,'0')}T12:00:00Z`;

test('Finisher needs every chapter of an approved book; untracked badges are "coming soon"',()=>{
 const chapters=new Map([['a',3],['b',2]]),mine=[{book:'a',chapter:1,score:8,date:at(1)},{book:'a',chapter:2,score:7,date:at(1)}];
 let b=byId(readerBadges({mine,chapters}));
 assert.equal(b.finisher.earned,false);assert.equal(b.finisher.have,2);assert.equal(b.finisher.need,3);
 assert.equal(b.pioneer.earned,null);assert.equal(b['hot-take'].earned,null);assert.equal(b.critic.earned,null);
 b=byId(readerBadges({mine:[...mine,{book:'a',chapter:3,score:9,date:at(2)}],chapters}));
 assert.equal(b.finisher.earned,true);
 // Ratings on books that are not approved never count.
 assert.equal(byId(readerBadges({mine:[{book:'x',chapter:1,score:8,date:at(1)}],chapters:new Map([['b',1]])})).finisher.earned,false);
});

test('Pioneer: first reader on a chapter that showed an estimate',()=>{
 const chapters=new Map([['a',5]]),estimated=(book,ch)=>ch!==5;
 const mine=[{book:'a',chapter:1,score:8,date:at(3)},{book:'a',chapter:5,score:8,date:at(1)}];
 const others=[{user:'me',book:'a',chapter:1,score:8,date:at(3)},{user:'x',book:'a',chapter:1,score:6,date:at(2)}];
 // Chapter 1: someone rated first. Chapter 5: first, but had no estimate. → no badge.
 assert.equal(byId(readerBadges({user:'me',mine,chapters,others,estimated,reviews:[]})).pioneer.earned,false);
 const b=byId(readerBadges({user:'me',mine,chapters,others:[...others,{user:'x',book:'a',chapter:2,score:7,date:at(9)}],estimated,reviews:[],mine:[...mine,{book:'a',chapter:2,score:9,date:at(4)}]}));
 assert.equal(b.pioneer.earned,true);assert.match(b.pioneer.detail,/chapter 2/);
});

test('Hot Take needs a 2-point gap from at least 3 other readers; Critic needs 5 reviews',()=>{
 const chapters=new Map([['a',2]]),mine=[{book:'a',chapter:1,score:9.5,date:at(5)}];
 const three=[7,7.5,7.5].map((score,i)=>({user:'u'+i,book:'a',chapter:1,score,date:at(1)}));
 assert.equal(byId(readerBadges({user:'me',mine,chapters,others:three.slice(0,2),reviews:[]}))['hot-take'].earned,false);
 const b=byId(readerBadges({user:'me',mine,chapters,others:[...three,{user:'me',...mine[0]}],reviews:Array(4).fill({updated:at(1)})}));
 assert.equal(b['hot-take'].earned,true);assert.match(b['hot-take'].detail,/\+2\.2/);
 assert.equal(b.critic.earned,false);assert.equal(b.critic.have,4);
 assert.equal(byId(readerBadges({user:'me',mine,chapters,others:[],reviews:Array(5).fill({updated:at(1)})})).critic.earned,true);
});

test('newBadges only reports badges that flipped from locked to earned',()=>{
 const before=[{id:'finisher',name:'Finisher',earned:false},{id:'pioneer',name:'Pioneer',earned:null}];
 const after=[{id:'finisher',name:'Finisher',earned:true},{id:'pioneer',name:'Pioneer',earned:true}];
 assert.deepEqual(stats.newBadges(before,after),['Finisher']);
});

const searchSummary=load('migration/supabase/functions/chillymz-analytics/summary.ts');
test('search insights keep only clean, non-personal words and rank unmatched searches',()=>{
 const n=searchSummary.normalizeSearch;
 assert.equal(n('  Mistborn!! '),'mistborn');assert.equal(n('THE   Way of Kings'),'the way of kings');
 for(const bad of ['a','me@mail.com','https://x.com','call 5551234567',42,'x'.repeat(81)])assert.equal(n(bad),null);
 const s=searchSummary.summarizeSearches([{query:'dune',results:0},{query:'mistborn',results:0},{query:'dune',results:0},{query:'hobbit',results:1}]);
 assert.equal(s.total,4);assert.deepEqual(s.missing.map(x=>[x.query,x.count]),[['dune',2],['mistborn',1]]);assert.deepEqual(s.top.map(x=>x.query),['hobbit']);
});

test('top chapters use an IMDb-style weighted score so one vote cannot top the list',()=>{
 const {rankChapters}=load('app/live/highlights.ts');
 const r=rankChapters([{book:'a',chapter:1,average:10,count:1},{book:'a',chapter:2,average:9.2,count:12},{book:'b',chapter:3,average:6,count:5},{book:'b',chapter:4,average:8,count:0}],8);
 assert.deepEqual(r.map(x=>x.chapter),[2,1,3]);
 assert.ok(r[0].weighted<9.2&&r[0].weighted>8.5);assert.equal(rankChapters([]).length,0);
});

test('the site owner gets 30,000 bonus XP on top of earned XP; readers do not',()=>{
 const books=[{id:'a',chapter_count:5,status:'approved'}],mine=[{book:'a',chapter:1,score:8,date:'2026-11-20T10:00:00Z'}];
 assert.equal(stats.progressOf({user:{admin:false},mine,books}).xp,250); // 100 + First Page badge + 1-day streak
 const owner=stats.progressOf({user:{admin:true},mine,books});
 assert.equal(owner.xp,30250);assert.ok(owner.levelXp<=owner.xp&&owner.xp<owner.nextXp);
});

test('milestone badges count chapters, books, finished books, best day, streak and perfect tens',()=>{
 const day=d=>`2026-11-${String(d).padStart(2,'0')}T10:00:00Z`;
 const chapters=new Map([['a',3],['b',40]]);
 const mine=[{book:'a',chapter:1,score:10,date:day(1)},{book:'a',chapter:2,score:8,date:day(2)},{book:'a',chapter:3,score:8,date:day(3)},...Array.from({length:22},(_,i)=>({book:'b',chapter:i+1,score:7,date:day(5)}))];
 const b=Object.fromEntries(readerBadges({mine,chapters}).map(x=>[x.id,x]));
 assert.equal(b['first-page'].earned,true);
 assert.equal(b.regular.earned,true);assert.equal(b.regular.have,25);
 assert.equal(b.century.earned,false);assert.equal(b.century.have,25);
 assert.equal(b.explorer.have,2);
 assert.equal(b.bookworm.have,1);
 assert.equal(b.marathon.earned,true);
 assert.equal(b['on-a-roll'].have,3);assert.equal(b['on-a-roll'].earned,false);
 assert.equal(b['perfect-ten'].earned,true);
});

test('earned badges add their difficulty XP and newBadgeList returns the badge objects',()=>{
 const books=[{id:'a',chapter_count:30,status:'approved',title:'A'}];
 const at=i=>`2026-11-21T10:${String(i).padStart(2,'0')}:00Z`;
 const mine=Array.from({length:24},(_,i)=>({book:'a',chapter:i+1,score:8,date:at(i)}));
 const before=stats.badgesOf({mine,books}),p1=stats.progressOf({mine,books});
 const more=[...mine,{book:'a',chapter:25,score:10,date:at(30)}];
 const after=stats.badgesOf({mine:more,books}),p2=stats.progressOf({mine:more,books});
 // 20 rated chapters earn XP that day (cap), Marathon (1500) and First Page (100) already earned
 assert.equal(p1.xp,20*100+100+1500+50);
 const gained=stats.newBadgeList(before,after).map(b=>b.id).sort();
 assert.deepEqual(gained,['perfect-ten','regular']);
 // the 25th chapter is over the daily cap, so only the new badges add XP: Regular 500 + Perfect 10 200
 assert.equal(p2.xp-p1.xp,500+200);
});

test('daily streak: 50 XP per day in a row, capped at 500 a day; status warns when today is missing',()=>{
 const local=(y,m,d)=>new Date(y,m-1,d,12).toISOString();
 // 3 days in a row, a gap, then 1 day: 50+100+150 + 50
 assert.equal(stats.streakBonusXp([local(2026,11,1),local(2026,11,1),local(2026,11,2),local(2026,11,3),local(2026,11,5)]),350);
 // 12 days in a row: 50..500 then 500, 500
 assert.equal(stats.streakBonusXp(Array.from({length:12},(_,i)=>local(2026,10,i+1))),50*(1+2+3+4+5+6+7+8+9+10)+500+500);
 const today=new Date(2026,10,10,18);
 const s=stats.streakStatus([local(2026,11,8),local(2026,11,9)],today);
 assert.deepEqual([s.current,s.ratedToday,s.atRisk],[2,false,true]);
 const t=stats.streakStatus([local(2026,11,9),local(2026,11,10)],today);
 assert.deepEqual([t.current,t.ratedToday,t.atRisk],[2,true,false]);
});
