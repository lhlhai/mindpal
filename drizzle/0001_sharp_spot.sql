CREATE TABLE `entries` (
	`id` varchar(36) NOT NULL,
	`user_id` int NOT NULL,
	`raw_text` text NOT NULL,
	`processed_json` json,
	`type` enum('task','event','knowledge','note') NOT NULL DEFAULT 'note',
	`title` text,
	`datetime` timestamp,
	`end_datetime` timestamp,
	`recurrence` enum('none','daily','weekly','monthly','yearly') NOT NULL DEFAULT 'none',
	`priority` enum('high','medium','low') NOT NULL DEFAULT 'medium',
	`status` enum('pending','done','archived') NOT NULL DEFAULT 'pending',
	`tags` json,
	`people` json,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` varchar(36) NOT NULL,
	`entry_id` varchar(36) NOT NULL,
	`remind_at` timestamp NOT NULL,
	`message` text NOT NULL,
	`sent` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` varchar(36) NOT NULL,
	`user_id` int NOT NULL,
	`quiet_hours_start` varchar(5),
	`quiet_hours_end` varchar(5),
	`timezone` varchar(50) NOT NULL DEFAULT 'UTC',
	`ai_tone` enum('formal','casual') NOT NULL DEFAULT 'casual',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` varchar(36) NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`color` varchar(7) NOT NULL DEFAULT '#3b82f6',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tags_id` PRIMARY KEY(`id`)
);
