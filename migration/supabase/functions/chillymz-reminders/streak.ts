// Streak maths for reminders, in the reader's own time zone (offset in minutes east of UTC).
export const localDay=(iso:string|number,tz:number)=>new Date((typeof iso==='number'?iso:Date.parse(iso))+tz*60000).toISOString().slice(0,10);
const prev=(day:string)=>new Date(Date.parse(day+'T00:00:00Z')-86400000).toISOString().slice(0,10);
// Days in a row with activity, ending yesterday (today not counted yet).
export function streakToYesterday(days:Set<string>,today:string){let n=0,d=prev(today);while(days.has(d)){n++;d=prev(d)}return n}
// Send once, around 7pm local, if there's a streak to lose and nothing yet today.
export function shouldRemind(o:{now:number;tz:number;days:Set<string>;lastSent:string|null;hour?:number}){
 const today=localDay(o.now,o.tz),hour=new Date(o.now+o.tz*60000).getUTCHours();
 if(hour<(o.hour??19)||hour>=23)return null;if(o.lastSent===today)return null;if(o.days.has(today))return null;
 const streak=streakToYesterday(o.days,today);return streak>=1?{today,streak}:null;
}
export function reminderText(streak:number){
 return streak>=7?{title:`🔥 ${streak}-day streak on the line`,body:'It ends at midnight. One chapter keeps it alive.'}
  :{title:`🔥 Keep your ${streak}-day streak`,body:'Rate one chapter before midnight to keep it going.'};
}
