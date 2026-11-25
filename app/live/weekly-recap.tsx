'use client';
// Weekly recap: chapters, XP and levels gained, best chapter, streak — for this week (in Diary)
// and, early in the week, last week's recap on the home page. Shareable as a story image.
import {useMemo,useState} from 'react';
import {progressOf,streakStatus} from './stats';
import {scoreBand} from './score-bands';
import {shareStory} from './story-card';

type Rating={book:string;chapter:number;score:number;date:string};
type Book={id:string;title:string;author:string;chapter_count:number;status?:string;cover?:string};
type Source={mine:Rating[];books:Book[];user?:{admin?:boolean;name?:string};invites?:any;badges?:any};
export type Recap={start:Date;end:Date;chapters:number;books:number;xp:number;levelFrom:number;levelTo:number;best?:{title:string;chapter:number;score:number};average?:number;streak:number};

// Weeks run Monday to Sunday, local time.
export function weekStart(d=new Date()){const s=new Date(d);s.setHours(0,0,0,0);s.setDate(s.getDate()-((s.getDay()+6)%7));return s}
export function recapFor(src:Source,activity:string[],start:Date,end:Date):Recap{
 const inWeek=(iso:string)=>{const t=new Date(iso).getTime();return t>=start.getTime()&&t<end.getTime()};
 const before=(iso:string)=>new Date(iso).getTime()<start.getTime(),upto=(iso:string)=>new Date(iso).getTime()<end.getTime();
 const week=src.mine.filter(r=>inWeek(r.date));
 // XP and level before vs after the week. Invite XP isn't dated, so it's left out of the gain.
 const base={...src,invites:src.invites?{...src.invites,chapters:0}:src.invites,badges:null};
 const a=progressOf({...base,mine:src.mine.filter(r=>before(r.date)),activity:activity.filter(before)} as any),b=progressOf({...base,mine:src.mine.filter(r=>upto(r.date)),activity:activity.filter(upto)} as any);
 const top=[...week].sort((x,y)=>y.score-x.score||x.date.localeCompare(y.date))[0],book=top&&src.books.find(x=>x.id===top.book);
 const last=new Date(Math.min(end.getTime(),Date.now())-1);
 return {start,end,chapters:week.length,books:new Set(week.map(r=>r.book)).size,xp:Math.max(0,(b?.xp||0)-(a?.xp||0)),levelFrom:a?.level||1,levelTo:b?.level||1,
  best:top&&book?{title:book.title,chapter:top.chapter,score:top.score}:undefined,average:week.length?week.reduce((s,r)=>s+r.score,0)/week.length:undefined,
  streak:streakStatus([...src.mine.map(r=>r.date),...activity].filter(upto),last).current};
}
const fmt=(d:Date)=>d.toLocaleDateString(undefined,{month:'short',day:'numeric'});
const range=(r:Recap)=>`${fmt(r.start)} – ${fmt(new Date(r.end.getTime()-1))}`;

async function recapImage(r:Recap,name:string,label:string):Promise<File>{
 const W=1080,H=1920,cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');if(!c)throw Error('Image export is unavailable.');
 const paper='#f6f2ea',ink='#1c1a17',muted='#6e675d',teal='#2f6f78',serif='"Newsreader", Georgia, serif',sans='-apple-system, "Segoe UI", Roboto, Arial, sans-serif';
 const t=(s:string,x:number,y:number,font:string,color=ink,align:CanvasTextAlign='left')=>{c.font=font;c.fillStyle=color;c.textAlign=align;c.fillText(s,x,y)};
 const box=(x:number,y:number,w:number,h:number,color:string,rad=20)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,rad);c.fill()};
 c.fillStyle=paper;c.fillRect(0,0,W,H);
 t('ChillyMZ',80,150,`600 64px ${serif}`);t(label.toUpperCase(),W-80,145,`700 26px ${sans}`,teal,'right');box(80,190,W-160,3,'#cfc6b6',0);
 t(`${name||'My'}${name?'’s':''} week`,80,330,`500 96px ${serif}`);t(range(r),80,400,`400 38px ${sans}`,muted);
 const stat=(x:number,y:number,big:string,small:string)=>{box(x,y,430,260,'#fffdf8');let size=110;c.font=`800 ${size}px ${sans}`;while(c.measureText(big).width>350&&size>50){size-=6;c.font=`800 ${size}px ${sans}`}t(big,x+40,y+150,`800 ${size}px ${sans}`,ink);t(small,x+40,y+215,`500 34px ${sans}`,muted)};
 stat(80,480,String(r.chapters),r.chapters===1?'chapter rated':'chapters rated');stat(570,480,'+'+r.xp.toLocaleString(),'XP earned');
 stat(80,780,r.levelTo>r.levelFrom?`${r.levelFrom}→${r.levelTo}`:String(r.levelTo),r.levelTo>r.levelFrom?'level up!':'level');stat(570,780,String(r.streak),r.streak===1?'day streak':'day streak 🔥');
 if(r.best){const b=scoreBand(r.best.score);box(80,1090,W-160,300,'#fffdf8');t('BEST CHAPTER',120,1160,`700 28px ${sans}`,teal);t(`Chapter ${r.best.chapter}`,120,1240,`600 60px ${serif}`);
  c.font=`400 38px ${serif}`;let title=r.best.title;while(c.measureText(title).width>620&&title.length>3)title=title.slice(0,-2);t(title===r.best.title?title:title+'…',120,1300,`400 38px ${serif}`,muted);
  box(W-320,1140,200,200,b?.color||'#ccc',20);t(r.best.score.toFixed(1),W-220,1268,`800 76px ${sans}`,b?.text||ink,'center')}
 if(r.average!==undefined)t(`Average score this week: ${r.average.toFixed(1)} · ${r.books} book${r.books===1?'':'s'}`,W/2,1480,`500 36px ${sans}`,muted,'center');
 box(80,1640,W-160,2,'#cfc6b6',0);t('Rate every chapter with me',W/2,1730,`500 52px ${serif}`,ink,'center');t('chillymz.github.io/IMDb-website',W/2,1800,`600 30px ${sans}`,teal,'center');
 const blob=await new Promise<Blob>((ok,no)=>cv.toBlob(b=>b?ok(b):no(Error('Could not create the image.')),'image/png'));
 return new File([blob],'chillymz-week.png',{type:'image/png'});
}

export function WeekRecap({recap,name,label,onDismiss,compact=false}:{recap:Recap;name:string;label:string;onDismiss?:()=>void;compact?:boolean}){
 const [busy,setBusy]=useState(false),[msg,setMsg]=useState('');
 async function share(){setBusy(true);setMsg('');try{const how=await shareStory(await recapImage(recap,name,label),'My week on ChillyMZ');if(how!=='cancelled')setMsg(how==='shared'?'Shared!':'Image saved. Post it to your story.')}catch(e){setMsg(e instanceof Error?e.message:'Could not create the image.')}finally{setBusy(false)}}
 const b=recap.best&&scoreBand(recap.best.score);
 return <section className={'p-panel week-recap'+(compact?' compact':'')} aria-label={label}>
  <div className="wr-head"><div><span className="wr-kicker">{label}</span><h2>{range(recap)}</h2></div>{onDismiss&&<button type="button" className="wr-close" aria-label="Dismiss recap" onClick={onDismiss}>×</button>}</div>
  <div className="wr-stats">
   <div><b>{recap.chapters}</b><span>{recap.chapters===1?'chapter':'chapters'}</span></div>
   <div><b>+{recap.xp.toLocaleString()}</b><span>XP</span></div>
   <div><b>{recap.levelTo>recap.levelFrom?`${recap.levelFrom}→${recap.levelTo}`:recap.levelTo}</b><span>{recap.levelTo>recap.levelFrom?'level up':'level'}</span></div>
   <div><b>{recap.streak}</b><span>day streak</span></div>
  </div>
  {recap.best&&<p className="wr-best">Best chapter: <i style={{background:b?.color,color:b?.text}}>{recap.best.score.toFixed(1)}</i> {recap.best.title}, chapter {recap.best.chapter}</p>}
  <button type="button" className="p-primary wr-share" disabled={busy} onClick={share}>{busy?'Creating…':'Share my week'}</button>{msg&&<p className="wr-msg" role="status">{msg}</p>}
 </section>;
}

// Diary: last week's recap, Monday to Wednesday, until dismissed.
export function LastWeekBanner({src,activity,name}:{src:Source;activity:string[];name:string}){
 const now=new Date(),thisWeek=weekStart(now),key='cmz-recap-'+thisWeek.toISOString().slice(0,10);
 const [hidden,setHidden]=useState(()=>{try{return !!localStorage.getItem(key)}catch{return false}});
 const recap=useMemo(()=>{const start=new Date(thisWeek);start.setDate(start.getDate()-7);return recapFor(src,activity,start,thisWeek)},[src,activity,thisWeek.getTime()]);
 const day=(now.getDay()+6)%7;if(hidden||day>2||!recap.chapters)return null;
 return <WeekRecap recap={recap} name={name} label="Your week in review" compact onDismiss={()=>{try{localStorage.setItem(key,'1')}catch{}setHidden(true)}}/>;
}
export function ThisWeek({src,activity,name}:{src:Source;activity:string[];name:string}){
 const recap=useMemo(()=>{const s=weekStart(),e=new Date(s);e.setDate(e.getDate()+7);return recapFor(src,activity,s,e)},[src,activity]);
 return <WeekRecap recap={recap} name={name} label="This week"/>;
}
