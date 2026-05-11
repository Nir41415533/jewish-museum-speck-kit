CREATE TABLE IF NOT EXISTS events (
  id               SERIAL PRIMARY KEY,
  title_en         VARCHAR(400) NOT NULL,
  title_he         VARCHAR(400) NOT NULL,
  start_date       DATE         NOT NULL,
  end_date         DATE,
  description_en   TEXT,
  description_he   TEXT,
  country_id       INTEGER      NOT NULL REFERENCES countries(id),
  search_vector_en TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title_en,'') || ' ' || coalesce(description_en,''))
  ) STORED,
  search_vector_he TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(title_he,'') || ' ' || coalesce(description_he,''))
  ) STORED,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_events_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_events_country    ON events(country_id);
CREATE INDEX IF NOT EXISTS idx_events_date       ON events(start_date ASC);
CREATE INDEX IF NOT EXISTS idx_events_search_en  ON events USING GIN(search_vector_en);
CREATE INDEX IF NOT EXISTS idx_events_search_he  ON events USING GIN(search_vector_he);
