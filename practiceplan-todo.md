# PracticePlan Feature – Technical Plan

## 1. Naming

- **Entity name (backend)**: `practice_plans` (`PracticePlan` model).
- **Item table**: `practice_plan_items`.

## 2. Database Schema

### 2.1. practice_plans

| Column      | Type                                | Constraints                                           |
| ----------- | ----------------------------------- | ----------------------------------------------------- |
| id          | INT AUTO_INCREMENT                  | PRIMARY KEY                                           |
| title       | VARCHAR(255)                        | NOT NULL                                              |
| description | TEXT                                | NULL                                                  |
| club_id     | INT                                 | NULL – FK → clubs.id (ON DELETE SET NULL)             |
| created_by  | INT                                 | NOT NULL – FK → users.id                              |
| status      | ENUM('draft','published','deleted') | DEFAULT 'draft'                                       |
| created_at  | TIMESTAMP                           | DEFAULT CURRENT_TIMESTAMP                             |
| updated_at  | TIMESTAMP                           | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

### 2.2. practice_plan_items

| Column           | Type                                     | Constraints                                                       |
| ---------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| id               | INT AUTO_INCREMENT                       | PRIMARY KEY                                                       |
| practice_plan_id | INT                                      | NOT NULL – FK → practice_plans.id (ON DELETE CASCADE)             |
| item_type        | ENUM('DRILL','VIDEO_SESSION','FAVORITE') | NOT NULL                                                          |
| item_id          | INT                                      | NOT NULL (FK to drills.id or video_sessions.id depending on type) |
| position         | INT                                      | NOT NULL                                                          |

_Indexes_

```sql
CREATE INDEX idx_plan_items_plan_pos ON practice_plan_items(practice_plan_id, position);
CREATE INDEX idx_plan_status ON practice_plans(status);
```

## 3. Migration

Single migration file `20250926_create_practice_plans.sql` with `UP` and `DOWN` sections creating both tables and indexes as above.

## 4. Backend Models / ORM (Prisma example)

```prisma
model PracticePlan {
  id          Int                  @id @default(autoincrement())
  title       String
  description String?
  clubId      Int?
  createdBy   Int
  status      PracticePlanStatus   @default(draft)
  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt
  items       PracticePlanItem[]
}

enum PracticePlanStatus {
  draft
  published
  deleted
}

model PracticePlanItem {
  id              Int               @id @default(autoincrement())
  practicePlanId  Int
  itemType        PracticePlanItemType
  itemId          Int
  position        Int
  practicePlan    PracticePlan      @relation(fields: [practicePlanId], references: [id])
}

enum PracticePlanItemType {
  DRILL
  VIDEO_SESSION
  FAVORITE
}
```

## 5. API Design

### 5.1. Public API v1 (Bearer token auth)

| Method | Path                                   | Description                             |
| ------ | -------------------------------------- | --------------------------------------- |
| GET    | /api/v1/practice-plans                 | List (filters: clubId, coachId, status) |
| GET    | /api/v1/practice-plans/:id             | Retrieve detail                         |
| POST   | /api/v1/practice-plans                 | Create (body: metadata + items)         |
| PATCH  | /api/v1/practice-plans/:id             | Update metadata/items                   |
| PATCH  | /api/v1/practice-plans/:id/items/order | Reorder items                           |
| DELETE | /api/v1/practice-plans/:id             | Mark status = deleted                   |

### 5.2. Dashboard API (Next.js app)

Auth via `getServerSession` cookie/session only (no Bearer). Routes under `/api/dashboard/practice-plans` proxy to internal services:
| Method | Path | Notes |
|--------|------|-------|
| GET | /api/dashboard/practice-plans | Only plans where club_id in (null, user.clubId) |
| POST | /api/dashboard/practice-plans | Create – owner = current user |
| etc. | … | … |

## 6. Front-end (Dashboard Wizard)

1. **Metadata step** – title, description, status (draft/published).
2. **Select items** – tabbed search: Drills, Video Sessions, Favorites (no need to expose favorite type to backend).
3. **Arrange** – drag-and-drop list ordering.
4. **Review & Publish** – confirm, sets status=published.

## 7. Authorization Rules

- Create/Update/Delete → only coach who created or club admin.
- Club plans (`club_id = X`) editable by coaches of that club.
- Global plans (`club_id NULL`) editable only by LeadHockey admins.
- Reading: any authenticated coach can read global + their club’s plans.

## 8. Future Considerations

- When user favorites a drill/video, it’s only a UI hint; no extra backend column needed now.
- Soft-delete replaced by status = deleted.
- Possible future: versioning table for plan revisions.
