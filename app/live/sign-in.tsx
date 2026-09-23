'use client';
import {supabaseBrowserConfig} from './supabase-browser';

export function signIn(){
 const returnTo=window.location.pathname+window.location.search+window.location.hash;
 const base=supabaseBrowserConfig.basePath();
 window.location.href=base+'login/?return_to='+encodeURIComponent(returnTo);
}
export function SignInLink({children='Sign in'}:{children?:React.ReactNode}){
 return <a href="#sign-in" onClick={e=>{e.preventDefault();signIn()}}>{children}</a>
}
