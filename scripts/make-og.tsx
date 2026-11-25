// Renders public/og.png (the default link preview). Run: npx tsx scripts/make-og.tsx
import React from 'react';
import {ImageResponse} from 'next/og';
import {readFileSync,writeFileSync} from 'node:fs';
import {scoreBands} from '../app/live/score-bands';
const geist=readFileSync('node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf'),serif=readFileSync('assets/fonts/Newsreader-600.ttf'),serifIt=readFileSync('assets/fonts/Newsreader-500.ttf');
// A sample story curve: a decorative grid, not real data.
const sample=[7.4,7.9,8.3,6.8,7.2,8.8,9.1,8.4,7.7,9.3,9.8,8.9,7.1,6.4,8.2,9.4,9.7,8.6,8.1,9.9,7.6,8.5,9.2,9.6,8.7,7.3,8.0,9.0,9.5,10];
const col=(v:number)=>scoreBands.find(b=>v>=b.min)!.color;
const img=new ImageResponse(
 <div style={{width:'100%',height:'100%',display:'flex',background:'#f6f2ea',padding:'64px 72px',color:'#1f1b16',fontFamily:'Geist'}}>
  <div style={{display:'flex',flexDirection:'column',justifyContent:'space-between',flex:1}}>
   <div style={{display:'flex',alignItems:'flex-end',fontFamily:'Serif',fontSize:44}}>ChillyMZ<div style={{width:14,height:14,borderRadius:7,background:'#2f6f78',marginLeft:6,marginBottom:6,alignSelf:'flex-end'}}/></div>
   <div style={{display:'flex',flexDirection:'column'}}>
    <div style={{display:'flex',fontFamily:'Serif',fontSize:82,lineHeight:1.02}}>Every chapter,</div>
    <div style={{display:'flex',fontFamily:'SerifIt',fontSize:82,lineHeight:1.02,color:'#2f6f78'}}>rated by readers.</div>
    <div style={{display:'flex',fontSize:28,color:'#6b6257',marginTop:22}}>See which chapters readers love. Rate them yourself.</div>
   </div>
   <div style={{display:'flex',fontSize:24,color:'#6b6257'}}>From the chapter-rating grids of @chillymz</div>
  </div>
  <div style={{display:'flex',gap:8,alignSelf:'center',marginLeft:40}}>{[0,1,2].map(c=><div key={c} style={{display:'flex',flexDirection:'column',gap:8}}>{sample.slice(c*10,c*10+10).map((v,i)=><div key={i} style={{width:62,height:36,borderRadius:5,background:col(v),display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:scoreBands.find(b=>v>=b.min)!.text}}>{v.toFixed(1)}</div>)}</div>)}</div>
 </div>,{width:1200,height:630,fonts:[{name:'Geist',data:geist,weight:400},{name:'Serif',data:serif,weight:600},{name:'SerifIt',data:serifIt,weight:500}]});
img.arrayBuffer().then(b=>{writeFileSync('public/og.png',Buffer.from(b));console.log('wrote public/og.png')});
