// Ratings made before signing in. Kept in this browser only, then moved into the reader's
// account the first time they are signed in (see syncGuestRatings in reader.tsx).
export type GuestRating={book:string;chapter:number;score:number;date:string};
const KEY='cmz-guest-ratings';

export function loadGuestRatings():GuestRating[]{
 try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v.filter(r=>r&&typeof r.book==='string'&&Number.isInteger(r.chapter)&&typeof r.score==='number'):[]}catch{return []}
}
export function saveGuestRatings(list:GuestRating[]){
 try{if(list.length)localStorage.setItem(KEY,JSON.stringify(list));else localStorage.removeItem(KEY)}catch{/* storage blocked: ratings live for this visit only */}
}
// One rating per chapter: a new score replaces the old one.
export function addGuestRating(r:GuestRating):GuestRating[]{
 const list=loadGuestRatings().filter(x=>!(x.book===r.book&&x.chapter===r.chapter));list.push(r);saveGuestRatings(list);return list;
}
