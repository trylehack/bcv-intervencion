# Publicar BCV Intervención en Google Play

## Lo que ya está listo

- `BCV-Intervencion.aab`: el archivo que se sube a Play Console (firmado con tu clave de subida).
- `BCV-Intervencion.apk`: la misma app para instalar directo en tu teléfono y probar.
- Apunta a Android 16 (API 36), como exige Google Play.
- Anuncios de AdMob: banner abajo y una pantalla completa como máximo cada 5 minutos (solo al tocar ⟳),
  con el formulario de consentimiento de Google. **Ahora usa los anuncios de PRUEBA de Google: no pagan.**
- Aviso de app no oficial y política de privacidad:
  https://trylehack.github.io/bcv-intervencion/privacidad.html
- Clave de firma: en `Documentos\BCV-Intervencion-firma\` (OneDrive). **Guarda una copia aparte. Sin ella no
  podrás publicar actualizaciones.**

## 1. AdMob (para cobrar)

1. Entra a https://admob.google.com con tu cuenta de Google y créala.
2. **Apps → Agregar app → Android →** «¿Está publicada en una tienda?» → **No** (la enlazas después).
   Nombre: BCV Intervención.
3. Copia el **ID de la app** (`ca-app-pub-…~…`).
4. Crea dos **bloques de anuncios**: uno **Banner** y uno **Intersticial**. Copia sus IDs (`ca-app-pub-…/…`).
5. Pásale los 3 IDs a Claude. Hay que ponerlos en:
   - `android-res/values/admob.xml` → ID de la app.
   - `www/index.html` → `ADS.banner`, `ADS.interstitial` y `ADS.PRUEBA: false`.
   y volver a compilar.
6. En AdMob → **Pagos**, revisa los métodos de pago disponibles para Venezuela.
7. **No toques tus propios anuncios reales**: Google puede suspender la cuenta.

## 2. Google Play Console

1. https://play.google.com/console → crea la cuenta de desarrollador (**US$25**, una vez) y verifica tu identidad.
2. **Crear app**: nombre, idioma español, «App», «Gratis».
3. **Configuración de la app** (panel principal) — respuestas sugeridas:
   - Política de privacidad: `https://trylehack.github.io/bcv-intervencion/privacidad.html`
   - Acceso a la app: todas las funciones disponibles sin acceso especial.
   - Anuncios: **Sí, contiene anuncios**.
   - Clasificación de contenido: cuestionario → categoría «Utilidad / Referencia», sin violencia, etc.
   - Público objetivo: **18+** (o 13+). No dirigida a niños.
   - Seguridad de los datos: la app **no recoge datos propios**; el SDK de AdMob recoge
     *Identificadores del dispositivo* y *Datos de diagnóstico / interacción* para **publicidad** y
     **prevención de fraude**, cifrados en tránsito. Marca que **no** se pueden solicitar borrados por la app.
   - Funciones financieras: **la app no ofrece servicios financieros** (solo muestra información).
   - App gubernamental: **No**. En la descripción aclara que no está afiliada al BCV.
4. **Ficha de Play Store**: descripción corta y larga, ícono 512×512 (`www/icons/icon-512.png`),
   gráfico de funciones 1024×500 y al menos 2 capturas de pantalla del teléfono.
5. **Prueba cerrada** (obligatoria para cuentas personales nuevas):
   Pruebas → Prueba cerrada → crea una versión → sube `BCV-Intervencion.aab`.
   Agrega **al menos 12 probadores** (sus correos de Gmail) y que **la tengan instalada 14 días seguidos**.
6. Después de los 14 días: **Solicitar acceso a producción** y publica.

## Riesgos de rechazo a tener en cuenta

- **Suplantación**: el nombre y el ícono dicen «BCV». Si Google lo rechaza por parecer oficial, cambiar el nombre
  (p. ej. «Tasa Intervención VE») y quitar «BCV» del ícono. El aviso de «no afiliada» ya está en la app.
- La tasa de Binance se lee de su web pública (no de una API oficial); si Binance la cambia, esa tasa dejaría de
  actualizarse hasta ajustar la app.

## Para cada actualización

1. Sube `versionCode` en `version.json` (3, 4, 5…) y `versionName`.
2. `powershell -File scripts\aplicar-android.ps1` → `npx cap sync android` → `android\gradlew bundleRelease`.
3. Sube el nuevo `.aab` en Play Console.
