ALTER TABLE `user_keys` ADD `provider_user_id` text(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `user_keys` ADD `provider` text DEFAULT 'EMAIL' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `password`;