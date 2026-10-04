import {scoreBand,scoreBands} from './score-bands';

type ExportBook={id:string;title:string;author:string;chapter_count:number;cover?:string};

// Fetching the cover with CORS keeps the canvas downloadable. A failed cover
// still produces a complete chart with a branded jacket placeholder.
async function loadCover(source?:string){
 if(!source)return null;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
 let url='';
 try{
  const response=await fetch(source,{mode:'cors',signal:controller.signal});
  if(!response.ok)return null;
  url=URL.createObjectURL(await response.blob());
  const image=new Image();image.src=url;await image.decode();return image;
 }catch{return null}finally{clearTimeout(timer);if(url)URL.revokeObjectURL(url)}
}

export async function exportGrid(book:ExportBook,values:(number|undefined)[],counts:number[],mode:string,page=0){
 const pages=Math.ceil(book.chapter_count/100);
 if(!Number.isInteger(page)||page<0||page>=pages)throw Error('Choose a valid chapter range.');
 const start=page*100,end=Math.min(start+100,book.chapter_count),columns=Math.ceil((end-start)/10);
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=940;
 const c=canvas.getContext('2d');if(!c)throw Error('Image export is unavailable.');
 const gold='#f4c95d',white='#f7f6f2',muted='#aaa9a4';
 const box=(x:number,y:number,w:number,h:number,color:string,r=7)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()};
 const text=(value:string,x:number,y:number,size:number,color=white,bold=false)=>{c.fillStyle=color;c.font=`${bold?'700':'400'} ${size}px Arial, sans-serif`;c.fillText(value,x,y)};
 const wrap=(value:string,x:number,y:number,width:number,size:number,maxLines=4)=>{
  c.font=`700 ${size}px Arial, sans-serif`;
  const words=value.split(/\s+/);let line='',row=0;
  for(let i=0;i<words.length;i++){
   const next=line?line+' '+words[i]:words[i];
   if(c.measureText(next).width>width&&line){
    text(line,x,y+row*(size+7),size,white,true);row++;line=words[i];
    if(row===maxLines-1){line=words.slice(i).join(' ');break}
   }else line=next;
  }
  while(c.measureText(line).width>width&&line.length)line=line.slice(0,-1);
  if(row===maxLines-1&&value.length>line.length)line=line.trimEnd()+'…';
  text(line,x,y+row*(size+7),size,white,true);return y+(row+1)*(size+7);
 };
 c.fillStyle='#111214';c.fillRect(0,0,1080,940);
 text('ChillyMZ',36,53,30,white,true);text('SCREENSCORE / CHAPTER RATINGS',280,51,17,gold,true);
 box(36,74,1008,2,gold,0);
 const cover=await loadCover(book.cover);
 box(36,108,214,316,'#242426',10);
 if(cover){
  const scale=Math.min(214/cover.naturalWidth,316/cover.naturalHeight),w=cover.naturalWidth*scale,h=cover.naturalHeight*scale;
  c.save();c.beginPath();c.roundRect(36,108,214,316,10);c.clip();c.drawImage(cover,36+(214-w)/2,108+(316-h)/2,w,h);c.restore();
 }else{box(56,133,4,263,gold,0);wrap(book.title,77,177,150,23,6);text('CHILLYMZ',77,395,15,gold,true)}
 let infoY=wrap(book.title,36,464,214,26,5);
 infoY=wrap(book.author,36,infoY+6,214,17,3);
 const rated=values.filter((v):v is number=>v!==undefined&&Number.isFinite(v));
 const average=rated.length?(rated.reduce((sum,v)=>sum+v,0)/rated.length).toFixed(2):'—';
 text('★ '+average+' / 10',36,infoY+27,25,gold,true);
 text(mode,36,infoY+60,17);text(rated.length+' / '+book.chapter_count+' chapters rated',36,infoY+86,15,muted);
 text('Average of rated chapters',36,infoY+111,13,muted);
 const legend=[...scoreBands.map(b=>({color:b.color,label:b.label})),{color:'#34363c',label:'Unrated'}];
 legend.forEach((band,i)=>{const x=280+(i%4)*193,y=112+Math.floor(i/4)*29;box(x,y-11,11,11,band.color,5);text(band.label,x+17,y,12,muted)});
 const gridX=280,gridY=243,gapX=8,gapY=8,cellW=(764-(Math.max(columns,4)-1)*gapX)/Math.max(columns,4),cellH=48;
 for(let col=0;col<columns;col++){
  const first=start+col*10+1,last=Math.min(first+9,end);
  c.textAlign='center';text(first+'–'+last,gridX+col*(cellW+gapX)+cellW/2,222,13,muted);c.textAlign='left';
  for(let row=0;row<10;row++){
   const index=start+col*10+row;if(index>=end)break;
   const v=values[index],band=scoreBand(v),x=gridX+col*(cellW+gapX),y=gridY+row*(cellH+gapY);
   box(x,y,cellW,cellH,band?.color||'#34363c');
   text('C'+(index+1),x+7,y+15,10,band?.text||'#c5c5c7');
   c.textAlign='center';text(v===undefined?'—':v.toFixed(1),x+cellW/2,y+37,21,band?.text||'#c5c5c7',true);c.textAlign='left';
  }
 }
 // Center only the grid labels and scores; book metadata stays left aligned.
 // Footer identifies the selected range and never implies missing scores are zero.
 box(36,829,1008,1,'#343438',0);
 text('C'+(start+1)+'–C'+end+' · '+counts.slice(start,end).reduce((sum,v)=>sum+v,0)+' ratings in this range',36,865,16,muted);
 text('Unrated chapters show — · Read down each column',36,893,14,muted);
 text('ChillyMZ / ScreenScore',773,865,19,gold,true);
 text('One chapter at a time.',820,892,14,muted);
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Could not export image.')),'image/png'));
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='chillymz-'+book.id+'-'+(page+1)+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
