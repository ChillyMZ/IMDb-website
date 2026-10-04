// ScreenScore's original five bands. A missing score is never a zero.
export const scoreBands=[
 {min:9,color:'#006400',text:'#ffffff',label:'9–10 · Great'},
 {min:8,color:'#90EE90',text:'#142314',label:'8–8.9 · Good'},
 {min:7,color:'#FFD700',text:'#292200',label:'7–7.9 · Mid'},
 {min:6,color:'#FF0000',text:'#ffffff',label:'6–6.9 · Bad'},
 {min:0,color:'#800080',text:'#ffffff',label:'Below 6'}
];
export const scoreBand=(value:number|undefined)=>value===undefined?undefined:scoreBands.find(b=>value>=b.min);
