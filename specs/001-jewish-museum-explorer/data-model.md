# Data Model: Jewish Soldier Museum — WWII Interactive Explorer

**Phase**: 1 | **Date**: 2026-05-10 | **Branch**: `001-jewish-museum-explorer`
**Database**: PostgreSQL 15+

---

## Entity Relationship Overview

```
countries ──────────────────────────── events
    │                                  (country_id FK, one-to-many)
    │
    └──── soldier_countries ──────── soldiers
          (join table, many-to-many)
          └── relationship_type

soldiers ──── soldier_participations
              (one-to-many: decorations and battle participations)

soldiers ─┐
          ├──── media (entity_type = 'soldier')
events ───┘──── media (entity_type = 'event')
```

---

## Tables

### `countries`

Stores each WWII-relevant nation. Only countries present in this table are rendered as interactive on the map.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PRIMARY KEY | Surrogate key |
| `code` | `VARCHAR(3)` | NOT NULL · UNIQUE | ISO 3166-1 alpha-3 code; links to GeoJSON `ISO_A3` property |
| `name_en` | `VARCHAR(200)` | NOT NULL | English display name |
| `name_he` | `VARCHAR(200)` | NOT NULL | Hebrew display name |
| `lat` | `DECIMAL(9,6)` | NOT NULL | Centroid latitude — used for map `flyTo` |
| `lng` | `DECIMAL(9,6)` | NOT NULL | Centroid longitude — used for map `flyTo` |
| `flag_url` | `VARCHAR(500)` | NULL | URL to flag image asset |

**Indexes**:
- `PRIMARY KEY (id)`
- `UNIQUE INDEX idx_countries_code ON countries(code)`

---

### `soldiers`

Stores individual Jewish soldier records. Participations, decorations, and media are in separate tables.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PRIMARY KEY | Surrogate key |
| `reference_code` | `VARCHAR(50)` | NOT NULL · UNIQUE | Museum catalog identifier (e.g., `SOL-00042`); canonical identifier for curator workflows and cross-referencing |
| `name_en` | `VARCHAR(300)` | NOT NULL | Full name in English |
| `name_he` | `VARCHAR(300)` | NOT NULL | Full name in Hebrew |
| `birth_date` | `DATE` | NULL | Date of birth |
| `birth_location_en` | `VARCHAR(300)` | NULL | Birth location in English |
| `birth_location_he` | `VARCHAR(300)` | NULL | Birth location in Hebrew |
| `biography_en` | `TEXT` | NULL | Full biography narrative in English |
| `biography_he` | `TEXT` | NULL | Full biography narrative in Hebrew |
| `army_en` | `VARCHAR(200)` | NULL | Military branch/army name in English |
| `army_he` | `VARCHAR(200)` | NULL | Military branch/army name in Hebrew |
| `rank_en` | `VARCHAR(100)` | NULL | Military rank in English |
| `rank_he` | `VARCHAR(100)` | NULL | Military rank in Hebrew |
| `role_en` | `VARCHAR(200)` | NULL | Military role/function in English |
| `role_he` | `VARCHAR(200)` | NULL | Military role/function in Hebrew |
| `death_date` | `DATE` | NULL | Date of death (NULL if alive or unknown) |
| `death_location_en` | `VARCHAR(300)` | NULL | Death location in English |
| `death_location_he` | `VARCHAR(300)` | NULL | Death location in Hebrew |
| `search_vector_en` | `TSVECTOR` | GENERATED STORED | Full-text search vector (English dictionary) over `name_en` and `biography_en` |
| `search_vector_he` | `TSVECTOR` | GENERATED STORED | Full-text search vector (simple dictionary) over `name_he` and `biography_he` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL · DEFAULT NOW() | Record creation timestamp |

**Indexes**:
- `PRIMARY KEY (id)`
- `UNIQUE INDEX idx_soldiers_reference_code ON soldiers(reference_code)`
- `GIN INDEX idx_soldiers_search_en ON soldiers(search_vector_en)`
- `GIN INDEX idx_soldiers_search_he ON soldiers(search_vector_he)`

**Generated column definitions**:
- `search_vector_en`: `to_tsvector('english', coalesce(name_en,'') || ' ' || coalesce(biography_en,''))`
- `search_vector_he`: `to_tsvector('simple', coalesce(name_he,'') || ' ' || coalesce(biography_he,''))`

---

### `soldier_countries` (join table)

Implements the many-to-many relationship between soldiers and countries. A soldier may be linked to multiple countries for different reasons (birth, service, death, or other historical association).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `soldier_id` | `INTEGER` | NOT NULL · FK → `soldiers.id` ON DELETE CASCADE | |
| `country_id` | `INTEGER` | NOT NULL · FK → `countries.id` ON DELETE CASCADE | |
| `relationship_type` | `VARCHAR(20)` | NOT NULL | Confirmed values: `'birth'` (country of birth), `'service'` (country where soldier fought), `'death'` (country where soldier died), `'other'` (any other association, e.g., emigration, imprisonment) |

**Constraints**:
- `PRIMARY KEY (soldier_id, country_id, relationship_type)` — a soldier can appear in the same country under multiple relationship types

**Indexes**:
- `PRIMARY KEY (soldier_id, country_id, relationship_type)`
- `INDEX idx_soldier_countries_country ON soldier_countries(country_id)` — used for country panel queries

---

### `soldier_participations`

Stores individual decoration and battle participation records for each soldier. Separated from the main soldier record to avoid wide rows and to allow independent querying.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PRIMARY KEY | Surrogate key |
| `soldier_id` | `INTEGER` | NOT NULL · FK → `soldiers.id` ON DELETE CASCADE | |
| `type` | `VARCHAR(20)` | NOT NULL | `'decoration'` or `'participation'` |
| `name_en` | `VARCHAR(300)` | NOT NULL | Name in English |
| `name_he` | `VARCHAR(300)` | NOT NULL | Name in Hebrew |
| `display_order` | `INTEGER` | NOT NULL · DEFAULT 0 | Controls rendering order |

**Indexes**:
- `PRIMARY KEY (id)`
- `INDEX idx_participations_soldier ON soldier_participations(soldier_id, display_order)`

---

### `events`

Stores historical WWII events. Each event is linked to exactly one country (per spec: "Related country").

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PRIMARY KEY | Surrogate key |
| `title_en` | `VARCHAR(400)` | NOT NULL | Event title in English |
| `title_he` | `VARCHAR(400)` | NOT NULL | Event title in Hebrew |
| `start_date` | `DATE` | NOT NULL | Start date of the event — used for timeline ordering |
| `end_date` | `DATE` | NULL | End date of the event; NULL for single-day events or unknown end dates; must be ≥ `start_date` when present |
| `description_en` | `TEXT` | NULL | Full description in English |
| `description_he` | `TEXT` | NULL | Full description in Hebrew |
| `country_id` | `INTEGER` | NOT NULL · FK → `countries.id` | |
| `search_vector_en` | `TSVECTOR` | GENERATED STORED | Full-text search over `title_en` and `description_en` |
| `search_vector_he` | `TSVECTOR` | GENERATED STORED | Full-text search over `title_he` and `description_he` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL · DEFAULT NOW() | |

**Indexes**:
- `PRIMARY KEY (id)`
- `INDEX idx_events_country ON events(country_id)`
- `INDEX idx_events_date ON events(start_date ASC)` — used for timeline ordering queries
- `GIN INDEX idx_events_search_en ON events(search_vector_en)`
- `GIN INDEX idx_events_search_he ON events(search_vector_he)`

**Generated column definitions**:
- `search_vector_en`: `to_tsvector('english', coalesce(title_en,'') || ' ' || coalesce(description_en,''))`
- `search_vector_he`: `to_tsvector('simple', coalesce(title_he,'') || ' ' || coalesce(description_he,''))`

---

### `media`

Stores image and video references for both soldiers and events. Media files are hosted externally; this table holds only metadata and URLs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PRIMARY KEY | Surrogate key |
| `entity_type` | `VARCHAR(10)` | NOT NULL | `'soldier'` or `'event'` |
| `entity_id` | `INTEGER` | NOT NULL | ID of the related soldier or event |
| `media_type` | `VARCHAR(10)` | NOT NULL | `'image'` or `'video'` |
| `url` | `VARCHAR(1000)` | NOT NULL | Fully qualified URL to the media asset |
| `caption_en` | `VARCHAR(500)` | NULL | Optional caption in English |
| `caption_he` | `VARCHAR(500)` | NULL | Optional caption in Hebrew |
| `display_order` | `INTEGER` | NOT NULL · DEFAULT 0 | Controls rendering order on the detail page |

**Indexes**:
- `PRIMARY KEY (id)`
- `INDEX idx_media_entity ON media(entity_type, entity_id, display_order)` — primary lookup pattern

---

## Validation Rules

| Entity | Rule |
|--------|------|
| Country | `code` must be a valid ISO 3166-1 alpha-3 string (enforced at application layer) |
| Soldier | `reference_code` must be unique across all soldiers (enforced by DB unique constraint) |
| Soldier | At least `name_en` or `name_he` must be non-empty |
| Soldier | `death_date` must be NULL or later than `birth_date` if both are present |
| soldier_countries | `relationship_type` must be one of: `birth`, `service`, `death`, `other` — confirmed canonical values, enforced as a CHECK constraint |
| soldier_participations | `type` must be one of: `decoration`, `participation` |
| Event | `start_date` is required; `end_date` must be ≥ `start_date` when present (enforced at application layer); no restriction on date range — curators may enter pre-war or post-war events |
| Media | `entity_type` must be `soldier` or `event` |
| Media | `media_type` must be `image` or `video` |

---

## Key Query Patterns

| Query | Tables | Index Used |
|-------|--------|-----------|
| Get all interactive countries | `countries` | full table scan (small table) |
| Get country panel data | `countries`, `soldier_countries`, `soldiers`, `events` | `idx_soldier_countries_country`, `idx_events_country` |
| Paginate soldiers for country | `soldier_countries`, `soldiers` | `idx_soldier_countries_country` + PK cursor |
| Get soldier detail | `soldiers`, `soldier_participations`, `media` | PK, `idx_participations_soldier`, `idx_media_entity` |
| Get event detail | `events`, `media` | PK, `idx_media_entity` |
| Timeline (all events ordered) | `events`, `countries` | `idx_events_date` |
| Search soldiers | `soldiers` | `idx_soldiers_search_en` OR `idx_soldiers_search_he` |
| Search events | `events` | `idx_events_search_en` OR `idx_events_search_he` |
