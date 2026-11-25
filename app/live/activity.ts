// Interactions that keep a daily streak alive besides ratings: posts, replies, votes,
// chapter reviews, book requests/submissions and profile edits. Logged in this browser;
// the reader page also adds the dates of the reader's own community posts and replies.
const KEY='cmz-activity',EVENT='cmz-activity';
export function loadActivity():string[]{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string'):[]}catch{return []}}
export function logActivity(){
 try{const list=[...loadActivity(),new Date().toISOString()].slice(-500);localStorage.setItem(KEY,JSON.stringify(list))}catch{/* storage blocked */}
 try{window.dispatchEvent(new Event(EVENT))}catch{/* no window */}
}
export function onActivity(fn:()=>void){window.addEventListener(EVENT,fn);return ()=>window.removeEventListener(EVENT,fn)}
