// Cloudflare Pages Function → GET /api/catalog
// Lee la base Airtable "No hay nada que ver" y devuelve el catálogo como JSON
// para que el front (index.html) lo pinte. La clave vive como secreto del
// servidor (nunca llega al navegador).
//
// Variables de entorno a configurar en Cloudflare Pages → Settings → Environment variables:
//   AIRTABLE_TOKEN    (secreto)  → Personal Access Token de Airtable con scope data.records:read
//   AIRTABLE_BASE_ID  (texto)    → appDbu9TpHku6nGqq
//
// Las imágenes NO salen de Airtable: el front las busca en /images/<ID imagen>.jpg

const PIEZAS = "Piezas";
const REELS = "Reels";

async function at(base, table, token) {
  const url = `https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}?pageSize=100`;
  const rows = [];
  let offset;
  do {
    const u = offset ? `${url}&offset=${offset}` : url;
    const r = await fetch(u, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error(`Airtable ${table} ${r.status}`);
    const j = await r.json();
    rows.push(...j.records);
    offset = j.offset;
  } while (offset);
  return rows;
}

export async function onRequest(context) {
  const { env } = context;
  const token = env.AIRTABLE_TOKEN;
  const base = env.AIRTABLE_BASE_ID || "appDbu9TpHku6nGqq";
  if (!token) return json({ error: "Falta AIRTABLE_TOKEN" }, 500);

  try {
    const [piezas, reels] = await Promise.all([
      at(base, PIEZAS, token),
      at(base, REELS, token),
    ]);

    // index reels por record-id de la Pieza enlazada
    const reelByPieza = {};
    for (const r of reels) {
      const link = (r.fields["Pieza"] || [])[0];
      if (link) reelByPieza[link] = r.fields;
    }

    const out = piezas.filter((p) => p.fields["Publicar"]).map((p) => {
      const f = p.fields;
      const reel = reelByPieza[p.id] || {};
      return {
        id: f["ID imagen"] || "",
        titulo: f["Título"] || "",
        lugar: f["Lugar"] || "",
        pais: f["País"] || "",
        ssdd: f["Gancho SSDD"] || [],
        apta: !!f["Apta copia"],
        tamanoMax: f["Tamaño máx"] || "",
        precio: f["Precio"] || null,
        kick: f["Registro"] || "",
        estado: reel["Estado"] || "Archivo",
        cierre: reel["Cierre"] || "",
        es: reel["Caption ES"] || "",
        en: reel["Caption EN"] || "",
        n: reel["Nº"] || 999,
      };
    });

    // sólo lo que tenga imagen-id; ordenar por Nº
    out.sort((a, b) => a.n - b.n);

    return json(out, 200, {
      // cachea 5 min en el edge; Airtable sigue siendo la fuente de verdad
      "cache-control": "public, max-age=300",
    });
  } catch (e) {
    return json({ error: String(e) }, 502);
  }
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...extra },
  });
}
