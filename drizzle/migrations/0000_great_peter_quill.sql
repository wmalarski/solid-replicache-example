CREATE TABLE `cell` (
	`id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`position` integer NOT NULL,
	`marked` integer NOT NULL,
	`clicked` integer NOT NULL,
	`deleted` integer NOT NULL,
	`version` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cell_id_unique` ON `cell` (`id`);--> statement-breakpoint
CREATE TABLE `game` (
	`id` text NOT NULL,
	`name` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`code` text NOT NULL,
	`deleted` integer NOT NULL,
	`version` integer NOT NULL,
	`started_at` integer,
	FOREIGN KEY (`id`) REFERENCES `replicache_space`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_id_unique` ON `game` (`id`);--> statement-breakpoint
CREATE TABLE `replicache_client` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`client_group_id` text(36) NOT NULL,
	`last_mutation_id` integer NOT NULL,
	`version` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `replicache_client_id_unique` ON `replicache_client` (`id`);--> statement-breakpoint
CREATE TABLE `replicache_space` (
	`id` text PRIMARY KEY NOT NULL,
	`ip_hash` text NOT NULL,
	`version` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `replicache_space_id_unique` ON `replicache_space` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `replicache_space_ip_hash_unique` ON `replicache_space` (`ip_hash`);