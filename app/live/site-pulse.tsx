'use client';
// Owner "Site pulse": the site's own numbers (ratings, accounts, books), owner excluded.
import {useState} from 'react';
type Day={day:string;real:number;guest:number};type Top={book:string;title:string;ratings:number;readers:number};
export type Pulse={days:number;ratingsByDay:Day[];signupsByDay:Day[];active:{day:{real:number;guest:number};week:{real:number;guest:number};month:{real:number;guest:number}};topWeek:Top[];topMonth:Top[];totals:{realAccounts:number;guestAccounts:number;ratings:number;invites:number}};
// Validated pair (CVD-safe, ≥3:1 on the panel): readers teal, guests amber.
const READER='#0089a0',GUEST='#b0650c';
const short=(d:string)=>new Date(d+'T12:00:00Z').toLocaleDateString(undefined,{month:'short',day:'numeric'});

function DayBars({title,rows,unit}:{title:string;rows:Day[];unit:string}){
 const [hover,setHover]=useState<number|null>(null);const max=Math.max(1,...rows.map(r=>r.real+r.guest)),total=rows.reduce((a,r)=>a+r.real+r.guest,0);
 const h=hover===null?null:rows[hover];
 return <figure className="pulse-chart"><figcaption><b>{title}</b><span>{total} in {rows.length} days</span></figcaption>
  <div className="pc-legend"><span><i style={{background:READER}}/>Readers with accounts</span><span><i style={{background:GUEST}}/>Guests</span></div>
  <div className="pc-plot" onMouseLeave={()=>setHover(null)}>
   <span className="pc-max">{max}</span>
   <div className="pc-bars">{rows.map((r,i)=><div role="img" tabIndex={0} key={r.day} className={'pc-col'+(hover===i?' on':'')} aria-label={`${short(r.day)}: ${r.real+r.guest} ${unit}, ${r.real} from readers, ${r.guest} from guests`} onMouseEnter={()=>setHover(i)} onFocus={()=>setHover(i)} onClick={()=>setHover(i)}>
    {r.guest>0&&<span style={{height:r.guest/max*100+'%',background:GUEST}}/>}{r.real>0&&<span style={{height:r.real/max*100+'%',background:READER}}/>}</div>)}</div>
   {h&&<div className="pc-tip" style={{left:`calc(${(hover!+.5)/rows.length*100}% )`}}><b>{short(h.day)} · {h.real+h.guest} {unit}</b><span><i style={{background:READER}}/>{h.real} from readers</span><span><i style={{background:GUEST}}/>{h.guest} from guests</span></div>}
  </div>
  <div className="pc-axis"><span>{short(rows[0].day)}</span><span>Today</span></div>
  <details className="pc-table"><summary>Show as table</summary><table className="analytics-table"><thead><tr><th>Day</th><th>Readers</th><th>Guests</th></tr></thead><tbody>{[...rows].reverse().filter(r=>r.real||r.guest).map(r=><tr key={r.day}><td>{short(r.day)}</td><td>{r.real}</td><td>{r.guest}</td></tr>)}</tbody></table>{!total&&<p>No {unit} yet.</p>}</details>
 </figure>;
}
const TopList=({title,rows}:{title:string;rows:Top[]})=><div className="pulse-top"><h4>{title}</h4>{rows.length?<ol>{rows.map(r=><li key={r.book}><span>{r.title}</span><b>{r.ratings}</b><small>{r.readers} reader{r.readers===1?'':'s'}</small></li>)}</ol>:<p className="p-muted">No ratings yet.</p>}</div>;

export default function SitePulse({pulse}:{pulse:Pulse}){
 const a=pulse.active,t=pulse.totals;
 const tile=(big:number|string,label:string,sub?:string)=><div className="pulse-tile"><strong>{big}</strong><span>{label}</span>{sub&&<small>{sub}</small>}</div>;
 return <section className="site-pulse"><h3>Site pulse <small>(last {pulse.days} days, you excluded)</small></h3>
  <div className="pulse-tiles">
   {tile(a.day.real+a.day.guest,'rated today',`${a.day.real} readers · ${a.day.guest} guests`)}
   {tile(a.week.real+a.week.guest,'rated this week',`${a.week.real} readers · ${a.week.guest} guests`)}
   {tile(t.ratings,'ratings',`last ${pulse.days} days`)}
   {tile(t.realAccounts,'accounts',`${t.guestAccounts} guest-only`)}
   {tile(t.invites,'invited friends')}
  </div>
  <div className="pulse-charts"><DayBars title="Ratings per day" rows={pulse.ratingsByDay} unit="ratings"/><DayBars title="New accounts per day" rows={pulse.signupsByDay} unit="new accounts"/></div>
  <div className="pulse-tops"><TopList title="Most rated this week" rows={pulse.topWeek}/><TopList title={`Most rated, ${pulse.days} days`} rows={pulse.topMonth}/></div>
 </section>;
}
