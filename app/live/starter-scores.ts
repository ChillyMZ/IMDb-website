// Scale calibration: 6 = bad, 7 = mid, 8 = good, 9 = great, 9.7+ = cinema.
// Qualitative estimates balance positive engagement against specific criticism;
// minor criticisms alone do not warrant the bad band. No blanket score offset.
// Conservative editorial interpretations, not measured averages or user votes.
// Sources retained for review; public cells are explicitly marked E.
// Sparse evidence stays absent rather than filling every chapter artificially.
export const starterScores:Record<string,Record<number,number>>={
 'a21af306-88b7-4d28-b5b4-738d26d71adf':{1:7.6,2:8.0,3:7.7,4:7.5,5:8.1,6:8.4,12:8.1},
 '1702dc13-12ff-4438-b13e-637e7b230d46':{1:7.5,2:8.2,3:8.0,4:7.4,5:8.0,6:8.2,7:8.1,8:7.8,9:8.3,10:8.5,11:8.4,12:8.1,13:7.2,14:9.1,15:7.6,16:7.9,17:7.7,18:8.9,19:8.4,20:8.0,21:8.5,22:8.7,23:7.9,24:8.4,25:8.5,27:8.8,28:9.0,29:8.2,30:8.9,31:7.4,32:8.6,33:7.6,34:7.8,35:8.0,36:9.0,37:9.2,39:9.3}
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
