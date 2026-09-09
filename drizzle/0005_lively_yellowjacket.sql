ALTER TABLE `books` ADD `catalogue_key` text;--> statement-breakpoint
ALTER TABLE `books` ADD `source_url` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `books` ADD `edition` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `books` ADD `chapter_note` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `books_catalogue_key` ON `books` (`catalogue_key`);