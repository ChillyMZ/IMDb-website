'use client';
import {installAnalytics} from './analytics-client';
import {installApiProxy} from './live/supabase-browser';

if(typeof window!=='undefined'){installApiProxy();installAnalytics();}

export default function SupabaseBootstrap(){return null}
