CREATE TABLE `request_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`hits` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `request_limits_expires` ON `request_limits` (`expires`);--> statement-breakpoint
CREATE TABLE `usage_daily` (
	`day` text NOT NULL,
	`view` text NOT NULL,
	`visits` integer DEFAULT 0 NOT NULL,
	`load_count` integer DEFAULT 0 NOT NULL,
	`load_total` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`day`, `view`)
);
