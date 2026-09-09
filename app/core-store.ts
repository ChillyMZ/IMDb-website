import {env} from 'cloudflare:workers';
export function storage(){const e=env as any;if(!e.DB||!e.BUCKET)throw new Error('Storage is unavailable');return {db:e.DB,bucket:e.BUCKET}}
