"use client";
import {useEffect,useState} from 'react';
import {NativeSelect} from '@/components/ui/native-select';
export default function BookPicker({value,onChange}:{value:string;onChange:(id:string)=>void}){
 const [query,setQuery]=useState(''),[books,setBooks]=useState<{id:string;title:string}[]>([]),[chosen,setChosen]=useState<{id:string;title:string}|null>(null),[error,setError]=useState('');
 useEffect(()=>{const abort=new AbortController();const timer=setTimeout(async()=>{try{const r=await fetch('/api/catalogue?'+new URLSearchParams({q:query,sort:'Title'}),{signal:abort.signal}),d=await r.json();if(!r.ok)throw Error(d.error);setBooks(d.books);setError('')}catch(e){if(!abort.signal.aborted)setError(e instanceof Error?e.message:'Could not search books.')}},200);return()=>{clearTimeout(timer);abort.abort()}},[query]);
 return <div><label>Find a book (optional)<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search title or author"/></label><label>Book<NativeSelect value={value} onChange={e=>{onChange(e.target.value);setChosen(books.find(b=>b.id===e.target.value)||null)}}><option value="">General book talk</option>{chosen&&!books.some(b=>b.id===chosen.id)&&<option value={chosen.id}>{chosen.title}</option>}{books.map(b=><option key={b.id} value={b.id}>{b.title}</option>)}</NativeSelect></label><small>Showing up to 12 matches. Type more to narrow your search.</small>{error&&<p role="alert">{error}</p>}</div>
}
