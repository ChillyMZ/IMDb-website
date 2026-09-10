-- Private staging schema. No browser/Data API access is granted.
-- Preserve legacy IDs until account ownership has been independently verified.
CREATE SCHEMA chillymz;
REVOKE ALL ON SCHEMA chillymz FROM PUBLIC, anon, authenticated;
SET LOCAL search_path TO chillymz, pg_catalog;
CREATE TABLE "books" (
	"id" text PRIMARY KEY NOT NULL,
	"owner" text NOT NULL,
	"title" text NOT NULL,
	"author" text NOT NULL,
	"chapter_count" integer NOT NULL,
	"cover_key" text NOT NULL,
	"mime" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created" text NOT NULL
);
CREATE TABLE "discussions" (
	"id" text PRIMARY KEY NOT NULL,
	"user" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"topic" text NOT NULL,
	"book" text,
	"spoiler" integer DEFAULT 0 NOT NULL,
	"created" text NOT NULL
);
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"bio" text DEFAULT '' NOT NULL
);
CREATE TABLE "ratings" (
	"user" text NOT NULL,
	"book" text NOT NULL,
	"chapter" integer NOT NULL,
	"score" integer NOT NULL,
	"date" text NOT NULL,
	PRIMARY KEY("user", "book", "chapter"),
	FOREIGN KEY ("book") REFERENCES "books"("id") ON UPDATE no action ON DELETE no action
);
CREATE TABLE "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"post" text NOT NULL,
	"user" text NOT NULL,
	"body" text NOT NULL,
	"created" text NOT NULL,
	FOREIGN KEY ("post") REFERENCES "discussions"("id") ON UPDATE no action ON DELETE no action
);
CREATE TABLE "votes" (
	"post" text NOT NULL,
	"user" text NOT NULL,
	PRIMARY KEY("post", "user"),
	FOREIGN KEY ("post") REFERENCES "discussions"("id") ON UPDATE no action ON DELETE no action
);
CREATE TABLE "chapter_reviews" (
	"user" text NOT NULL,
	"book" text NOT NULL,
	"chapter" integer NOT NULL,
	"body" text NOT NULL,
	"spoiler" integer DEFAULT 0 NOT NULL,
	"updated" text NOT NULL,
	PRIMARY KEY("user", "book", "chapter"),
	FOREIGN KEY ("book") REFERENCES "books"("id") ON UPDATE no action ON DELETE no action
);
CREATE TABLE "moderation_cases" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"target" text NOT NULL,
	"author" text NOT NULL,
	"reporter" text NOT NULL,
	"reason" text NOT NULL,
	"snapshot" text NOT NULL,
	"state" text DEFAULT 'open' NOT NULL,
	"decision" text DEFAULT '' NOT NULL,
	"appeal" text DEFAULT '' NOT NULL,
	"appeal_state" text DEFAULT '' NOT NULL,
	"created" text NOT NULL
);
CREATE TABLE "moderation_events" (
	"id" text PRIMARY KEY NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"target" text NOT NULL,
	"reason" text NOT NULL,
	"created" text NOT NULL
);
CREATE TABLE "reader_relations" (
	"user" text NOT NULL,
	"other" text NOT NULL,
	"kind" text NOT NULL,
	PRIMARY KEY("user", "other", "kind")
);
CREATE TABLE "restrictions" (
	"user" text PRIMARY KEY NOT NULL,
	"until" text NOT NULL,
	"reason" text NOT NULL
);
CREATE TABLE "request_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"hits" integer NOT NULL,
	"expires" bigint NOT NULL
);
CREATE TABLE "usage_daily" (
	"day" text NOT NULL,
	"view" text NOT NULL,
	"visits" integer DEFAULT 0 NOT NULL,
	"load_count" integer DEFAULT 0 NOT NULL,
	"load_total" bigint DEFAULT 0 NOT NULL,
	PRIMARY KEY("day", "view")
);
CREATE INDEX "books_status" ON "books" ("status");
CREATE INDEX "books_owner" ON "books" ("owner");
CREATE INDEX "ratings_book_chapter" ON "ratings" ("book","chapter");
CREATE INDEX "chapter_reviews_location" ON "chapter_reviews" ("book","chapter");
CREATE INDEX "moderation_target" ON "moderation_cases" ("kind","target");
CREATE INDEX "moderation_author" ON "moderation_cases" ("author");
ALTER TABLE "books" ADD "catalogue_key" text;
ALTER TABLE "books" ADD "source_url" text DEFAULT '' NOT NULL;
ALTER TABLE "books" ADD "edition" text DEFAULT '' NOT NULL;
ALTER TABLE "books" ADD "chapter_note" text DEFAULT '' NOT NULL;
CREATE UNIQUE INDEX "books_catalogue_key" ON "books" ("catalogue_key");
CREATE INDEX "request_limits_expires" ON "request_limits" ("expires");
CREATE TABLE auth_links (
 auth_user uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 reader_id text NOT NULL UNIQUE REFERENCES profiles(id),
 linked_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE administrators (
 auth_user uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE chillymz."books" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE chillymz."books" FROM PUBLIC, anon, authenticated;
ALTER TABLE chillymz."discussions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE chillymz."discussions" FROM PUBLIC, anon, authenticated;
ALTER TABLE chillymz."profiles" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE chillymz."profiles" FROM PUBLIC, anon, authenticated;
ALTER TABLE chillymz."ratings" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE chillymz."ratings" FROM PUBLIC, anon, authenticated;
ALTER TABLE chillymz."comments" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE chillymz."comments" FROM PUBLIC, anon, authenticated;
ALTER TABLE chillymz."votes" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE chillymz."votes" FROM PUBLIC, anon, authenticated;
ALTER TABLE chillymz."chapter_reviews" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE chillymz."chapter_reviews" FROM PUBLIC, anon, authenticated;
ALTER TABLE chillymz."moderation_cases" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE chillymz."moderation_cases" FROM PUBLIC, anon, authenticated;
ALTER TABLE chillymz."moderation_events" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE chillymz."moderation_events" FROM PUBLIC, anon, authenticated;
ALTER TABLE chillymz."reader_relations" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE chillymz."reader_relations" FROM PUBLIC, anon, authenticated;
ALTER TABLE chillymz."restrictions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE chillymz."restrictions" FROM PUBLIC, anon, authenticated;
ALTER TABLE chillymz."request_limits" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE chillymz."request_limits" FROM PUBLIC, anon, authenticated;
ALTER TABLE chillymz."usage_daily" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE chillymz."usage_daily" FROM PUBLIC, anon, authenticated;
ALTER TABLE chillymz."auth_links" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE chillymz."auth_links" FROM PUBLIC, anon, authenticated;
ALTER TABLE chillymz."administrators" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE chillymz."administrators" FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA chillymz TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA chillymz TO service_role;
