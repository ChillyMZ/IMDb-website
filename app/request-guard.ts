import {storage} from './core-store';
import {RequestError} from './core-service';
export async function readJson(request:Request,limit=20000){
 if(!request.headers.get('content-type')?.includes('application/json'))throw new RequestError(415,'Send JSON data.');
 const bytes=await boundedBody(request,limit);let value:any;try{value=JSON.parse(new TextDecoder().decode(bytes))}catch{throw new RequestError(400,'Invalid form data. Please reload and retry.');}
 if(!value||typeof value!=='object'||Array.isArray(value))throw new RequestError(400,'Invalid form data.');return value;
}
export async function boundedBody(request:Request,limit:number){
 if(Number(request.headers.get('content-length')||0)>limit)throw new RequestError(413,'This request is too large.');
 const reader=request.body?.getReader();if(!reader)return new Uint8Array();const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw new RequestError(413,'This request is too large.')}chunks.push(value)}}finally{reader.releaseLock()}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}return bytes;
}
export async function limitRequests(user:string,scope:string,limit=30,seconds=60){
 const {db}=storage(),now=Date.now(),key=user+':'+scope,expires=now+seconds*1000;
 const row=await db.prepare('INSERT INTO request_limits (key,hits,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN request_limits.expires<=? THEN 1 ELSE request_limits.hits+1 END,expires=CASE WHEN request_limits.expires<=? THEN excluded.expires ELSE request_limits.expires END WHERE request_limits.expires<=? OR request_limits.hits<? RETURNING hits').bind(key,expires,now,now,now,limit).first();
 if(!row){const current=await db.prepare('SELECT expires FROM request_limits WHERE key=?').bind(key).first();throw new RequestError(429,`Too many requests. Try again in ${Math.max(1,Math.ceil((Number(current?.expires||expires)-now)/1000))} seconds.`)}
 await db.prepare('DELETE FROM request_limits WHERE key IN (SELECT key FROM request_limits WHERE expires<? LIMIT 100)').bind(now).run();
}
