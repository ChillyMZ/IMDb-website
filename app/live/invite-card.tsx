"use client";
// Invite a friend: personal link, share/copy, and progress toward the invite badges.
import {useState} from 'react';
import {Gift,Copy,Share2} from 'lucide-react';
import {INVITE} from './stats';

export default function InviteCard({userId,invites}:{userId:string;invites?:{friends:number;pending?:number;invited:boolean;chapters?:number}|null}){
 const [msg,setMsg]=useState('');
 const link=(typeof location!=='undefined'?location.origin+location.pathname:'https://chillymz.github.io/IMDb-website/')+'?invite='+encodeURIComponent(userId);
 const friends=invites?.friends||0,pending=invites?.pending||0,chapters=invites?.chapters||0;
 const next=friends<INVITE.recruiter?['Recruiter',INVITE.recruiter]:friends<INVITE.bookClub?['Book Club',INVITE.bookClub]:friends<INVITE.ambassador?['Ambassador',INVITE.ambassador]:null;
 async function share(){const text='Rate books chapter by chapter with me on ChillyMZ';try{if(navigator.share){await navigator.share({title:'ChillyMZ',text,url:link});return}}catch(e){if(e instanceof DOMException&&e.name==='AbortError')return}copy()}
 async function copy(){try{await navigator.clipboard.writeText(link);setMsg('Link copied!')}catch{setMsg(link)}}
 return <section className="p-panel invite-card">
  <div className="invite-head"><span className="invite-icon" aria-hidden="true"><Gift size={22}/></span><div><h2>Invite friends</h2><p className="p-muted">Earn <b>+{INVITE.perChapterXp} XP</b> for every chapter your friends rate, forever. The more friends you bring, the faster it adds up.</p></div></div>
  <div className="invite-link"><input readOnly value={link} aria-label="Your invite link" onFocus={e=>e.target.select()}/><button type="button" onClick={copy} aria-label="Copy invite link"><Copy size={16} aria-hidden="true"/></button></div>
  <button type="button" className="p-primary invite-share" onClick={share}><Share2 size={16} aria-hidden="true"/> Share invite link</button>
  {msg&&<p role="status" className="p-muted">{msg}</p>}
  <p className="invite-stats"><b>{friends+pending}</b> {friends+pending===1?'friend':'friends'} joined · <b>{chapters.toLocaleString()}</b> {chapters===1?'chapter':'chapters'} rated by them · <b>+{(chapters*INVITE.perChapterXp).toLocaleString()} XP</b> earned</p>
  {next&&<><p className="p-muted invite-next">{(next[1] as number)-friends} more {(next[1] as number)-friends===1?'friend':'friends'} (who rate {INVITE.qualifyRatings}+ chapters) to unlock <b>{next[0]}</b></p><progress value={friends} max={next[1] as number} aria-label={`Progress to ${next[0]}`}/></>}
 </section>;
}
