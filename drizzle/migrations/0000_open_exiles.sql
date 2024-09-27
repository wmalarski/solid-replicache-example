CREATE TABLE `message` (
	`id` text PRIMARY KEY NOT NULL,
	`sender` text(255) NOT NULL,
	`content` text NOT NULL,
	`ord` integer NOT NULL,
	`deleted` integer NOT NULL,
	`version` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `replicache_server` (
	`id` integer PRIMARY KEY NOT NULL,
	`version` integer
);
--> statement-breakpoint
INSERT INTO `replicache_server`(id, version) values (1, 1);
--> statement-breakpoint
CREATE UNIQUE INDEX `message_id_unique` ON `message` (`id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `replicache_server_id_unique` ON `replicache_server` (`id`);
