// POST /api/binance -> anuncios de la sección "Vender" USDT/VES de Binance P2P (primeros 12)
// La consulta es fija; se ignora lo que mande el cliente.
const { pedir } = require("./_comun");

const CONSULTA = JSON.stringify({ asset: "USDT", fiat: "VES", tradeType: "SELL", page: 1, rows: 12, payTypes: [], publisherType: null });

module.exports = async (req, res) => {
  try {
    const r = await pedir("https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search", {
      method: "POST",
      body: CONSULTA,
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(CONSULTA) },
    });
    if (r.status !== 200) throw new Error("Binance respondió " + r.status);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    res.status(200).send(r.body);
  } catch (e) {
    res.status(502).send(String(e.message || e));
  }
};
