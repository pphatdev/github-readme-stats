DROP INDEX IF EXISTS `uq_stats_request_url`;
--> statement-breakpoint
ALTER TABLE `stats_requests` ADD COLUMN `user_agent` text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `ix_stats_request_url` ON `stats_requests` (`url`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `ix_stats_request_username` ON `stats_requests` (`username`);
