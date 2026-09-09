import {requireChatGPTUser} from '../chatgpt-auth';
import Live from './reader';
export const dynamic='force-dynamic';
export default async function LivePage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const params=await searchParams;const query=new URLSearchParams();for(const key of ['book','chapter'])if(typeof params?.[key]==='string')query.set(key,params[key] as string);await requireChatGPTUser('/live'+(query.size?'?'+query.toString():''));return <Live/>}
