// GET /api/bcv -> página de inicio de bcv.org.ve (la app extrae la tasa y la fecha valor)
const { pedir, BCV_INTERMEDIO } = require("./_comun");

module.exports = async (req, res) => {
  try {
    const r = await pedir("https://www.bcv.org.ve/", { ca: BCV_INTERMEDIO });
    if (r.status !== 200) throw new Error("BCV respondió " + r.status);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    // el BCV cambia una vez al día: se guarda 10 minutos en la red de Vercel
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
    res.status(200).send(r.body);
  } catch (e) {
    res.status(502).send(String(e.message || e));
  }
};
