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
