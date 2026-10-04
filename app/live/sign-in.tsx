'use client';
import {supabaseBrowserConfig,signOut} from './supabase-browser';

export async function browseAsGuest(){await signOut();window.location.href=supabaseBrowserConfig.basePath()}

export function signIn(){
 const returnTo=window.location.pathname+window.location.search+window.location.hash;
 const base=supabaseBrowserConfig.basePath();
 window.location.href=base+'login/?return_to='+encodeURIComponent(returnTo);
}
export function SignInLink({children='Sign in'}:{children?:React.ReactNode}){
 return <button type="button" className="live-sign-in" onClick={()=>signIn()}>{children}</button>
}
