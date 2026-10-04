"use client";
import {useState} from 'react';
export default function BookArt({book}:{book:{title:string;author:string;cover?:string}}){const [failed,setFailed]=useState('');return book.cover&&failed!==book.cover?<img src={book.cover} alt={`Cover of ${book.title} by ${book.author}`} width={600} height={900} loading="lazy" decoding="async" onError={()=>setFailed(book.cover||'')}/>:<div className="book-type-card"><small>CHILLYMZ / BOOKS</small><strong>{book.title}</strong><span>{book.author}</span></div>}
