CREATE TABLE `moderation_cases` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`target` text NOT NULL,
	`author` text NOT NULL,
	`reporter` text NOT NULL,
	`reason` text NOT NULL,
	`snapshot` text NOT NULL,
	`state` text DEFAULT 'open' NOT NULL,
	`decision` text DEFAULT '' NOT NULL,
	`appeal` text DEFAULT '' NOT NULL,
	`appeal_state` text DEFAULT '' NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `moderation_target` ON `moderation_cases` (`kind`,`target`);--> statement-breakpoint
CREATE INDEX `moderation_author` ON `moderation_cases` (`author`);--> statement-breakpoint
CREATE TABLE `moderation_events` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`target` text NOT NULL,
	`reason` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reader_relations` (
	`user` text NOT NULL,
	`other` text NOT NULL,
	`kind` text NOT NULL,
	PRIMARY KEY(`user`, `other`, `kind`)
);
--> statement-breakpoint
CREATE TABLE `restrictions` (
	`user` text PRIMARY KEY NOT NULL,
	`until` text NOT NULL,
	`reason` text NOT NULL
);
