import {SITE_URL,SITE_INDEXABLE} from '../site-config';
export function GET(){return new Response(`User-agent: *\n${SITE_INDEXABLE?'Allow: /':'Disallow: /'}\nSitemap: ${SITE_URL}/sitemap.xml\n`,{headers:{'Content-Type':'text/plain; charset=utf-8'}})}
