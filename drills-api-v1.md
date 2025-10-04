# Drills API (v1)

This document describes all public endpoints under `/api/v1/drills**` for the Field Hockey Dashboard. Share it with frontend developers to integrate drill-related features.

---

## Base URLs

| Environment | Base URL                            |
| ----------- | ----------------------------------- |
| Local       | `http://localhost:3000`             |
| Production  | `https://admin.leadfieldhockey.com` |

Prefix all paths below with the chosen base URL.

---

## Authentication

- **Bearer JWT** is required for all mutating actions (create, update, delete).
- Read-only endpoints (`GET /api/v1/drills` and `GET /api/v1/drills/{id}`) are public.
- Provide the token in the `Authorization` header:

```http
Authorization: Bearer <jwt-token>
```

---

## Domain Schemas

### Drill

| Field         | Type              | Description                                              |
| ------------- | ----------------- | -------------------------------------------------------- |
| `id`          | integer           | Primary key                                              |
| `title`       | string            | Drill title                                              |
| `description` | string \| null    | Optional description                                     |
| `clubId`      | integer \| null   | Restricts visibility to a club when set; `null` = global |
| `createdBy`   | string            | User id (admin/coach)                                    |
| `createdAt`   | string (ISO 8601) | Creation timestamp                                       |
| `updatedAt`   | string (ISO 8601) | Last update timestamp                                    |
| `frames`      | `Frame[]`         | Ordered list of frames                                   |

### Frame

| Field              | Type             | Description                       |
| ------------------ | ---------------- | --------------------------------- |
| `id`               | integer          | Primary key                       |
| `order_index`      | integer          | Zero-based order inside the drill |
| `background_image` | string \| null   | Optional background image URL     |
| `elements`         | `FrameElement[]` | List of drawable elements         |

### FrameElement

| Field       | Type           | Description                           |
| ----------- | -------------- | ------------------------------------- |
| `id`        | integer        | Primary key                           |
| `icon_path` | string         | Relative path of the icon to render   |
| `x`,`y`     | number         | Coordinates (0-1 range w.r.t. canvas) |
| `rotation`  | number         | Degrees (default 0)                   |
| `scale`     | number         | Multiplier (default 1)                |
| `thickness` | number         | Line thickness for drawing tools      |
| `text`      | string \| null | Optional text (for labels)            |
| `z_index`   | integer        | Render order                          |

---

## Endpoints

### 1. List Drills

```http
GET /api/v1/drills
```

| Query param | Type    | Default | Description                                            |
| ----------- | ------- | ------- | ------------------------------------------------------ |
| `search`    | string  | —       | Text filter (title/description)                        |
| `clubId`    | integer | —       | Show drills where `clubId IS NULL OR clubId = :clubId` |
| `page`      | integer | 1       | Page index (1-based)                                   |
| `limit`     | integer | 20      | Page size                                              |

**Response 200**

```jsonc
{
  "items": [Drill, …],
  "page": 1,
  "totalPages": 4,
  "totalItems": 62
}
```

---

### 2. Create Drill _(protected)_

```http
POST /api/v1/drills
Content-Type: application/json
Authorization: Bearer <jwt>
```

```jsonc
{
  "title": "Give & Go Passing",
  "description": "Basic give-and-go pattern",
  "clubId": 3,
  "thumbnail": "base64-encoded-png-without-header",  // Optional: PNG thumbnail of first frame
  "animation_gif": "base64-encoded-gif-without-header",  // Optional: Animated GIF of all frames
  "frames": [Frame, …]
}
```

**Response 201** – returns the full newly-created `Drill`.

**Notes:**
- `thumbnail` and `animation_gif` should be raw base64 strings without the `data:image/...;base64,` prefix
- Frontend automatically generates both when saving a drill

---

### 3. Get Drill by ID

```http
GET /api/v1/drills/{id}
```

Path param `id` _(string \| integer)_.

**Response 200** – full `Drill`.

**Response 404** – drill not found.

---

### 4. Update Drill _(protected)_

```http
PUT /api/v1/drills/{id}
Authorization: Bearer <jwt>
```

Partial or full update; any of these fields may be present:

```jsonc
{
  "title": "…",
  "description": "…",
  "clubId": 7,
  "frames": [Frame, …]   // Replaces all frames when provided
}
```

**Response 200** – updated `Drill`.

**Response 404** – not found.

---

### 5. Delete Drill _(protected)_

```http
DELETE /api/v1/drills/{id}
Authorization: Bearer <jwt>
```

**Response 200**

```json
{ "message": "Drill deleted" }
```

---

### 6. Replace Frames _(protected)_

```http
PUT /api/v1/drills/{id}/frames
Authorization: Bearer <jwt>
```

```jsonc
{
  "frames": [Frame, …]
}
```

Replaces **all** existing frames in a single transaction.

- `400` – missing/invalid `frames` array.
- `404` – drill not found.
- `200` – returns updated full `Drill`.

---

## Error Format

All error responses follow:

```jsonc
{
  "error": "Human-readable message"
}
```

Status code conveys the category (400, 401, 404, 500…).

---

## Change Log

- **2025-09-22** – Initial release of Drills API v1.
