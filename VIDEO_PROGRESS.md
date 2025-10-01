# Video Progress Tracking - Frontend Implementation Guide

## 📋 Resumen

Sistema backend **listo para usar** que trackea el progreso de visualización de videos y drills. Permite implementar:

- ✅ **Continue Watching** - Reanudar videos desde donde se quedó el usuario
- ✅ **Watch History** - Historial de contenido visto para recomendaciones
- ✅ **Progress Tracking** - Actualización automática del progreso mientras se reproduce

## 🔑 Autenticación

**TODAS** las APIs requieren JWT token en header:

```
Authorization: Bearer <jwt_token>
```

## 🎯 Flujo de Usuario

1. Usuario entra a ver un video → Frontend consulta si hay progreso guardado
2. Si hay progreso → Video inicia desde ese punto
3. Mientras reproduce → Frontend envía progreso cada 10-15 segundos
4. Al completar ≥90% → Backend marca como COMPLETED e incrementa vistas
5. Continue Watching muestra solo videos IN_PROGRESS
6. Watch History muestra solo videos COMPLETED

## APIs v1

### 1. Obtener progreso actual de video

**Endpoint:** `GET /api/v1/videos/{id}/progress`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (con progreso):**

```json
{
  "success": true,
  "data": {
    "progress": {
      "id": 1,
      "userId": 123,
      "contentId": 456,
      "contentType": "VIDEO_SESSION",
      "positionSec": 45,
      "durationSec": 180,
      "status": "IN_PROGRESS",
      "updatedAt": "2025-10-01T12:00:00Z",
      "completedAt": null
    }
  }
}
```

**Response (sin progreso):**

```json
{
  "success": true,
  "data": {
    "progress": null
  }
}
```

**Uso:** Llamar al cargar un video para saber si debe continuar desde donde se quedó.

---

### 2. Actualizar progreso de video

**Endpoint:** `PUT /api/v1/videos/{id}/progress`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Body:**

```json
{
  "positionSec": 45,
  "durationSec": 180
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "progress": {
      "id": 1,
      "userId": 123,
      "contentId": 456,
      "contentType": "VIDEO_SESSION",
      "positionSec": 45,
      "durationSec": 180,
      "status": "IN_PROGRESS",
      "updatedAt": "2025-10-01T12:00:00Z",
      "completedAt": null
    },
    "completed": false
  }
}
```

**Lógica:**

- Si `positionSec / durationSec >= 0.9` → marca como `COMPLETED`
- Al completar por primera vez → incrementa `sessions.views` en 1
- Actualizaciones posteriores no incrementan vistas

---

### 3. Obtener progreso actual de drill

**Endpoint:** `GET /api/v1/drills/{id}/progress`

Mismo comportamiento que videos, pero para drills.

---

### 4. Actualizar progreso de drill

**Endpoint:** `PUT /api/v1/drills/{id}/progress`

Mismo comportamiento que actualizar video, pero para drills.

---

### 5. Continue Watching

**Endpoint:** `GET /api/v1/me/continue-watching?page=1&limit=10`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "contentType": "VIDEO_SESSION",
        "contentId": 456,
        "title": "Passing Drills",
        "thumbnail": "/thumbnails/passing.jpg",
        "positionSec": 45,
        "durationSec": 180,
        "updatedAt": "2025-10-01T12:00:00Z"
      }
    ],
    "page": 1,
    "limit": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

**Lógica:**

- Retorna solo contenido con `status = IN_PROGRESS`
- Ordenado por `updated_at DESC` (más reciente primero)
- Incluye datos del contenido (título, thumbnail)

---

### 6. Watch History

**Endpoint:** `GET /api/v1/me/watched?page=1&limit=20`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "contentType": "VIDEO_SESSION",
        "contentId": 789,
        "title": "Shooting Techniques",
        "thumbnail": "/thumbnails/shooting.jpg",
        "completedAt": "2025-10-01T11:30:00Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "totalItems": 5,
    "totalPages": 1
  }
}
```

**Lógica:**

- Retorna solo contenido con `status = COMPLETED`
- Ordenado por `completed_at DESC`
- Útil para recomendaciones "Because you watched..."

---

## Uso desde Frontend

### 1. Cargar video y reanudar desde progreso guardado

```javascript
// Al cargar la página del video
async function loadVideo(videoId) {
  // 1. Obtener progreso guardado
  const progressRes = await fetch(`/api/v1/videos/${videoId}/progress`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { progress } = await progressRes.json().data;

  // 2. Inicializar player
  const player = videojs("my-video");

  // 3. Si hay progreso guardado, posicionar video
  if (progress && progress.status === "IN_PROGRESS") {
    player.on("loadedmetadata", () => {
      player.currentTime(progress.positionSec);
      // Opcional: mostrar toast "Resuming from XX:XX"
    });
  }

  // 4. Setup tracking
  setupProgressTracking(player, videoId);
}
```

### 2. Actualizar progreso periódicamente

```javascript
function setupProgressTracking(player, videoId) {
  // Enviar progreso cada 10 segundos
  const interval = setInterval(async () => {
    const position = Math.floor(player.currentTime());
    const duration = Math.floor(player.duration());

    await fetch(`/api/v1/videos/${videoId}/progress`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ positionSec: position, durationSec: duration }),
    });
  }, 10000);

  // También enviar al pausar/cerrar
  player.on("pause", async () => {
    const position = Math.floor(player.currentTime());
    const duration = Math.floor(player.duration());
    await saveProgress(videoId, position, duration);
  });

  window.addEventListener("beforeunload", async () => {
    const position = Math.floor(player.currentTime());
    const duration = Math.floor(player.duration());
    await saveProgress(videoId, position, duration);
  });

  // Limpiar al destruir
  player.on("dispose", () => clearInterval(interval));
}

async function saveProgress(videoId, position, duration) {
  await fetch(`/api/v1/videos/${videoId}/progress`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ positionSec: position, durationSec: duration }),
  });
}
```

### 3. Continue Watching UI

```javascript
// Página Continue Watching
async function loadContinueWatching() {
  const response = await fetch("/api/v1/me/continue-watching?limit=5", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { items } = (await response.json()).data;

  // Renderizar lista con barra de progreso
  items.forEach((item) => {
    const progressPercent = (item.positionSec / item.durationSec) * 100;

    // Ejemplo de card
    const card = `
      <div class="video-card" onclick="playVideo('${item.contentId}', '${
      item.contentType
    }')">
        <img src="${item.thumbnail}" />
        <h3>${item.title}</h3>
        <div class="progress-bar">
          <div style="width: ${progressPercent}%"></div>
        </div>
        <span>${Math.floor(progressPercent)}% completado</span>
      </div>
    `;
  });
}
```

### 4. Watch History UI

```javascript
// Para recomendaciones "Because you watched..."
async function loadRecommendations() {
  const response = await fetch("/api/v1/me/watched?limit=10", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { items } = (await response.json()).data;

  // items[0] = último video completado
  // Usar para buscar contenido similar basado en categorías/tags
  const lastWatched = items[0];
  // fetchSimilarVideos(lastWatched.contentId);
}
```

---

## 📝 Casos de Uso Completos

### Caso 1: Usuario ve un video por primera vez

```javascript
// 1. Página se carga
const videoId = 123;

// 2. Verificar progreso
const res = await fetch(`/api/v1/videos/${videoId}/progress`, {
  headers: { Authorization: `Bearer ${token}` },
});
const { progress } = (await res.json()).data;

// 3. progress será null → video inicia desde 0:00
const player = videojs("video-player");
// player comienza normalmente

// 4. Mientras reproduce, enviar progreso cada 10s
setInterval(() => {
  saveProgress(videoId, player.currentTime(), player.duration());
}, 10000);
```

### Caso 2: Usuario retoma un video

```javascript
// 1. Verificar progreso
const { progress } = (
  await fetch(`/api/v1/videos/${videoId}/progress`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json())
).data;

// 2. progress existe con positionSec = 45
const player = videojs("video-player");

// 3. Mostrar opción al usuario
if (progress && progress.status === "IN_PROGRESS") {
  const resume = confirm(
    `Continuar desde ${formatTime(progress.positionSec)}?`
  );
  if (resume) {
    player.currentTime(progress.positionSec);
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
```

### Caso 3: Usuario completa un video

```javascript
// Backend maneja automáticamente:
// - Cuando progreso >= 90% → marca como COMPLETED
// - Incrementa sessions.views en 1
// - Video desaparece de Continue Watching
// - Aparece en Watch History

// Frontend solo necesita seguir enviando progreso normal
await fetch(`/api/v1/videos/${videoId}/progress`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    positionSec: 165, // 165/180 = 91.6%
    durationSec: 180,
  }),
});

// Response incluirá: { completed: true }
// Frontend puede mostrar notificación "Video completado! ✓"
```

---

## ⚠️ Manejo de Errores

```javascript
async function saveProgress(videoId, position, duration) {
  try {
    const response = await fetch(`/api/v1/videos/${videoId}/progress`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        positionSec: Math.floor(position),
        durationSec: Math.floor(duration),
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado → redirigir a login
        window.location.href = "/login";
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.data.completed) {
      // Mostrar badge de completado
      showCompletionBadge();
    }
  } catch (error) {
    // No bloquear reproducción si falla el tracking
    console.error("Failed to save progress:", error);
  }
}
```

---

## 💡 Tips y Mejores Prácticas

### 1. Frecuencia de Updates

- ✅ **Cada 10-15 segundos** mientras reproduce
- ✅ Al pausar
- ✅ Al cerrar (beforeunload)
- ❌ No cada segundo (genera tráfico innecesario)

### 2. Validación Local

```javascript
// Validar antes de enviar
function shouldSaveProgress(position, duration) {
  return (
    position >= 0 &&
    duration > 0 &&
    position <= duration &&
    !isNaN(position) &&
    !isNaN(duration)
  );
}
```

### 3. Debounce en Pause

```javascript
let pauseTimeout;
player.on("pause", () => {
  clearTimeout(pauseTimeout);
  pauseTimeout = setTimeout(() => {
    saveProgress(videoId, player.currentTime(), player.duration());
  }, 500); // Esperar 500ms por si el usuario retoma inmediatamente
});
```

### 4. Cleanup

```javascript
// Limpiar listeners al salir de la página
useEffect(() => {
  const cleanup = setupProgressTracking(player, videoId);
  return () => cleanup(); // Llamar cleanup al desmontar
}, [videoId]);

function setupProgressTracking(player, videoId) {
  const interval = setInterval(() => {
    saveProgress(videoId, player.currentTime(), player.duration());
  }, 10000);

  return () => {
    clearInterval(interval);
    // Guardar progreso final
    saveProgress(videoId, player.currentTime(), player.duration());
  };
}
```

### 5. Loading States

```javascript
// Mostrar loader mientras carga progreso
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function init() {
    setLoading(true);
    const { progress } = await getProgress(videoId);
    if (progress) {
      player.currentTime(progress.positionSec);
    }
    setLoading(false);
  }
  init();
}, [videoId]);
```

---

## 🔗 Endpoints Resumidos

| Método | Endpoint                       | Descripción                     |
| ------ | ------------------------------ | ------------------------------- |
| `GET`  | `/api/v1/videos/{id}/progress` | Obtener progreso de video       |
| `PUT`  | `/api/v1/videos/{id}/progress` | Actualizar progreso de video    |
| `GET`  | `/api/v1/drills/{id}/progress` | Obtener progreso de drill       |
| `PUT`  | `/api/v1/drills/{id}/progress` | Actualizar progreso de drill    |
| `GET`  | `/api/v1/me/continue-watching` | Lista de videos en progreso     |
| `GET`  | `/api/v1/me/watched`           | Historial de videos completados |

---

## 🧪 Testing

Todos los endpoints están testeados. Ver: `tests/integration/videoProgress.flow.spec.ts`

---

## 📞 Contacto

Si tienes dudas sobre la implementación, contacta al equipo de backend.
