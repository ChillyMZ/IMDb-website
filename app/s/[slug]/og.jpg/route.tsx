// Preview image for share links, rendered once per deploy as a static og.jpg (JPEG keeps it under
// WhatsApp's ~300 KB preview limit; PNG with a cover photo is ~450 KB).
import {ImageResponse} from 'next/og';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {shareBooks,scoresFor} from '../../og-data';
import {scoreBands} from '../../../live/score-bands';
export const dynamic='force-static';
const size={width:1200,height:630};
export function generateStaticParams(){return shareBooks.map(b=>({slug:b.slug}))}
const paper='#f6f2ea',ink='#1f1b16',muted='#6b6257',accent='#2f6f78';
async function cover(url:string){if(!url||url.startsWith('/'))return '';try{const r=await fetch(url);if(!r.ok)return '';const type=r.headers.get('content-type')||'image/jpeg';if(!type.startsWith('image/'))return '';return `data:${type};base64,${Buffer.from(await r.arrayBuffer()).toString('base64')}`}catch{return ''}}
export async function GET(_req:Request,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,b=shareBooks.find(x=>x.slug===slug)!;
 const [geist,serif,serifBold,img,s]=await Promise.all([readFile(join(process.cwd(),'node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf')),readFile(join(process.cwd(),'assets/fonts/Newsreader-500.ttf')),readFile(join(process.cwd(),'assets/fonts/Newsreader-600.ttf')),cover(b.cover||''),scoresFor(b)]);
 // Up to 60 chapters in the grid (6 columns of 10), same colours as the site.
 const shown=Math.min(b.chapter_count,60),cols=Math.ceil(shown/10),cell=Math.min(46,Math.floor(470/Math.max(cols,1))-6);
 const colour=(v:number|undefined)=>v===undefined?'#e4ddd1':scoreBands.find(x=>v>=x.min)!.color;
 const label=s.source==='readers'?`${s.average!.toFixed(1)} / 10 average · ${s.votes} reader vote${s.votes===1?'':'s'}`:s.source==='chillymz'?`ChillyMZ's score: ${s.average!.toFixed(1)} / 10`:`${b.chapter_count} chapters to rate`;
 const png=new ImageResponse(
  <div style={{width:'100%',height:'100%',display:'flex',background:paper,padding:'56px 64px',fontFamily:'Geist',color:ink}}>
   {img?<img src={img} width={300} height={450} style={{objectFit:'cover',borderRadius:10,boxShadow:'0 18px 40px rgba(31,27,22,.28)',marginRight:56,alignSelf:'center'}}/>:null}
   <div style={{display:'flex',flexDirection:'column',flex:1,justifyContent:'space-between'}}>
    <div style={{display:'flex',flexDirection:'column'}}>
     <div style={{display:'flex',fontSize:22,letterSpacing:3,color:accent,textTransform:'uppercase'}}>Chapter by chapter</div>
     <div style={{display:'flex',fontFamily:'NewsreaderBold',fontSize:b.title.length>28?54:68,lineHeight:1.04,marginTop:12}}>{b.title}</div>
     <div style={{display:'flex',fontFamily:'Newsreader',fontSize:30,color:muted,marginTop:8}}>{b.author}</div>
     <div style={{display:'flex',fontSize:28,marginTop:18}}>{label}</div>
    </div>
    {s.source!=='none'?<div style={{display:'flex',gap:6}}>{Array.from({length:cols},(_,c)=><div key={c} style={{display:'flex',flexDirection:'column',gap:6}}>{Array.from({length:Math.min(10,shown-c*10)},(_,i)=><div key={i} style={{width:cell,height:14,borderRadius:3,background:colour(s.values[c*10+i])}}/>)}</div>)}</div>:<div style={{display:'flex'}}/>}
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
     <div style={{display:'flex',alignItems:'flex-end',fontFamily:'NewsreaderBold',fontSize:38}}>ChillyMZ<div style={{width:14,height:14,borderRadius:7,background:'#2f6f78',marginLeft:6,marginBottom:6,alignSelf:'flex-end'}}/></div>
     <div style={{display:'flex',fontSize:24,background:accent,color:'#fff',padding:'12px 22px',borderRadius:8}}>Rate it · no sign-up</div>
    </div>
   </div>
  </div>,
  {...size,fonts:[{name:'Geist',data:geist,weight:400},{name:'Newsreader',data:serif,weight:500},{name:'NewsreaderBold',data:serifBold,weight:600}]});
 const buf=Buffer.from(await png.arrayBuffer());
 try{const sharp=(await import('sharp')).default;const jpg=await sharp(buf).jpeg({quality:82,mozjpeg:true}).toBuffer();return new Response(new Uint8Array(jpg),{headers:{'Content-Type':'image/jpeg'}})}catch{return new Response(new Uint8Array(buf),{headers:{'Content-Type':'image/png'}})}
}
