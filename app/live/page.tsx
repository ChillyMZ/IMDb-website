import {requireChatGPTUser} from '../chatgpt-auth';
import Live from './reader';
export const dynamic='force-dynamic';
export default async function LivePage(){await requireChatGPTUser('/live');return <Live/>}
