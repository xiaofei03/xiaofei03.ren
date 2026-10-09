CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`content` text NOT NULL,
	`excerpt` text NOT NULL,
	`date` text NOT NULL,
	`status` text NOT NULL,
	`attachment_key` text,
	`attachment_name` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_posts_status_date` ON `posts` (`status`,`date`);