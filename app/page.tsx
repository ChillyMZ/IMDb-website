import type {Metadata} from 'next';
import {SITE_URL} from './site-config';
export const metadata:Metadata={alternates:{canonical:SITE_URL+'/'}};
export {default} from './live/page';
