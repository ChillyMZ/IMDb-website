import type { Metadata } from "next";
import "./globals.css";
import './launch.css';
import CookiePreferences from './cookie-preferences';
import {SITE_URL,SITE_TITLE,SITE_DESCRIPTION,SITE_INDEXABLE} from './site-config';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  robots: {index:SITE_INDEXABLE,follow:SITE_INDEXABLE},
  openGraph:{type:'website',siteName:'ChillyMZ',title:SITE_TITLE,description:SITE_DESCRIPTION,url:SITE_URL,images:[{url:SITE_URL+'/og.png',width:1200,height:630,alt:'ChillyMZ — Rate stories. One chapter at a time.'}]},
  twitter:{card:'summary_large_image',title:SITE_TITLE,description:SITE_DESCRIPTION,images:[SITE_URL+'/og.png']},
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><a href="#main-content" className="skip-link">Skip to content</a>{children}<CookiePreferences/></body>
    </html>
  );
}
