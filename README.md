# BCV Intervención

Tasa oficial del BCV (dólar y euro), tasa de intervención (BCV + 0,5 %), precio de USDT en Binance P2P
(sección Vender, promedio de los anuncios 3.º al 12.º), calculadora y ganancia de intervención.

## Estructura

- `www/` — la app (una sola página, íconos, manifiesto y modo sin conexión).
- `api/bcv.js`, `api/binance.js` — funciones de Vercel que leen bcv.org.ve y Binance P2P por la app web,
  porque el navegador no puede leerlos directamente. `api/_comun.js` incluye el certificado intermedio
  que el sitio del BCV no envía.
- `dev_server.py` — servidor para probar en el PC (`python dev_server.py` → http://127.0.0.1:8770).
- `capacitor.config.json` — configuración para compilar el `.apk` de Android con Capacitor
  (en el `.apk` la app lee el BCV y Binance directamente, sin `/api`).
- `icon/icon.html` — fuente del ícono (órbita tricolor con BCV en tornasol).

## Publicación

Vercel publica automáticamente cada cambio que se sube a la rama `main`.
En el iPhone: abrir el enlace en Safari → Compartir → Agregar a pantalla de inicio.
