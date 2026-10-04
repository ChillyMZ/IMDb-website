export type ApiResult<T> = T & {error?:string; held?:boolean};
export async function apiResponse<T=Record<string,unknown>>(response:Response):Promise<ApiResult<T>> {
 const value:unknown=await response.json();
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Could not read the server response. Please retry.');
 return value as ApiResult<T>;
}
