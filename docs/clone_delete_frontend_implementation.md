# Clone & Delete Feature - Frontend Implementation

## Overview

This document describes the frontend implementation of the clone and delete features for practice plans and drills, following the project's proxy API pattern.

## Architecture

### API Proxy Pattern

All API calls from the frontend go through Next.js API routes that act as proxies to the backend. This provides:
- Server-side authentication handling
- Secure token management
- Consistent error handling
- Better separation of concerns

### API Routes Created

#### 1. Practice Plans - Delete
**File**: `/app/api/practice-plans/[id]/route.ts`
- **Method**: `DELETE`
- **Backend**: `DELETE ${LEAD_BACKEND}/api/v1/practice-plans/:id`
- **Authentication**: Server-side via `getServerSession`

#### 2. Practice Plans - Clone
**File**: `/app/api/practice-plans/[id]/clone/route.ts`
- **Method**: `POST`
- **Backend**: `POST ${LEAD_BACKEND}/api/v1/practice-plans/:id/clone`
- **Authentication**: Server-side via `getServerSession`
- **Body**: Optional `{ title: "Custom Title" }`

#### 3. Drills - Delete
**File**: `/app/api/drills/[id]/route.ts`
- **Method**: `DELETE`
- **Backend**: `DELETE ${LEAD_BACKEND}/api/v1/drills/:id`
- **Authentication**: Server-side via `getServerSession`

## Frontend Components

### TrainingCard Component
**Location**: `/components/practice-plan/training-card.tsx`

**Features**:
- Three-dot menu button (MoreVertical icon)
- Two actions: Clone and Delete
- Prevents navigation when clicking menu
- Callbacks: `onClone` and `onDelete`

**Props**:
```typescript
interface TrainingCardProps {
  plan: PracticePlan
  onClone?: (id: number) => void
  onDelete?: (id: number) => void
}
```

### VideoCard Component
**Location**: `/components/ui/video-card.tsx`

**Features**:
- Three-dot menu button (MoreVertical icon)
- One action: Delete
- Prevents navigation when clicking menu
- Callback: `onDelete`

**Props**:
```typescript
interface VideoCardProps {
  video: WatchContent & { ... }
  onClick?: () => void
  onDelete?: (id: number) => void
}
```

## Page Implementations

### My Trainings Page
**Location**: `/app/my/trainings/page.tsx`

**Features**:
1. **Clone Functionality**:
   - Calls `/api/practice-plans/${id}/clone`
   - Shows success toast
   - Refreshes list
   - Navigates to cloned plan

2. **Delete Functionality**:
   - Shows confirmation dialog (AlertDialog)
   - Calls `/api/practice-plans/${id}`
   - Shows success/error toast
   - Refreshes list

**API Calls**:
```typescript
// Clone
await fetch(`/api/practice-plans/${planId}/clone`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
})

// Delete
await fetch(`/api/practice-plans/${selectedPlanId}`, {
  method: "DELETE",
})
```

### My Drills Page
**Location**: `/app/my/drills/page.tsx`

**Features**:
1. **Delete Functionality**:
   - Shows confirmation dialog with warning
   - Mentions removal from all practice plans
   - Calls `/api/drills/${id}`
   - Shows success/error toast
   - Refreshes list

**API Call**:
```typescript
// Delete
await fetch(`/api/drills/${selectedDrillId}`, {
  method: "DELETE",
})
```

## User Experience

### Visual Feedback
- **Toast Notifications**: Success/error messages for all actions
- **Loading States**: Spinners during operations
- **Confirmation Dialogs**: Prevent accidental deletions
- **Auto Refresh**: List updates after successful operations

### Menu Behavior
- Menu button appears on hover/focus
- Clicking menu stops event propagation
- Prevents accidental navigation to item detail

### Error Handling
- Network errors are caught and displayed
- Backend errors are parsed and shown to user
- Loading states prevent double-submissions

## State Management

### Refresh Pattern
Both pages use a `refreshKey` state that increments after successful operations:

```typescript
const [refreshKey, setRefreshKey] = useState(0)
const { data } = useApi(`/me/practice-sessions?refresh=${refreshKey}`)

// After successful operation
setRefreshKey((prev) => prev + 1)
```

This triggers a re-fetch from the API without full page reload.

### Dialog States
```typescript
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
const [isDeleting, setIsDeleting] = useState(false)
```

## Security

- ✅ No client-side token handling
- ✅ All authentication done server-side
- ✅ Tokens never exposed to browser
- ✅ Ownership validation on backend
- ✅ CSRF protection via Next.js

## Testing Checklist

- [ ] Clone practice plan with default title
- [ ] Clone practice plan with custom title
- [ ] Delete practice plan (soft delete)
- [ ] Delete drill (hard delete)
- [ ] Verify drill removal from plans
- [ ] Test error scenarios (401, 403, 404, 500)
- [ ] Test loading states
- [ ] Test confirmation dialogs
- [ ] Verify toast notifications
- [ ] Test auto-refresh after operations
- [ ] Verify navigation after clone

## Notes

1. **Practice Plans**: Soft delete (status set to 'deleted')
2. **Drills**: Hard delete (permanently removed from database)
3. **Cascade Effect**: Deleting a drill removes it from ALL practice plans
4. **Clone Status**: Cloned plans always start with status 'draft'
5. **Authentication**: Handled transparently via server-side session

