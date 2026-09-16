'use client';
import {FormEvent,useEffect,useState} from 'react';
import {saveSession,supabaseBrowserConfig} from '../live/supabase-browser';

export default function LoginPage(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState(''),[mode,setMode]=useState<'login'|'signup'>('login'),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const api=supabaseBrowserConfig.url, key=supabaseBrowserConfig.publishableKey;
 useEffect(()=>{
  const h=new URLSearchParams(location.hash.replace(/^#/,''));
  const access=h.get('access_token'),refresh=h.get('refresh_token');
  if(access){saveSession({access_token:access,refresh_token:refresh||undefined,expires_in:Number(h.get('expires_in')||3600),token_type:h.get('token_type')||'bearer'});location.href=supabaseBrowserConfig.basePath();}
 },[]);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setMessage('');try{
  const endpoint=mode==='login'?api+'/auth/v1/token?grant_type=password':api+'/auth/v1/signup?redirect_to='+encodeURIComponent(location.origin+supabaseBrowserConfig.basePath()+'login/');
  const body=mode==='login'?{email,password}:{email,password,data:{full_name:name.trim()||'Reader'}};
  const r=await fetch(endpoint,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify(body)}),d=await r.json();
  if(!r.ok)throw Error(d.msg||d.error_description||d.message||'Could not sign in.');
  if(d.access_token){saveSession(d);location.href=new URLSearchParams(location.search).get('return_to')||supabaseBrowserConfig.basePath();return}
  setMessage('Check your email to confirm your account, then come back and sign in.');setMode('login');
 }catch(err){setMessage(err instanceof Error?err.message:'Could not sign in.')}finally{setBusy(false)}}
 return <main id="main-content" className="p-main" style={{maxWidth:520,margin:'8vh auto'}}><a href={supabaseBrowserConfig.basePath()} className="p-brand">ChillyMZ<span>●</span></a><section className="p-panel" style={{marginTop:24}}><h1>{mode==='login'?'Sign in':'Create account'}</h1><p>{mode==='login'?'Rate chapters, keep your diary, and join discussions.':'Create your ChillyMZ reader account.'}</p><form className="live-form" onSubmit={submit}>{mode==='signup'&&<label>Display name<input maxLength={80} value={name} onChange={e=>setName(e.target.value)} required/></label>}<label>Email<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" minLength={8} autoComplete={mode==='login'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)} required/></label>{message&&<p role="status">{message}</p>}<button className="p-primary" disabled={busy}>{busy?'Please wait…':mode==='login'?'Sign in':'Create account'}</button></form><button style={{marginTop:12}} onClick={()=>{setMessage('');setMode(mode==='login'?'signup':'login')}}>{mode==='login'?'New here? Create an account':'Already have an account? Sign in'}</button></section></main>;
}
