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

| Field                    | Type                                    | Description                                                                                    |
| ------------------------ | --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `id`                     | integer                                 | Primary key                                                                                    |
| `title`                  | string                                  | Drill title                                                                                    |
| `description`            | string \| null                          | Optional description                                                                           |
| `animationGifUrl`        | string \| null                          | Public URL of the original GIF (available immediately after upload)                            |
| `animationVideoUrl`      | string \| null                          | Public URL of the MP4 animation converted from the GIF (available after background processing) |
| `animationVideoStatus`   | `"pending"` \| `"success"` \| `"error"` | Status of the GIF-to-MP4 conversion process                                                    |
| `animationVideoAttempts` | integer                                 | Number of conversion attempts made (max 5 with retry)                                          |
| `clubId`                 | integer \| null                         | Restricts visibility to a club when set; `null` = global                                       |
| `createdBy`              | string                                  | User id (admin/coach)                                                                          |
| `createdAt`              | string (ISO 8601)                       | Creation timestamp                                                                             |
| `updatedAt`              | string (ISO 8601)                       | Last update timestamp                                                                          |
| `frames`                 | `Frame[]`                               | Ordered list of frames                                                                         |

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
  "items": [
    {
      "id": 1,
      "title": "Give & Go Passing",
      "description": "Basic give-and-go pattern",
      "animationGifUrl": "https://bucket.fra1.digitaloceanspaces.com/drills/gifs/1234-uuid.gif",
      "animationVideoUrl": "https://bucket.fra1.digitaloceanspaces.com/drills/videos/5678-uuid.mp4",
      "animationVideoStatus": "success",
      "animationVideoAttempts": 1,
      "clubId": 3,
      "createdBy": "12",
      "createdAt": "2025-10-04T10:30:00Z",
      "updatedAt": "2025-10-04T10:31:00Z",
      "frames": [
        /* Frame objects */
      ]
    }
    // ... more drills
  ],
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
  "animation_gif": "data:image/gif;base64,...", // Uploaded immediately; converted to MP4 in background
  "frames": [Frame, …]
}
```

> **Animation Processing Flow:**
>
> 1. The `animation_gif` field accepts a Base64-encoded GIF (data URI or raw string)
> 2. The GIF is **uploaded immediately** to storage and its URL is saved in `animationGifUrl`
> 3. The drill is created and returned with `animationVideoStatus: "pending"`
> 4. **In the background**, the GIF is converted to MP4 with up to 5 retry attempts
> 5. Once conversion succeeds, `animationVideoUrl` is populated and `animationVideoStatus` becomes `"success"`
> 6. If all retries fail, `animationVideoStatus` becomes `"error"`

**Response 201** – returns the newly-created `Drill` (with `animationVideoStatus: "pending"` if GIF was provided).

```jsonc
{
  "id": 42,
  "title": "Give & Go Passing",
  "description": "Basic give-and-go pattern",
  "animationGifUrl": "https://bucket.fra1.digitaloceanspaces.com/drills/gifs/1234-uuid.gif",
  "animationVideoUrl": null, // Will be populated after background conversion
  "animationVideoStatus": "pending",
  "animationVideoAttempts": 0,
  "clubId": 3,
  "createdBy": "12",
  "createdAt": "2025-10-04T10:30:00Z",
  "updatedAt": "2025-10-04T10:30:00Z",
  "frames": [
    /* Frame objects */
  ]
}
```

**Possible errors**

- `422` – invalid GIF payload or upload failure.

---

### 3. Get Drill by ID

```http
GET /api/v1/drills/{id}
```

Path param `id` _(string \| integer)_.

**Response 200** – full `Drill`.

```jsonc
{
  "id": 42,
  "title": "Give & Go Passing",
  "description": "Basic give-and-go pattern",
  "animationGifUrl": "https://bucket.fra1.digitaloceanspaces.com/drills/gifs/1234-uuid.gif",
  "animationVideoUrl": "https://bucket.fra1.digitaloceanspaces.com/drills/videos/5678-uuid.mp4",
  "animationVideoStatus": "success", // Can be "pending", "success", or "error"
  "animationVideoAttempts": 2,
  "clubId": 3,
  "createdBy": "12",
  "createdAt": "2025-10-04T10:30:00Z",
  "updatedAt": "2025-10-04T10:31:00Z",
  "frames": [
    /* Frame objects */
  ]
}
```

> **Frontend Integration Tip:**
>
> - If `animationVideoStatus === "pending"`, show a loading indicator or use `animationGifUrl` as a fallback
> - If `animationVideoStatus === "success"`, display the video using `animationVideoUrl`
> - If `animationVideoStatus === "error"`, show `animationGifUrl` or an error message
> - Poll this endpoint every 3-5 seconds while status is `"pending"` to check for completion

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
  "animation_gif": "data:image/gif;base64,...", // Optional: uploads new GIF and triggers MP4 conversion
  "frames": [Frame, …]   // Replaces all frames when provided
}
```

> **Note:** If `animation_gif` is provided, the drill's `animationVideoStatus` will be reset to `"pending"` and a new background conversion will start.

**Response 200** – updated `Drill`.

```jsonc
{
  "id": 42,
  "title": "Updated Title",
  "animationGifUrl": "https://bucket.fra1.digitaloceanspaces.com/drills/gifs/new-1234-uuid.gif",
  "animationVideoUrl": null, // Will be updated after background conversion
  "animationVideoStatus": "pending",
  "animationVideoAttempts": 0
  // ... other fields
}
```

**Response 404** – not found.

**Possible errors**

- `422` – invalid GIF payload or upload failure.

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

## Animation Status Reference

| Status      | Description                                                                    | Frontend Action                                                  |
| ----------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `"pending"` | GIF uploaded, MP4 conversion in progress (background processing with retry)    | Show loading spinner or display `animationGifUrl` as placeholder |
| `"success"` | MP4 conversion completed successfully, `animationVideoUrl` is ready            | Display video player with `animationVideoUrl`                    |
| `"error"`   | MP4 conversion failed after 5 retry attempts, only `animationGifUrl` available | Show `animationGifUrl` or error message                          |

---

## Change Log

- **2025-10-04** – Added background GIF-to-MP4 conversion with retry logic. New fields: `animationGifUrl`, `animationVideoStatus`, `animationVideoAttempts`.
- **2025-09-22** – Initial release of Drills API v1.
