"use client";
import {useEffect,useState} from 'react';
import {Flame,Check} from 'lucide-react';
import {streakStatus,flameTier,nextFlameTier,FLAME_TIERS,streakDayXp,monthDays} from './stats';
import {BADGE_RULES} from '../../migration/supabase/functions/chillymz-api/badges';

// Time left until local midnight, refreshed every minute.
function useUntilMidnight(){
 const calc=()=>{const n=new Date(),m=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1);const mins=Math.max(0,Math.floor((m.getTime()-n.getTime())/60000));return `${Math.floor(mins/60)}h ${mins%60}m`};
 const [left,setLeft]=useState(calc);
 useEffect(()=>{const t=setInterval(()=>setLeft(calc()),30000);return ()=>clearInterval(t)},[]);
 return left;
}

const STREAK_BADGES=[{name:'Warming Up',days:BADGE_RULES.warmingUp,xp:300},{name:'On a Roll',days:BADGE_RULES.streak,xp:2000},{name:'Unstoppable',days:BADGE_RULES.unstoppable,xp:5000},{name:'Legend',days:BADGE_RULES.legend,xp:10000}];

export default function StreakPage({dates,onRate,onBack}:{dates:string[];onRate:()=>void;onBack:()=>void}){
 const s=streakStatus(dates),tier=flameTier(s.current),next=nextFlameTier(s.current),left=useUntilMidnight(),month=monthDays(dates);
 const nextBadge=STREAK_BADGES.find(b=>b.days>s.current);
 const todayXp=streakDayXp(s.ratedToday?s.current:s.current+1),tomorrowXp=streakDayXp((s.ratedToday?s.current:s.current+1)+1);
 return <div className="streak-page">
  <button type="button" className="shop-back" onClick={onBack}>← Back</button>
  <section className={'p-panel streak-hero flame-'+(s.current?tier.id:'none')}>
   <span className="streak-flame" aria-hidden="true"><Flame size={64} strokeWidth={1.75}/></span>
   <div><h1>{s.current}-day streak</h1><p className="p-muted">{s.current?tier.name:'No streak yet'} · Best: {s.best} {s.best===1?'day':'days'}</p></div>
   {s.ratedToday
    ?<p className="streak-today done"><Check size={18} aria-hidden="true"/> Done for today. +{todayXp} XP earned. Come back tomorrow for +{tomorrowXp} XP.</p>
    :<div className="streak-today pending"><p>{s.current?<><b>Rate a chapter in the next {left}</b> to keep your streak.</>:<><b>Rate a chapter today</b> to start your streak.</>} Today is worth <b>+{todayXp} XP</b>.</p>{s.current>1&&<p className="streak-loss">Miss today and your streak resets to 0, your daily bonus drops back to +{streakDayXp(1)} XP{s.current>=7?` and you lose the ${tier.name.toLowerCase()}`:''}.</p>}<button className="p-primary" onClick={onRate}>Rate a chapter</button></div>}
  </section>

  <section className="p-panel">
   <h2>{month.label} <span className="rs-sub rs-inline">{month.ratedCount} {month.ratedCount===1?'day':'days'} rated</span></h2>
   <ol className="streak-weekdays" aria-hidden="true">{['M','T','W','T','F','S','S'].map((d,i)=><li key={i}>{d}</li>)}</ol>
   <ol className="streak-calendar" aria-label={`Days with a rating in ${month.label}`}>{month.cells.map((d,i)=>d?<li key={d.key} className={(d.rated?'rated':'')+(d.today?' today':'')+(d.future?' future':'')} title={d.key+(d.rated?' · rated':'')}>{d.rated?<Flame size={14} aria-hidden="true"/>:d.day}<span className="sr-only">{d.key}{d.rated?' rated':''}</span></li>:<li key={'b'+i} className="blank" aria-hidden="true"/>)}</ol>
  </section>

  <section className="p-panel">
   <h2>What your streak gets you</h2>
   <h3 className="rs-subhead">Flame colour</h3>
   {next&&<><p className="p-muted">{next.min-s.current} more {next.min-s.current===1?'day':'days'} to the {next.name.toLowerCase()}.</p><progress value={s.current} max={next.min} aria-label={`Progress to the ${next.name}`}/></>}
   <ul className="streak-tiers">{FLAME_TIERS.map(t=><li key={t.id} className={'flame-'+t.id+(s.current>=t.min?' on':'')}><Flame size={26} aria-hidden="true"/><b>{t.name}</b><small>{t.min} {t.min===1?'day':'days'}</small></li>)}</ul>
   <h3 className="rs-subhead">Daily streak bonus</h3>
   <p className="p-muted">Each day in a row earns more: day 1 +50 XP, day 5 +250 XP, day 10 and after +500 XP a day.</p>
   <h3 className="rs-subhead">Streak badges</h3>
   {nextBadge&&<p className="p-muted">{nextBadge.days-s.current} more {nextBadge.days-s.current===1?'day':'days'} to {nextBadge.name} (+{nextBadge.xp.toLocaleString()} XP).</p>}
   <ul className="streak-badges">{STREAK_BADGES.map(b=><li key={b.name} className={s.best>=b.days?'on':''}><b>{b.name}</b><small>{b.days} days · +{b.xp.toLocaleString()} XP</small>{s.best>=b.days&&<span>Earned</span>}</li>)}</ul>
  </section>
 </div>;
}
