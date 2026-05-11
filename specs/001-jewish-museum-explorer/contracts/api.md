# API Contracts: Jewish Soldier Museum — WWII Interactive Explorer

**Phase**: 1 | **Date**: 2026-05-10 | **Branch**: `001-jewish-museum-explorer`
**Base URL**: `/api`
**Format**: JSON request and response bodies
**Language fields**: All response objects include both `name_en`/`name_he` (and equivalent bilingual fields). The frontend selects which to render based on active language; the API always returns both.

---

## Common Conventions

**Pagination** (cursor-based for soldiers, offset for events and search):
```
Request:  ?limit=20&after=<last_id>
Response: { data: [...], pagination: { limit, next_cursor, has_more } }
```

**Error response shape** (all endpoints):
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Soldier with id 999 not found"
  }
}
```

**HTTP status codes**:
- `200` — success
- `400` — invalid request parameters
- `404` — resource not found
- `503` — AI service unavailable (AI endpoints only)

---

## Countries

### `GET /api/countries`

Returns all countries that have at least one associated soldier or event. Used on app load to determine which countries are interactive on the map.

**Query parameters**: none

**Response** `200`:
```json
{
  "data": [
    {
      "id": 1,
      "code": "POL",
      "name_en": "Poland",
      "name_he": "פולין",
      "lat": 51.9194,
      "lng": 19.1451,
      "flag_url": "https://..."
    }
  ]
}
```

---

### `GET /api/countries/:id`

Returns full detail for a single country.

**Path parameters**: `id` — integer country ID

**Response** `200`:
```json
{
  "data": {
    "id": 1,
    "code": "POL",
    "name_en": "Poland",
    "name_he": "פולין",
    "lat": 51.9194,
    "lng": 19.1451,
    "flag_url": "https://..."
  }
}
```

**Response** `404`: country not found

---

### `GET /api/countries/:id/soldiers`

Returns a paginated list of soldiers associated with a country (across all relationship types).

**Path parameters**: `id` — integer country ID

**Query parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | `20` | Results per page (max 100) |
| `after` | integer | — | Cursor: ID of last soldier from previous page |

**Response** `200`:
```json
{
  "data": [
    {
      "id": 42,
      "reference_code": "SOL-00042",
      "name_en": "David Cohen",
      "name_he": "דוד כהן",
      "birth_date": "1920-03-15",
      "death_date": "1944-06-06",
      "army_en": "British Army",
      "army_he": "הצבא הבריטי",
      "rank_en": "Corporal",
      "rank_he": "רב טוראי",
      "relationship_types": ["birth", "service"]
    }
  ],
  "pagination": {
    "limit": 20,
    "next_cursor": 42,
    "has_more": true
  }
}
```

**Notes**:
- `relationship_types` lists all types linking this soldier to this country
- Ordered by `soldiers.id` ASC for stable cursor pagination

---

### `GET /api/countries/:id/events`

Returns all events linked to a country, ordered by `event_date` ascending.

**Path parameters**: `id` — integer country ID

**Query parameters**: none (event counts per country are small)

**Response** `200`:
```json
{
  "data": [
    {
      "id": 7,
      "title_en": "Warsaw Ghetto Uprising",
      "title_he": "מרד גטו ורשה",
      "start_date": "1943-04-19",
      "end_date": "1943-05-16",
      "country_id": 1
    }
  ]
}
```

---

## Soldiers

### `GET /api/soldiers/:id`

Returns full soldier biography including participations and media.

**Path parameters**: `id` — integer soldier ID

**Response** `200`:
```json
{
  "data": {
    "id": 42,
    "reference_code": "SOL-00042",
    "name_en": "David Cohen",
    "name_he": "דוד כהן",
    "birth_date": "1920-03-15",
    "birth_location_en": "Warsaw, Poland",
    "birth_location_he": "ורשה, פולין",
    "biography_en": "David Cohen was born in...",
    "biography_he": "דוד כהן נולד ב...",
    "army_en": "British Army",
    "army_he": "הצבא הבריטי",
    "rank_en": "Corporal",
    "rank_he": "רב טוראי",
    "role_en": "Infantry",
    "role_he": "חי\"ר",
    "death_date": "1944-06-06",
    "death_location_en": "Normandy, France",
    "death_location_he": "נורמנדי, צרפת",
    "countries": [
      { "id": 1, "name_en": "Poland", "name_he": "פולין", "relationship_type": "birth" },
      { "id": 2, "name_en": "United Kingdom", "name_he": "הממלכה המאוחדת", "relationship_type": "service" }
    ],
    "participations": [
      { "id": 1, "type": "decoration", "name_en": "Military Medal", "name_he": "מדליה צבאית", "display_order": 0 },
      { "id": 2, "type": "participation", "name_en": "Battle of Normandy", "name_he": "קרב נורמנדי", "display_order": 1 }
    ],
    "media": [
      { "id": 1, "media_type": "image", "url": "https://...", "caption_en": "David in uniform", "caption_he": "דוד במדים", "display_order": 0 }
    ]
  }
}
```

**Response** `404`: soldier not found

---

## Events

### `GET /api/events/:id`

Returns full event detail including media.

**Path parameters**: `id` — integer event ID

**Response** `200`:
```json
{
  "data": {
    "id": 7,
    "title_en": "Warsaw Ghetto Uprising",
    "title_he": "מרד גטו ורשה",
    "start_date": "1943-04-19",
    "end_date": "1943-05-16",
    "description_en": "The Warsaw Ghetto Uprising was...",
    "description_he": "מרד גטו ורשה היה...",
    "country": {
      "id": 1,
      "name_en": "Poland",
      "name_he": "פולין",
      "code": "POL"
    },
    "media": [
      { "id": 5, "media_type": "image", "url": "https://...", "caption_en": null, "caption_he": null, "display_order": 0 }
    ]
  }
}
```

**Response** `404`: event not found

---

## Timeline

### `GET /api/events`

Returns events ordered by date for the timeline view. Offset-paginated (events total is much smaller than soldiers).

**Query parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | `50` | Results per page (max 200) |
| `offset` | integer | `0` | Number of records to skip |
| `sort` | string | `date_asc` | `date_asc` or `date_desc` (ordered by `start_date`) |

**Response** `200`:
```json
{
  "data": [
    {
      "id": 3,
      "title_en": "Germany Invades Poland",
      "title_he": "גרמניה פולשת לפולין",
      "start_date": "1939-09-01",
      "end_date": "1939-10-06",
      "country": {
        "id": 1,
        "code": "POL",
        "name_en": "Poland",
        "name_he": "פולין",
        "lat": 51.9194,
        "lng": 19.1451
      }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 120,
    "has_more": true
  }
}
```

**Notes**: `country.lat` and `country.lng` are included so the frontend can call `map.flyTo()` without a second request.

---

## Search

### `GET /api/search`

Full-text search across soldiers and events. Searches both Hebrew and English fields simultaneously.

**Query parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | yes | — | Search query (min 2 characters) |
| `type` | string | no | `all` | `soldiers`, `events`, `countries`, or `all` |
| `limit` | integer | no | `20` | Results per group (max 50) |
| `offset` | integer | no | `0` | Offset within each group |

**Response** `200`:
```json
{
  "query": "warsaw",
  "soldiers": {
    "data": [
      {
        "id": 42,
        "name_en": "David Cohen",
        "name_he": "דוד כהן",
        "birth_date": "1920-03-15",
        "army_en": "British Army",
        "army_he": "הצבא הבריטי"
      }
    ],
    "pagination": { "total": 3, "limit": 20, "offset": 0, "has_more": false }
  },
  "events": {
    "data": [
      {
        "id": 7,
        "title_en": "Warsaw Ghetto Uprising",
        "title_he": "מרד גטו ורשה",
        "start_date": "1943-04-19",
        "end_date": "1943-05-16",
        "country_id": 1
      }
    ],
    "pagination": { "total": 1, "limit": 20, "offset": 0, "has_more": false }
  },
  "countries": {
    "data": [
      {
        "id": 1,
        "code": "POL",
        "name_en": "Poland",
        "name_he": "פולין",
        "lat": 51.9194,
        "lng": 19.1451,
        "flag_url": "https://..."
      }
    ],
    "pagination": { "total": 1, "limit": 20, "offset": 0, "has_more": false }
  }
}
```

**Response** `400`: `q` is missing or fewer than 2 characters
```json
{ "error": { "code": "INVALID_QUERY", "message": "Search query must be at least 2 characters" } }
```

**Notes**:
- When `type=soldiers`, only the `soldiers` key is returned; `events` and `countries` are omitted (same logic for other specific type values)
- Country search matches against `name_en` and `name_he` fields (exact and prefix match; countries table is small so no tsvector needed)
- Search runs against both `search_vector_en` and `search_vector_he` — a result is included if it matches either vector

---

## AI Generation

All AI endpoints:
- Require the entity to exist (return `404` if not)
- Accept `language` in the request body (`'en'` or `'he'`)
- Return `503` if Gemini API is unavailable or times out
- Never cache responses

### `POST /api/ai/country/:id`

**Path parameters**: `id` — integer country ID

**Request body**:
```json
{ "language": "he" }
```

**Response** `200`:
```json
{
  "content": "פולין שיחקה תפקיד מרכזי...",
  "language": "he",
  "entity_type": "country",
  "entity_id": 1
}
```

**Response** `400`: `language` missing or not `'en'`/`'he'`
**Response** `404`: country not found
**Response** `503`: Gemini API unavailable
```json
{ "error": { "code": "AI_UNAVAILABLE", "message": "AI context unavailable at this time" } }
```

---

### `POST /api/ai/soldier/:id`

**Path parameters**: `id` — integer soldier ID

**Request body**:
```json
{ "language": "en" }
```

**Response** `200`:
```json
{
  "content": "David Cohen served in the British Army during...",
  "language": "en",
  "entity_type": "soldier",
  "entity_id": 42
}
```

**Response** `400`, `404`, `503`: same structure as above

---

### `POST /api/ai/event/:id`

**Path parameters**: `id` — integer event ID

**Request body**:
```json
{ "language": "he" }
```

**Response** `200`:
```json
{
  "content": "מרד גטו ורשה היה...",
  "language": "he",
  "entity_type": "event",
  "entity_id": 7
}
```

**Response** `400`, `404`, `503`: same structure as above
