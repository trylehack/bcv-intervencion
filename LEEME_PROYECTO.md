# BCV Intervención — guía para continuar el proyecto

> Última actualización de esta guía: **2026-11-23**
> Este archivo se renueva con cada cambio. Si eres otra IA (o una persona) retomando el trabajo,
> lee esto completo antes de tocar nada.

## 1. Qué es

App de una sola página para Venezuela que muestra:

- **Tasa oficial BCV** del dólar y del euro (leída de https://www.bcv.org.ve/).
- **Tasa de intervención** = tasa BCV + 0,5 %.
- **USDT en Binance P2P**: sección *Vender*, promedio de los anuncios 3.º al 12.º (se saltan los dos primeros).
- **Calculadoras**: conversión $/€/Bs y ganancia de intervención.
- Tema claro/oscuro, funciona sin conexión (service worker).
- Versión Android (Capacitor) con anuncios AdMob y suscripción **Pro** (US$3/mes, sin anuncios, producto `pro_mensual`).

Dueño: cuenta de GitHub **trylehack**. La app la usa también su catálogo de productos (catalogo-lego) para
calcular precios en Bs.

## 2. Dónde vive

| Qué | Dónde |
|---|---|
| Código (fuente de verdad) | https://github.com/trylehack/bcv-intervencion (repo **público**, rama `main`) |
| App publicada | https://trylehack.github.io/bcv-intervencion/ (GitHub Pages) |
| Tasas en JSON | https://trylehack.github.io/bcv-intervencion/tasas.json |
| Política de privacidad | https://trylehack.github.io/bcv-intervencion/privacidad.html |
| Copia local | esta carpeta (`Descargas\bcv-intervencion`) |
| Respaldo completo con historial Git | `respaldo\bcv-intervencion-con-git.zip` (incluye `.git` y `.github`) |
| Clave de firma de Android | `Documentos\BCV-Intervencion-firma\` (OneDrive). **NUNCA** subirla a GitHub. |

Nota: Windows/la app de Claude no permite escribir la carpeta `.github` suelta aquí. El flujo de GitHub Actions
está en el zip de respaldo y en `respaldo\publicar.yml` (copia de lectura).

## 3. Estructura

```
www/                  la app (index.html, manifest, sw.js, privacidad.html, icons/, tasas.json)
api/bcv.js            función de Vercel: devuelve el HTML del BCV (el navegador no puede leerlo directo)
api/binance.js        función de Vercel: anuncios Vender USDT/VES de Binance P2P
api/_comun.js         función pedir() + certificado intermedio que el BCV no envía
certs/, android-res/raw/bcv_intermediate.pem   certificado público intermedio (Sectigo) del BCV
scripts/actualizar-tasas.js   lo ejecuta GitHub Actions: lee BCV y Binance y escribe www/tasas.json
scripts/aplicar-android.ps1   aplica ícono, nombre, AdMob, certificado, versión y firma al proyecto android/
.github/workflows/publicar.yml   cada 15 min: actualiza tasas y publica en GitHub Pages (con 1 reintento)
android-res/          recursos Android (ícono, splash, admob.xml, network_security_config)
capacitor.config.json appId com.tasabcv.app, nombre "BCV Intervención"
version.json          versionName / versionCode de Android (hoy 1.2.0 / 3)
PLAY-STORE.md         guía completa para publicar en Google Play, AdMob y la suscripción Pro
dev_server.py         servidor local: python dev_server.py -> http://127.0.0.1:8770
vercel.json           config de Vercel (publica www/ y las funciones api/)
```

## 4. Cómo funciona la actualización de tasas

1. GitHub Actions corre `publicar.yml` cada 15 minutos, con cada push a `main` y a mano.
2. `scripts/actualizar-tasas.js` lee BCV y Binance. Si una fuente falla, conserva el valor publicado antes.
   Nunca retrocede a una "fecha valor" del BCV anterior.
3. Se sube `www/` como paquete de Pages y se publica. Si la publicación falla, espera 20 s y reintenta una vez
   (se agregó por la falla #63, un error temporal del servicio de artefactos de GitHub).
4. La app web lee `tasas.json`; el `.apk` lee BCV y Binance directamente.

## 5. Probar en el PC

```
python dev_server.py
```
Abrir http://127.0.0.1:8770

Android: `npm install` → `npx cap add android` (si no existe `android/`) → `powershell -File scripts\aplicar-android.ps1`
→ `npx cap sync android` → `android\gradlew bundleRelease`. Detalles en `PLAY-STORE.md`.

## 6. Reglas importantes

- El repo es público: **nunca** subir contraseñas, `keystore.properties`, `.jks`, `.aab`, `.apk` ni `.env`
  (ya están en `.gitignore`).
- Los IDs de AdMob actuales son los **de prueba de Google** (no pagan). Para cobrar, reemplazarlos según `PLAY-STORE.md`.
- En cada actualización de Android subir `versionCode` en `version.json`.
- La app aclara que **no es oficial** ni está afiliada al BCV.

## 7. Estado actual y pendientes

- ✅ Publicación de tasas funcionando (ejecuciones #64 a #78 correctas al 2026-11-23).
- ✅ Revisión de seguridad 2026-11-23: no hay claves ni datos privados en el repo ni en su historial.
- ⏳ **Pendiente de subir a GitHub**: actualización del flujo a Node 24 (GitHub eliminó Node 20):
  `checkout@v6`, `setup-node@v6` con `node-version: 24`, `configure-pages@v6`,
  `upload-pages-artifact@v5`, `deploy-pages@v5`. Ya está aplicado en la copia del zip y en
  `respaldo\publicar.yml`; falta hacer push a `main` y verificar la siguiente ejecución.
- ⏳ Play Store: pasos de AdMob real, suscripción y prueba cerrada en `PLAY-STORE.md`.

## 8. Historial de cambios

- 2026-11-23 — Traspaso a Claude Code: ver CONTINUAR_EN_CLAUDE_CODE.md.
- 2026-11-23 — Guía y respaldo creados. Revisión de seguridad. Preparada la migración del flujo a Node 24.
- (anterior) — Reintento en la publicación de GitHub Pages (commit bd6e656).
- (anterior) — Tarjeta Pro siempre visible en Android; suscripción Pro 1.2.0; versión Play Store con AdMob;
  publicación en GitHub Pages cada 15 min; versión inicial.
