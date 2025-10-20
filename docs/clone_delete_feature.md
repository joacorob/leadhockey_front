# Clone & Delete Feature - API Documentation

This document describes the new clone and delete endpoints for drills and practice plans in the v1 API.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Delete Drill](#delete-drill)
- [Delete Practice Plan](#delete-practice-plan)
- [Clone Practice Plan](#clone-practice-plan)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## Overview

### New Features

1. **Delete Drills**: Users can now delete their own drills via the API. When a drill is deleted, it's automatically removed from all practice plans that contain it.
2. **Delete Practice Plans**: Users can delete their own practice plans (soft delete - sets status to 'deleted').
3. **Clone Practice Plans**: Users can duplicate their practice plans to create a copy with all items preserved.

### Ownership Validation

All endpoints validate that the authenticated user owns the resource they're trying to modify. Attempting to delete or clone someone else's resource will return a `403 Forbidden` error.

---

## Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

The user ID is extracted from the token (`id` or `sub` field).

---

## Delete Drill

### Endpoint

```
DELETE /api/v1/drills/:id
```

### Description

Deletes a drill owned by the authenticated user. The drill is permanently removed from the database and automatically removed from all practice plans that contain it (including plans owned by other users).

### Path Parameters

| Parameter | Type   | Description            |
| --------- | ------ | ---------------------- |
| `id`      | number | The drill ID to delete |

### Headers

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Response

**Success (200)**

```json
{
  "success": true,
  "data": {
    "message": "Drill deleted"
  }
}
```

**Errors**

- `401 Unauthorized`: No valid token provided
- `403 Forbidden`: User doesn't own this drill
- `404 Not Found`: Drill doesn't exist
- `500 Internal Server Error`: Server error

### Behavior

- The drill is **permanently deleted** (hard delete)
- All references in `practice_plan_items` are automatically removed
- This affects all practice plans (yours and others) that contain this drill
- The operation is atomic - if any part fails, the entire operation is rolled back

---

## Delete Practice Plan

### Endpoint

```
DELETE /api/v1/practice-plans/:id
```

### Description

Soft-deletes a practice plan owned by the authenticated user. The plan's status is set to `'deleted'` but the data remains in the database.

### Path Parameters

| Parameter | Type   | Description                    |
| --------- | ------ | ------------------------------ |
| `id`      | number | The practice plan ID to delete |

### Headers

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Response

**Success (200)**

```json
{
  "success": true,
  "data": {
    "message": "Practice plan deleted"
  }
}
```

**Errors**

- `401 Unauthorized`: No valid token provided
- `403 Forbidden`: User doesn't own this practice plan
- `404 Not Found`: Practice plan doesn't exist
- `500 Internal Server Error`: Server error

### Behavior

- The practice plan is **soft deleted** (status set to `'deleted'`)
- Items within the plan are preserved in the database
- The plan will no longer appear in listings by default
- Can potentially be restored by manually changing the status back to `'published'` or `'draft'`

---

## Clone Practice Plan

### Endpoint

```
POST /api/v1/practice-plans/:id/clone
```

### Description

Creates a duplicate of an existing practice plan owned by the authenticated user. The cloned plan will have the same description, thumbnail, items, and structure, but will be set to `'draft'` status.

### Path Parameters

| Parameter | Type   | Description                   |
| --------- | ------ | ----------------------------- |
| `id`      | number | The practice plan ID to clone |

### Headers

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Request Body (Optional)

```json
{
  "title": "Custom Title for Clone"
}
```

If no title is provided, the cloned plan will be named `"{Original Title} (Copy)"`.

| Field   | Type   | Required | Description                      |
| ------- | ------ | -------- | -------------------------------- |
| `title` | string | No       | Custom title for the cloned plan |

### Response

**Success (201)**

```json
{
  "success": true,
  "data": {
    "id": 42,
    "title": "My Practice Plan (Copy)",
    "description": "Original description",
    "thumbnailUrl": "https://...",
    "clubId": null,
    "createdBy": 123,
    "status": "draft",
    "createdAt": "2025-10-20T10:00:00.000Z",
    "updatedAt": "2025-10-20T10:00:00.000Z"
  }
}
```

**Errors**

- `401 Unauthorized`: No valid token provided
- `403 Forbidden`: User doesn't own the original practice plan
- `404 Not Found`: Original practice plan doesn't exist
- `500 Internal Server Error`: Server error

### Behavior

- Creates a **new practice plan** with a new ID
- All items (drills, videos, favorites) are copied with their original order and `startTime`
- The cloned plan always starts with `status: 'draft'`
- The `createdBy` is set to the authenticated user
- The thumbnail URL is reused (not duplicated in storage)
- The original plan remains unchanged

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

### Common HTTP Status Codes

- `200 OK`: Successful deletion
- `201 Created`: Successful clone
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't own the resource
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Unexpected server error

---

## Examples

### Delete a Drill

```javascript
const response = await fetch("/api/v1/drills/123", {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const result = await response.json();
// result: { success: true, data: { message: "Drill deleted" } }
```

### Delete a Practice Plan

```javascript
const response = await fetch("/api/v1/practice-plans/456", {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const result = await response.json();
// result: { success: true, data: { message: "Practice plan deleted" } }
```

### Clone a Practice Plan (default title)

```javascript
const response = await fetch("/api/v1/practice-plans/456/clone", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const result = await response.json();
// result.data will contain the new cloned plan with title "Original Title (Copy)"
```

### Clone a Practice Plan (custom title)

```javascript
const response = await fetch("/api/v1/practice-plans/456/clone", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "My Custom Clone Title",
  }),
});

const result = await response.json();
// result.data will contain the new cloned plan with title "My Custom Clone Title"
```

### React Hook Example

```typescript
// hooks/usePracticePlans.ts

export function usePracticePlans() {
  const deleteDrill = async (drillId: number) => {
    const response = await fetch(`/api/v1/drills/${drillId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to delete drill");
    }

    return response.json();
  };

  const deletePracticePlan = async (planId: number) => {
    const response = await fetch(`/api/v1/practice-plans/${planId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to delete practice plan");
    }

    return response.json();
  };

  const clonePracticePlan = async (planId: number, customTitle?: string) => {
    const response = await fetch(`/api/v1/practice-plans/${planId}/clone`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: customTitle ? JSON.stringify({ title: customTitle }) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to clone practice plan");
    }

    return response.json();
  };

  return {
    deleteDrill,
    deletePracticePlan,
    clonePracticePlan,
  };
}
```

---

## Important Notes

1. **Drill Deletion is Permanent**: Unlike practice plans, deleting a drill is a hard delete. Make sure to confirm with users before deletion.

2. **Cascade Effect**: When a drill is deleted, it's removed from ALL practice plans (not just yours). This ensures data consistency across the platform.

3. **Soft Delete for Plans**: Practice plans are soft-deleted (status set to 'deleted'). They can potentially be recovered if needed.

4. **Clone Status**: Cloned practice plans always start with `status: 'draft'` regardless of the original plan's status. This allows users to review and modify before publishing.

5. **Ownership Required**: All operations require the authenticated user to own the resource. You cannot delete or clone someone else's content.

6. **Thumbnail Sharing**: When cloning, the thumbnail URL is reused, not duplicated in storage. If you need a unique thumbnail, you'll need to upload a new one via the PUT endpoint.

---

## Support

For questions or issues, contact the backend team or refer to the main API documentation.
