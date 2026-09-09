import {headers} from 'next/headers';
import {getChatGPTUser} from '../../chatgpt-auth';
import {OWNER_EMAIL} from '../../core-service';
export const dynamic='force-dynamic';
export async function GET(){const user=await getChatGPTUser(),h=await headers();if(!user||!h.get('oai-authenticated-user-id')||user.email.toLowerCase()!==OWNER_EMAIL)return Response.json({error:'Owner access required.'},{status:403});return Response.json({allowed:true},{headers:{'Cache-Control':'private, no-store'}})}
