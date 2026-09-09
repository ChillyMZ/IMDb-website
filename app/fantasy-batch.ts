// Counts refer to numbered narrative chapters in the unabridged English novels.
// Only bibliographic facts are stored; no chapter text, artwork, or imported ratings.
const hp="https://en.wikibooks.org/wiki/Muggles%27_Guide_to_Harry_Potter/Contents";
export type ImportBook={title:string;author:string;chapterCount:number;sourceUrl:string;edition:string;chapterNote:string};
const row=(title:string,author:string,chapterCount:number,sourceUrl:string,chapterNote='Numbered narrative chapters only.'):ImportBook=>({title,author,chapterCount,sourceUrl,edition:'Unabridged English novel',chapterNote});
export const fantasyBatch:ImportBook[]=[
 row("Harry Potter and the Philosopher's Stone",'J. K. Rowling',17,hp,"17 numbered chapters. Also published as Harry Potter and the Sorcerer's Stone."),
 row('Harry Potter and the Chamber of Secrets','J. K. Rowling',18,hp),
 row('Harry Potter and the Prisoner of Azkaban','J. K. Rowling',22,hp),
 row('Harry Potter and the Goblet of Fire','J. K. Rowling',37,hp),
 row('Harry Potter and the Order of the Phoenix','J. K. Rowling',38,hp),
 row('Harry Potter and the Half-Blood Prince','J. K. Rowling',30,hp),
 row('Harry Potter and the Deathly Hallows','J. K. Rowling',36,hp,'36 numbered chapters; the unnumbered epilogue is excluded.'),
 row('The Lightning Thief','Rick Riordan',22,'https://meltongblog.wordpress.com/2020/11/13/lightning-thief-book-summary-and-chapter-breakdown/'),
 row('The Sea of Monsters','Rick Riordan',20,'https://www.supersummary.com/the-sea-of-monsters/teacher-introduction/'),
 row("The Titan's Curse",'Rick Riordan',20,'https://www.theliteraryjourney.com/en/post/summary-titans-curse'),
 row('The Battle of the Labyrinth','Rick Riordan',20,'https://www.reddit.com/r/bookclub/comments/15cmslr/discussion_the_battle_of_the_labyrinth_by_rick/'),
 row('The Last Olympian','Rick Riordan',23,'https://www.thenerdparty.com/throwback-paperback/percy-jackson-and-the-last-olympian-chapters-13-23'),
 row("The Magician's Nephew",'C. S. Lewis',15,'https://homework.study.com/explanation/how-many-chapters-are-in-the-magician-s-nephew.html'),
 row('The Lion, the Witch and the Wardrobe','C. S. Lewis',17,'https://narnia.fandom.com/wiki/The_Lion,_the_Witch_and_the_Wardrobe_(book)'),
 row('The Horse and His Boy','C. S. Lewis',15,'https://outschool.com/classes/book-club-narnia-5-the-horse-and-his-boy-pyV7deVO'),
 row('Prince Caspian','C. S. Lewis',15,'https://narnia.fandom.com/wiki/Prince_Caspian_(book)'),
 row('The Voyage of the Dawn Treader','C. S. Lewis',16,'https://www.frowl.org/dawntreader/bibliographic.html'),
 row('The Silver Chair','C. S. Lewis',16,'https://americanliterature.com/author/cs-lewis/book/the-silver-chair'),
 row('The Last Battle','C. S. Lewis',16,'https://bradleysbasement.co.uk/the-chronicles-of-narnia/the-last-battle-book/'),
 row('The Hobbit','J. R. R. Tolkien',19,'https://tolkiengateway.net/wiki/The_Hobbit'),
 row('The Fellowship of the Ring','J. R. R. Tolkien',22,'https://tolkiengateway.net/wiki/The_Fellowship_of_the_Ring','C1–12 = Book I chapters 1–12; C13–22 = Book II chapters 1–10. Prologue and foreword excluded.'),
 row('The Two Towers','J. R. R. Tolkien',21,'https://tolkiengateway.net/wiki/The_Two_Towers','C1–11 = Book III chapters 1–11; C12–21 = Book IV chapters 1–10.'),
 row('The Return of the King','J. R. R. Tolkien',19,'https://tolkiengateway.net/wiki/The_Return_of_the_King','C1–10 = Book V chapters 1–10; C11–19 = Book VI chapters 1–9. Appendices excluded.'),
 row('A Wizard of Earthsea','Ursula K. Le Guin',10,'https://homework.study.com/explanation/how-many-chapters-are-in-a-wizard-of-earthsea.html'),
 row('The Tombs of Atuan','Ursula K. Le Guin',12,'https://library.hrmtc.com/2024/01/15/the-tombs-of-atuan/','12 numbered chapters; the unnumbered prologue is excluded.')
];
