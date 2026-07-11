CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text
);
--> statement-breakpoint
ALTER TABLE `entries` ADD `corrected` integer DEFAULT false NOT NULL;