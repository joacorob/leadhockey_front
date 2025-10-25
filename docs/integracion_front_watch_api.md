# Integración Frontend - Watch API

## Endpoint `/api/v1/watch`

Este endpoint permite obtener contenido mixto (videos y drills) filtrado por categoría. Reemplaza la necesidad de llamar a `/api/v1/videos` y `/api/v1/drills` por separado cuando se navega por categorías.

---

## Especificación Técnica

### URL y Método

```
GET /api/v1/watch
```

### Autenticación

**Requerida**: Sí

```
Authorization: Bearer <JWT_TOKEN>
```

El token JWT debe incluir el `clubId` del usuario si pertenece a un club. El endpoint filtrará contenido según el club del usuario.

---

## Parámetros Query String

| Parámetro         | Tipo     | Requerido | Default | Descripción                                                                                       |
|-------------------|----------|-----------|---------|---------------------------------------------------------------------------------------------------|
| `categoryId`      | `number` | **Sí**    | -       | ID de la categoría. Puede ser categoría padre o subcategoría.                                     |
| `page`            | `number` | No        | `1`     | Número de página para paginación (base 1).                                                        |
| `limit`           | `number` | No        | `20`    | Cantidad de items por página (máximo recomendado: 50).                                            |
| `filterOptionIds` | `string` | No        | `""`    | IDs de opciones de filtro separados por coma. Ej: `"1,3,5"`. Filtra contenido que tenga **TODOS** los filtros especificados (AND). |

### Notas sobre parámetros:

1. **`categoryId`**: 
   - Incluye **automáticamente** todas las subcategorías descendientes.
   - Si pasas la categoría padre "Técnica" (id=1), obtendrás contenido de "Técnica" y todas sus subcategorías ("Passing", "Shooting", etc.).
   - Si pasas una subcategoría "Passing" (id=5), obtendrás sólo contenido de "Passing" y sus hijos (si los tuviera).

2. **`filterOptionIds`**:
   - Debe coincidir con los filtros válidos para la categoría.
   - Los filtros se aplican con lógica AND (el contenido debe tener **todos** los filtros especificados).
   - Ejemplo: `filterOptionIds=1,3` retorna sólo items que tengan AMBOS filtros con id 1 y 3.

---

## Estructura de Respuesta

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "type": "VIDEO_SESSION",
        "id": "123",
        "title": "Passing Drills for Beginners",
        "thumbnail": "https://cdn.example.com/thumbnails/video-123.jpg",
        "duration": 1200,
        "categoryId": 5,
        "clubId": null,
        "createdAt": "2024-03-15T10:30:00.000Z"
      },
      {
        "type": "DRILL",
        "id": "456",
        "title": "Triangle Passing Pattern",
        "thumbnail": "https://cdn.example.com/thumbnails/drill-456.png",
        "duration": null,
        "categoryId": 5,
        "clubId": 10,
        "createdAt": "2024-03-14T14:20:00.000Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "totalItems": 42,
    "totalPages": 3
  }
}
```

### Estructura de cada Item

| Campo        | Tipo                         | Descripción                                                                                     |
|--------------|------------------------------|-------------------------------------------------------------------------------------------------|
| `type`       | `"VIDEO_SESSION"` \| `"DRILL"` | **Crítico**: Usar para diferenciar el tipo de contenido y navegar a la vista correcta.          |
| `id`         | `string`                     | ID único del contenido.                                                                         |
| `title`      | `string`                     | Título del contenido.                                                                           |
| `thumbnail`  | `string` \| `null`           | URL de la imagen thumbnail. Puede ser `null`.                                                   |
| `duration`   | `number` \| `null`           | Duración en **segundos**. Para drills puede ser `null` (no tienen duración de video).          |
| `categoryId` | `number` \| `null`           | ID de la categoría asignada.                                                                    |
| `clubId`     | `number` \| `null`           | ID del club dueño del contenido. `null` si es contenido global.                                |
| `createdAt`  | `string` (ISO 8601)          | Fecha de creación. Formato: `"2024-03-15T10:30:00.000Z"`.                                      |

### Metadata de Paginación

| Campo        | Tipo     | Descripción                              |
|--------------|----------|------------------------------------------|
| `page`       | `number` | Página actual.                           |
| `limit`      | `number` | Items por página.                        |
| `totalItems` | `number` | Total de items disponibles.              |
| `totalPages` | `number` | Total de páginas calculadas.             |

---

## Casos de Uso

### 1. Listar contenido de una categoría padre

**Request:**
```http
GET /api/v1/watch?categoryId=1&page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta:** Devuelve videos y drills de la categoría `1` **y todas sus subcategorías**, ordenados por fecha de creación (más recientes primero).

---

### 2. Listar contenido de una subcategoría específica

**Request:**
```http
GET /api/v1/watch?categoryId=5&page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta:** Devuelve videos y drills de la categoría `5` **y sus hijos** (si los tiene).

---

### 3. Filtrar por opciones de filtro

**Request:**
```http
GET /api/v1/watch?categoryId=1&filterOptionIds=2,7&page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta:** Devuelve videos y drills que:
- Pertenecen a la categoría `1` (o sus subcategorías).
- Tienen **ambos** filtros con ID `2` y `7`.

---

### 4. Paginación

**Request página 2:**
```http
GET /api/v1/watch?categoryId=1&page=2&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Manejo de Errores

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Causa:** Token JWT no proporcionado o inválido.

**Acción:** Redirigir al login o refrescar el token.

---

### 400 Bad Request

```json
{
  "success": false,
  "message": "categoryId is required"
}
```

**Causa:** Falta el parámetro `categoryId`.

**Acción:** Validar que siempre se envíe `categoryId` en el query.

---

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Failed to fetch watch content",
  "error": "Database connection timeout"
}
```

**Causa:** Error del servidor (base de datos, lógica interna).

**Acción:** Mostrar mensaje genérico al usuario y loggear el error. Reintentar si es transiente.

---

## Ejemplos de Integración

### JavaScript (Fetch)

```javascript
async function fetchWatchContent(categoryId, page = 1, limit = 20, filterOptionIds = []) {
  const token = localStorage.getItem('auth_token');
  
  // Build query string
  const params = new URLSearchParams({
    categoryId: categoryId.toString(),
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (filterOptionIds.length > 0) {
    params.append('filterOptionIds', filterOptionIds.join(','));
  }
  
  const url = `/api/v1/watch?${params.toString()}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Handle unauthorized
      window.location.href = '/login';
      return;
    }
    throw new Error(`HTTP error ${response.status}`);
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Unknown error');
  }
  
  return result.data;
}

// Uso:
fetchWatchContent(5, 1, 20, [2, 7])
  .then(data => {
    console.log('Items:', data.items);
    console.log('Total pages:', data.totalPages);
    
    // Renderizar items
    data.items.forEach(item => {
      if (item.type === 'VIDEO_SESSION') {
        renderVideoCard(item);
      } else if (item.type === 'DRILL') {
        renderDrillCard(item);
      }
    });
  })
  .catch(error => {
    console.error('Error fetching watch content:', error);
  });
```

---

### TypeScript + React (Axios)

```typescript
import axios from 'axios';

interface WatchContentItem {
  type: 'VIDEO_SESSION' | 'DRILL';
  id: string;
  title: string;
  thumbnail: string | null;
  duration: number | null;
  categoryId: number | null;
  clubId: number | null;
  createdAt: string;
}

interface WatchContentResponse {
  items: WatchContentItem[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

async function fetchWatchContent(
  categoryId: number,
  page: number = 1,
  limit: number = 20,
  filterOptionIds: number[] = []
): Promise<WatchContentResponse> {
  const token = localStorage.getItem('auth_token');
  
  const params: any = {
    categoryId,
    page,
    limit,
  };
  
  if (filterOptionIds.length > 0) {
    params.filterOptionIds = filterOptionIds.join(',');
  }
  
  const response = await axios.get<{ success: boolean; data: WatchContentResponse }>(
    '/api/v1/watch',
    {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data.data;
}

// Hook de React
import { useState, useEffect } from 'react';

function useWatchContent(categoryId: number, page: number = 1, filterOptionIds: number[] = []) {
  const [data, setData] = useState<WatchContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    setLoading(true);
    fetchWatchContent(categoryId, page, 20, filterOptionIds)
      .then(result => {
        setData(result);
        setError(null);
      })
      .catch(err => {
        setError(err);
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [categoryId, page, filterOptionIds.join(',')]);
  
  return { data, loading, error };
}

// Uso en componente:
function WatchContentList({ categoryId }: { categoryId: number }) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<number[]>([]);
  const { data, loading, error } = useWatchContent(categoryId, page, filters);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;
  
  return (
    <div>
      {data.items.map(item => (
        <ContentCard 
          key={`${item.type}-${item.id}`}
          item={item}
          onClick={() => navigateToContent(item)}
        />
      ))}
      
      <Pagination
        currentPage={data.page}
        totalPages={data.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}

function navigateToContent(item: WatchContentItem) {
  if (item.type === 'VIDEO_SESSION') {
    window.location.href = `/videos/${item.id}`;
  } else if (item.type === 'DRILL') {
    window.location.href = `/drills/${item.id}`;
  }
}
```

---

## Consideraciones Importantes

### 1. **Campo `type` es crítico**

Siempre verificar el campo `type` antes de navegar o renderizar:

```javascript
if (item.type === 'VIDEO_SESSION') {
  // Mostrar play button, duración, etc.
  navigateTo(`/videos/${item.id}`);
} else if (item.type === 'DRILL') {
  // Mostrar icono de drill, sin duración
  navigateTo(`/drills/${item.id}`);
}
```

### 2. **Duración puede ser `null`**

Los drills no siempre tienen duración. Validar antes de mostrar:

```javascript
const durationText = item.duration 
  ? formatDuration(item.duration) 
  : 'N/A';
```

### 3. **Thumbnail puede ser `null`**

Usar placeholder cuando `thumbnail` sea `null`:

```javascript
const thumbnailUrl = item.thumbnail || '/placeholder.svg';
```

### 4. **Paginación infinita**

Para scroll infinito, incrementar `page` cuando el usuario llegue al final:

```javascript
function loadMore() {
  if (page < totalPages) {
    setPage(page + 1);
  }
}
```

### 5. **Filtros AND (no OR)**

Los filtros se aplican con lógica AND. Si necesitas OR, hacer múltiples requests o cambiar la lógica del backend.

### 6. **Subcategorías incluidas automáticamente**

No necesitas hacer queries recursivas por subcategorías en el front. El backend ya incluye todo el árbol descendiente.

### 7. **Club filtering**

El filtrado por club es automático basado en el JWT. No necesitas pasar `clubId` como parámetro.

### 8. **Orden fijo**

Los resultados siempre vienen ordenados por `createdAt DESC` (más recientes primero). No hay parámetro de ordenamiento por ahora.

---

## Datos de Prueba

### Categorías de ejemplo:

- **Técnica** (id: 1, parent: null)
  - **Passing** (id: 5, parent: 1)
  - **Shooting** (id: 6, parent: 1)
- **Táctica** (id: 2, parent: null)
  - **Defensiva** (id: 7, parent: 2)

### Requests de ejemplo:

```bash
# Técnica + subcategorías (Passing, Shooting)
GET /api/v1/watch?categoryId=1

# Solo Passing + sus hijos
GET /api/v1/watch?categoryId=5

# Defensiva con filtros 2 y 7
GET /api/v1/watch?categoryId=7&filterOptionIds=2,7&page=1&limit=10
```

---

## Testing

### Checklist de integración:

- [ ] El token JWT se envía correctamente en `Authorization` header
- [ ] Se maneja correctamente `401 Unauthorized`
- [ ] Se valida `type` antes de navegar
- [ ] Se usa placeholder cuando `thumbnail` es `null`
- [ ] Se formatea o oculta `duration` cuando es `null`
- [ ] La paginación funciona correctamente
- [ ] Los filtros múltiples se envían como string separado por comas
- [ ] Se muestran videos y drills mezclados (no sólo uno u otro)
- [ ] Se navega a `/videos/:id` cuando `type === 'VIDEO_SESSION'`
- [ ] Se navega a `/drills/:id` cuando `type === 'DRILL'`

---

## Soporte

Para dudas técnicas, contactar al equipo de backend o revisar:

- Código fuente: `/app/api/v1/watch/route.ts`
- Query implementation: `/lib/queries.ts` → `listWatchContent`
- Tests: `/__tests__/api/watch.test.ts`

---

**Última actualización:** 2025-10-25  
**Versión API:** v1  
**Endpoint estable:** ✅

