CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`body` text,
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
CREATE TABLE `categoriesToPosts` (
	`id` text NOT NULL,
	`postId` text NOT NULL,
	`categoryId` text NOT NULL,
	`createdOn` integer,
	`updatedOn` integer,
	PRIMARY KEY(`postId`, `categoryId`),
	FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`body` text,
	`userId` text,
	`postId` integer,
	`tags` text,
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`body` text,
	`userId` text,
	`image` text,
	`images` text,
	`tags` text,
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
CREATE TABLE `userSessions` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`activeExpires` integer NOT NULL,
	`idleExpires` integer NOT NULL,
	`createdOn` integer,
	`updatedOn` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`firstName` text,
	`lastName` text,
	`email` text,
	`password` text,
	`role` text,
	`createdOn` integer,
	`updatedOn` integer
);
--> statement-breakpoint
CREATE INDEX `commentsUserIdIndex` ON `comments` (`userId`);--> statement-breakpoint
CREATE INDEX `commentsPostIdIndex` ON `comments` (`postId`);--> statement-breakpoint
CREATE INDEX `postUserIdIndex` ON `posts` (`userId`);