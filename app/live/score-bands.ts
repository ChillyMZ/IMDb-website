// Missing ratings stay unrated; lower scores use darker purple.
export const scoreBands=[
 {min:9.7,color:'#00E5FF',text:'#00343b',label:'9.7–10 · Cinema'},
 {min:9,color:'#006400',text:'#ffffff',label:'9–9.6 · Great'},
 {min:8,color:'#90EE90',text:'#142314',label:'8–8.9 · Good'},
 {min:7,color:'#FFD700',text:'#292200',label:'7–7.9 · Mid'},
 {min:6,color:'#FF0000',text:'#ffffff',label:'6–6.9 · Bad'},
 {min:5,color:'#800080',text:'#ffffff',label:'5–5.9'},
 {min:4,color:'#690069',text:'#ffffff',label:'4–4.9'},
 {min:3,color:'#520052',text:'#ffffff',label:'3–3.9'},
 {min:2,color:'#3b003b',text:'#ffffff',label:'2–2.9'},
 {min:0,color:'#260026',text:'#ffffff',label:'Below 2'}
];
export const scoreBand=(value:number|undefined)=>value===undefined?undefined:scoreBands.find(b=>value>=b.min);
