import {storage} from '../../core-store';
import {catalogueUser,catalogueResponse,catalogueError,bookCover} from '../../catalogue-service';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{
 await catalogueUser();const {db}=storage(),p=new URL(request.url).searchParams;
 const query=(p.get('q')||'').trim().slice(0,160),pageSize=12;
 const requested=Number(p.get('page')||1),page=Number.isSafeInteger(requested)&&requested>0?requested:1;
 const filter="b.status='approved' AND (?='' OR instr(lower(b.title || ' ' || b.author),lower(?))>0)";
 const counts=await db.prepare(`SELECT COUNT(*) AS total FROM books b WHERE ${filter}`).bind(query,query).first();
 const total=Number(counts.total),pages=Math.max(1,Math.ceil(total/pageSize)),current=Math.min(page,pages);
 const order=p.get('sort')==='Highest rated'?'average DESC, votes DESC':p.get('sort')==='Popular'?'votes DESC, average DESC':p.get('sort')==='Newest'?'b.created DESC':'b.title COLLATE NOCASE ASC';
 const rows=await db.prepare(`WITH chapter_scores AS (SELECT book,chapter,AVG(score)/10.0 AS average,COUNT(*) AS votes FROM ratings GROUP BY book,chapter), scores AS (SELECT book,AVG(average) AS average,SUM(votes) AS votes FROM chapter_scores GROUP BY book) SELECT b.*,s.average,COALESCE(s.votes,0) AS votes FROM books b LEFT JOIN scores s ON s.book=b.id WHERE ${filter} ORDER BY ${order},b.title COLLATE NOCASE ASC,b.id ASC LIMIT ? OFFSET ?`).bind(query,query,pageSize,(current-1)*pageSize).all();
 return catalogueResponse({books:rows.results.map(bookCover),total,page:current,pages,pageSize});
 }catch(e){return catalogueError(e)}}
