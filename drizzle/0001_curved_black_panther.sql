CREATE TABLE "generation_counters" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"hour_window" timestamp NOT NULL,
	"count" integer NOT NULL,
	"model" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "initiative_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"participants" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "npcs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"race" varchar(100),
	"role" varchar(100),
	"level" integer,
	"tone" varchar(100),
	"content" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"type" varchar(100) NOT NULL,
	"language" varchar(10) DEFAULT 'ru' NOT NULL,
	"content" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "translations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tier" varchar(20) DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "boosty_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "generation_counters" ADD CONSTRAINT "generation_counters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "initiative_sessions" ADD CONSTRAINT "initiative_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "npcs" ADD CONSTRAINT "npcs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "generation_counters_user_window_model_idx" ON "generation_counters" USING btree ("user_id","hour_window","model");--> statement-breakpoint
CREATE INDEX "translations_slug_type_language_idx" ON "translations" USING btree ("slug","type","language");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tier_check" CHECK ("users"."tier" IN ('free', 'pro'));