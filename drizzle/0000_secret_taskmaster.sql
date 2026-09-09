CREATE TABLE `books` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`chapter_count` integer NOT NULL,
	`cover_key` text NOT NULL,
	`mime` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `books_status` ON `books` (`status`);--> statement-breakpoint
CREATE INDEX `books_owner` ON `books` (`owner`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`bio` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`user` text NOT NULL,
	`book` text NOT NULL,
	`chapter` integer NOT NULL,
	`score` integer NOT NULL,
	`date` text NOT NULL,
	PRIMARY KEY(`user`, `book`, `chapter`),
	FOREIGN KEY (`book`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ratings_book_chapter` ON `ratings` (`book`,`chapter`);