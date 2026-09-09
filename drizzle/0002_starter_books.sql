INSERT INTO books (id,owner,title,author,chapter_count,cover_key,mime,status,created) VALUES ('gutenberg-11','catalogue','Alice''s Adventures in Wonderland','Lewis Carroll',12,'/covers/pg11.jpg','image/jpeg','approved','2026-09-08T00:00:00.000Z') ON CONFLICT(id) DO NOTHING;
--> statement-breakpoint
INSERT INTO books (id,owner,title,author,chapter_count,cover_key,mime,status,created) VALUES ('gutenberg-12','catalogue','Through the Looking-Glass','Lewis Carroll',12,'/covers/pg12.jpg','image/jpeg','approved','2026-09-08T00:00:00.000Z') ON CONFLICT(id) DO NOTHING;
--> statement-breakpoint
INSERT INTO books (id,owner,title,author,chapter_count,cover_key,mime,status,created) VALUES ('gutenberg-120','catalogue','Treasure Island','Robert Louis Stevenson',34,'/covers/pg120.jpg','image/jpeg','approved','2026-09-08T00:00:00.000Z') ON CONFLICT(id) DO NOTHING;
--> statement-breakpoint
INSERT INTO books (id,owner,title,author,chapter_count,cover_key,mime,status,created) VALUES ('gutenberg-345','catalogue','Dracula','Bram Stoker',27,'/covers/pg345.jpg','image/jpeg','approved','2026-09-08T00:00:00.000Z') ON CONFLICT(id) DO NOTHING;
--> statement-breakpoint
INSERT INTO books (id,owner,title,author,chapter_count,cover_key,mime,status,created) VALUES ('gutenberg-1342','catalogue','Pride and Prejudice','Jane Austen',61,'/covers/pg1342.jpg','image/jpeg','approved','2026-09-08T00:00:00.000Z') ON CONFLICT(id) DO NOTHING;
