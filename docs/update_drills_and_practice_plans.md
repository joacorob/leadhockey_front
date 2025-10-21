# Actualizar drills y practice plans desde el front-end

Este documento resume los flujos, payloads y consideraciones para que el equipo de front-end implemente la edición de drills y practice plans utilizando las APIs v1 existentes en el dashboard de Field Hockey.

## Autenticación y headers comunes

- Todas las llamadas de escritura usan `Bearer <JWT>` en `Authorization`.
- Content-Type siempre `application/json`.
- Las respuestas exitosas envuelven el payload real en el helper `successResponse`, por lo que el objeto final viene bajo `data` en la respuesta HTTP (revisar helper si usan un cliente ya armado).

```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "..."
  }
}
```

## 1. Drills

### Endpoints

- `GET /api/v1/drills/{id}`: obtener datos actuales (incluye frames, filtros, thumbnail, etc.).
- `PUT /api/v1/drills/{id}`: actualizar drill. Requiere JWT válido.

### Payload esperado en `PUT`

El backend limpia algunos campos especiales y pasa el resto directo a `updateDrill`. Usar los nombres exactos:

- `title` (`string`)
- `description` (`string | null`)
- `clubId` (`number | null`)
- `categoryId` (`number | null`)
- `filterOptionIds` (`number[] | string[]`) → reemplaza completamente las opciones previas.
- `frames` (array completo, ver estructura más abajo). Si se envía, se borran todos los frames anteriores y se insertan los nuevos en orden.
- `thumbnailBase64` (`string`) → cadena base64 (`data:image/png;base64,...`). Si se envía, el backend sube un PNG nuevo y elimina el anterior. Para remover manualmente un thumbnail sin subir otro, enviar `thumbnailUrl: null`.
- `thumbnailUrl` (`string | null`) → se mapea directo a la DB. Útil para mantener/forzar una URL ya existente o eliminar (`null`).
- `animation_gif` o `animationGif` (`string base64`) → el backend sube el GIF al bucket, pone el estado en `pending` y lanza conversión a MP4 en background. Tras finalizar, la API actualiza el drill sola.
- `animationVideoUrl` (`string | null`) → para setear directamente un MP4 existente. Si se envía junto al GIF, prevalece el flujo de GIF.

#### Estructura de `frames`

Cada frame reemplaza al anterior en la misma posición:

```json
[
  {
    "order_index": 1,
    "background_image": null,
    "elements": [
      {
        "icon_path": "icons/player-blue.svg",
        "x": 120,
        "y": 340,
        "rotation": 0,
        "scale": 1,
        "thickness": 1,
        "color": "#00FFAA",
        "text": "Delantero",
        "z_index": 0
      }
    ]
  }
]
```

- `order_index` es obligatorio y determina el orden (1-based).
- `background_image` acepta URL o `null`.
- Cada elemento requiere al menos `icon_path`, `x`, `y`. El resto es opcional (`rotation`, `scale`, `thickness`, `color`, `text`, `z_index`).

### Respuestas relevantes

- `200 OK` con el drill completo actualizado.
- `401` si falta o es inválido el token.
- `404` si el `id` no existe o pertenece a otro usuario/club.
- `422` cuando falla la subida de GIF.
- `500` para errores generales (incluye fallback con el mensaje).

### Consideraciones de UI/UX

- Mientras `animationVideoStatus` esté en `pending`, mostrar un estado de “procesando animación”. El campo se actualiza tras la conversión.
- Si se reemplaza un thumbnail con base64, el backend se encarga de borrar el archivo anterior.
- Para editar filtros (`filterOptionIds`), enviar siempre la lista final (el backend recalcula el join table completo).
- Para remover por completo un thumbnail existente, enviar `thumbnailUrl: null` y **no** incluir `thumbnailBase64`.

## 2. Practice plans

### Endpoints

- `GET /api/v1/practice-plans/{id}`: trae plan + items; si el plan tiene `items`, devuelve cada elemento enriquecido cuando existe.
- `PUT /api/v1/practice-plans/{id}`: actualiza plan completo. Requiere JWT válido.

### Payload esperado en `PUT`

- `title` (`string`) → obligatorio si se quiere modificar; si no, omitir.
- `description` (`string | null`).
- `status` (`"draft" | "published" | "deleted"`).
- `items` (`array`) → si se envía, **reemplaza** la lista completa. Si se omite, se mantienen los existentes.
- `thumbnail` (`string | null`) → comportamiento:
  - `undefined`: no tocar thumbnail.
  - `null` o cadena vacía: eliminar thumbnail (el backend borra el archivo anterior si existía).
  - Base64 (`data:image/...`): subir nuevo PNG.
  - URL (`https://...`): usar esa URL directamente.

#### Estructura de items

```json
[
  {
    "itemType": "DRILL",
    "itemId": 45,
    "startTime": "09:15"
  },
  {
    "itemType": "VIDEO_SESSION",
    "itemId": 87,
    "startTime": null
  }
]
```

- `itemType`: `DRILL`, `VIDEO_SESSION` o `FAVORITE`.
- `itemId`: entero (referencia a drill, sesión o favorito según tipo).
- `startTime`: opcional en formato `HH:MM` (24h). Validado por regex; si falla devuelve `400`.
- El backend asigna `position` automáticamente según índice (1, 2, 3...).

### Respuestas relevantes

- `200 OK` con el plan actualizado.
- `401` sin token válido.
- `404` si el plan no existe o no pertenece al usuario.
- `500` para errores generales.

### Consideraciones de UI/UX

- Mostrar feedback cuando se elimina un thumbnail: al hacer PUT con `thumbnail: null` la API devuelve el plan con `thumbnailUrl: null`.
- Al editar items, enviar siempre la lista final ordenada; el backend eliminará e insertará todo respetando el orden recibido.
- Validar en el front el formato `HH:MM` antes de enviar para evitar errores 400.
- Los elementos dentro de `items` pueden llegar enriquecidos con `element` en el GET, pero ese campo es **solo lectura**; no enviarlo de vuelta.

## 3. Manejo de assets en el front

- Convertir imágenes o GIFs a base64 antes de llamar a la API cuando se necesite subir archivos nuevos.
- Limitar el tamaño del archivo base64 para evitar timeouts (recomendación < 5 MB); aplicar compresión si es necesario.
- Para GIFs de animaciones usar siempre la cadena base64 sin cabeceras multipart (el backend ya espera `data:image/gif;base64,...`).
- Tras subir un GIF, la conversión a MP4 es asincrónica. La UI debería consultar periódicamente o refrescar el drill para ver si `animationVideoStatus` pasó a `success` y obtener `animationVideoUrl`.

## 4. Manejo de errores

- El helper `errorResponse` devuelve `{ success: false, error: message }`. Mostrar el mensaje cuando sea relevante.
- Errores 4xx: revisar inputs; usualmente significa validaciones (auth, startTime inválido, drill inexistente).
- Errores 5xx: reintentar o escalar al backend con logs.

## 5. Checklist de implementación en el front

- [ ] Asegurar que el usuario tenga un JWT válido antes de editar.
- [ ] Al cargar la vista de edición, obtener los datos actuales con `GET` y mapearlos al formulario.
- [ ] Normalizar los campos que el backend espera (`thumbnail`, `thumbnailBase64`, `filterOptionIds`, `frames`, etc.).
- [ ] Enviar `PUT` solo con los campos cambiados. Evitar mutar propiedades que no se editen, salvo que la UI requiera reemplazo total (frames/items).
- [ ] Manejar estados de subida (`isUploading`, `isProcessingAnimation`) mientras se resuelven las llamadas.
- [ ] Refrescar la entidad después del `PUT` exitoso para obtener datos finales provenientes del backend (IDs, URLs definitivas, estados actualizados).

Con esta guía el equipo de front-end debería poder implementar formularios y flujos de edición de drills y practice plans sin ambigüedades sobre qué payloads enviar ni cómo interpretar las respuestas.
