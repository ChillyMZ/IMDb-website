// Reader badges, derived on every request from existing ratings and visible reviews (nothing stored).
// Kept free of Deno/Supabase imports so the website and tests can load it directly.
// Scores are on the 0–10 scale. `others` = every reader's ratings on the books this reader rated;
// leave it (or `reviews`) undefined when unknown and those badges come back as `earned:null`.
export type Badge={id:'first-page'|'regular'|'century'|'explorer'|'bookworm'|'marathon'|'on-a-roll'|'perfect-ten'|'finisher'|'pioneer'|'hot-take'|'critic';name:string;description:string;earned:boolean|null;have:number;need:number;detail?:string};
type Rating={book:string;chapter:number;score:number;date:string};
type Input={user?:string;mine:Rating[];chapters:Map<string,number>;titles?:Map<string,string>;reviews?:{updated:string}[];others?:(Rating&{user:string})[];estimated?:(book:string,chapter:number)=>boolean};
export const BADGE_RULES={hotTakeGap:2,hotTakeReaders:3,critic:5,regular:25,century:100,explorer:10,bookworm:5,marathon:20,streak:7};

// Milestones that only need this reader's own ratings, so the browser can always work them out.
function milestones(valid:Rating[],done:number):Badge[]{
 const R=BADGE_RULES,n=valid.length,count=(need:number,have:number)=>({earned:have>=need,have:Math.min(have,need),need});
 const books=new Set(valid.map(r=>r.book)).size;
 const perDay=new Map<string,number>();for(const r of valid){const d=String(r.date).slice(0,10);perDay.set(d,(perDay.get(d)||0)+1)}
 const bestDay=Math.max(0,...perDay.values());
 // Longest run of consecutive UTC days with at least one rating.
 const days=[...perDay.keys()].sort();let run=0,best=0,prev=0;for(const d of days){const t=Date.parse(d+'T00:00:00Z');run=prev&&t-prev===86400000?run+1:1;best=Math.max(best,run);prev=t}
 const ten=valid.some(r=>r.score>=10);
 return [
  {id:'first-page',name:'First Page',description:'Rate your first chapter.',...count(1,n)},
  {id:'regular',name:'Regular',description:`Rate ${R.regular} chapters.`,...count(R.regular,n)},
  {id:'century',name:'Century',description:`Rate ${R.century} chapters.`,...count(R.century,n)},
  {id:'explorer',name:'Explorer',description:`Rate chapters in ${R.explorer} different books.`,...count(R.explorer,books)},
  {id:'bookworm',name:'Bookworm',description:`Rate every chapter of ${R.bookworm} books.`,...count(R.bookworm,done)},
  {id:'marathon',name:'Marathon',description:`Rate ${R.marathon} chapters in one day.`,...count(R.marathon,bestDay)},
  {id:'on-a-roll',name:'On a Roll',description:`Rate chapters ${R.streak} days in a row.`,...count(R.streak,best)},
  {id:'perfect-ten',name:'Perfect 10',description:'Give a chapter a perfect 10.',earned:ten,have:ten?1:0,need:1},
 ];
}

export function readerBadges({user,mine,chapters,titles,reviews,others,estimated}:Input):Badge[]{
 const valid=mine.filter(r=>chapters.has(r.book)),name=(b:string)=>titles?.get(b)||'a book',key=(b:string,c:number)=>b+'#'+c;
 const perBook=new Map<string,number>();for(const r of valid)perBook.set(r.book,(perBook.get(r.book)||0)+1);
 const books=[...perBook].map(([book,n])=>({book,n,count:chapters.get(book)||0})).filter(b=>b.count>0).sort((a,b)=>b.n/b.count-a.n/a.count);
 const done=books.filter(b=>b.n>=b.count),best=books[0];
 const finisher:Badge={id:'finisher',name:'Finisher',description:'Rate every chapter of a book.',earned:done.length>0,have:done.length?1:best?best.n:0,need:done.length?1:best?best.count:1,detail:done.length?name(done[0].book):best?`${best.n} of ${best.count} chapters of ${name(best.book)}`:undefined};
 const critic:Badge={id:'critic',name:'Critic',description:`Write ${BADGE_RULES.critic} chapter reviews.`,earned:reviews?reviews.length>=BADGE_RULES.critic:null,have:Math.min(reviews?.length||0,BADGE_RULES.critic),need:BADGE_RULES.critic};
 if(!others)return [...milestones(valid,done.length),finisher,{id:'pioneer',name:'Pioneer',description:'Be the first reader to rate a chapter that only had a ChillyMZ estimate.',earned:null,have:0,need:1},{id:'hot-take',name:'Hot Take',description:`Score a chapter ${BADGE_RULES.hotTakeGap}+ points away from at least ${BADGE_RULES.hotTakeReaders} other readers.`,earned:null,have:0,need:1},critic];
 // Everyone else's ratings per chapter: earliest date (Pioneer) and score sum/count (Hot Take).
 const rest=new Map<string,{first:string;sum:number;count:number}>();
 for(const r of others){if(r.user===user)continue;const k=key(r.book,r.chapter),x=rest.get(k)||{first:r.date,sum:0,count:0};if(r.date<x.first)x.first=r.date;x.sum+=r.score;x.count++;rest.set(k,x)}
 // Pioneer: the chapter showed an "E" estimate and nobody else had rated it before this reader (edits can shift dates; accepted).
 const pioneer=valid.filter(r=>estimated?.(r.book,r.chapter)&&(!rest.has(key(r.book,r.chapter))||r.date<=rest.get(key(r.book,r.chapter))!.first)).sort((a,b)=>a.date.localeCompare(b.date));
 const hot=valid.map(r=>{const x=rest.get(key(r.book,r.chapter));return x&&x.count>=BADGE_RULES.hotTakeReaders?{r,gap:r.score-x.sum/x.count}:null}).filter((h):h is {r:Rating;gap:number}=>!!h&&Math.abs(h.gap)>=BADGE_RULES.hotTakeGap).sort((a,b)=>Math.abs(b.gap)-Math.abs(a.gap));
 return [...milestones(valid,done.length),finisher,
  {id:'pioneer',name:'Pioneer',description:'Be the first reader to rate a chapter that only had a ChillyMZ estimate.',earned:pioneer.length>0,have:pioneer.length?1:0,need:1,detail:pioneer[0]&&`${name(pioneer[0].book)}, chapter ${pioneer[0].chapter}`},
  {id:'hot-take',name:'Hot Take',description:`Score a chapter ${BADGE_RULES.hotTakeGap}+ points away from at least ${BADGE_RULES.hotTakeReaders} other readers.`,earned:hot.length>0,have:hot.length?1:0,need:1,detail:hot[0]&&`${name(hot[0].r.book)}, chapter ${hot[0].r.chapter} (${hot[0].gap>0?'+':''}${hot[0].gap.toFixed(1)} vs others)`},
  critic];
}
