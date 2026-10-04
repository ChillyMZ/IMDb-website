// Rank exact matches before nearby spellings; never match unrelated short queries.
const normalize=(text:string)=>text.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
export function editDistance(a:string,b:string):number{
 const matrix=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
 for(let i=0;i<=a.length;i++)matrix[i][0]=i;for(let j=0;j<=b.length;j++)matrix[0][j]=j;
 for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){
  matrix[i][j]=Math.min(matrix[i-1][j]+1,matrix[i][j-1]+1,matrix[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])matrix[i][j]=Math.min(matrix[i][j],matrix[i-2][j-2]+1);
 }return matrix[a.length][b.length];
}
const allowance=(length:number)=>length<4?0:length<8?1:2;
export function searchRank(query:string,title:string,author:string):number|null{
 const q=normalize(query),t=normalize(title),a=normalize(author);if(!q)return 0;
 if(q===t||q===a)return 0;if(t.includes(q)||a.includes(q))return 1;
 const compact=q.replace(/ /g,''),titleCompact=t.replace(/ /g,'');
 if(compact===titleCompact)return 1;
 if(compact.length>=5&&Math.abs(compact.length-titleCompact.length)<=allowance(compact.length)&&editDistance(compact,titleCompact)<=allowance(compact.length))return 2+editDistance(compact,titleCompact)/compact.length;
 const words=(t+' '+a).split(' '),tokens=q.split(' ');let total=0;
 for(const token of tokens){let best=Infinity;
  for(const word of words){
   if(word===token){best=0;break}
   if(token.length>=2&&word.startsWith(token)){best=Math.min(best,.1);continue}
   const allowed=allowance(token.length);if(!allowed||Math.abs(token.length-word.length)>allowed)continue;
   const distance=editDistance(token,word);if(distance<=allowed)best=Math.min(best,distance/token.length);
  }
  if(!Number.isFinite(best))return null;total+=best;
 }return 2+total/tokens.length;
}
