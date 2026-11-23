"use client";
import {useEffect,useState} from 'react';

// Picks a cover's strongest colour (the biggest group of vivid pixels) for the soft glow behind a book.
// Returns undefined until loaded, or if the image host blocks reading pixels; the page then just has no glow.
const cache=new Map<string,string>();
export function useCoverColor(url?:string){
 const [found,setFound]=useState<{url:string;color:string}>();
 useEffect(()=>{
  if(!url||cache.has(url))return;
  let live=true;const img=new Image();img.crossOrigin='anonymous';
  img.onload=()=>{try{
   const c=document.createElement('canvas');c.width=24;c.height=36;const ctx=c.getContext('2d',{willReadFrequently:true});if(!ctx)return;
   ctx.drawImage(img,0,0,24,36);const px=ctx.getImageData(0,0,24,36).data;
   // Group vivid pixels by hue and take the strongest group; greyscale covers fall back to their average.
   const groups=Array.from({length:12},()=>({r:0,g:0,b:0,w:0}));let ar=0,ag=0,ab=0,n=0;
   for(let i=0;i<px.length;i+=4){const [r,g,b]=[px[i],px[i+1],px[i+2]],max=Math.max(r,g,b),min=Math.min(r,g,b),sat=max?(max-min)/max:0;ar+=r;ag+=g;ab+=b;n++;
    if(sat<.35||max<60)continue;const d=max-min,h=max===r?((g-b)/d+6)%6:max===g?(b-r)/d+2:(r-g)/d+4,x=groups[Math.floor(h*2)%12],w=sat*sat;x.r+=r*w;x.g+=g*w;x.b+=b*w;x.w+=w}
   const best=groups.reduce((a,b)=>b.w>a.w?b:a),vivid=best.w>n*.02;
   const [vr,vg,vb]=[best.r/best.w,best.g/best.w,best.b/best.w],lift=210/Math.max(vr,vg,vb,1);
   const value=vivid?`rgb(${Math.round(Math.min(255,vr*lift))} ${Math.round(Math.min(255,vg*lift))} ${Math.round(Math.min(255,vb*lift))})`:`rgb(${Math.round(ar/n)} ${Math.round(ag/n)} ${Math.round(ab/n)})`;
   cache.set(url,value);if(live)setFound({url,color:value});
  }catch{/* cross-site image without permission: no glow */}};
  img.src=url;return ()=>{live=false};
 },[url]);
 return url?cache.get(url)??(found?.url===url?found.color:undefined):undefined;
}
