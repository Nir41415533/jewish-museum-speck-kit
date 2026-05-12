-- Remove participation rows where both names are 'nan' (no useful data)
DELETE FROM soldier_participations WHERE name_en = 'nan' AND name_he = 'nan';

-- For remaining participations with one nan name, fall back to the other
UPDATE soldier_participations SET name_en = name_he WHERE name_en = 'nan';
UPDATE soldier_participations SET name_he = name_en WHERE name_he = 'nan';

-- Clean nan strings from extra soldier columns added by SQLite migration
UPDATE soldiers SET
  nickname_he               = NULLIF(nickname_he,               'nan'),
  previous_last_name_he     = NULLIF(previous_last_name_he,     'nan'),
  fighting_description_he   = NULLIF(fighting_description_he,   'nan'),
  fighting_description_en   = NULLIF(fighting_description_en,   'nan'),
  getto_description_he      = NULLIF(getto_description_he,      'nan'),
  getto_description_en      = NULLIF(getto_description_en,      'nan'),
  wounds_he                 = NULLIF(wounds_he,                 'nan'),
  wounds_en                 = NULLIF(wounds_en,                 'nan'),
  death_details_he          = NULLIF(death_details_he,          'nan'),
  death_details_en          = NULLIF(death_details_en,          'nan'),
  enlist_reason_he          = NULLIF(enlist_reason_he,          'nan'),
  release_reason_he         = NULLIF(release_reason_he,         'nan'),
  other_fighting_context_he = NULLIF(other_fighting_context_he, 'nan'),
  father_name               = NULLIF(father_name,               'nan'),
  mother_name               = NULLIF(mother_name,               'nan')
WHERE
  nickname_he               = 'nan' OR previous_last_name_he     = 'nan' OR
  fighting_description_he   = 'nan' OR fighting_description_en   = 'nan' OR
  getto_description_he      = 'nan' OR getto_description_en      = 'nan' OR
  wounds_he                 = 'nan' OR wounds_en                 = 'nan' OR
  death_details_he          = 'nan' OR death_details_en          = 'nan' OR
  enlist_reason_he          = 'nan' OR release_reason_he         = 'nan' OR
  other_fighting_context_he = 'nan' OR father_name               = 'nan' OR
  mother_name               = 'nan';

-- Null out numeric-only enlist_reason_he codes (e.g. '6731.0') — not human-readable
UPDATE soldiers SET enlist_reason_he = NULL
WHERE enlist_reason_he ~ '^[0-9]+(\.[0-9]+)?$';

-- '1800-01-01' is a pandas placeholder for unknown dates
UPDATE soldiers SET birth_date  = NULL WHERE birth_date  = '1800-01-01';
UPDATE soldiers SET aliya_date  = NULL WHERE aliya_date  = '1800-01-01';
