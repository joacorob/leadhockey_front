# Thumbnails en Practice Plans

## 📋 Resumen

Los practice plans ahora soportan thumbnails opcionales que se suben automáticamente a S3.

## 📱 Cambios para el Frontend 

### 1. **Al LISTAR practice plans** (`GET /api/v1/practice-plans`)

El response ahora incluye `thumbnailUrl`:

```typescript
interface PracticePlan {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null; // ⭐ NUEVO
  status: "draft" | "published" | "deleted";
  items?: PracticePlanItem[];
  // ... otros campos
}
```

**Qué hacer:**

```typescript
// Mostrar thumbnail o placeholder
<Image
  source={{ uri: plan.thumbnailUrl || "https://placeholder.svg" }}
  style={{ width: 200, height: 120 }}
/>
```

---

### 2. **Al CREAR practice plan** (`POST /api/v1/practice-plans`)

Ahora podés enviar `thumbnail` en el body:

```typescript
// OPCIÓN A: Subir como URL (si ya la subiste a S3)
const payload = {
  title: "Mi Plan",
  description: "Descripción...",
  thumbnail: "https://s3.amazonaws.com/bucket/mi-imagen.jpg", // URL
  items: [...]
};

// OPCIÓN B: Subir como base64 (la API lo sube automáticamente a S3)
const payload = {
  title: "Mi Plan",
  description: "Descripción...",
  thumbnail: "data:image/png;base64,iVBORw0KGgoAAAANS...", // Base64
  items: [...]
};

// OPCIÓN C: No enviar thumbnail (será null)
const payload = {
  title: "Mi Plan",
  description: "Descripción...",
  // Sin thumbnail
  items: [...]
};
```

---

### 3. **Al ACTUALIZAR practice plan** (`PUT /api/v1/practice-plans/{id}`)

Mismo comportamiento que POST:

```typescript
// Actualizar con nuevo thumbnail
await fetch(`/api/v1/practice-plans/${id}`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "Título actualizado",
    thumbnail: imageBase64OrUrl, // Nueva imagen
  }),
});

// Eliminar thumbnail (mandar null explícitamente)
await fetch(`/api/v1/practice-plans/${id}`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    thumbnail: null, // Esto BORRA el thumbnail
  }),
});
```

---

## 🔑 Puntos Importantes

1. **El campo es opcional**: No es obligatorio enviar `thumbnail` al crear/actualizar
2. **La API acepta 2 formatos**:
   - **URL**: Si ya subiste la imagen a S3, mandá la URL completa
   - **Base64**: Mandá `data:image/png;base64,...` y la API la sube automáticamente
3. **Para borrar**: Mandá `thumbnail: null` en el PUT
4. **Response**: La API siempre devuelve `thumbnailUrl` (no `thumbnail`) con la URL final en S3
5. **Fallback**: Si `thumbnailUrl` es null, mostrá un placeholder

---

## 📝 Ejemplo completo en React Native

```typescript
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

function CreatePracticePlan() {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].base64) {
      setThumbnail(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const createPlan = async () => {
    const response = await fetch("/api/v1/practice-plans", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Mi Plan",
        description: "Descripción",
        thumbnail: thumbnail, // Base64 o null
        items: [],
      }),
    });

    const data = await response.json();
    console.log("Created plan with thumbnail:", data.thumbnailUrl);
  };

  return (
    <View>
      <Button title="Seleccionar Imagen" onPress={pickImage} />
      {thumbnail && <Image source={{ uri: thumbnail }} />}
      <Button title="Crear Plan" onPress={createPlan} />
    </View>
  );
}
```

---

## 🗄️ Detalles Técnicos (Backend)

### Base de datos

- Tabla: `practice_plans`
- Columna: `thumbnail_url VARCHAR(2048) NULL`
- Migración: `030_practice_plan_thumbnail.sql`

### Almacenamiento S3

- Carpeta: `practice-plans/thumbnails/`
- Formato: Soporta PNG, JPG, JPEG
- Límite: 5MB (configurable en `/api/uploads/image`)

### Comportamiento del Backend

1. Si recibe base64 → lo convierte a PNG y sube a S3
2. Si recibe URL → la guarda directamente
3. Si recibe `null` en PUT → borra la imagen anterior de S3 y setea NULL en DB
4. Al actualizar con nueva imagen → borra la anterior automáticamente

---

## 🧪 Tests

Se agregó test de integración en `tests/integration/practicePlans.flow.spec.ts`:

- Test de creación con thumbnail
- Test de actualización de thumbnail
- Test de eliminación de thumbnail

Para correr los tests:

```bash
npm test -- practicePlans.flow.spec.ts
```
