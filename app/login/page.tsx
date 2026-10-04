'use client';
import './login.css';
import {FormEvent,useEffect,useState} from 'react';
import {saveSession,supabaseBrowserConfig,currentSession,clearSession} from '../live/supabase-browser';

type Mode='login'|'signup'|'forgot'|'reset';
function returnPath(){
 const base=supabaseBrowserConfig.basePath(),raw=new URLSearchParams(location.search).get('return_to')||base;
 try{const u=new URL(raw,location.origin);return u.origin===location.origin&&u.pathname.startsWith(base)&&!u.pathname.includes('/login')?u.pathname+u.search+u.hash:base}catch{return base}
}
export default function LoginPage(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState(''),[mode,setMode]=useState<Mode>('login'),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const api=supabaseBrowserConfig.url,key=supabaseBrowserConfig.publishableKey;
 useEffect(()=>{
  const h=new URLSearchParams(location.hash.replace(/^#/,''));
  if(h.get('error_description')){setMessage(h.get('error_description')!);history.replaceState({},'',location.pathname+location.search);return}
  const access=h.get('access_token'),refresh=h.get('refresh_token');
  if(access){saveSession({access_token:access,refresh_token:refresh||undefined,expires_in:Number(h.get('expires_in')||3600),token_type:h.get('token_type')||'bearer'});history.replaceState({},'',location.pathname+location.search);if(['recovery','invite'].includes(h.get('type')||''))setMode('reset');else location.href=returnPath();}
 },[]);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setMessage('');try{
  const redirect=encodeURIComponent(location.origin+supabaseBrowserConfig.basePath()+'login/');
  const endpoint=mode==='login'?api+'/auth/v1/token?grant_type=password':mode==='signup'?api+'/auth/v1/signup?redirect_to='+redirect:mode==='forgot'?api+'/auth/v1/recover?redirect_to='+redirect:api+'/auth/v1/user';
  const headers:Record<string,string>={apikey:key,'Content-Type':'application/json'};
  if(mode==='reset'){const session=currentSession();if(!session?.access_token)throw Error('Open a new password reset link from your email.');headers.Authorization='Bearer '+session.access_token;}
  const body=mode==='login'?{email,password}:mode==='signup'?{email,password,data:{full_name:name.trim()||'Reader'}}:mode==='forgot'?{email}:{password};
  const r=await fetch(endpoint,{method:mode==='reset'?'PUT':'POST',headers,body:JSON.stringify(body)}),d=await r.json();
  if(!r.ok)throw Error(d.msg||d.error_description||d.message||'Could not complete this request.');
  if(mode==='forgot'){setMessage('If this account exists, check your email for a password reset link.');return}
  if(mode==='reset'){clearSession();setPassword('');setMode('login');setMessage('Password saved. Sign in with your new password.');return}
  if(d.access_token){saveSession(d);location.href=returnPath();return}
  setMessage('Check your email to confirm your account, then come back and sign in.');setMode('login');
 }catch(err){setMessage(err instanceof Error?err.message:'Could not sign in.')}finally{setBusy(false)}}
 const heading=mode==='login'?'Sign in':mode==='signup'?'Create account':mode==='forgot'?'Reset your password':'Choose a password';
 return <main id="main-content" className="auth-page"><a href={supabaseBrowserConfig.basePath()} className="auth-brand">ChillyMZ<span>●</span></a><section className="auth-card"><h1>{heading}</h1><p>Rate chapters, keep your diary, and join discussions.</p><form className="auth-form" onSubmit={submit}>{mode==='signup'&&<label>Display name<input maxLength={80} value={name} onChange={e=>setName(e.target.value)} required/></label>}{mode!=='reset'&&<label>Email<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>}{mode!=='forgot'&&<label>Password<input type="password" minLength={8} autoComplete={mode==='login'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)} required/></label>}{message&&<p role="status">{message}</p>}<button className="auth-submit" disabled={busy}>{busy?'Please wait…':mode==='forgot'?'Send reset link':mode==='reset'?'Save password':heading}</button></form>{mode==='login'&&<button onClick={()=>{setMessage('');setMode('forgot')}}>Forgot password?</button>}<button style={{marginTop:12}} onClick={()=>{setMessage('');setMode(mode==='login'?'signup':'login')}}>{mode==='login'?'New here? Create an account':'Back to sign in'}</button><p><a href={supabaseBrowserConfig.basePath()}>Browse books as a guest</a></p></section></main>;
}
