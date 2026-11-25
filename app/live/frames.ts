// Profile-picture frames unlocked by reader level. Highest unlocked frame is shown.
export type Frame={id:'bronze'|'silver'|'gold'|'diamond'|'platinum';name:string;level:number};
export const FRAMES:Frame[]=[
 {id:'bronze',name:'Bronze',level:1},
 {id:'silver',name:'Silver',level:10},
 {id:'gold',name:'Gold',level:50},
 {id:'diamond',name:'Diamond',level:100},
 {id:'platinum',name:'Platinum',level:500},
];
export const frameFor=(level:number)=>[...FRAMES].reverse().find(f=>level>=f.level)||FRAMES[0];
export const nextFrame=(level:number)=>FRAMES.find(f=>f.level>level);

// The frame a reader chose to wear (any unlocked one). Saved in this browser.
const CHOICE_KEY='cmz-frame';
export function savedFrame():Frame['id']|''{try{return (localStorage.getItem(CHOICE_KEY)||'') as Frame['id']|''}catch{return ''}}
export function saveFrame(id:Frame['id']|''){try{if(id)localStorage.setItem(CHOICE_KEY,id);else localStorage.removeItem(CHOICE_KEY)}catch{/* storage blocked */}}
// Chosen frame if it is unlocked at this level, otherwise the highest unlocked one.
export function wornFrame(level:number,choice:string):Frame{const f=FRAMES.find(x=>x.id===choice);return f&&level>=f.level?f:frameFor(level)}
