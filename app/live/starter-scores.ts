// Conservative editorial interpretations, not measured averages or user votes.
// Sources retained for review; public cells are explicitly marked E.
// Sparse evidence stays absent rather than filling every chapter artificially.
export const starterScores:Record<string,Record<number,number>>={
 'a21af306-88b7-4d28-b5b4-738d26d71adf':{1:6.8,2:7.0,3:6.9,4:6.7,5:7.3,6:7.6,12:7.5},
 '1702dc13-12ff-4438-b13e-637e7b230d46':{1:6.9,2:7.7,3:7.3,4:6.8,5:7.2,6:7.5,7:7.6,8:7.2,9:7.7,10:8.0,11:7.8,12:7.5,13:6.8,14:8.5,15:7.0,16:7.2,17:7.1,18:8.4,19:7.9,20:7.4,21:8.0,22:8.2,23:7.3,24:7.9,25:8.0,27:8.3,28:8.5,29:7.6,30:8.4,31:6.9,32:8.1,33:7.0,34:7.2,35:7.4,36:8.5,37:8.7,39:8.8}
};
export const starterResearch={
 book:'Red Rising',reviewed:'2026-10-04',confidence:'Limited; qualitative discussions, no measured chapter averages',
 sources:[
 'https://www.goodreads.com/topic/show/19326097-part-i-aka-chapters-1-6',
 'https://www.goodreads.com/topic/show/19905738-red-rising-july-2019-group-read-discussion'
 ],
 basis:'Opening chapters receive mixed reactions to exposition and pacing. Chapter 4 divides readers on characterization. Chapters 5–6 draw emotional engagement alongside criticism of predictable plotting. Chapter 12 receives qualified praise for its transformation concept. Scores are conservative editorial estimates; unsupported later chapters remain empty.'
};
export function communityChapter(book:string,chapter:number,reader?:{average:number;count:number}){
 if(reader&&reader.count>0)return {value:reader.average,count:reader.count,starter:false};
 const value=starterScores[book]?.[chapter];
 return {value,count:0,starter:value!==undefined};
}

export const fourthWingResearch={
 reviewed:'2026-10-04',confidence:'Limited; qualitative editorial inference, primarily one chapter-by-chapter reviewer, not community consensus',
 sources:['https://sffbookreview.wordpress.com/2023/10/27/spoiler-review-readthrough-of-fourth-wing-by-rebecca-yarros/','https://ahousefullofbooks.com/2025/03/04/fourth-wing-chapter-by-chapter-spoilers/'],
 basis:'Mixed early characterization and exposition; better reception of action, dragons and later relationship payoffs. Conservative estimates reflect chapter-specific reactions rather than star ratings. Chapters 26 and 38 lack sufficiently evaluative comments and remain unrated.'
};
