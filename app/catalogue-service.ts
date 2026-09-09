import {headers} from 'next/headers';
import {getChatGPTUser} from './chatgpt-auth';
import {OWNER_EMAIL,RequestError} from './core-service';
export async function catalogueUser(){
 const u=await getChatGPTUser(),h=await headers(),id=h.get('oai-authenticated-user-id');
 if(!u||!id)throw new RequestError(401,'Sign in to continue.');
 return {id,admin:u.email.toLowerCase()===OWNER_EMAIL};
}
export function bookCover(b:any){return {...b,cover:!b.cover_key?'':/^\/covers\/pg\d+\.jpg$/.test(b.cover_key)?b.cover_key:'/api/cover?id='+encodeURIComponent(b.id)}}
export function catalogueResponse(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}})}
export function catalogueError(e:unknown){if(e instanceof RequestError)return catalogueResponse({error:e.message},e.status);console.error('Catalogue operation failed',e);return catalogueResponse({error:'Could not load the catalogue. Please retry.'},503)}
