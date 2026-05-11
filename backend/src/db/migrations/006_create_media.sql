CREATE TABLE IF NOT EXISTS media (
  id            SERIAL PRIMARY KEY,
  entity_type   VARCHAR(10)   NOT NULL CHECK (entity_type IN ('soldier','event')),
  entity_id     INTEGER       NOT NULL,
  media_type    VARCHAR(10)   NOT NULL CHECK (media_type IN ('image','video')),
  url           VARCHAR(1000) NOT NULL,
  caption_en    VARCHAR(500),
  caption_he    VARCHAR(500),
  display_order INTEGER       NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_media_entity ON media(entity_type, entity_id, display_order);
