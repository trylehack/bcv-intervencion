"""Servidor de desarrollo para probar la app en el PC.

Sirve la carpeta www/ y reenvía dos rutas a los sitios reales, porque el navegador
no puede leerlos directamente:
  /api/bcv      -> https://www.bcv.org.ve/
  /api/binance  -> Binance P2P (POST)
En el teléfono (.apk) la app llama a esos sitios directamente y no usa este servidor.

Uso:  python dev_server.py   (abre http://127.0.0.1:8770)
"""
import http.server
import os
import ssl
import urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
WWW = os.path.join(ROOT, "www")
PORT = int(os.environ.get("PORT", "8770"))

# El sitio del BCV no envía su certificado intermedio; lo cargamos nosotros.
ctx = ssl.create_default_context()
ctx.load_verify_locations(os.path.join(ROOT, "certs", "bcv_intermediate.pem"))
ctx.verify_flags |= ssl.VERIFY_X509_PARTIAL_CHAIN

UA = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36"
BINANCE_URL = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search"


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=WWW, **kw)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _relay(self, req):
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=40) as r:
                body = r.read()
                ctype = r.headers.get("Content-Type", "application/octet-stream")
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:  # noqa: BLE001
            msg = str(e).encode("utf-8")
            self.send_response(502)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(msg)))
            self.end_headers()
            self.wfile.write(msg)

    def do_GET(self):
        if self.path.startswith("/api/bcv"):
            return self._relay(urllib.request.Request("https://www.bcv.org.ve/", headers={"User-Agent": UA}))
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/binance"):
            n = int(self.headers.get("Content-Length", "0"))
            data = self.rfile.read(n)
            req = urllib.request.Request(BINANCE_URL, data=data, method="POST",
                                         headers={"Content-Type": "application/json", "User-Agent": UA})
            return self._relay(req)
        self.send_error(404)


if __name__ == "__main__":
    print(f"Tasa BCV del Dia en http://127.0.0.1:{PORT}", flush=True)
    http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
