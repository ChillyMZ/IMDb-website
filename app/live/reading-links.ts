import catalogue from '../books/catalogue.json';
const slugs=new Map(catalogue.map(b=>[b.id,b.slug]));
// Books with a share page get /s/<slug>/ links, which show a proper preview card in DMs and posts.
export function readingLink(book:string,chapter=0){const url=new URL(window.location.href);url.search='';url.hash='';const slug=slugs.get(book);if(slug){const s=new URL('s/'+slug+'/',url);if(chapter)s.searchParams.set('c',String(chapter));return s.toString()}url.searchParams.set('book',book);if(chapter)url.searchParams.set('chapter',String(chapter));return url.toString()}
// First unrated chapter after `after` (wrapping to the start), so saving chapter 31 moves to 32, not back to 1.
export function nextUnrated(count:number,ratings:{chapter:number}[],after=0){const done=new Set(ratings.map(r=>r.chapter));for(let i=1;i<=count;i++){const n=(after+i-1)%count+1;if(!done.has(n))return n}return 0}
