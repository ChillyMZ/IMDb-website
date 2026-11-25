// "Hot take" story image (1080x1920): my score for one chapter against other readers (or ChillyMZ).
import {scoreBand} from './score-bands';

type Book={id:string;title:string;author:string;cover?:string};
async function loadCover(src?:string){if(!src)return null;try{const r=await fetch(src,{mode:'cors'});if(!r.ok)return null;const u=URL.createObjectURL(await r.blob());const i=new Image();i.src=u;await i.decode();return i}catch{return null}}

// Headline from how far apart the two scores are.
export function takeHeadline(mine:number,other?:number,who='readers'){
 if(other===undefined)return {kicker:'FIRST TO RATE IT',line:'I rated it first.'};
 const d=mine-other;
 if(Math.abs(d)>=2)return {kicker:'HOT TAKE',line:d>0?`I loved it. ${who==='readers'?'Readers':'ChillyMZ'} didn’t.`:`${who==='readers'?'Readers':'ChillyMZ'} loved it. I didn’t.`};
 if(Math.abs(d)>=1)return {kicker:'UNPOPULAR OPINION',line:d>0?`I rate it higher than ${who==='readers'?'most':'ChillyMZ'}.`:`I rate it lower than ${who==='readers'?'most':'ChillyMZ'}.`};
 return {kicker:'SAME PAGE',line:`${who==='readers'?'Readers':'ChillyMZ'} and I agree.`};
}

export async function takeCard(book:Book,chapter:number,mine:number,opts:{others?:number;othersCount?:number;chillymz?:number;link:string}):Promise<File>{
 const W=1080,H=1920,cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');if(!c)throw Error('Image export is unavailable.');
 const paper='#f6f2ea',ink='#1c1a17',muted='#6e675d',teal='#2f6f78',serif='"Newsreader", Georgia, serif',sans='-apple-system, "Segoe UI", Roboto, Arial, sans-serif';
 const t=(s:string,x:number,y:number,font:string,color=ink,align:CanvasTextAlign='left')=>{c.font=font;c.fillStyle=color;c.textAlign=align;c.fillText(s,x,y)};
 const box=(x:number,y:number,w:number,h:number,color:string,r=10)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()};
 const fit=(s:string,font:string,max:number)=>{c.font=font;let out=s;while(c.measureText(out).width>max&&out.length>3)out=out.slice(0,-2);return out===s?s:out.trimEnd()+'…'};
 const useReaders=opts.others!==undefined,other=useReaders?opts.others:opts.chillymz,who=useReaders?'readers':'chillymz',head=takeHeadline(mine,other,who);
 c.fillStyle=paper;c.fillRect(0,0,W,H);
 t('ChillyMZ',80,150,`600 64px ${serif}`);t('CHAPTER-BY-CHAPTER RATINGS',W-80,145,`700 26px ${sans}`,teal,'right');box(80,190,W-160,3,'#cfc6b6',0);
 // Book line
 const cover=await loadCover(book.cover);const cx=80,cy=250,cw=150,ch=225;box(cx,cy,cw,ch,'#e9e2d4',10);
 if(cover){c.save();c.beginPath();c.roundRect(cx,cy,cw,ch,10);c.clip();const s=Math.max(cw/cover.naturalWidth,ch/cover.naturalHeight);c.drawImage(cover,cx+(cw-cover.naturalWidth*s)/2,cy+(ch-cover.naturalHeight*s)/2,cover.naturalWidth*s,cover.naturalHeight*s);c.restore()}
 t(`Chapter ${chapter}`,270,320,`600 64px ${serif}`);t(fit(book.title,`400 40px ${serif}`,W-350),270,378,`400 40px ${serif}`,muted);t(fit(book.author,`400 30px ${sans}`,W-350),270,424,`400 30px ${sans}`,muted);
 // Headline
 t(head.kicker,W/2,620,`800 40px ${sans}`,teal,'center');
 const words=head.line.split(' ');let line='',y=720;const lines:string[]=[];c.font=`500 76px ${serif}`;for(const w of words){const next=line?line+' '+w:w;if(c.measureText(next).width>W-160&&line){lines.push(line);line=w}else line=next}lines.push(line);
 for(const l of lines){t(l,W/2,y,`500 76px ${serif}`,ink,'center');y+=88}
 // Score tiles
 const tile=(x:number,label:string,v:number|undefined,sub:string)=>{const b=scoreBand(v);box(x,920,380,440,b?.color||'#2a2a2a',28);t(v===undefined?'—':v.toFixed(1),x+190,1190,`800 140px ${sans}`,b?.text||'#b4b4b4','center');t(label,x+190,1430,`700 34px ${sans}`,ink,'center');t(sub,x+190,1478,`400 28px ${sans}`,muted,'center')};
 tile(80,'ME',mine,'my score');
 tile(620,useReaders?'READERS':opts.chillymz!==undefined?'CHILLYMZ':'READERS',other,useReaders?`${opts.othersCount} reader${opts.othersCount===1?'':'s'}`:opts.chillymz!==undefined?'the author of the grids':'no one yet');
 if(other!==undefined&&Math.abs(mine-other)>=.05){const d=mine-other;box(W/2-70,1105,140,70,ink,35);t((d>0?'+':'−')+Math.abs(d).toFixed(1),W/2,1153,`800 38px ${sans}`,'#fff','center')}
 box(80,1640,W-160,2,'#cfc6b6',0);
 t('What would you give it?',W/2,1730,`500 52px ${serif}`,ink,'center');t(opts.link.replace(/^https?:\/\//,'').replace(/\/$/,''),W/2,1800,`600 28px ${sans}`,teal,'center');
 const blob=await new Promise<Blob>((ok,no)=>cv.toBlob(b=>b?ok(b):no(Error('Could not create the image.')),'image/png'));
 return new File([blob],`chillymz-${book.id}-c${chapter}.png`,{type:'image/png'});
}
