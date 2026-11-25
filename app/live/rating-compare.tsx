"use client";
import {scoreBand,scoreBands} from './score-bands';
import {verdict,xpLine,type Comparison} from './stats';

// Score scale behind the two markers, built from the canonical bands (lowest first).
const scale='linear-gradient(90deg,'+[...scoreBands].reverse().map((b,i,all)=>`${b.color} ${b.min*10}% ${(all[i+1]?.min??10)*10}%`).join(',')+')';

export default function RatingCompare({result,title,onClose,floating=false}:{result:Comparison;title?:string;onClose:()=>void;floating?:boolean}){
 const other=result.others??result.estimate,you=scoreBand(result.mine),them=scoreBand(other);
 const diff=result.others===undefined?undefined:result.mine-result.others;
 return <div className={'rating-compare'+(floating?' floating':'')} role="status" aria-live="polite">
  <div className="rc-head"><span>Chapter {result.chapter}{title?' · '+title:''}</span><button type="button" aria-label="Dismiss comparison" onClick={onClose}>×</button></div>
  <div className="rc-scores">
   <div><small className="rc-label-you">You</small><b style={{background:you?.color,color:you?.text}}>{result.mine.toFixed(1)}</b></div>
   <div><small className="rc-label-them">{result.others!==undefined?'Other readers':result.estimate!==undefined?'ChillyMZ estimate':'Other readers'}</small><b style={{background:them?.color||'#2a2a2a',color:them?.text||'#b4b4b4'}}>{other===undefined?'—':other.toFixed(1)}</b></div>
   {diff!==undefined&&Math.abs(diff)>=.05&&<span className="rc-diff">{diff>0?'+':'−'}{Math.abs(diff).toFixed(1)}</span>}
  </div>
  {other!==undefined&&<div className="rc-scale" style={{background:scale}} aria-hidden="true"><i className="rc-them" style={{left:other*10+'%'}}/><i className="rc-you" style={{left:result.mine*10+'%'}}/></div>}
  <p className="rc-verdict">{verdict(result)}{result.finished?' And that’s every chapter of this book rated!':''}</p>
  {xpLine(result.xp)&&<p className={'rc-xp'+(result.xp?.levelUp?' level-up':'')}>{xpLine(result.xp)}</p>}
  {!!result.streak&&<p className="rc-xp rc-streak">🔥 {result.streak}-day streak! +{50*Math.min(result.streak,10)} XP</p>}{!!result.badges?.length&&<p className="rc-xp rc-badge">Badge unlocked: {result.badges.join(', ')}</p>}
  {result.othersCount>0&&<small className="rc-note">Based on {result.othersCount} other reader{result.othersCount===1?'':'s'}</small>}
 </div>;
}
