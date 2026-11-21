// Reader XP and levels, derived from existing ratings and visible reviews on every request.
// Nothing is stored, so changing these rules re-scores every reader consistently.
// Kept free of Deno/Supabase imports so tests can load it directly.
export const XP={rating:10,review:25,finish:50},DAILY={rating:20,review:5};

// XP needed to reach a level: 0, 100, 250, 450, 700… (each step 50 more than the last).
export const levelStart=(level:number)=>25*(level-1)*(level+2);
export function levelOf(xp:number){let level=1;while(levelStart(level+1)<=xp)level++;return level}

// Days are UTC calendar days. Each chapter counts once (one rating row per reader/chapter);
// editing a rating moves it to the edit day but never earns it twice.
const day=(iso:string)=>String(iso).slice(0,10);
function capped(dates:string[],perDay:number){const days=new Map<string,number>();for(const d of dates)days.set(day(d),(days.get(day(d))||0)+1);let n=0;for(const c of days.values())n+=Math.min(c,perDay);return n}

export type Progress={xp:number;level:number;levelXp:number;nextXp:number;ratingsToday:number;ratingCap:number;finished:number};

// `chapters` maps approved book id → chapter count; ratings on other books earn nothing.
// `reviews` should already exclude reviews held or removed by moderation.
export function readerProgress(ratings:{book:string;date:string}[],reviews:{updated:string}[],chapters:Map<string,number>,now=new Date().toISOString()):Progress{
 const valid=ratings.filter(r=>chapters.has(r.book)),perBook=new Map<string,number>();
 for(const r of valid)perBook.set(r.book,(perBook.get(r.book)||0)+1);
 const finished=[...perBook].filter(([book,n])=>{const count=chapters.get(book)!;return count>0&&n>=count}).length;
 const xp=capped(valid.map(r=>r.date),DAILY.rating)*XP.rating+capped(reviews.map(r=>r.updated),DAILY.review)*XP.review+finished*XP.finish;
 const level=levelOf(xp),today=valid.filter(r=>day(r.date)===day(now)).length;
 return {xp,level,levelXp:levelStart(level),nextXp:levelStart(level+1),ratingsToday:Math.min(today,DAILY.rating),ratingCap:DAILY.rating,finished};
}
