# BCV Intervención — guía para continuar el proyecto

> Última actualización de esta guía: **2026-11-24**
> Este archivo se renueva con cada cambio. Si eres otra IA (o una persona) retomando el trabajo,
> lee esto completo antes de tocar nada.

## 1. Qué es

App de una sola página para Venezuela que muestra:

- **Tasa oficial BCV** del dólar y del euro (leída de https://www.bcv.org.ve/).
- **Tasa de intervención** = tasa BCV + 0,5 %.
- **USDT en Binance P2P**: sección *Vender*, promedio de los anuncios 3.º al 12.º (se saltan los dos primeros).
- **Calculadoras**: conversión $/€/Bs y ganancia de intervención.
- **Tasa anterior** (botón de calendario en el encabezado): el BCV publica por la tarde la tasa del siguiente
  día hábil (el viernes sale la del lunes); el botón permite calcular con la tasa vigente hoy o la anterior.
  Por defecto siempre se muestra la más nueva (la elección no se guarda).
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
| Copia local (con Git) | esta carpeta (`Descargas\bcv-intervencion-git`), abierta en Claude Code |
| Respaldo completo con historial Git | `respaldo\bcv-intervencion-con-git.zip` (incluye `.git` y `.github`; `respaldo/` no se sube a GitHub) |
| Clave de firma de Android | `Documentos\BCV-Intervencion-firma\` (OneDrive). **NUNCA** subirla a GitHub. |

Para subir cambios desde esta carpeta: `git add …`, `git commit`, `git push origin main`
(el CLI `gh` está conectado a la cuenta trylehack).

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
version.json          versionName / versionCode de Android (hoy 1.3.0 / 4)
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
5. Tasa anterior: cuando cambia la fecha valor, el script copia la tasa que estaba publicada a `bcv_anterior`
   en `tasas.json` (y la conserva mientras la fecha no cambie). La app guarda en el teléfono las últimas 8 tasas
   que ha visto (`localStorage` `tasaBCV.historial`) y además lee `bcv_anterior` del `tasas.json` publicado,
   también en el `.apk`. El botón lleva a la tasa vigente hoy si la más nueva es de un día futuro; si no, a la
   fecha anterior. Solo aparece cuando hay al menos dos fechas.

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

- ✅ Publicación de tasas funcionando (ejecuciones #64 a #107 correctas al 2026-11-24).
- ✅ Botón de tasa anterior publicado en la web (commit 3f4a2da, ejecución #107). `bcv_anterior` sale `null`
  hasta el próximo cambio de fecha valor del BCV; desde ahí se llena solo.
- ⏳ Android 1.3.0 (versionCode 4) con el botón: falta compilar y subir el `.aab` a Play Store.
- ✅ Revisión de seguridad 2026-11-23: no hay claves ni datos privados en el repo ni en su historial.
- ✅ Flujo migrado a Node 24 (commit 7c2c3b2): `checkout@v6`, `setup-node@v6` con `node-version: 24`,
  `configure-pages@v6`, `upload-pages-artifact@v5`, `deploy-pages@v5`. La ejecución #79 terminó bien y sin
  el aviso de Node.js 20. Solo queda un `DeprecationWarning` de `punycode` interno de `deploy-pages` (inofensivo).
- ℹ️ Ya existe `actions/checkout@v7` y `actions/setup-node@v7`; no hace falta cambiar, v6 ya usa Node 24.
- ⏳ Play Store: pasos de AdMob real, suscripción y prueba cerrada en `PLAY-STORE.md`.

## 8. Historial de cambios

- 2026-11-24 — Botón para ver la tasa BCV anterior; `bcv_anterior` en `tasas.json`; versión 1.3.0 (4);
  caché del service worker v3 (commit 3f4a2da).
- 2026-11-23 — Push de la migración a Node 24 (7c2c3b2), verificada en la ejecución #79. Proyecto abierto en
  Claude Code desde `Descargas\bcv-intervencion-git`; `respaldo/` agregado a `.gitignore`.
- 2026-11-23 — Traspaso a Claude Code: ver CONTINUAR_EN_CLAUDE_CODE.md.
- 2026-11-23 — Guía y respaldo creados. Revisión de seguridad. Preparada la migración del flujo a Node 24.
- (anterior) — Reintento en la publicación de GitHub Pages (commit bd6e656).
- (anterior) — Tarjeta Pro siempre visible en Android; suscripción Pro 1.2.0; versión Play Store con AdMob;
  publicación en GitHub Pages cada 15 min; versión inicial.
