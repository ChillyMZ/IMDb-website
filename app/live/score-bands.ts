// Missing ratings stay unrated; all scores below 5 use one Garbage band.
export const scoreBands=[
 {min:9.7,color:'#00E5FF',text:'#00343b',label:'9.7–10 · Cinema'},
 {min:9,color:'#006400',text:'#ffffff',label:'9–9.6 · Great'},
 {min:8,color:'#90EE90',text:'#142314',label:'8–8.9 · Good'},
 {min:7,color:'#FFD700',text:'#292200',label:'7–7.9 · Mid'},
 {min:5,color:'#FF0000',text:'#ffffff',label:'5–6.9 · Bad'},
 {min:0,color:'#800080',text:'#ffffff',label:'Below 5 · Garbage'}
];
export const scoreBand=(value:number|undefined)=>value===undefined?undefined:scoreBands.find(b=>value>=b.min);
