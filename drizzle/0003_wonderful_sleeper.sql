CREATE TABLE `chapter_reviews` (
	`user` text NOT NULL,
	`book` text NOT NULL,
	`chapter` integer NOT NULL,
	`body` text NOT NULL,
	`spoiler` integer DEFAULT 0 NOT NULL,
	`updated` text NOT NULL,
	PRIMARY KEY(`user`, `book`, `chapter`),
	FOREIGN KEY (`book`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `chapter_reviews_location` ON `chapter_reviews` (`book`,`chapter`);