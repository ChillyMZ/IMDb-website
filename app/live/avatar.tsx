"use client";
// The profile look used everywhere: initial in a level frame ring, with the streak flame on the corner.
import {Flame} from 'lucide-react';
import {frameFor} from './frames';
import {flameTier} from './stats';

export type Look={level:number;streak:number};
export default function Avatar({name,look,size='sm',frameId}:{name:string;look?:Look|null;size?:'xs'|'sm'|'md';frameId?:string}){
 const initial=(name||'R').trim().charAt(0).toUpperCase()||'R';
 const frame=frameId||(look?frameFor(look.level).id:'');
 return <span className={'avatar-wrap av-'+size}><span className={'av-pic'+(frame?' frame frame-'+frame:'')} aria-hidden="true">{initial}</span>{look&&look.streak>0&&<span className={'avatar-flame flame-'+flameTier(look.streak).id} title={`${look.streak}-day streak`}><Flame size={10} aria-hidden="true"/>{look.streak}</span>}</span>;
}
