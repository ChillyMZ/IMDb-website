'use client';
import {installApiProxy} from './live/supabase-browser';

if(typeof window!=='undefined')installApiProxy();

export default function SupabaseBootstrap(){return null}
