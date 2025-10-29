# Leaf Category Navigation - Watch Page

## Overview

The watch page now implements a **leaf category navigation pattern**. Users must navigate through the category hierarchy until they reach a "leaf" category (a category with no children) before any content (videos/drills) or filters are displayed.

---

## User Flow

### 1. Initial State
- User lands on `/watch`
- Sees a grid of **top-level categories**
- No content, search, or filters are shown
- Breadcrumb shows "All Categories"

### 2. Selecting a Parent Category
- User clicks on a category (e.g., "Technique")
- URL updates to `/watch?category=1`
- Breadcrumb shows: `All Categories / Technique`
- Backend fetches subcategories for category ID 1
- If subcategories exist, they are displayed
- Still **no content or filters shown** (not a leaf yet)

### 3. Navigating to a Leaf Category
- User clicks on a subcategory (e.g., "Passing")
- URL updates to `/watch?category=5`
- Breadcrumb shows: `All Categories / Technique / Passing`
- Backend checks if "Passing" has children
- If no children (leaf category detected):
  - **Search bar appears**
  - **Filter toggle button appears**
  - **Content grid is fetched and displayed** via `/api/v1/watch?categoryId=5`
  - Filters are fetched via `/api/v1/filters?categoryId=5`

### 4. Filtering Content (Only at Leaf)
- User can now:
  - Type in the search box
  - Toggle filters panel
  - Select filter options
  - See filtered results
  - Navigate pagination

### 5. Breadcrumb Navigation
- User can click any breadcrumb segment to go back
- Clicking "All Categories" resets to root
- Clicking intermediate categories goes back to that level
- Category trail is maintained for smooth back navigation

---

## Technical Implementation

### Key Components

#### 1. **isLeafCategory** Flag
```typescript
const isLeafCategory = useMemo(() => {
  // If we're still loading subcategories, we don't know yet
  if (subCategoriesLoading) return false
  
  // If we have subcategories, it's not a leaf
  if (subCategories.length > 0) return false
  
  // If the category explicitly says hasChildren, it's not a leaf
  if (currentCategory?.hasChildren) return false
  
  // If we have a selected category and no subcategories loaded, it's a leaf
  return !!selectedCategoryId
}, [selectedCategoryId, subCategories, subCategoriesLoading, currentCategory])
```

**Logic:**
- Returns `false` while loading subcategories
- Returns `false` if subcategories exist
- Returns `false` if `hasChildren` flag is true
- Returns `true` only when we have a selected category with no children

#### 2. **Conditional API Calls**

**Filters API:**
```typescript
const filtersParams = useMemo(() => {
  // Only fetch filters when we're at a leaf category
  if (!selectedCategoryId || !isLeafCategory) {
    return { __skip: true }
  }
  return { categoryId: selectedCategoryId }
}, [selectedCategoryId, isLeafCategory])
```

**Watch API:**
```typescript
const watchParams = useMemo(() => {
  // Only fetch watch content when we're at a leaf category
  if (!selectedCategoryId || !isLeafCategory) {
    return { __skip: true }
  }

  const params: Record<string, any> = {
    categoryId: selectedCategoryId,
    page,
    limit: ITEMS_PER_PAGE,
  }

  if (filterOptionIds.length > 0) {
    params.filterOptionIds = filterOptionIds.join(",")
  }

  if (searchTerm) {
    params.search = searchTerm
  }

  return params
}, [selectedCategoryId, isLeafCategory, page, filterOptionIds, searchTerm])
```

**Result:** APIs are only called when `isLeafCategory` is `true`, saving unnecessary network requests.

#### 3. **Conditional UI Rendering**

**Search and Filters (Only at Leaf):**
```typescript
{isLeafCategory && (
  <>
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <Input placeholder="Search content..." />
      <button onClick={() => setShowFilters(!showFilters)}>
        <FilterIcon />
      </button>
    </div>
    {showFilters && <FiltersPanel />}
  </>
)}
```

**Content Grid (Only at Leaf):**
```typescript
{isLeafCategory ? (
  <ContentGrid items={displayItems} />
) : (
  <div className="text-center py-12">
    <p>Select a category above to view content</p>
  </div>
)}
```

#### 4. **Category Trail (Breadcrumbs)**

State:
```typescript
const [categoryTrail, setCategoryTrail] = useState<Category[]>([])
```

When clicking a category:
```typescript
const handleCategoryClick = (categoryId: string) => {
  router.push(`/watch?category=${categoryId}`)
  
  const clickedCategory = displayCategories.find(c => String(c.id) === categoryId)
  if (clickedCategory) {
    setCategoryTrail(prev => {
      // Check if going back
      const existingIndex = prev.findIndex(c => String(c.id) === categoryId)
      if (existingIndex >= 0) {
        return prev.slice(0, existingIndex + 1)
      }
      // Moving forward
      return [...prev, clickedCategory]
    })
  }
  
  setSelectedCategoryId(categoryId)
}
```

When clicking breadcrumb:
```typescript
const handleBreadcrumbClick = (categoryId: string | null) => {
  if (categoryId === null) {
    router.push('/watch')
    setSelectedCategoryId(null)
    setCategoryTrail([])
  } else {
    router.push(`/watch?category=${categoryId}`)
    setSelectedCategoryId(categoryId)
    
    const index = categoryTrail.findIndex(c => String(c.id) === categoryId)
    if (index >= 0) {
      setCategoryTrail(categoryTrail.slice(0, index + 1))
    }
  }
}
```

---

## Backend Requirements

### Category API Response
The `/api/categories` endpoint must return categories with a `hasChildren` field:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Technique",
        "hasChildren": true,
        "childCount": 5
      },
      {
        "id": 5,
        "name": "Passing",
        "parentId": 1,
        "hasChildren": false,
        "childCount": 0
      }
    ]
  }
}
```

**Fields:**
- `hasChildren` (boolean): `true` if category has child categories
- `childCount` (number): Count of direct children (optional, for optimization)

**Fallback:**
If backend doesn't provide `hasChildren`, the frontend computes it:
```typescript
hasChildren: category.hasChildren ?? (category.childCount > 0)
```

### Watch API
Only called when `isLeafCategory` is `true`. Parameters:
- `categoryId` (required): The leaf category ID
- `page` (optional): Page number
- `limit` (optional): Items per page
- `filterOptionIds` (optional): Comma-separated filter option IDs
- `search` (optional): Search term

---

## Edge Cases & Handling

### 1. **Loading States**
- Show skeleton while loading categories
- Show "Loading subcategories..." message when checking if category is leaf
- Show loading grid while fetching content at leaf

### 2. **Empty Categories**
- If a leaf category has no content, show:
  > "No content found matching your criteria"
  > [Reset search & filters button]

### 3. **Direct URL Access**
- User can land on `/watch?category=5` directly
- Frontend fetches category data and initializes trail
- If it's a leaf, content loads immediately
- If it has children, subcategories are shown

### 4. **Browser Back/Forward**
- URL changes are synced via `router.push()`
- `categoryParam` from `useSearchParams()` triggers re-initialization
- Trail is reconstructed based on URL

### 5. **Sidebar Integration**
- Sidebar links point to `/watch?category={id}`
- When user clicks sidebar link, they navigate to that category
- Same leaf detection logic applies

---

## Benefits

### User Experience
✅ **Clear Navigation:** Users understand they need to drill down  
✅ **No Confusion:** Content only appears when relevant  
✅ **Breadcrumbs:** Easy to navigate back up the hierarchy  
✅ **Performance:** No unnecessary API calls for parent categories

### Developer Experience
✅ **Simple Logic:** Single `isLeafCategory` flag controls everything  
✅ **Type Safety:** TypeScript ensures correct Category shape  
✅ **Maintainable:** Clear separation between navigation and content display  
✅ **Scalable:** Works with unlimited category depth

---

## Testing Checklist

- [ ] Navigate from root to leaf category shows content
- [ ] Navigate to parent category shows subcategories (no content)
- [ ] Breadcrumb navigation works correctly
- [ ] Direct URL access to leaf category loads content
- [ ] Direct URL access to parent category shows subcategories
- [ ] Search and filters only appear at leaf
- [ ] Filters apply correctly at leaf
- [ ] Pagination works at leaf
- [ ] Browser back/forward buttons work
- [ ] Sidebar links navigate correctly
- [ ] Empty leaf categories show appropriate message
- [ ] Loading states display properly

---

## Future Enhancements

1. **Multi-level Trail Persistence:** Store full parent chain in backend for direct access
2. **Category Icons:** Show visual indicators for parent vs leaf categories
3. **Child Count Badges:** Display number of subcategories on parent cards
4. **Keyboard Navigation:** Arrow keys to navigate categories
5. **Recently Viewed:** Track user's category navigation history

---

**Last Updated:** 2025-10-29  
**Implemented By:** AI Assistant  
**Status:** ✅ Complete

