// Shared business rules; runtime identity is supplied only by the server adapter.
export const OWNER_EMAIL='owner@example.invalid';
export class RequestError extends Error{constructor(public status:number,message:string){super(message)}}
export function validateRating(chapter:unknown,score:unknown,count:number){
 if(!Number.isInteger(chapter)||Number(chapter)<1||Number(chapter)>count)throw new RequestError(400,'Invalid chapter.');
 if(typeof score!=='number'||!Number.isInteger(Math.round(score*10))||score<0.1||score>10||Math.abs(score*10-Math.round(score*10))>0.00001)throw new RequestError(400,'Use a score from 0.1 to 10 in steps of 0.1.');
 return Math.round(score*10);
}
export function validBook(input:any){
 const title=String(input.title||'').trim(),author=String(input.author||'').trim(),count=Number(input.chapterCount);
 if(!title||title.length>160||!author||author.length>120||!Number.isInteger(count)||count<1||count>500)throw new RequestError(400,'Enter a title, author and whole chapter count from 1 to 500.');
 return {title,author,count};
}
export function requireAdmin(user:{admin:boolean}){if(!user.admin)throw new RequestError(403,'Only the site owner can review books.')}
export function coverType(bytes:Uint8Array){
 if(bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71&&bytes[4]===13&&bytes[5]===10&&bytes[6]===26&&bytes[7]===10)return 'image/png';
 if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
 if(String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP')return 'image/webp';
 throw new RequestError(400,'Use a PNG, JPEG or WebP cover.');
}
