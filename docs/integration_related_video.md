# Related Video Playlist API

## Overview

`GET /api/v1/related-videos/:id` devuelve una lista ordenada de videos/drills para mostrar como “contenido relacionado” a un video principal. La API aplica reglas de prioridad para reutilizar una playlist existente o construir una lista dinámica usando categorías y filtros. Siempre respeta el `clubId` del usuario autenticado.

## Autenticación

- **Header** `Authorization: Bearer <JWT>` (requerido)
- El token debe incluir `id` y, si aplica, `clubId`. Los videos con `clubId` distinto al del token se excluyen automáticamente (solo se retornan los que tienen `clubId = null` o coinciden con el usuario).

## Endpoint

| Método | URL                          | Descripción                                           |
| ------ | ---------------------------- | ----------------------------------------------------- |
| GET    | `/api/v1/related-videos/:id` | Obtiene la playlist relacionada para un video o drill |

### Parámetros de ruta

- `:id` (`string | number`): ID del video o drill principal.

### Parámetros de query

- `type` (`string`, requerido): Tipo de contenido del ID recibido. Valores válidos:
  - `VIDEO_SESSION`
  - `DRILL`

### Headers relevantes

- `Authorization: Bearer <token>`
- `Content-Type: application/json` (solo para referencia; la petición es `GET`).

## Prioridad de selección

La API intenta construir la playlist en el siguiente orden. Apenas encuentra contenido usa ese resultado y no continúa con los pasos siguientes:

1. **Playlist existente**: si el contenido pertenece a una playlist (`playlist_sessions`), se retorna esa playlist completa (respetando `clubId`).
2. **Subcategoría**: si no está en una playlist, se buscan otros ítems del mismo tipo (`type`) dentro de la misma subcategoría (`categoryId`), excluyendo el ID original.
3. **Filtros**: si tampoco hay hermanos de subcategoría, se buscan otros ítems que compartan al menos un filter option (`session_filter_options` o `drill_filter_options`).
4. **Categorías padre**: si no hay coincidencias previas, se recorren las categorías padre del contenido y se listan ítems de esas categorías.
5. **Fallback vacío**: si todos los pasos fallan, se retorna un payload vacío (`items: []`, `source: "none"`).

En todos los casos se excluye el ítem original de `items`. El tamaño máximo de la lista es 20 elementos.

## Respuesta

```json
{
  "data": {
    "source": "playlist",
    "title": "Playlist Name or Generated Title",
    "description": "Optional description (playlist o generada)",
    "playlistId": "42", // null para listas generadas dinámicamente
    "itemsCount": 12,
    "items": [
      {
        "id": "101",
        "type": "VIDEO_SESSION",
        "title": "3v2 Pressing Trap",
        "thumbnail": "https://cdn/.../thumb.jpg",
        "duration": 420,
        "clubId": null,
        "categoryId": 8,
        "filterOptionIds": ["34", "55"]
      }
      // ... restantes
    ]
  }
}
```

### Campos

- `source`: de dónde provino la lista. Valores posibles: `playlist`, `subcategory`, `filters`, `parentCategory`, `none`.
- `title` / `description`: metadatos mostrables. Para playlists reutilizadas provienen de la tabla `playlists`; para listas generadas se construye un título descriptivo (p.ej. “Más drills de Subcategoría X”).
- `playlistId`: ID real cuando `source = playlist`; `null` en listas dinámicas.
- `itemsCount`: número de elementos incluidos.
- `items`: array ordenado de recomendaciones. Cada ítem contiene:
  - `id`: identificador único del video o drill recomendado.
  - `type`: `VIDEO_SESSION` o `DRILL` (útil para routing/render en frontend).
  - `title`, `thumbnail`, `duration`: datos básicos para UI.
  - `clubId`: `null` o ID del club del contenido (para features específicas del club).
  - `categoryId`: categoría principal del contenido.
  - `filterOptionIds`: IDs de filters asociados (string[]). Vacío si no aplica.

## Ejemplos

### 1. Video en playlist existente

```
GET /api/v1/related-videos/15?type=VIDEO_SESSION
Authorization: Bearer <token>
```

Respuesta (extracto):

```json
{
  "data": {
    "source": "playlist",
    "title": "Intermediate Midfield Build-Up",
    "playlistId": "9",
    "itemsCount": 8,
    "items": [
      {
        "id": "15",
        "type": "VIDEO_SESSION",
        "title": "...",
        "thumbnail": "...",
        "duration": 360,
        "clubId": 4,
        "categoryId": 11,
        "filterOptionIds": ["22"]
      },
      { "id": "18", "type": "VIDEO_SESSION", "title": "..." }
      // ...
    ]
  }
}
```

> Nota: el frontend puede decidir ocultar el elemento actual (`id=15`) si prefiere mostrar solo recomendaciones distintas.

### 2. Drill sin playlist pero con filtros

```
GET /api/v1/related-videos/207?type=DRILL
Authorization: Bearer <token>
```

```json
{
  "data": {
    "source": "filters",
    "title": "Más drills con filtro: Pressing",
    "playlistId": null,
    "itemsCount": 5,
    "items": [
      {
        "id": "301",
        "type": "DRILL",
        "title": "Pressing Trap 3v2",
        "thumbnail": "...",
        "duration": null,
        "clubId": null,
        "categoryId": 14,
        "filterOptionIds": ["54"]
      },
      {
        "id": "415",
        "type": "DRILL",
        "title": "Defensive Press Channels",
        "thumbnail": "..."
      }
    ]
  }
}
```

## Consideraciones para el Frontend

- **Elemento actual**: La respuesta puede incluir el video/drill consultado si proviene de una playlist. El cliente decide si lo muestra o lo filtra.
- **Orden**: El backend ya entrega los ítems en el orden recomendado.
- **Fallback vacío**: Si no hay resultados, `source = "none"` y `items = []`. Mostrar un estado vacío amigable.
- **Cache**: el endpoint depende de metadatos que pueden cambiar (playlist updates, filtros nuevos). Evitar cache agresiva en el cliente.

---

Cualquier duda adicional contactar al equipo backend.
