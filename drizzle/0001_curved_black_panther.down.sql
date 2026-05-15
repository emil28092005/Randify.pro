ALTER TABLE "users" DROP CONSTRAINT "users_tier_check";
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "tier";
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "boosty_verified_at";
--> statement-breakpoint
DROP TABLE "translations";
--> statement-breakpoint
DROP TABLE "npcs";
--> statement-breakpoint
DROP TABLE "notes";
--> statement-breakpoint
DROP TABLE "initiative_sessions";
--> statement-breakpoint
DROP TABLE "generation_counters";