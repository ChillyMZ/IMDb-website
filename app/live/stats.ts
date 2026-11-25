import {scoreBands} from './score-bands';
import {readerProgress,levelOf,levelStart,type Progress as ApiProgress} from '../../migration/supabase/functions/chillymz-api/progress';
import {readerBadges,type Badge} from '../../migration/supabase/functions/chillymz-api/badges';
export type {Badge};

// Pure helpers for the post-rating comparison card and the reader stats page.
// Kept free of React/DOM so tests can load them directly.
export type MineRating={book:string;chapter:number;score:number;date:string};
export type StatsBook={id:string;title:string;author:string;chapter_count:number};
export type StatsEntry=MineRating&{title:string};
// Same XP rules as the API (one shared file). `partial` marks a browser-side figure without review XP,
// used until/unless the API sends its own `progress` (which includes visible reviews).
export type Progress=ApiProgress&{partial?:boolean};
type ProgressSource={user?:{admin?:boolean};activity?:string[];progress?:Progress|null;badges?:Badge[]|null;mine:{book:string;chapter:number;score:number;date:string}[];books:{id:string;title?:string;chapter_count:number;status?:string}[]};
// Site owner's bonus XP, added on top of what their ratings earn.
export const OWNER_BONUS_XP=30000;
export function progressOf(d:ProgressSource|null|undefined):Progress|undefined{
 if(!d)return undefined;
// Always worked out in the browser so badge, streak and owner XP are included; the API's own figure only knows ratings.
 const base:Progress={...readerProgress(d.mine,[],new Map(d.books.filter(b=>!b.status||b.status==='approved').map(b=>[b.id,b.chapter_count]))),partial:true};
 const badgeXp=(badgesOf(d)||[]).filter(b=>b.earned).reduce((a,b)=>a+(b.xp||0),0);
 const streakXp=streakBonusXp([...d.mine.filter(r=>d.books.some(b=>b.id===r.book&&(!b.status||b.status==='approved'))).map(r=>r.date),...(d.activity||[])]);
 const bonus=badgeXp+streakXp+(d.user?.admin?OWNER_BONUS_XP:0);
 if(!bonus)return base;
 const xp=base.xp+bonus,level=levelOf(xp);
 return {...base,xp,level,levelXp:levelStart(level),nextXp:levelStart(level+1)};
}
// Badges: the API's when it sends them; otherwise the browser works out Finisher and leaves the
// badges that need other readers' data or reviews as `earned:null` ("coming soon").
type BadgeSource={activity?:string[];badges?:Badge[]|null;mine:{book:string;chapter:number;score:number;date:string}[];books:{id:string;title?:string;chapter_count:number;status?:string}[]};
export function badgesOf(d:BadgeSource|null|undefined):Badge[]|undefined{
 if(!d)return undefined;
 const approved=d.books.filter(b=>!b.status||b.status==='approved');
 const local=readerBadges({activity:d.activity,mine:d.mine,chapters:new Map(approved.map(b=>[b.id,b.chapter_count])),titles:new Map(approved.map(b=>[b.id,b.title||'']))});
 if(!d.badges)return local;
 // Pioneer, Hot Take and Critic need other readers' data, so the API's version of those wins.
 const api=new Map(d.badges.map(b=>[b.id,b]));
 return local.map(b=>(b.id==='pioneer'||b.id==='hot-take'||b.id==='critic')&&api.get(b.id)?.earned!==null&&api.get(b.id)?{...api.get(b.id)!,xp:b.xp}:b);
}
// Badges earned by this save (only ones known before and after, so a fallback→API switch never "unlocks" old badges).
export function newBadgeList(before?:Badge[],after?:Badge[]):Badge[]{
 if(!before||!after)return [];
 return after.filter(b=>b.earned&&before.find(x=>x.id===b.id)?.earned===false);
}
export function newBadges(before?:Badge[],after?:Badge[]){
 if(!before||!after)return [];
 return after.filter(b=>b.earned&&before.find(x=>x.id===b.id)?.earned===false).map(b=>b.name);
}
export type XpGain={gained:number;level:number;levelUp:boolean;capped:boolean};
export type Comparison={chapter:number;mine:number;others?:number;othersCount:number;estimate?:number;finished?:boolean;xp?:XpGain;badges?:string[];streak?:number;chillymz?:number};

// What one save earned, from progress before and after it. Re-rating a chapter earns nothing and shows nothing.
export function xpGain(before:Progress|null|undefined,after:Progress|null|undefined,newChapter:boolean):XpGain|undefined{
 if(!before||!after)return undefined;
 const gained=after.xp-before.xp;
 return {gained:Math.max(0,gained),level:after.level,levelUp:after.level>before.level,capped:newChapter&&gained<=0&&after.ratingsToday>=after.ratingCap};
}
export function xpLine(x?:XpGain){
 if(!x)return '';
 if(x.levelUp)return `+${x.gained} XP · Level up! You’re now Level ${x.level}.`;
 if(x.gained>0)return `+${x.gained} XP`;
 if(x.capped)return 'Daily XP limit reached. Your rating still counts; XP resumes tomorrow.';
 return '';
}

// `total` comes from the API after the save, so it already includes this reader's score.
// Remove it to compare against everyone else; otherwise a lone vote "agrees" with itself.
export function compareRating(chapter:number,mine:number,total?:{average:number;count:number},estimate?:number):Comparison{
 const score=Math.round(mine*10)/10;
 if(!total||total.count<=1)return {chapter,mine:score,othersCount:0,estimate};
 const others=(total.average*total.count-score)/(total.count-1);
 return {chapter,mine:score,others:Math.min(10,Math.max(0,others)),othersCount:total.count-1};
}

// One line comparing the reader with ChillyMZ's own score.
export function chillymzLine(c:Comparison){
 if(c.chillymz===undefined)return '';
 const d=Math.round((c.mine-c.chillymz)*10)/10;
 if(Math.abs(d)<.05)return 'Exactly what ChillyMZ gave it.';
 return d>0?`${d.toFixed(1)} higher than ChillyMZ.`:`${Math.abs(d).toFixed(1)} lower than ChillyMZ.`;
}
export function verdict(c:Comparison){
 if(c.others===undefined)return 'You’re the first reader to rate this chapter.';
 const d=c.mine-c.others;
 if(Math.abs(d)<.5)return 'Right in step with other readers.';
 if(d>=2)return 'Way kinder than other readers.';
 if(d>0)return 'A little kinder than other readers.';
 if(d<=-2)return 'Much tougher than other readers.';
 return 'A little tougher than other readers.';
}

const pad=(n:number)=>String(n).padStart(2,'0');
export const dayKey=(d:Date)=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const shift=(d:Date,days:number)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+days);

// Streaks count local calendar days with at least one rating. The current streak
// survives until the end of today, so a reader who rated yesterday still has it.
export function streaks(dates:string[],today=new Date()){
 const days=new Set(dates.map(s=>new Date(s)).filter(d=>!isNaN(d.getTime())).map(dayKey));
 let best=0;
 for(const key of days){
  const [y,m,d]=key.split('-').map(Number),start=new Date(y,m-1,d);
  if(days.has(dayKey(shift(start,-1))))continue;
  let run=1;while(days.has(dayKey(shift(start,run))))run++;
  best=Math.max(best,run);
 }
 let cursor=shift(today,0),current=0;
 if(!days.has(dayKey(cursor)))cursor=shift(cursor,-1);
 while(days.has(dayKey(cursor))){current++;cursor=shift(cursor,-1)}
 return {current,best};
}

// Daily streak XP: the Nth day in a row earns 50×N XP, up to 500 a day from day 10 on.
export const STREAK_XP=50,STREAK_XP_CAP_DAYS=10;
export function streakBonusXp(dates:string[]){
 const days=[...new Set(dates.map(s=>new Date(s)).filter(d=>!isNaN(d.getTime())).map(dayKey))].sort();
 let total=0,run=0,prev='';
 for(const key of days){const [y,m,d]=key.split('-').map(Number);run=prev&&dayKey(shift(new Date(y,m-1,d),-1))===prev?run+1:1;total+=STREAK_XP*Math.min(run,STREAK_XP_CAP_DAYS);prev=key}
 return total;
}
// Current streak plus whether today already counts (so the site can warn before it breaks).
export function streakStatus(dates:string[],today=new Date()){
 const {current,best}=streaks(dates,today),ratedToday=dates.some(s=>{const d=new Date(s);return !isNaN(d.getTime())&&dayKey(d)===dayKey(today)});
 return {current,best,ratedToday,atRisk:current>0&&!ratedToday};
}

// Flame colour by streak length: shown in the header and on the streak page.
export type FlameTier={id:'orange'|'blue'|'purple'|'gold';name:string;min:number};
export const FLAME_TIERS:FlameTier[]=[{id:'orange',name:'Orange flame',min:1},{id:'blue',name:'Blue flame',min:7},{id:'purple',name:'Purple flame',min:30},{id:'gold',name:'Gold flame',min:100}];
export const flameTier=(days:number)=>[...FLAME_TIERS].reverse().find(t=>days>=t.min)||FLAME_TIERS[0];
export const nextFlameTier=(days:number)=>FLAME_TIERS.find(t=>t.min>days);
export const streakDayXp=(day:number)=>STREAK_XP*Math.min(Math.max(day,1),STREAK_XP_CAP_DAYS);
// Last `count` local days, oldest first, marking the days with a rating.
export function recentDays(dates:string[],count=30,today=new Date()){
 const rated=new Set(dates.map(s=>new Date(s)).filter(d=>!isNaN(d.getTime())).map(dayKey));
 return Array.from({length:count},(_,i)=>{const d=shift(today,i-count+1);return {key:dayKey(d),day:d.getDate(),rated:rated.has(dayKey(d)),today:i===count-1}});
}

// The current calendar month as a Monday-first grid: null for leading blanks.
export function monthDays(dates:string[],today=new Date()){
 const rated=new Set(dates.map(s=>new Date(s)).filter(d=>!isNaN(d.getTime())).map(dayKey));
 const first=new Date(today.getFullYear(),today.getMonth(),1),count=new Date(today.getFullYear(),today.getMonth()+1,0).getDate(),lead=(first.getDay()+6)%7;
 const cells:({key:string;day:number;rated:boolean;today:boolean;future:boolean}|null)[]=Array.from({length:lead},()=>null);
 for(let d=1;d<=count;d++){const date=new Date(today.getFullYear(),today.getMonth(),d);cells.push({key:dayKey(date),day:d,rated:rated.has(dayKey(date)),today:d===today.getDate(),future:d>today.getDate()})}
 return {label:today.toLocaleDateString(undefined,{month:'long',year:'numeric'}),cells,ratedCount:cells.filter(c=>c?.rated).length};
}

export function readerStats(mine:MineRating[],books:StatsBook[],today=new Date()){
 const byId=new Map(books.map(b=>[b.id,b]));
 const rated:StatsEntry[]=mine.filter(r=>byId.has(r.book)&&Number.isFinite(r.score)).map(r=>({...r,title:byId.get(r.book)!.title}));
 const newest=(a:StatsEntry,b:StatsEntry)=>b.date.localeCompare(a.date);
 const high=[...rated].sort((a,b)=>b.score-a.score||newest(a,b)),low=[...rated].sort((a,b)=>a.score-b.score||newest(a,b));
 const perBook=new Map<string,{book:StatsBook;rated:number;sum:number;last:string}>();
 for(const r of rated){const x=perBook.get(r.book)||{book:byId.get(r.book)!,rated:0,sum:0,last:''};x.rated++;x.sum+=r.score;if(r.date>x.last)x.last=r.date;perBook.set(r.book,x)}
 const progress=[...perBook.values()].sort((a,b)=>b.last.localeCompare(a.last)).map(x=>({book:x.book,rated:x.rated,average:x.sum/x.rated,finished:x.rated>=x.book.chapter_count}));
 const bands=scoreBands.map(b=>({...b,count:0}));
 for(const r of rated){const band=bands.find(b=>r.score>=b.min);if(band)band.count++}
 return {
  total:rated.length,
  books:perBook.size,
  finished:progress.filter(p=>p.finished).length,
  average:rated.length?rated.reduce((sum,r)=>sum+r.score,0)/rated.length:undefined,
  kindest:high[0] as StatsEntry|undefined,
  harshest:rated.length>1?low[0]:undefined,
  favourites:high.slice(0,5),
  bands,progress,
  recent:[...rated].sort(newest),
  ...streaks(rated.map(r=>r.date),today)
 };
}
export type ReaderStatsResult=ReturnType<typeof readerStats>;
