import type {MetadataRoute} from 'next';
import {SITE_URL} from './site-config';
export const dynamic='force-static';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/IMDb-website/',disallow:['/IMDb-website/login/','/IMDb-website/live/','/IMDb-website/demo/']},sitemap:SITE_URL+'/sitemap.xml'}}
