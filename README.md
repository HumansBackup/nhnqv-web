# No hay nada que ver — web (escaparate v1)

Sitio estático + **Cloudflare Pages Function** que lee el catálogo de Airtable.
Airtable es la única fuente de verdad: tú editas la base, la web se actualiza.

```
nhnqv-web/
├── index.html              ← el sitio entero (SPA autocontenida)
├── functions/api/catalog.js ← Pages Function: lee Airtable y devuelve JSON
├── images/                  ← aquí van las fotos web, nombradas por ID
└── README.md
```

## Cómo funciona
- `index.html` pide `/api/catalog`. Si responde, pinta lo que haya en Airtable.
  Si no (abriéndolo en local, sin la Function), usa un catálogo de ejemplo embebido
  con los textos reales — por eso ya se ve el diseño sin desplegar.
- Las **fotos no se guardan en Airtable**. La web las busca en `images/<ID imagen>.jpg`
  (p. ej. `images/L1008652.jpg`). Si falta, muestra un placeholder con el ID.

## Pipeline de imágenes (lo único manual)
1. Exporta cada foto en versión **web** (~2000px lado largo, sRGB, calidad ~80).
2. Nómbrala **exactamente** con el ID de imagen de Airtable: `L1008652.jpg`.
3. Mételas en `images/`.
> Se puede automatizar luego (script que lea la carpeta de Dropbox y genere las web
> con el nombre correcto). De momento, arrastrar y soltar.

## Desplegar en Cloudflare Pages
1. Sube esta carpeta a un repo (GitHub/GitLab) **o** usa `npx wrangler pages deploy nhnqv-web`.
2. En Cloudflare → Pages → *Create project* → conecta el repo.
   - Build command: *(ninguno)*
   - Output directory: `/` (la raíz)
3. **Settings → Environment variables** (Production + Preview):
   - `AIRTABLE_TOKEN` = *(Personal Access Token de Airtable, scope `data.records:read` sobre la base)* — márcalo como **Secret**
   - `AIRTABLE_BASE_ID` = `appDbu9TpHku6nGqq`
4. **Custom domains** → añade `nohaynadaquever.com` (Cloudflare te guía con el DNS).

Crear el token: airtable.com/create/tokens → scope `data.records:read` → acceso a la base *No hay nada que ver*.

## Qué hace la web hoy (v1 · escaparate)
- Galería leída de Airtable, con badges (Próximamente / Pieza-no-venta).
- Ficha por imagen: foto, historia (caption ES/EN con toggle), la línea de cierre,
  specs de impresión y bloque de compra.
- "Encargar" abre un email a hola@nohaynadaquever.com (checkout ligero de v1).
- Piezas marcadas **Apta copia = off** (p. ej. Una vida nueva, Bankia) no muestran compra.

## Fase 2 — checkout automático (cuando haya demanda)
Sustituir el `mailto` por checkout real, sin exponer claves:
- `functions/api/checkout.js` → crea una **Stripe Checkout Session** (clave `STRIPE_SECRET_KEY`).
- `functions/api/webhook.js` → al confirmarse el pago (webhook de Stripe), crea el pedido
  en **Prodigi** vía su API (`PRODIGI_API_KEY`) con el SKU del tamaño y el fichero print-res.
- Guardar el pedido de vuelta en una tabla **Pedidos** de Airtable (trazabilidad).
Precios y SKUs saldrán del campo `Precio`/tamaños de Airtable. Los hi-res print (no los web)
se suben a un bucket privado (R2) y se pasan a Prodigi por URL firmada.

## Precios
Ahora mismo son de ejemplo (en `index.html` → `PRECIOS`). Lo suyo es moverlos al campo
`Precio` de Airtable (regla ~4× coste, margen >45% del `Modelo_Copias_v1.xlsx`) y que la
Function los sirva por tamaño.
