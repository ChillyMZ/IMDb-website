import type { Metadata } from "next";
import "./globals.css";
import './launch.css';
import './site-light.css';
import CookiePreferences from './cookie-preferences';
import SupabaseBootstrap from './supabase-bootstrap';
import {SITE_URL,SITE_TITLE,SITE_DESCRIPTION,SITE_INDEXABLE} from './site-config';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  robots: {index:SITE_INDEXABLE,follow:SITE_INDEXABLE},
  openGraph:{type:'website',siteName:'ChillyMZ',title:SITE_TITLE,description:SITE_DESCRIPTION,url:SITE_URL,images:[{url:SITE_URL+'/og.png',width:1200,height:630,alt:'ChillyMZ — Rate stories. One chapter at a time.'}]},
  twitter:{card:'summary_large_image',title:SITE_TITLE,description:SITE_DESCRIPTION,images:[SITE_URL+'/og.png']},
  icons: {icon: "/IMDb-website/favicon.svg",shortcut: "/IMDb-website/favicon.svg"},
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..600&display=swap"/></head><body><SupabaseBootstrap/><a href="#main-content" className="skip-link">Skip to content</a>{children}<CookiePreferences/></body></html>;
}
