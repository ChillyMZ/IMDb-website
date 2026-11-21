import {scoreBand} from './score-bands';
import {SITE_URL} from '../site-config';
import type {ReaderStatsResult,StatsEntry} from './stats';

// 1080×1920 story card for TikTok, Reels and Stories. Everything important sits
// inside y≈200–1480 and x≈90–940, clear of the apps' top bar, caption area and
// right-hand action buttons.
const W=1080,H=1920,X=90,CW=850;
const gold='#f4c95d',white='#f5f5f5',muted='#a8a8a8',panel='#1b1b1b',line='#383838';
const FONT='system-ui, -apple-system, "Segoe UI", Arial, sans-serif';

export async function statsCardBlob(name:string,s:ReaderStatsResult){
 const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
 const c=canvas.getContext('2d');if(!c)throw Error('Image export is unavailable on this device.');
 const font=(size:number,weight=400)=>{c.font=`${weight} ${size}px ${FONT}`};
 const text=(value:string,x:number,y:number,size:number,color=white,weight=400,align:CanvasTextAlign='left')=>{font(size,weight);c.fillStyle=color;c.textAlign=align;c.fillText(value,x,y);c.textAlign='left'};
 // Shrinks long names/titles down to `min`, then trims with an ellipsis.
 const fit=(value:string,x:number,y:number,width:number,size:number,min:number,color=white,weight=700)=>{
  let s2=size;font(s2,weight);while(c.measureText(value).width>width&&s2>min){s2-=2;font(s2,weight)}
  let out=value;if(c.measureText(out).width>width){while(out.length&&c.measureText(out+'…').width>width)out=out.slice(0,-1);out=out.trimEnd()+'…'}
  text(out,x,y,s2,color,weight);
 };
 const box=(x:number,y:number,w:number,h:number,color:string,r=18)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()};

 c.fillStyle='#101010';c.fillRect(0,0,W,H);
 const glow=c.createRadialGradient(W-80,140,20,W-80,140,900);glow.addColorStop(0,'#f4c95d2e');glow.addColorStop(1,'#f4c95d00');c.fillStyle=glow;c.fillRect(0,0,W,H);

 text('ChillyMZ',X,232,46,white,800);
 font(46,800);const brandW=c.measureText('ChillyMZ').width;c.fillStyle=gold;c.beginPath();c.arc(X+brandW+18,218,9,0,Math.PI*2);c.fill();
 text('MY CHAPTER STATS',X+CW,228,24,gold,700,'right');
 box(X,262,CW,3,gold,0);

 fit(name||'Reader',X,350,CW,68,44);
 text('rates books one chapter at a time',X,398,30,muted);

 const tiles:[string,string,string?][]=[
  [String(s.total),s.total===1?'chapter rated':'chapters rated'],
  [String(s.books),s.books===1?'book':'books',s.finished?s.finished+' finished':undefined],
  [s.average===undefined?'—':s.average.toFixed(2),'average score'],
  [String(s.best),'best day streak',s.current?s.current+' active now':undefined]
 ];
 tiles.forEach(([value,label,sub],i)=>{
  const tw=(CW-24)/2,x=X+(i%2)*(tw+24),y=440+Math.floor(i/2)*204;
  box(x,y,tw,180,panel);
  text(value,x+30,y+92,76,gold,800);
  text(label,x+30,y+138,28,white,600);
  if(sub)text(sub,x+tw-28,y+138,24,muted,400,'right');
 });

 const pick=(label:string,entry:StatsEntry|undefined,y:number)=>{
  if(!entry)return;
  text(label,X,y,24,gold,700);
  const band=scoreBand(entry.score);
  box(X,y+22,150,110,band?.color||'#2a2a2a',16);
  text(entry.score.toFixed(1),X+75,y+97,50,band?.text||white,800,'center');
  fit(entry.title,X+180,y+70,CW-180,40,28);
  text('Chapter '+entry.chapter,X+180,y+116,30,muted);
 };
 pick('FAVOURITE CHAPTER',s.kindest,910);
 pick('HARSHEST TAKE',s.harshest,1090);

 const mixY=s.harshest?1290:1110;
 text('MY SCORE MIX',X,mixY,24,gold,700);
 const used=s.bands.filter(b=>b.count>0),gap=6,barW=CW-gap*Math.max(0,used.length-1);let bx=X;
 c.save();c.beginPath();c.roundRect(X,mixY+22,CW,44,22);c.clip();
 used.forEach(b=>{const w=barW*b.count/Math.max(1,s.total);c.fillStyle=b.color;c.fillRect(bx,mixY+22,w,44);bx+=w+gap});
 c.restore();
 let lx=X;
 for(const b of used){const label=b.label.split(' · ').pop()+' '+b.count;font(24,600);const w=c.measureText(label).width+40;if(lx+w>X+CW)break;c.fillStyle=b.color;c.beginPath();c.arc(lx+9,mixY+104,9,0,Math.PI*2);c.fill();text(label,lx+26,mixY+113,24,muted,600);lx+=w+18}

 box(X,1400,CW,1,line,0);
 text('Rate chapters with me →',X,1452,36,white,700);
 text(SITE_URL.replace(/^https?:\/\//,''),X+CW,1452,26,gold,600,'right');

 return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Could not create the image.')),'image/png'));
}

// Shares through the phone's share sheet when it accepts image files
// (so it can go straight to TikTok/Instagram); otherwise downloads the PNG.
export async function shareStatsCard(name:string,s:ReaderStatsResult,preferShare:boolean):Promise<'shared'|'downloaded'>{
 const blob=await statsCardBlob(name,s),file=new File([blob],'chillymz-stats.png',{type:'image/png'});
 if(preferShare&&navigator.canShare?.({files:[file]})){
  await navigator.share({files:[file],title:'My ChillyMZ chapter stats',text:'My chapter ratings on ChillyMZ → '+SITE_URL+'/'});
  return 'shared';
 }
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
 return 'downloaded';
}
