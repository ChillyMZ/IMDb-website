// Scale calibration: 6 = bad, 7 = mid, 8 = good, 9 = great, 9.7+ = cinema.
// Qualitative estimates balance positive engagement against specific criticism;
// minor criticisms alone do not warrant the bad band. No blanket score offset.
// Conservative editorial interpretations, not measured averages or user votes.
// Sources retained for review; public cells are explicitly marked E.
// Recap-only chapters use moderate narrative estimates; no inferred reader votes.
export const starterScores:Record<string,Record<number,number>>={
 'a21af306-88b7-4d28-b5b4-738d26d71adf':{"1":7.6,"2":8,"3":7.7,"4":7.5,"5":8.1,"6":8.4,"7":8.1,"8":8.3,"9":8.8,"10":8,"11":7.9,"12":8.1,"13":7.8,"14":7.8,"15":8,"16":8.3,"17":8.2,"18":8,"19":9.1,"20":8.5,"21":8.1,"22":7.9,"23":8.1,"24":8.3,"25":8.5,"26":8.8,"27":8.5,"28":8.8,"29":8.1,"30":8.2,"31":8.7,"32":8.3,"33":9.1,"34":8.5,"35":8.4,"36":8.8,"37":8.5,"38":9,"39":8.8,"40":8.7,"41":9.3,"42":9.4,"43":8.9,"44":8.6},
 '1702dc13-12ff-4438-b13e-637e7b230d46':{1:7.5,2:8.2,3:8.0,4:7.4,5:8.0,6:8.2,7:8.1,8:7.8,9:8.3,10:8.5,11:8.4,12:8.1,13:7.2,14:9.1,15:7.6,16:7.9,17:7.7,18:8.9,19:8.4,20:8.0,21:8.5,22:8.7,23:7.9,24:8.4,25:8.5,26:8.0,27:8.8,28:9.0,29:8.2,30:8.9,31:7.4,32:8.6,33:7.6,34:7.8,35:8.0,36:9.0,37:9.2,38:8.3,39:9.3},
 '306eadac-7d22-43aa-a6f5-911445e350a6':{"1":8,"2":7.7,"3":8,"4":8.1,"5":7.5,"6":8,"7":7.8,"8":8.3,"9":8.3,"10":8.8,"11":8.1,"12":8.2,"13":8.5,"14":7.8,"15":8,"16":7.6,"17":8.1,"18":7.5,"19":8.7,"20":7.7,"21":8.4,"22":7.9,"23":8.3,"24":8.5,"25":8.4,"26":8.2,"27":7.7,"28":7.8,"29":8.5,"30":8.7,"31":8.1,"32":8.3,"33":8.6,"34":8,"35":9.1,"36":8.9,"37":8,"38":8.2,"39":7.8,"40":7.2,"41":8.1,"42":8.8,"43":8.4,"44":8.5,"45":7.8,"46":7.4,"47":7.7,"48":8.9,"49":7.6,"50":7.5,"51":8.2,"52":8.1,"53":8.3,"54":8.6,"55":7.8,"56":8.8,"57":8.3,"58":8.2,"59":8.8,"60":8,"61":8.6,"62":9,"63":8.6,"64":9.2,"65":9,"66":8.7}
};
export const starterResearch={
 book:'Red Rising',reviewed:'2026-10-04',confidence:'Limited; qualitative discussions, no measured chapter averages',
 sources:[
 'https://reviewsfromabookworm.blogspot.com/2024/02/red-rising-recap-summary.html',
 'https://www.goodreads.com/topic/show/19326097-part-i-aka-chapters-1-6',
 'https://www.goodreads.com/topic/show/19905738-red-rising-july-2019-group-read-discussion'
 ],
 basis:'Opening chapters receive mixed reactions to exposition and pacing. Chapter 4 divides readers on characterization. Chapters 5–6 draw emotional engagement alongside criticism of predictable plotting. Chapter 12 receives qualified praise for its transformation concept. Later chapters use narrative interpretation of the numbered recap: leadership development, reversals and emotional payoffs score above transitional setup. These are subjective estimates, not ratings supplied by the sources.'
};
export function communityChapter(book:string,chapter:number,reader?:{average:number;count:number}){
 if(reader&&reader.count>0)return {value:reader.average,count:reader.count,starter:false};
 const value=starterScores[book]?.[chapter];
 return {value,count:0,starter:value!==undefined};
}

export const fourthWingResearch={
 reviewed:'2026-10-04',confidence:'Limited; qualitative editorial inference, primarily one chapter-by-chapter reviewer, not community consensus',
 sources:['https://sffbookreview.wordpress.com/2023/10/27/spoiler-review-readthrough-of-fourth-wing-by-rebecca-yarros/','https://ahousefullofbooks.com/2025/03/04/fourth-wing-chapter-by-chapter-spoilers/'],
 basis:'Mixed early characterization and exposition; better reception of action, dragons and later relationship payoffs. Conservative estimates reflect chapter-specific reactions rather than star ratings. Chapters 26 and 38 use moderate narrative estimates for foreshadowing and aftermath rather than claiming an explicit reviewer score.'
};

export const ironFlameResearch={
 reviewed:'2026-10-04',confidence:'Limited; subjective interpretation of one numbered chapter review, not reader consensus',
 sources:['https://sffbookreview.wordpress.com/2025/07/30/spoiler-review-readthrough-of-iron-flame-by-rebecca-yarros/'],
 basis:'The numbered review supports stronger action, friendships and emotional payoffs, with weaker repetitive relationship conflict and training. Scores interpret that qualitative assessment; the reviewer did not provide numerical chapter ratings.'
};
