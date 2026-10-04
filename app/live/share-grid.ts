import {scoreBand} from './score-bands';
import {readingLink} from './reading-links';
export async function exportGrid(book:{id:string;title:string;author:string;chapter_count:number},values:(number|undefined)[],counts:number[],mode:string,page=0){
 const pages=Math.ceil(book.chapter_count/100);
 {
 if(!Number.isInteger(page)||page<0||page>=pages)throw Error('Choose a valid chapter range.');
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const c=canvas.getContext('2d');if(!c)throw Error('Image export is unavailable.');
 c.fillStyle='#f8f7fa';c.fillRect(0,0,1080,1350);c.fillStyle='#6f42b5';c.font='bold 42px sans-serif';c.fillText('ChillyMZ / ScreenScore',48,64);c.fillStyle='#211c29';c.font='bold 38px sans-serif';
 const wrap=(text:string,y:number)=>{let line='';for(const word of text.split(' ')){if(c.measureText(line+' '+word).width>980){c.fillText(line,48,y);y+=44;line=word}else line+=(line?' ':'')+word}c.fillText(line,48,y);return y+44};
 let top=wrap(book.title,125);c.font='24px sans-serif';top=wrap(book.author,top);c.font='22px sans-serif';c.fillText(mode+' · '+counts.reduce((a,v)=>a+v,0)+' ratings · '+new Date().toLocaleDateString(),48,top);top+=40;
 const start=page*100,end=Math.min(start+100,book.chapter_count),width=91,gap=9,height=62;
 for(let i=start;i<end;i++){const local=i-start,x=48+Math.floor(local/10)*(width+gap),y=top+(local%10)*(height+12),v=values[i];const band=scoreBand(v);c.fillStyle=band?.color||'#e6e7eb';c.fillRect(x,y,width,height);c.fillStyle=band?.text||'#625969';c.font='16px sans-serif';c.fillText('C'+(i+1),x+8,y+20);c.font='bold 26px sans-serif';c.fillText(v===undefined?'—':v.toFixed(1),x+8,y+49);}
 c.fillStyle='#51465c';c.font='20px sans-serif';c.fillText('C'+(start+1)+'–C'+end+' · Unrated chapters show — · ScreenScore · 0.1–10',48,1170);c.font='16px sans-serif';wrap(readingLink(book.id),1215);
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Could not export image.')),'image/png'));const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='chillymz-'+book.id+'-'+(page+1)+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
 }
}
