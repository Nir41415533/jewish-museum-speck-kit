CREATE TABLE IF NOT EXISTS soldier_participations (
  id            SERIAL PRIMARY KEY,
  soldier_id    INTEGER      NOT NULL REFERENCES soldiers(id) ON DELETE CASCADE,
  type          VARCHAR(20)  NOT NULL CHECK (type IN ('decoration','participation')),
  name_en       VARCHAR(300) NOT NULL,
  name_he       VARCHAR(300) NOT NULL,
  display_order INTEGER      NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_participations_soldier ON soldier_participations(soldier_id, display_order);
