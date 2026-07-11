CREATE TABLE `days` (
	`date` text PRIMARY KEY NOT NULL,
	`title` text
);
--> statement-breakpoint
CREATE TABLE `entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day_date` text NOT NULL,
	`uuid` text NOT NULL,
	`timestamp` text NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`day_date`) REFERENCES `days`(`date`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `entries_uuid_unique` ON `entries` (`uuid`);