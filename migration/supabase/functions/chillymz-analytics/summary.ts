export function summarizeVisits(events:any[],now=Date.now(),books:Record<string,string>={}){
 const sessions=new Map<string,any>(),people=new Map<string,any>(),sections=new Map<string,any>(),sources=new Map<string,number>();
 const sessionReaders=new Map<string,string>();for(const e of events)if(e.reader)sessionReaders.set(e.session,e.reader);
 for(const e of events){const key=sessionReaders.get(e.session)?'reader:'+sessionReaders.get(e.session):'browser:'+e.visitor;let p=people.get(key);if(!p){p={id:key,label:(key.startsWith('reader:')?'Account ':'Browser ')+key.split(':')[1].slice(0,8),first:e.created,last:e.created,sessions:new Set<string>(),ratings:0};people.set(key,p)}if(e.created<p.first)p.first=e.created;if(e.created>p.last)p.last=e.created;p.sessions.add(e.session);if(e.event==='rating_saved')p.ratings++;
 let s=sessions.get(e.session);if(!s){s={id:e.session,visitor:p.label,key,started:e.created,last:e.created,source:e.source,device:e.device,visibleMs:0,ratings:0,steps:[],lastScreen:e.view};sessions.set(e.session,s)}s.last=e.created;s.visibleMs+=e.durationMs||0;s.lastScreen=e.view;if(e.event==='rating_saved')s.ratings++;
 if(!['heartbeat','exit'].includes(e.event)){s.steps.push({at:e.created,event:e.event,view:e.view,book:e.book?books[e.book]||e.book:null,chapter:e.chapter,code:e.code})}
 const sec=sections.get(e.view)||{view:e.view,views:0,visibleMs:0,exits:0};if(e.event==='view')sec.views++;sec.visibleMs+=e.durationMs||0;sections.set(e.view,sec);
 }
 for(const s of sessions.values()){sources.set(s.source,(sources.get(s.source)||0)+1);const sec=sections.get(s.lastScreen);if(sec)sec.exits++}
 const funnel=['books','book','chapter','signup_started','signup_completed','rating_saved'].map(stage=>({stage,visits:[...sessions.values()].filter(s=>s.steps.some((e:any)=>['books','book','chapter'].includes(stage)?e.event==='view'&&e.view===stage:e.event===stage)).length}));
 const visitors=[...people.values()].map(p=>({...p,sessions:undefined,visits:p.sessions.size,days:new Set([...p.sessions].map(id=>sessions.get(id).started.slice(0,10))).size,history:[...p.sessions].map(id=>sessions.get(id)).sort((a,b)=>b.started.localeCompare(a.started))})).sort((a,b)=>b.last.localeCompare(a.last));
 const retention=[1,7,30].map(days=>{const eligible=visitors.filter(p=>Date.parse(p.first)<=now-days*86400000);return {days,eligible:eligible.length,returned:eligible.filter(p=>p.history.some((s:any)=>{const gap=(Date.parse(s.started.slice(0,10))-Date.parse(p.first.slice(0,10)))/86400000;return gap>=1&&gap<=days})).length}});
 return {totals:{visits:sessions.size,visitors:people.size,returning:visitors.filter(p=>p.visits>1).length,ratingVisits:[...sessions.values()].filter(s=>s.ratings>0).length},funnel,retention,sections:[...sections.values()].sort((a,b)=>b.views-a.views),sources:[...sources].map(([source,visits])=>({source,visits})),errors:events.filter(e=>e.event==='action_error').length,emptySearches:events.filter(e=>e.event==='search_empty').length,visitors:visitors.slice(0,200)};
}

// Search insights. Queries are cleaned before storing; anything that looks personal (emails, links, long numbers) is dropped.
export function normalizeSearch(q:unknown){
 if(typeof q!=='string')return null;
 const s=q.normalize('NFKC').toLowerCase().replace(/\s+/g,' ').replace(/^[\s"'“”‘’.,!?;:-]+|[\s"'“”‘’.,!?;:-]+$/g,'').trim();
 if(s.length<2||s.length>80||/@|https?:|www\.|\d{5,}/.test(s))return null;
 return s;
}
export function summarizeSearches(rows:{query:string;results:number}[],limit=20){
 const all=new Map<string,{query:string;count:number;results:number}>();
 for(const r of rows){const x=all.get(r.query)||{query:r.query,count:0,results:r.results};x.count++;x.results=r.results;all.set(r.query,x)}
 const list=[...all.values()].sort((a,b)=>b.count-a.count||a.query.localeCompare(b.query));
 return {total:rows.length,missing:list.filter(x=>x.results===0).slice(0,limit),top:list.filter(x=>x.results>0).slice(0,limit)};
}

// Site pulse from the site's own tables (not consent-based visit logs): ratings and sign-ups per day,
// active readers, top books. Real accounts and silent guest accounts are counted separately; the owner is left out.
type PulseRating={user:string;book:string;date:string};type PulseUser={reader:string;created:string;anonymous:boolean};
export function sitePulse(o:{ratings:PulseRating[];users:PulseUser[];owners:string[];titles:Record<string,string>;invites:number;now?:number;days?:number}){
 const now=o.now??Date.now(),days=o.days??30,owners=new Set(o.owners),guest=new Set(o.users.filter(u=>u.anonymous).map(u=>u.reader));
 const key=(t:number)=>new Date(t).toISOString().slice(0,10),from=now-days*86400000;
 const dayList=Array.from({length:days},(_,i)=>key(now-(days-1-i)*86400000));
 const ratings=o.ratings.filter(r=>!owners.has(r.user)&&Date.parse(r.date)>=from),users=o.users.filter(u=>!owners.has(u.reader));
 const per=(rows:{t:string;g:boolean}[])=>{const m=new Map(dayList.map(d=>[d,{day:d,real:0,guest:0}]));for(const r of rows){const x=m.get(r.t.slice(0,10));if(x)r.g?x.guest++:x.real++}return [...m.values()]};
 const active=(ms:number)=>{const ids=new Set(ratings.filter(r=>Date.parse(r.date)>=now-ms).map(r=>r.user));let real=0,g=0;for(const id of ids)guest.has(id)?g++:real++;return {real,guest:g}};
 const top=(ms:number)=>{const m=new Map<string,{book:string;title:string;ratings:number;readers:Set<string>}>();for(const r of ratings){if(Date.parse(r.date)<now-ms)continue;const x=m.get(r.book)||{book:r.book,title:o.titles[r.book]||'Unknown book',ratings:0,readers:new Set<string>()};x.ratings++;x.readers.add(r.user);m.set(r.book,x)}return [...m.values()].sort((a,b)=>b.ratings-a.ratings).slice(0,8).map(x=>({book:x.book,title:x.title,ratings:x.ratings,readers:x.readers.size}))};
 return {days,ratingsByDay:per(ratings.map(r=>({t:r.date,g:guest.has(r.user)}))),signupsByDay:per(users.filter(u=>Date.parse(u.created)>=from).map(u=>({t:u.created,g:u.anonymous}))),
  active:{day:active(86400000),week:active(7*86400000),month:active(days*86400000)},topWeek:top(7*86400000),topMonth:top(days*86400000),
  totals:{realAccounts:users.filter(u=>!u.anonymous).length,guestAccounts:users.filter(u=>u.anonymous).length,ratings:ratings.length,invites:o.invites}};
}
