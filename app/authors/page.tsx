import type {Metadata} from 'next';
import Link from 'next/link';
import {scoreBands} from '../live/score-bands';
import {WAITLIST_URL} from './waitlist';
import './authors.css';

export const metadata:Metadata={title:'ChillyMZ for Authors: chapter-by-chapter reader scores',description:'Real readers score your manuscript chapter by chapter. See where your story hooks readers, where it drags, and how it compares to books readers love. Early access for authors.'};

// Illustrative example only (clearly labelled on the page): not real reader data.
const example=[7.4,7.9,8.3,7.1,6.4,6.1,6.8,8.0,8.6,9.1,8.2,8.8];
const band=(v:number)=>scoreBands.find(b=>v>=b.min)||scoreBands[scoreBands.length-1];

export default function Authors(){
 return <div className="authors">
  <header className="a-header"><Link href="/" className="a-brand">ChillyMZ <span>●</span></Link><nav><Link href="/books/">Chapter ratings</Link><a className="a-cta-small" href={WAITLIST_URL}>Get early access</a></nav></header>
  <main id="main-content">
   <section className="a-hero">
    <p className="a-kicker">ChillyMZ for Authors · Early access</p>
    <h1>Find the chapter where readers stop.</h1>
    <p className="a-lead">Real readers score your manuscript chapter by chapter. See where your story hooks them, where it drags, and how it compares to books readers love, before you publish.</p>
    <div className="a-actions"><a className="a-cta" href={WAITLIST_URL}>Join the early-access list</a><Link href="/books/" className="a-secondary">See how chapter ratings work</Link></div>
    <p className="a-note">Free for early-access authors while we build it. No card needed.</p>
   </section>

   <section className="a-example" aria-labelledby="example-title">
    <div className="a-example-head"><h2 id="example-title">What your report looks like</h2><span>Illustrative example, not real reader data</span></div>
    <div className="a-cells">{example.map((v,i)=>{const b=band(v);return <div key={i} className="a-cell" style={{background:b.color,color:b.text}}><small>C{i+1}</small><b>{v.toFixed(1)}</b></div>})}</div>
    <ul className="a-findings">
     <li><b>Chapters 5–6 dip below 6.5.</b> Most readers who stopped did so here.</li>
     <li><b>Chapter 10 is your strongest.</b> Readers called the reveal “the moment it clicked”.</li>
     <li><b>Your opening scores 7.4.</b> Comparable fantasy openings on ChillyMZ average around 7.6.</li>
    </ul>
   </section>

   <section className="a-steps" aria-labelledby="how-title">
    <h2 id="how-title">How it works</h2>
    <ol>
     <li><b>Upload your chapters.</b> Your manuscript stays private: only the readers you approve can see it.</li>
     <li><b>Readers score every chapter.</b> Invite your own beta readers, or get matched with ChillyMZ readers who love your genre.</li>
     <li><b>Get your chapter curve.</b> Scores, drop-off points, reader comments, and comparisons with published books in your genre.</li>
    </ol>
   </section>

   <section className="a-compare" aria-labelledby="why-title">
    <h2 id="why-title">Why not just beta readers?</h2>
    <div className="a-grid">
     <div><h3>Beta readers</h3><p>A handful of opinions in long comments. Hard to compare, easy to miss patterns.</p></div>
     <div><h3>Paid manuscript critiques</h3><p>Often hundreds of dollars per book, from one or two people.</p></div>
     <div className="a-us"><h3>ChillyMZ</h3><p>A score for every chapter from many readers, shown as one clear curve, measured against books readers already love.</p></div>
    </div>
   </section>

   <section className="a-for" aria-labelledby="for-title">
    <h2 id="for-title">Made for</h2>
    <ul><li>Self-published novelists revising before launch</li><li>Web-serial authors on Royal Road, Wattpad and similar sites</li><li>Authors preparing a manuscript for agents</li></ul>
   </section>

   <section className="a-founder">
    <h2>Built by an author</h2>
    <p>I’m ChillyMZ, author of the urban fantasy <i>Jace Halloway: When Shadows Stir</i>. I built ChillyMZ because I wanted to know which of my chapters worked, not just whether people liked the book. Join the early-access list and help shape what authors get first.</p>
    <a className="a-cta" href={WAITLIST_URL}>Join the early-access list</a>
   </section>
  </main>
  <footer className="a-footer"><Link href="/">ChillyMZ</Link><Link href="/privacy/">Privacy</Link><Link href="/terms/">Terms</Link></footer>
 </div>;
}
