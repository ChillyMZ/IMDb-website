CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post` text NOT NULL,
	`user` text NOT NULL,
	`body` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`post`) REFERENCES `discussions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `discussions` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`topic` text NOT NULL,
	`book` text,
	`spoiler` integer DEFAULT 0 NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`post` text NOT NULL,
	`user` text NOT NULL,
	PRIMARY KEY(`post`, `user`),
	FOREIGN KEY (`post`) REFERENCES `discussions`(`id`) ON UPDATE no action ON DELETE no action
);
