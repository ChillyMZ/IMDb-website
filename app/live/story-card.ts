// Instagram-story sized (1080x1920) image of a reader's chapter grid, in the site's paper-and-teal style.
import {scoreBand} from './score-bands';

type Book={id:string;title:string;author:string;chapter_count:number;cover?:string};
async function loadCover(src?:string){if(!src)return null;try{const r=await fetch(src,{mode:'cors'});if(!r.ok)return null;const u=URL.createObjectURL(await r.blob());const i=new Image();i.src=u;await i.decode();return i}catch{return null}}

export async function storyCard(book:Book,values:(number|undefined)[],name:string,level?:number):Promise<File>{
 const W=1080,H=1920,cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');if(!c)throw Error('Image export is unavailable.');
 const paper='#f6f2ea',ink='#1c1a17',muted='#6e675d',teal='#2f6f78',serif='"Newsreader", Georgia, serif',sans='-apple-system, "Segoe UI", Roboto, Arial, sans-serif';
 const t=(s:string,x:number,y:number,font:string,color=ink,align:CanvasTextAlign='left')=>{c.font=font;c.fillStyle=color;c.textAlign=align;c.fillText(s,x,y)};
 const box=(x:number,y:number,w:number,h:number,color:string,r=10)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()};
 const fit=(s:string,font:string,max:number)=>{c.font=font;let out=s;while(c.measureText(out).width>max&&out.length>3)out=out.slice(0,-2);return out===s?s:out.trimEnd()+'…'};
 c.fillStyle=paper;c.fillRect(0,0,W,H);
 t('ChillyMZ',80,150,`600 64px ${serif}`);t('CHAPTER-BY-CHAPTER RATINGS',W-80,145,`700 26px ${sans}`,teal,'right');
 box(80,190,W-160,3,'#cfc6b6',0);
 const cover=await loadCover(book.cover);
 const cx=80,cy=250,cw=260,ch=390;box(cx,cy,cw,ch,'#e9e2d4',12);
 if(cover){c.save();c.beginPath();c.roundRect(cx,cy,cw,ch,12);c.clip();const s=Math.max(cw/cover.naturalWidth,ch/cover.naturalHeight);c.drawImage(cover,cx+(cw-cover.naturalWidth*s)/2,cy+(ch-cover.naturalHeight*s)/2,cover.naturalWidth*s,cover.naturalHeight*s);c.restore()}
 const rated=values.filter((v):v is number=>v!==undefined),avg=rated.length?rated.reduce((a,v)=>a+v,0)/rated.length:undefined;
 const tx=380;t(fit(book.title,`500 58px ${serif}`,W-tx-80),tx,320,`500 58px ${serif}`);t(fit(book.author,`400 32px ${sans}`,W-tx-80),tx,372,`400 32px ${sans}`,muted);
 const band=scoreBand(avg);box(tx,420,250,120,band?.color||'#e9e2d4',16);t(avg===undefined?'—':avg.toFixed(1),tx+125,505,`700 72px ${sans}`,band?.text||ink,'center');
 t('my average',tx+275,470,`600 28px ${sans}`,muted);t(`${rated.length} / ${book.chapter_count} chapters`,tx+275,512,`400 28px ${sans}`,muted);
 t(`Rated by ${name}${level?` · Level ${level}`:''}`,tx,600,`600 30px ${sans}`,teal);
 // Grid: up to 100 chapters, 10 per column like the site.
 const n=Math.min(book.chapter_count,100),cols=Math.max(1,Math.ceil(n/10)),gx=80,gy=720,gw=W-160,gap=10,cellW=(gw-(cols-1)*gap)/cols,rows=Math.min(10,n),cellH=Math.min(96,(1640-gy-(rows-1)*gap)/rows);
 for(let i=0;i<n;i++){const col=Math.floor(i/10),row=i%10,x=gx+col*(cellW+gap),y=gy+row*(cellH+gap),v=values[i],b=scoreBand(v);box(x,y,cellW,cellH,b?.color||'#ebe5d9',8);
  const big=Math.min(40,cellW/2.6);t('C'+(i+1),x+cellW/2,y+cellH*0.38,`600 ${Math.min(22,big*0.6)}px ${sans}`,b?.text||muted,'center');t(v===undefined?'—':v.toFixed(1),x+cellW/2,y+cellH*0.8,`700 ${big}px ${sans}`,b?.text||muted,'center')}
 if(book.chapter_count>100)t(`First 100 of ${book.chapter_count} chapters`,W/2,1690,`400 26px ${sans}`,muted,'center');
 box(80,1740,W-160,2,'#cfc6b6',0);
 t('Rate every chapter with me',W/2,1810,`500 46px ${serif}`,ink,'center');t('chillymz.github.io/IMDb-website',W/2,1866,`600 30px ${sans}`,teal,'center');
 const blob=await new Promise<Blob>((ok,no)=>cv.toBlob(b=>b?ok(b):no(Error('Could not create the image.')),'image/png'));
 return new File([blob],`chillymz-${book.id}-story.png`,{type:'image/png'});
}

// Opens the phone share sheet (Instagram, etc.) when possible, otherwise downloads the image.
export async function shareStory(file:File,title:string){
 const nav=navigator as Navigator&{canShare?:(d:ShareData)=>boolean};
 if(nav.canShare?.({files:[file]})){try{await nav.share({files:[file],title,text:'My chapter ratings on ChillyMZ'});return 'shared'}catch(e){if(e instanceof DOMException&&e.name==='AbortError')return 'cancelled'}}
 const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);return 'downloaded';
}
