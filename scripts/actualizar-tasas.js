// Lee la tasa oficial del BCV y el precio USDT de Binance P2P y escribe www/tasas.json.
// Lo ejecuta GitHub Actions cada ~15 minutos antes de publicar la app en GitHub Pages.
//   node scripts/actualizar-tasas.js [url-de-tasas.json-anterior]
// Si una fuente falla, se conserva el valor publicado anteriormente (si se pasa su URL).
const fs = require("fs");
const path = require("path");
const { pedir, BCV_INTERMEDIO } = require("../api/_comun");

const SALIDA = path.join(__dirname, "..", "www", "tasas.json");
const ANTERIOR_URL = process.argv[2] || "";

function numVE(s) { return parseFloat(String(s).trim().replace(/\./g, "").replace(",", ".")); }
function hoyVE() {
  // fecha de hoy en Venezuela (UTC-4)
  return new Date(Date.now() - 4 * 3600 * 1000).toISOString().slice(0, 10);
}

async function leerBCV() {
  const r = await pedir("https://www.bcv.org.ve/", { ca: BCV_INTERMEDIO });
  if (r.status !== 200) throw new Error("BCV respondió " + r.status);
  const h = r.body.toString("utf8");
  const tasa = (id) => {
    const m = h.match(new RegExp('id="' + id + '"[\\s\\S]{0,1500}?<strong[^>]*>\\s*([\\d.,]+)\\s*</strong>'));
    if (!m) throw new Error("No se encontró la tasa " + id);
    return numVE(m[1]);
  };
  const usd = tasa("dolar"), eur = tasa("euro");
  const f = h.match(/Fecha Valor:[\s\S]{0,200}?content="(\d{4}-\d{2}-\d{2})/);
  if (!f) throw new Error("No se encontró la fecha valor");
  if (!(usd > 0 && eur > usd)) throw new Error("Tasas BCV fuera de rango");
  return { usd, eur, fecha: f[1] };
}

// Sección "Vender" USDT/VES: se saltan los dos primeros anuncios y se promedian del 3.º al 12.º
async function leerBinance() {
  const consulta = JSON.stringify({ asset: "USDT", fiat: "VES", tradeType: "SELL", page: 1, rows: 12, payTypes: [], publisherType: null });
  const r = await pedir("https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search", {
    method: "POST", body: consulta,
    headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(consulta) },
  });
  if (r.status !== 200) throw new Error("Binance respondió " + r.status);
  const j = JSON.parse(r.body.toString("utf8"));
  const precios = (j.data || []).map((a) => parseFloat(a.adv.price)).filter((n) => n > 0);
  const tramo = precios.length > 2 ? precios.slice(2, 12) : precios;
  if (!tramo.length) throw new Error("Binance sin anuncios");
  const prom = tramo.reduce((a, b) => a + b, 0) / tramo.length;
  return { precio: Math.round(prom * 100) / 100, fecha: hoyVE(), anuncios: tramo.length };
}

async function leerAnterior() {
  if (!ANTERIOR_URL) return null;
  try {
    const r = await pedir(ANTERIOR_URL + "?t=" + Date.now());
    return r.status === 200 ? JSON.parse(r.body.toString("utf8")) : null;
  } catch (e) { return null; }
}

(async () => {
  const anterior = await leerAnterior();
  const [bcv, binance] = await Promise.allSettled([leerBCV(), leerBinance()]);
  const salida = { actualizado: new Date().toISOString(), bcv: null, binance: null, errores: [] };

  if (bcv.status === "fulfilled") {
    // nunca retroceder a una fecha valor anterior
    salida.bcv = (anterior && anterior.bcv && anterior.bcv.fecha > bcv.value.fecha) ? anterior.bcv : bcv.value;
  } else {
    salida.bcv = anterior && anterior.bcv; salida.errores.push("BCV: " + bcv.reason.message);
  }
  if (binance.status === "fulfilled") salida.binance = binance.value;
  else { salida.binance = anterior && anterior.binance; salida.errores.push("Binance: " + binance.reason.message); }

  fs.writeFileSync(SALIDA, JSON.stringify(salida, null, 2));
  console.log(JSON.stringify(salida));
  if (!salida.bcv && !salida.binance) process.exit(1);
})();
