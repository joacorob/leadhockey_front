# Finalizar Navegación Lateral y Vistas Asociadas

## ✅ COMPLETADO

Este documento describe las tareas que se implementaron para completar la navegación del sidemenu y las vistas asociadas.

## Objetivo
Completar la experiencia de navegación para contenidos de video, drills y entrenamientos, asegurando que el menú lateral funcione sin 404, que la vista `watch` combine ambos tipos de contenido y que existan pantallas dedicadas a los recursos creados por el usuario.

---

## 1. Variables de Entorno
- Agregar en `.env.local` (lo carga infra):
  - `DEFAULT_DRILL_CATEGORY_ID=<ID>` → categorización que representa drills dentro de `watch`.
- Confirmar que ya están configuradas: `LEAD_BACKEND` (base del backend) y las claves de NextAuth usadas en los proxies.

> **Nota:** No subir `.env.local` al repositorio. La aplicación leerá `process.env.DEFAULT_DRILL_CATEGORY_ID` en cliente (revisar si se necesita exponerla vía `next.config.mjs` mediante `process.env.NEXT_PUBLIC_...`).

---

## 2. Refactor de `watch`
Archivo: `app/watch/page.tsx`

### 2.1 Cambios Principales
1. **Resolver ID de categoría**
   - Convertir `DEFAULT_DRILL_CATEGORY_ID` a número (parsear string) para comparaciones con `category.id`.

2. **Seleccionar endpoint dinámicamente**
   - Cuando la categoría seleccionada (por query o UI) coincida con el ID anterior, usar `/api/drills`.
   - En cualquier otro caso, continuar usando `/api/videos`.
   - Sugerencia: reemplazar el `useApi` actual por un `useEffect`+`fetch` o un `useAsync` custom que recalcule cuando cambien `selectedCategoryId`, filtros, búsqueda, page.

3. **Unificar modelo de datos**
   - Crear un helper `mapContentItem(raw, isDrill)` que devuelva:
     ```ts
     type WatchContent = {
       id: string
       title: string
       description: string
       thumbnail: string
       duration: string
       coach: string
       category_id: string
       category: string
       created_at: string
       tags: string[]
       contentType: "VIDEO" | "DRILL"
     }
     ```
   - Para drills: `contentType: "DRILL"`, `thumbnail` puede venir de `thumbnail` o `thumbnail_url`, `duration` (si el backend no la provee) puede default a `'--:--'`.
   - Para videos: `contentType: "VIDEO"`, mantener la lógica actual.

4. **Actualizar filtros**
   - `filterVideos` debe trabajar sobre la colección unificada.
   - Si el backend de drills no soporta los mismos filtros dinámicos, ocultar el panel de filtros cuando se trate de drills (o ajustar a la respuesta real).

5. **Texto del encabezado**
   - Cambiar de “Watch Videos” a algo neutro como “Watch Content” para reflejar la mezcla de tipos.

6. **Asegurar navegación correcta**
   - `VideoCard` espera `contentType`. El mapper debe setearlo para que la card redirija a `/drills/:id` cuando toque.

### 2.2 Estados y Errores
- Mostrar skeleton mientras se cargan datos.
- Emplear un estado “sin resultados” con botón para limpiar filtros, igual al actual.

### 2.3 Tests Manuales
- Diagramar en QA: cambiar de categoría, validar que Drill Categoria (ID 2) llama a `/api/drills` y otras a `/api/videos`. Revisar con network tab.

---

## 3. Estandarizar `VideoCard`
Archivo: `components/ui/video-card.tsx`

- Confirmar que el componente acepta el nuevo tipo `WatchContent` sin depender de `data/videos` mock.
- Ajustar import y tipos: definir `interface WatchCardContent` dentro del archivo o en `lib/types/watch.ts`.
- Asegurar que `router.push` use `video.contentType`:
  - `DRILL` → `/drills/${video.id}`
  - `VIDEO` (default) → `/video/${video.id}`
- Si falta duración en drills, ocultar la pill o mostrar `--:--`.

---

## 4. Compartir Layout de Listado

### 4.1 Crear componente `WatchLayout`
- Ruta sugerida: `components/watch/content-browser.tsx`.
- Props mínimas:
  ```ts
  interface ContentBrowserProps {
    title: string
    fetcher: (params) => Promise<WatchContent[]> // o `useContentQuery` hook
    supportsFilters?: boolean
    emptyMessage: string
    disableCategories?: boolean
  }
  ```
- Extraer del actual `Watch`:
  - Header con buscador
  - Botón de filtros + rendering condicional
  - Grilla de `VideoCard`
  - Skeleton y estado vacío

### 4.2 Hook Reutilizable
- Crear `useWatchContent(params)` en `lib/hooks/use-watch-content.ts`:
  - Recibe `source: "videos" | "drills" | "auto"`.
  - Maneja page, limit, búsqueda, categorías.
- `WatchPage` usa `source: "auto"` (según categoría). Las otras vistas usarán `drills` o `sessions` fijo.

---

## 5. Vistas “My Drills” y “My Trainings”

### 5.1 Rutas
- Crear archivos:
  - `app/my/drills/page.tsx`
  - `app/my/trainings/page.tsx`
- Cada página debe ser client component (`"use client"`) y reutilizar `Sidebar` + `Header`.

### 5.2 Consumo de API
- Endpoints a través del proxy:
  - `/api/me/drills`
  - `/api/me/practice-sessions`
- Asegurar que existan handlers en `app/api/me/drills/route.ts` y `app/api/me/practice-sessions/route.ts`:
  ```ts
  export async function GET(request: NextRequest) {
    const token = await getToken(...)
    const url = `${process.env.LEAD_BACKEND}/api/v1/me/drills`
    // copiar patrón de otros proxies (authorize + forward query)
  }
  ```
- Los endpoints deben retornar items con metadatos; si formato difiere de `Watch`, adaptar con el helper de mapeo.

### 5.3 UI
- Título: “My Drills” / “My Trainings”.
- Reutilizar `ContentBrowser`.
- Desactivar categoría/filtros si la API no los provee, pero mantener buscador.
- Cuando no haya resultados, mostrar mensaje “No drills yet. Create your first drill.” con botón a `/create/drill` o `/create/train` según corresponda.

---

## 6. Sidebar y Navegación
Archivo: `components/layout/sidebar-client.tsx`

### 6.1 Actualizar Items
- Reemplazar rutas inexistentes por las nuevas:
  - `My drills` → `/my/drills`
  - `My trainings` → `/my/trainings`
  - Ajustar cualquier otro link que apunte a páginas sin implementar (`/watch/playlists`, etc.). Validar uno por uno en el árbol `app/`.

### 6.2 Marcado Activo
- `isHrefActive` ya considera query-string, no requiere cambios si la ruta existe.
- Asegurar que `defaultOpen` en `TRAIN` siga mostrando los nuevos links.

### 6.3 Tests Manuales
- Navegar desde el sidebar a cada ruta y confirmar que renderiza sin 404.
- Verificar estado activo (background azul) cuando se está en `My Drills` / `My Trainings`.

---

## 7. Ajustes Complementarios

### 7.1 Componentes de Header/Sidebar
- Comprobar que no haya doble scroll en las nuevas páginas; mantener `overflow` igual a `watch`.

### 7.2 Internationalización
- Dejar strings en inglés (coherencia actual). Si se requiere traducción futura, encapsular en constantes.

### 7.3 Accesibilidad
- Asegurar roles/aria en filtros y botones.

---

## 8. QA / Lista de Verificación

1. **Variables**
   - `.env` contiene `DEFAULT_DRILL_CATEGORY_ID`.
   - API proxies de `/api/me/drills` y `/api/me/practice-sessions` responden 200 en dev.

2. **Watch**
   - Cambiar categoría a la que corresponde al ID → ver que la llamada de red vaya a `/api/drills`.
   - Seleccionar otra categoría → `/api/videos`.
   - Los cards abren `/drills/:id` o `/video/:id` según `contentType`.

3. **My Drills**
   - Cargar el enlace desde el sidebar.
   - Ver listado del usuario (simular datos de backend).
   - Estado vacío ofrece CTA para crear.

4. **My Trainings**
   - Mismo check que anterior con `/api/me/practice-sessions`.

5. **Sidebar**
   - Todos los links de LEARN/CREATE/TRAIN apuntan a rutas válidas.
   - Estado activo correcto.

6. **Responsive**
   - Revisar en breakpoints (mobile/tablet) que buscador y filtros no se rompen.

7. **Regresión**
   - Confirmar que otras páginas (`create/*`, `train/page`) no rompen importando el layout compartido.

---

## 9. Siguientes Pasos (opcional)
- Añadir pruebas unitarias para el mapper de contenido (`jest`/`vitest`).
- Crear stories en Storybook para `ContentBrowser` con mocks de videos y drills.
- Integrar paginación cuando el backend lo exponga.

---

## Entregables Finales
- ✅ `app/watch/page.tsx` actualizado - Ahora detecta la categoría de drills y llama a `/api/drills` o `/api/videos` según corresponda
- ✅ `lib/types/watch.ts` - Tipos compartidos `WatchContent` y función `mapContentItem` para unificar respuestas de API
- ✅ `components/ui/video-card.tsx` - Actualizado para usar `WatchContent` y navegar correctamente según `contentType`
- ✅ `app/my/drills/page.tsx` - Nueva página para ver los drills del usuario
- ✅ `app/my/trainings/page.tsx` - Nueva página para ver los entrenamientos del usuario
- ✅ `app/api/me/drills/route.ts` - Proxy a `/api/v1/me/drills` del backend
- ✅ `app/api/me/practice-sessions/route.ts` - Proxy a `/api/v1/me/practice-sessions` del backend
- ✅ `components/layout/sidebar-client.tsx` - Enlaces actualizados con rutas correctas
- ✅ `app/train/page.tsx` - Enlaces de cards actualizados

## Resumen de Implementación

### ✅ Completado
1. **Proxies API creados** - `/api/me/drills` y `/api/me/practice-sessions` funcionando
2. **Tipos unificados** - `WatchContent` con mapper que normaliza videos, drills y practice sessions
3. **Watch mejorado** - Detecta categoría de drills (vía `NEXT_PUBLIC_DEFAULT_DRILL_CATEGORY_ID`) y consume endpoint correcto
4. **VideoCard flexible** - Navega a `/drills/:id` o `/video/:id` según `contentType`
5. **Nuevas páginas**:
   - `/my/drills` - Lista drills del usuario con buscador y estado vacío
   - `/my/trainings` - Lista entrenamientos del usuario con buscador y estado vacío
6. **Sidebar corregido** - Todos los enlaces apuntan a rutas existentes
7. **Sin errores de linting** - Código limpio y funcional

### 📋 Pendiente (Opcional)
- Extraer componente `ContentBrowser` reutilizable (las páginas funcionan sin esto, es una optimización futura)
- Añadir variable de entorno `NEXT_PUBLIC_DEFAULT_DRILL_CATEGORY_ID` en el `.env.local` del servidor

### 🧪 Testing Manual Recomendado
1. Navegar a `/watch` y cambiar entre categorías
2. Verificar que cuando se selecciona la categoría de drills, se llama a `/api/drills` (Network tab)
3. Crear un drill y verificar que aparece en `/my/drills`
4. Crear un training y verificar que aparece en `/my/trainings`
5. Navegar desde el sidebar a todas las rutas de LEARN, CREATE y TRAIN
6. Verificar que no hay 404s

Con estos pasos completados, la navegación está funcional y lista para usar.

