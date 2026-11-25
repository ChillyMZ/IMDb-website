// Public "look" for a reader (level and daily streak), shown next to their name across the site.
// Same rules as the browser (app/live/stats.ts): rating XP, badge XP, streak XP, owner bonus.
// Streak days are UTC here; the browser uses local days, so a streak can differ by a day near midnight.
import {readerProgress,levelOf} from './progress.ts';
import {readerBadges,INVITE} from './badges.ts';
import {starterScores} from './starter-scores.ts';

export const OWNER_BONUS_XP=30000,STREAK_XP=50,STREAK_XP_CAP_DAYS=10;
const day=(s:string)=>String(s).slice(0,10);
const prevDay=(d:string)=>new Date(Date.parse(d+'T00:00:00Z')-86400000).toISOString().slice(0,10);

export function streakXp(dates:string[]){const days=[...new Set(dates.map(day))].sort();let total=0,run=0,prev='';for(const d of days){run=prev&&prevDay(d)===prev?run+1:1;total+=STREAK_XP*Math.min(run,STREAK_XP_CAP_DAYS);prev=d}return total}
export function currentStreak(dates:string[],now=new Date().toISOString()){const days=new Set(dates.map(day));let d=day(now);if(!days.has(d))d=prevDay(d);let n=0;while(days.has(d)){n++;d=prevDay(d)}return n}

type Rating={user:string;book:string;chapter:number;score:number;date:string};
export function readerLook(user:string,ratings:Rating[],activity:string[],chapters:Map<string,number>,admin:boolean,others:Rating[]=[],reviews:{updated:string}[]=[],friends=0,friendChapters=0){
 const mine=ratings.filter(r=>chapters.has(r.book)).map(r=>({...r,score:r.score/10}));
 const base=readerProgress(mine,[],chapters).xp;
 const badgeXp=readerBadges({user,mine,chapters,activity,reviews,friends,others:others.map(r=>({...r,score:r.score/10})),estimated:(b:string,c:number)=>(starterScores as any)[b]?.[c]!==undefined}).filter(b=>b.earned).reduce((a,b)=>a+(b.xp||0),0);
 const dates=[...mine.map(r=>r.date),...activity];
 const xp=base+badgeXp+streakXp(dates)+(admin?OWNER_BONUS_XP:0)+friendChapters*INVITE.perChapterXp;
 return {level:levelOf(xp),streak:currentStreak(dates)};
}
