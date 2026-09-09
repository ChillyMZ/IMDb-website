export async function optimizeCover(file:File):Promise<File>{
 if(file.size>5*1024*1024)throw Error('Choose a cover under 5 MB.');
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Use a PNG, JPEG or WebP cover.');
 if(typeof createImageBitmap==='undefined')return file;
 const bitmap=await createImageBitmap(file);try{
 const ratio=Math.min(1,720/bitmap.width,1080/bitmap.height),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
 const context=canvas.getContext('2d');if(!context)return file;context.drawImage(bitmap,0,0,canvas.width,canvas.height);
 const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',.82));
 return blob&&blob.size<file.size?new File([blob],file.name.replace(/\.[^.]+$/,'')+'.webp',{type:blob.type}):file;
 }finally{bitmap.close()}
}
