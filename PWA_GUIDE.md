# Guía para Convertir LinguaRead en PWA (Progressive Web App)

## ¿Qué es una PWA?

Una Progressive Web App es una aplicación web que puede instalarse en dispositivos Android (y otros) y funcionar sin conexión, ofreciendo una experiencia similar a una aplicación nativa.

## Estado Actual

El proyecto ya está configurado como PWA. El archivo `vite.config.js` incluye el plugin `vite-plugin-pwa` con la configuración necesaria.

## Cómo Instalar en Android

### Opción 1: A través del Navegador Chrome

1. **Despliega la aplicación:**
   ```bash
   docker-compose up --build
   ```

2. **Accede desde Android:**
   - Asegúrate de que tu Android esté en la misma red WiFi
   - Abre Chrome en el Android y accede a `http://TU_IP:3000`

3. **Instala la app:**
   - Verás un banner de instalación en la parte inferior que dice "Añadir a pantalla de inicio"
   - O bien, toca el menú (tres puntos) > "Añadir a pantalla de inicio"

### Opción 2: Generar APK con PWA

Para distribuir la app sin un servidor:

1. **Usando PWABuilder:**
   - Despliega la app (o sirve los archivos estáticos)
   - Ve a https://www.pwabuilder.com/
   - Ingresa la URL de tu PWA
   - Descarga el paquete para Android

2. **Usando Trusted Web Activity (TWA):**
   - Genera el APK con PWABuilder
   - Firma el APK con keytool
   - Instala en tu dispositivo

## Archivos PWA Generados

El proyecto ya incluye:

- **`manifest.json`** - Definido en `vite.config.js` con:
  - Nombre: LinguaRead
  - Íconos: 192x192 y 512x512
  - Theme color: #3B82F6
  - Modo de pantalla: standalone

- **Service Worker** - Configurado con Workbox para:
  - Cacheo de assets estáticos
  - Cacheo de respuestas API (NetworkFirst)
  - Funcionamiento offline

## Personalización de Íconos

Para que la PWA se vea profesional, reemplaza los siguientes archivos en `frontend/public/`:

```
frontend/public/
├── favicon.svg
├── pwa-192x192.png   (192x192 px)
├── pwa-512x512.png   (512x512 px)
└── apple-touch-icon.png (180x180 px)
```

## Configuración Adicional (Opcional)

### Habilitar Notificaciones Push

1. Instala `web-push`:
   ```bash
   npm install web-push
   ```

2. Genera claves VAPID:
   ```bash
   npx web-push generate-vapid-keys
   ```

3. Configura en el backend y frontend

### Optimizar para Tienda Play (Opcional)

Para publicar en Google Play Store:

1. Usa **PWABuilder** para generar el APK
2. Crea una cuenta de Google Play Developer ($25 una vez)
3. Sube el APK firmado
4. Completa la información de la tienda

## Troubleshooting

### "No se puede instalar" en Chrome Android
- Verifica que el sitio use HTTPS (o localhost)
- Asegúrate de que el manifest sea válido
- Verifica que haya un service worker registrado

### La app no funciona offline
- Verifica que el service worker esté instalado
- Revisa la consola del navegador para errores

### Íconos no aparecen
- Verifica que los archivos existan en `/public`
- Asegúrate de que los tamaños sean correctos
