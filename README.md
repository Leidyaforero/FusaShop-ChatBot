# Fusashop Academy AI

Plataforma educativa inteligente para la transformación digital de las MiPymes de Fusagasugá. HTML, CSS y JavaScript vanilla, integrada al ecosistema Fusashop.

## Requisitos

- Navegador moderno
- Servidor estático local (recomendado para cargar `data/products.json`)

## Cómo ejecutar

### Opción 1: VS Code + Live Server

1. Abre la carpeta del proyecto en VS Code.
2. Instala la extensión **Live Server**.
3. Clic derecho en `index.html` → **Open with Live Server**.
4. Panel admin: `pages/admin.html` desde la misma URL base.

### Opción 2: npx serve o Python

```bash
npx serve .
# o: python -m http.server 5500
```

- Academia: `http://127.0.0.1:3000/index.html` (puerto según serve)
- Admin: `http://127.0.0.1:3000/pages/admin.html`

**No uses `file://`** — puede fallar la carga de `data/products.json`.

## Funcionalidades

- Landing: inicio, catálogo de cursos, nosotros, contacto y footer.
- Catálogo con búsqueda y filtro por categoría.
- CRUD de cursos con persistencia en LocalStorage.
- Gestión de cupos (entrada/salida) con historial.
- Chatbot Asistente Fusashop: español/inglés, preguntas frecuentes, filtro de dominio y Gemini.

## Persistencia (LocalStorage)

- Cursos: `fusashop_products_v1`
- Historial de cupos: `fusashop_stock_history_v1`
- Idioma del chat (sesión): `fusashop_chat_lang_v1`
- API Gemini (opcional): `fusashop_gemini_key_v1`

## API Gemini

En `.env`:

```env
GEMINI_API_KEY=tu_clave_aqui
```

## Estructura

- `index.html` — landing pública
- `pages/admin.html` — panel administrativo
- `data/products.json` — 15 cursos iniciales (6+ categorías)
- `services/` — productos, cupos, chatbot, autor
- `js/` — UI principal y admin
