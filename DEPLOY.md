# Desplegar — GitHub + Cloudflare Pages + dominio

Tu ruta: repo en GitHub → Cloudflare Pages (auto-deploy en cada push) → dominio desde tu registrador.

---

## 1 · Subir la carpeta a GitHub
La **raíz del repo debe ser el contenido de `nhnqv-web/`** (que `index.html` quede en la raíz, no dentro de una subcarpeta).

Opción A — GitHub Desktop (sin terminal): File → Add local repository → elige la carpeta `nhnqv-web` → Publish repository (puede ser privado).

Opción B — terminal, desde dentro de `nhnqv-web/`:
```bash
git init
git add .
git commit -m "nhnqv web v1"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/nhnqv-web.git   # crea antes el repo vacío en github.com
git push -u origin main
```
> Las 13 fotos de `images/` (6,5 MB) se suben con el repo — bien para v1.

## 2 · Crear el token de Airtable (sólo lectura)
1. airtable.com/create/tokens → **Create token**.
2. Scope: **`data.records:read`**.
3. Access: la base **No hay nada que ver**.
4. Copia el token (empieza por `pat...`). Lo pegas en el paso 3.

## 3 · Conectar en Cloudflare Pages
1. dash.cloudflare.com → **Workers & Pages** → **Create** → pestaña **Pages** → **Connect to Git** → elige el repo.
2. Build settings:
   - Framework preset: **None**
   - Build command: **(vacío)**
   - Build output directory: **`/`**
3. **Save and Deploy**. Sale una URL `https://nhnqv-web.pages.dev` — ya se ve.
4. Project → **Settings → Variables and Secrets** → añade (para Production *y* Preview):
   - `AIRTABLE_TOKEN` = el `pat...` del paso 2 → tipo **Secret**
   - `AIRTABLE_BASE_ID` = `appDbu9TpHku6nGqq`
5. **Retry deployment** (o un push nuevo) para que tome las variables. Ahora `/api/catalog` lee de Airtable.

## 4 · El dominio (está en otro registrador)
Lo más limpio es llevar el DNS a Cloudflare:
1. Cloudflare → **Add a site** → `nohaynadaquever.com` → plan Free. Cloudflare escanea el DNS y te da **2 nameservers** (p. ej. `xxx.ns.cloudflare.com`).
2. En tu **registrador** (donde compraste el dominio): sustituye los nameservers por los dos de Cloudflare. (Propaga en minutos–horas.)
3. Cuando el dominio esté "Active" en Cloudflare: Pages → tu proyecto → **Custom domains** → **Set up a domain** → `nohaynadaquever.com` (y repite con `www`). Cloudflare crea los registros solo.

## Comprobación final
- `nhnqv-web.pages.dev` carga con fotos ✓
- La galería refleja lo que haya en Airtable (edita una Pieza y refresca) ✓
- `nohaynadaquever.com` apunta al sitio ✓

Cualquier paso que se atasque, me lo dices y lo depuramos.
