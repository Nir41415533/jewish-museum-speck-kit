-- Replace Python/pandas NaN strings (imported as literal 'nan') with proper NULLs.
-- name_en is NOT NULL — fall back to name_he for soldiers where English name was unknown.
UPDATE soldiers
  SET name_en = name_he
  WHERE name_en IN ('nan', 'nan nan');

-- All other fields are nullable — replace 'nan' with NULL.
UPDATE soldiers SET
  biography_en      = NULLIF(biography_en,      'nan'),
  biography_he      = NULLIF(biography_he,      'nan'),
  rank_en           = NULLIF(rank_en,           'nan'),
  rank_he           = NULLIF(rank_he,           'nan'),
  army_en           = NULLIF(army_en,           'nan'),
  army_he           = NULLIF(army_he,           'nan'),
  role_en           = NULLIF(role_en,           'nan'),
  role_he           = NULLIF(role_he,           'nan'),
  birth_location_en = NULLIF(birth_location_en, 'nan'),
  birth_location_he = NULLIF(birth_location_he, 'nan'),
  death_location_en = NULLIF(death_location_en, 'nan'),
  death_location_he = NULLIF(death_location_he, 'nan')
WHERE
  biography_en      = 'nan' OR biography_he      = 'nan' OR
  rank_en           = 'nan' OR rank_he           = 'nan' OR
  army_en           = 'nan' OR army_he           = 'nan' OR
  role_en           = 'nan' OR role_he           = 'nan' OR
  birth_location_en = 'nan' OR birth_location_he = 'nan' OR
  death_location_en = 'nan' OR death_location_he = 'nan';
