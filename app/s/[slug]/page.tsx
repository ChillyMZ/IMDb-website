import type {Metadata} from 'next';
import {shareBooks} from '../og-data';
import {SITE_URL} from '../../site-config';
// Share links: /s/<book>/?c=<chapter>. Messaging apps read this page's preview card;
// people are sent straight on to the book (and chapter) in the app.
export const dynamicParams=false;
export function generateStaticParams(){return shareBooks.map(b=>({slug:b.slug}))}
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const {slug}=await params,b=shareBooks.find(x=>x.slug===slug);if(!b)return {};const title=`${b.title} — rated chapter by chapter`,description=`See which chapters of ${b.title} readers love, then rate them yourself. No sign-up needed.`;return {title,description,robots:{index:false,follow:true},alternates:{canonical:SITE_URL+'/books/'+b.slug+'/'},openGraph:{title,description,url:SITE_URL+'/s/'+b.slug+'/',type:'website',siteName:'ChillyMZ',images:[{url:SITE_URL+'/s/'+b.slug+'/og.jpg',width:1200,height:630,alt:`${b.title} chapter ratings on ChillyMZ`}]},twitter:{card:'summary_large_image',title,description,images:[SITE_URL+'/s/'+b.slug+'/og.jpg']}}}
export default async function Share({params}:Props){const {slug}=await params,b=shareBooks.find(x=>x.slug===slug)!;const target='../../?book='+encodeURIComponent(b.id);
 const go=`(function(){var c=new URLSearchParams(location.search).get('c');var t=${JSON.stringify(target)}+(c&&/^\\d+$/.test(c)?'&chapter='+c:'');var i=new URLSearchParams(location.search).get('invite');if(i)t+='&invite='+encodeURIComponent(i);location.replace(t)})()`;
 return <main style={{fontFamily:'system-ui',padding:32,background:'#f6f2ea',minHeight:'100vh'}}><script dangerouslySetInnerHTML={{__html:go}}/><p>Opening {b.title} on ChillyMZ… <a href={target}>Continue</a></p></main>}
