CREATE TABLE IF NOT EXISTS soldier_countries (
  soldier_id        INTEGER     NOT NULL REFERENCES soldiers(id) ON DELETE CASCADE,
  country_id        INTEGER     NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('birth','service','death','other')),
  PRIMARY KEY (soldier_id, country_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_soldier_countries_country ON soldier_countries(country_id);
