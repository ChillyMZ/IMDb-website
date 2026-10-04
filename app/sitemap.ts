import type {MetadataRoute} from 'next';
import books from './books/catalogue.json';
import {SITE_URL} from './site-config';
export const dynamic='force-static';
export default function sitemap():MetadataRoute.Sitemap{return ['', '/books','/privacy','/terms','/cookies',...books.map(b=>'/books/'+b.slug)].map(path=>({url:SITE_URL+path+'/'}))}
