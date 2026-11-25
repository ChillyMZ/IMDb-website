// Renders app icons (favicon, home-screen icons). Run: npx tsx scripts/make-icons.tsx
import React from 'react';
import {ImageResponse} from 'next/og';
import {readFileSync,writeFileSync} from 'node:fs';
const serif=readFileSync('assets/fonts/Newsreader-600.ttf');
async function icon(size:number,file:string,pad=0){
 const inner=size-pad*2;
 const img=new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:pad?'#2f6f78':'transparent'}}>
  <div style={{width:inner,height:inner,borderRadius:pad?0:inner*0.22,background:'#2f6f78',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
   <div style={{display:'flex',fontFamily:'Serif',fontSize:inner*0.74,color:'#f6f2ea',marginTop:-inner*0.06}}>C</div>
   <div style={{position:'absolute',right:inner*0.2,bottom:inner*0.24,width:inner*0.11,height:inner*0.11,borderRadius:inner,background:'#f4c95d'}}/>
  </div></div>,{width:size,height:size,fonts:[{name:'Serif',data:serif,weight:600}]});
 writeFileSync(file,Buffer.from(await img.arrayBuffer()));console.log('wrote',file);
}
(async()=>{await icon(192,'public/icon-192.png',0);await icon(512,'public/icon-512.png',0);await icon(512,'public/icon-maskable-512.png',64);await icon(180,'public/apple-touch-icon.png',18);await icon(64,'public/favicon.png',0)})();
