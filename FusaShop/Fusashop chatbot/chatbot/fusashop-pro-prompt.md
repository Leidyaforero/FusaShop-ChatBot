# 🏋️ Prompt de Ingeniería — SportZone Pro E-commerce

> **Tipo:** Prompt de desarrollo web full-stack
> **Nivel:** Avanzado
> **Stack:** HTML · CSS · Vanilla JavaScript
> **Categoría:** E-commerce / Proyecto Académico

---

## 🎯 Rol del Agente

```
Actúa como un desarrollador web full-stack experto en arquitectura modular,
buenas prácticas, seguridad y diseño moderno.
```

---

## 📌 Objetivo del Proyecto

Desarrollar una aplicación web tipo **tienda E-commerce** de implementos deportivos, con:

- Interfaz moderna tipo **landing page**
- **Módulo administrativo completo** con CRUD funcional
- **Gestión de stock** (entradas y salidas)
- Arquitectura **modular y escalable**

---

## 🏪 Identidad de la Tienda

| Campo | Detalle |
|---|---|
| **Nombre** | SportZone Pro |
| **Categoría** | Implementos deportivos |
| **Moneda** | Pesos colombianos (COP) |

### Productos que vende

- Balones · Pesas · Guantes
- Ropa deportiva · Accesorios fitness
- Bicicletas · Bandas elásticas
- Botellas deportivas · Protecciones
- Implementos de entrenamiento

---

## 🧩 Funcionalidades Obligatorias

### 1. Landing Page (Frontend Público)

#### ✅ Home
- Presentación breve de la tienda
- Mensaje llamativo (ej: *"Todo lo que necesitas para entrenar como un profesional"*)
- Sección de categorías destacadas
- Productos destacados

#### ✅ Sección Productos
- Catálogo con cards de producto
- Botón **"Ver detalle"**
- Filtro por categoría
- Búsqueda por nombre
- Mostrar precio y stock disponible

#### ✅ Sección Nosotros
- Historia de la empresa
- Misión y visión
- Valores

#### ✅ Sección Contáctanos
- Formulario funcional: nombre, correo, mensaje
- Validaciones en frontend

#### ✅ Footer Completo
- Redes sociales · Dirección · Email · Teléfono

---

### 2. Panel Administrativo — CRUD de Productos

Cada producto debe tener los siguientes campos:

| Campo | Tipo |
|---|---|
| `id` | Identificador único |
| `nombre` | Texto |
| `descripción` | Texto largo |
| `categoría` | Selector |
| `precio` | Número (COP) |
| `stock` | Número entero |
| `imagen` | URL o carga local |
| `estado` | Activo / Inactivo |
| `fecha de creación` | Fecha automática |

**Operaciones CRUD requeridas:**

- ➕ Crear producto
- 📋 Listar productos
- ✏️ Editar producto
- 🗑️ Eliminar producto
- 🔄 Activar / Desactivar producto

---

### 3. Gestión de Stock (Requisito Clave)

Módulo para:

- **Aumentar stock** (entrada)
- **Reducir stock** (venta o salida)
- **Historial de movimientos** de stock

Cada movimiento debe guardar:

| Campo | Detalle |
|---|---|
| `id movimiento` | Identificador único |
| `producto` | Referencia al producto |
| `tipo` | `entrada` / `salida` |
| `cantidad` | Número entero |
| `fecha` | Automática |
| `descripción` | Opcional |

---

## 🗃️ Base de Datos

### Opción A — Sin backend (mínimo aceptable)
Usar **LocalStorage** como base de datos simulada.

### Opción B — Recomendada
- Archivo **JSON** simulando una API local
- O mini API con **Node.js** (opcional)

> ⚠️ **El CRUD debe ser totalmente funcional y con datos persistentes.**

---

## 🎨 Diseño UI/UX

### Paleta de Colores

| Rol | Color | Hex |
|---|---|---|
| Principal | Verde | `#00A86B` |
| Secundario | Azul | `#0057D9` |
| Fondo base | Blanco | `#FFFFFF` |
| Fondo secundario | Gris claro | `#F5F5F5` |

### Estilo Visual
- Minimalista y profesional
- Botones redondeados
- Cards modernas
- Tipografía limpia y legible
- **100% Responsive** (móvil / tablet / desktop)

---

## 🧱 Stack Tecnológico

```
HTML + CSS + JavaScript Vanilla (puro)
```

> 🚫 **No usar** frameworks como React, Angular o Vue.

---

## 🏗️ Arquitectura del Proyecto

```
📁 /assets          → Imágenes, íconos y recursos estáticos
📁 /css             → Hojas de estilo por módulo
📁 /js              → Lógica principal de la app
📁 /pages           → Páginas HTML adicionales
📁 /components      → Componentes reutilizables (cards, modales, etc.)
📁 /data            → productos.json o simulación de BD
📁 /services        → Funciones para CRUD y stock
📁 /utils           → Helpers y funciones reutilizables
📄 .env.example     → Variables de entorno (sin claves reales)
📄 README.md        → Instrucciones de uso
```

**Buenas prácticas exigidas:**
- Código comentado
- Funciones reutilizables
- Validación de formularios
- Manejo de errores en JS

---

## 🤖 Módulo Opcional — Chatbot con Gemini API

### Nombre: *"Asistente SportZone"*

El chatbot debe:
- Responder **únicamente** preguntas sobre: productos, stock, categorías, tienda y horarios
- **NO** responder temas externos al dominio de la tienda

### Base de Conocimiento del Chatbot
- Información del home
- Categorías y productos disponibles
- Políticas de envíos y devoluciones
- Horarios de atención

### Seguridad de API Key

Crear archivo `.env.example`:

```env
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

> 🔒 **NO incluir claves reales en el código bajo ninguna circunstancia.**

---

## 🧾 Datos Iniciales Obligatorios

| Requisito | Cantidad mínima |
|---|---|
| Productos deportivos | **15 productos** |
| Categorías | **5 categorías** |
| Moneda | Pesos colombianos (COP) |
| Stock inicial | Definido por producto |

---

## ✅ Entregables Finales

- [ ] Código completo HTML / CSS / JS
- [ ] CRUD funcionando con persistencia
- [ ] Gestión de stock con historial
- [ ] Diseño responsive
- [ ] Estructura modular y escalable
- [ ] Archivo `.env.example`
- [ ] Archivo `README.md` con instrucciones
- [ ] Archivo `products.json` con datos iniciales
- [ ] Comentarios explicativos en el código

---

## 📌 Restricciones Críticas

1. El proyecto debe funcionar **sin errores** en el navegador
2. El CRUD debe guardar datos **persistentes** (LocalStorage como mínimo)
3. El stock debe **actualizarse automáticamente** al registrar movimientos
4. El código debe ser **limpio, profesional y presentable** como proyecto académico

---

## 🏁 Resultado Esperado

> Una tienda web **funcional y completa**, con panel administrativo y control real de inventario, lista para ser usada como **prototipo real o proyecto académico**.

---

*Prompt diseñado bajo principios de Ingeniería de Prompts: rol claro, contexto definido, restricciones explícitas, entregables medibles y criterios de éxito verificables.*