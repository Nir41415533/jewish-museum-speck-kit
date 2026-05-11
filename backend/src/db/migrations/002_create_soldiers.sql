CREATE TABLE IF NOT EXISTS soldiers (
  id                  SERIAL PRIMARY KEY,
  reference_code      VARCHAR(50)  NOT NULL,
  name_en             VARCHAR(300) NOT NULL,
  name_he             VARCHAR(300) NOT NULL,
  birth_date          DATE,
  birth_location_en   VARCHAR(300),
  birth_location_he   VARCHAR(300),
  biography_en        TEXT,
  biography_he        TEXT,
  army_en             VARCHAR(200),
  army_he             VARCHAR(200),
  rank_en             VARCHAR(100),
  rank_he             VARCHAR(100),
  role_en             VARCHAR(200),
  role_he             VARCHAR(200),
  death_date          DATE,
  death_location_en   VARCHAR(300),
  death_location_he   VARCHAR(300),
  search_vector_en    TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name_en,'') || ' ' || coalesce(biography_en,''))
  ) STORED,
  search_vector_he    TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(name_he,'') || ' ' || coalesce(biography_he,''))
  ) STORED,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_soldiers_reference_code ON soldiers(reference_code);
CREATE INDEX IF NOT EXISTS idx_soldiers_search_en ON soldiers USING GIN(search_vector_en);
CREATE INDEX IF NOT EXISTS idx_soldiers_search_he ON soldiers USING GIN(search_vector_he);
