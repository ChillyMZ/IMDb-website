'use client';
export function signIn(){const returnTo=window.location.pathname+window.location.search+window.location.hash;window.open('/signin-with-chatgpt?return_to='+encodeURIComponent(returnTo),'_top')}
export function SignInLink({children='Sign in'}:{children?:React.ReactNode}){return <a href="/signin-with-chatgpt?return_to=%2F" target="_top" onClick={e=>{e.preventDefault();signIn()}}>{children}</a>}
