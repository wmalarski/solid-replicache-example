CREATE TABLE `cell` (
	`id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`position` integer NOT NULL,
	`marked` integer NOT NULL,
	`clicked` integer NOT NULL,
	`deleted` integer NOT NULL,
	`version` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `replicache_client` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`client_group_id` text(36) NOT NULL,
	`last_mutation_id` integer NOT NULL,
	`version` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `replicache_server` (
	`id` text PRIMARY KEY NOT NULL,
	`version` integer,
	`name` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`code` text NOT NULL,
	`ip_hash` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cell_id_unique` ON `cell` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `replicache_client_id_unique` ON `replicache_client` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `replicache_server_id_unique` ON `replicache_server` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `replicache_server_ip_hash_unique` ON `replicache_server` (`ip_hash`);