import type {Metadata} from 'next';
import Link from 'next/link';
import books from './catalogue.json';
import {SITE_URL} from '../site-config';
import './books.css';
export const metadata:Metadata={title:'Book chapter ratings & discussions | ChillyMZ',description:'Browse books on ChillyMZ. Explore chapter rating grids, story curves and reader discussions for Red Rising, Fourth Wing, Hunger Games and more.',alternates:{canonical:SITE_URL+'/books/'}};
export default function Books(){return <div className="seo-books"><header><Link href="/">ChillyMZ <span>●</span></Link><Link href="/">Open rating catalogue</Link></header><main id="main-content"><h1>Book chapter ratings</h1><p>Find your book, explore its chapter grid, and share what you think with other readers. Browse freely; sign in to save ratings and join discussions.</p><div className="seo-book-list">{books.map(b=><Link key={b.id} href={'/books/'+b.slug+'/'} className="seo-book-card">{b.cover&&<img src={b.cover} alt={'Cover of '+b.title} width={200} height={300} loading="lazy"/>}<h2>{b.title}</h2><p>{b.author}</p><small>{b.chapter_count} numbered chapters</small></Link>)}</div></main><footer><Link href="/">Back to ChillyMZ</Link><a href="https://openlibrary.org">Covers: Open Library</a></footer></div>}
