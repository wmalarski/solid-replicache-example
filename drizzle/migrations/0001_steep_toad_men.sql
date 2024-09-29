CREATE TABLE `replicache_client` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`client_group_id` text(36) NOT NULL,
	`last_mutation_id` integer NOT NULL,
	`version` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `replicache_client_id_unique` ON `replicache_client` (`id`);