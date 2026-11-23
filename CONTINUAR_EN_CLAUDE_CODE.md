# Continuar en Claude Code — traspaso del 2026-11-23

## Cómo abrirlo

1. Descomprime `respaldo\bcv-intervencion-con-git.zip` en `Descargas\` (crea `Descargas\bcv-intervencion-git\` o
   reemplaza esta carpeta). Esa versión trae `.git` y `.github`, que son necesarios para subir cambios.
2. Abre Claude Code y elige como carpeta del proyecto la que descomprimiste.
3. Pega el mensaje de abajo.

## Mensaje para pegar en Claude Code

```
Retomo el proyecto BCV Intervención (repo github.com/trylehack/bcv-intervencion, rama main).
Lee primero LEEME_PROYECTO.md y CONTINUAR_EN_CLAUDE_CODE.md.

Ya está hecho en esta copia local, sin subir todavía:
- .github/workflows/publicar.yml actualizado a Node 24 (GitHub eliminó Node 20):
  checkout@v6, setup-node@v6 con node-version 24, configure-pages@v6,
  upload-pages-artifact@v5, deploy-pages@v5 (en ambos pasos, el normal y el reintento).
- LEEME_PROYECTO.md (guía para continuar el proyecto) y este archivo.

Tareas:
1. Revisa el diff con git status / git diff.
2. Haz commit de esos cambios en main y push a GitHub.
3. Verifica en GitHub Actions que la siguiente ejecución de "Actualizar tasas y publicar" termine bien
   y sin el aviso de Node.js 20.
4. Actualiza LEEME_PROYECTO.md (estado y historial) y vuelve a subirlo.
Regla permanente: con cada cambio, renueva LEEME_PROYECTO.md y el respaldo en respaldo/.
```

## Resumen de lo trabajado en el chat (2026-11-23)

- El historial original de la app se hizo en Claude Code con **otra cuenta de Claude**, en este mismo PC; con la
  cuenta actual no se ve. El código no depende de ese historial: todo está en GitHub.
- Se revisaron las ejecuciones de GitHub Actions: la #63 falló por un error temporal de GitHub Pages; ya se había
  agregado un reintento (commit bd6e656) y desde entonces todas (#64–#78) salieron bien.
- Revisión de seguridad del repo público: sin contraseñas, tokens, claves de firma ni datos privados
  (el certificado de `certs/` es público y los IDs de AdMob son los de prueba de Google).
- Se preparó la migración a Node 24 (pendiente de push).
- Se creó esta copia local con guía y respaldo.
