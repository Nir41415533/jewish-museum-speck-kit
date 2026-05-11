CREATE TABLE IF NOT EXISTS countries (
  id        SERIAL PRIMARY KEY,
  code      VARCHAR(3)   NOT NULL,
  name_en   VARCHAR(200) NOT NULL,
  name_he   VARCHAR(200) NOT NULL,
  lat       DECIMAL(9,6) NOT NULL,
  lng       DECIMAL(9,6) NOT NULL,
  flag_url  VARCHAR(500)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_countries_code ON countries(code);
