CREATE TABLE `healthUnits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('ubs','posto','hospital') NOT NULL,
	`address` text NOT NULL,
	`latitude` varchar(50) NOT NULL,
	`longitude` varchar(50) NOT NULL,
	`phone` varchar(20),
	`occupancyLevel` enum('baixo','medio','alto','critico') NOT NULL DEFAULT 'medio',
	`averageWaitTime` int NOT NULL DEFAULT 30,
	`waitingCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthUnits_id` PRIMARY KEY(`id`)
);
