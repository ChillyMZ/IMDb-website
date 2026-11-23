import {scoreBands} from './score-bands';
import {readerProgress,type Progress as ApiProgress} from '../../migration/supabase/functions/chillymz-api/progress';
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
type ProgressSource={progress?:Progress|null;mine:{book:string;date:string}[];books:{id:string;chapter_count:number;status?:string}[]};
export function progressOf(d:ProgressSource|null|undefined):Progress|undefined{
 if(!d)return undefined;
 if(d.progress)return d.progress;
 return {...readerProgress(d.mine,[],new Map(d.books.filter(b=>!b.status||b.status==='approved').map(b=>[b.id,b.chapter_count]))),partial:true};
}
// Badges: the API's when it sends them; otherwise the browser works out Finisher and leaves the
// badges that need other readers' data or reviews as `earned:null` ("coming soon").
type BadgeSource={badges?:Badge[]|null;mine:{book:string;chapter:number;score:number;date:string}[];books:{id:string;title?:string;chapter_count:number;status?:string}[]};
export function badgesOf(d:BadgeSource|null|undefined):Badge[]|undefined{
 if(!d)return undefined;
 if(d.badges)return d.badges;
 const approved=d.books.filter(b=>!b.status||b.status==='approved');
 return readerBadges({mine:d.mine,chapters:new Map(approved.map(b=>[b.id,b.chapter_count])),titles:new Map(approved.map(b=>[b.id,b.title||'']))});
}
// Badges earned by this save (only ones known before and after, so a fallback→API switch never "unlocks" old badges).
export function newBadges(before?:Badge[],after?:Badge[]){
 if(!before||!after)return [];
 return after.filter(b=>b.earned&&before.find(x=>x.id===b.id)?.earned===false).map(b=>b.name);
}
export type XpGain={gained:number;level:number;levelUp:boolean;capped:boolean};
export type Comparison={chapter:number;mine:number;others?:number;othersCount:number;estimate?:number;finished?:boolean;xp?:XpGain;badges?:string[]};

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
