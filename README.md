# 🔄 YouTube Reloader

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen.svg)](https://www.google.com/chrome/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0-blue.svg)](https://github.com/usuario/youtube-reloader)

Una extensión de Chrome que detecta eventos no deseados en YouTube y recarga automáticamente la página hasta encontrar contenido limpio.

## 📋 Características

- ✅ **Detección automática** de eventos no deseados en YouTube
- 🔄 **Recarga inteligente** de la página cuando se detectan eventos
- ⏰ **Preservación del tiempo** del video después de recargar
- 🛡️ **Límite de seguridad** para evitar recargas infinitas (máximo 5 intentos)
- 🎛️ **Control ON/OFF** desde el popup de la extensión
- 📊 **Estadísticas** de recargas por pestaña
- 💾 **Almacenamiento persistente** de configuración

## 🚀 Instalación

### Opción 1: Instalación manual (Modo desarrollador)

1. **Descarga** este repositorio:
   ```bash
   git clone https://github.com/usuario/youtube-reloader.git
   ```

2. **Abre Chrome** y navega a:
   ```
   chrome://extensions/
   ```

3. **Activa** el "Modo de desarrollador" en la esquina superior derecha

4. **Haz clic** en "Cargar extensión sin empaquetar"

5. **Selecciona** la carpeta del proyecto descargado

6. ¡Listo! La extensión está instalada 🎉

### Opción 2: Instalación desde Chrome Web Store

*Próximamente...*

## 📂 Estructura del proyecto

```
youtube-reloader/
├── manifest.json          # Configuración de la extensión
├── content.js            # Script principal de detección
├── background.js         # Service worker para gestión global
├── popup.html           # Interfaz del popup
├── popup.js            # Lógica del popup
├── misc/
│   ├── youTubeReloader16.png    # Icono 16x16
│   ├── youTubeReloader48.png    # Icono 48x48
│   └── youTubeReloader128.png   # Icono 128x128
└── README.md
```

## 🛠️ Desarrollo

### Requisitos previos

- Google Chrome (versión 88 o superior)
- Visual Studio, VS Code o cualquier editor de texto

### Configuración del entorno de desarrollo

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/usuario/youtube-reloader.git
   cd youtube-reloader
   ```

2. **Abre el proyecto** en tu editor favorito

3. **Realiza cambios** en los archivos según necesites

4. **Recarga la extensión** en `chrome://extensions/` haciendo clic en el icono de recarga

### Archivos principales

#### `manifest.json`
Define la configuración básica de la extensión, permisos y recursos.

#### `content.js`
Script que se ejecuta en cada página de YouTube. Contiene la lógica de:
- Detección de eventos
- Gestión de recargas
- Preservación del tiempo del video
- Comunicación con el background script

#### `background.js`
Service Worker que maneja:
- Estado global de la extensión
- Estadísticas de recargas por pestaña
- Comunicación entre tabs y popup

#### `popup.html` y `popup.js`
Interfaz de usuario para activar/desactivar la extensión.

## 🎯 Uso

1. **Navega a YouTube** y reproduce cualquier video

2. La extensión **detectará automáticamente** eventos no deseados

3. Si se detecta un evento, la página se **recargará automáticamente**

4. El proceso se repite hasta encontrar un video sin eventos (máximo 5 intentos)

5. Puedes **activar/desactivar** la extensión haciendo clic en su icono

## ⚙️ Configuración

### Desde el código

Puedes modificar estos valores en `background.js`:

```javascript
chrome.storage.sync.set({
  enabled: true,        // Activar/desactivar extensión
  maxReloads: 5,       // Número máximo de recargas
  reloadDelay: 100     // Delay antes de recargar (ms)
});
```

### Desde la interfaz

- Click en el icono de la extensión
- Activa/desactiva el interruptor
- Los cambios se aplican inmediatamente

## 🐛 Solución de problemas

### La extensión no detecta eventos

- Verifica que está activada en el popup
- Abre la consola del navegador (F12) y busca mensajes de la extensión
- Asegúrate de estar en una página de YouTube

### La página se recarga infinitamente

- La extensión tiene un límite de 5 recargas
- Si alcanza el límite, espera 30 segundos para que se resetee
- Puedes desactivar temporalmente la extensión desde el popup

### El tiempo del video no se restaura

- Esto puede ocurrir en videos muy cortos
- La extensión solo guarda el tiempo si el video ha avanzado más de 0 segundos

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si deseas mejorar esta extensión:

1. **Fork** el proyecto
2. Crea una **rama** para tu función (`git checkout -b feature/nueva-funcion`)
3. **Commit** tus cambios (`git commit -m 'Añadir nueva función'`)
4. **Push** a la rama (`git push origin feature/nueva-funcion`)
5. Abre un **Pull Request**

### Guía de estilo

- Usa nombres descriptivos para variables y funciones
- Comenta código complejo
- Mantén las funciones pequeñas y enfocadas
- Sigue las convenciones de JavaScript ES6+

## 📝 Changelog

### [1.0.0] - 2025-01-06

#### Añadido
- Detección automática de eventos en YouTube
- Sistema de recarga inteligente con límite de seguridad
- Preservación del tiempo del video
- Popup de control ON/OFF
- Estadísticas de recargas por pestaña
- Almacenamiento persistente de configuración

## ⚠️ Advertencias

- Esta extensión recarga páginas automáticamente, lo cual puede:
  - Consumir más ancho de banda
  - Afectar el historial de reproducción
  - Ser detectado por YouTube
- Úsala bajo tu propia responsabilidad
- Considera alternativas como bloqueadores de contenido nativos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👤 Autor

**Tu Nombre**

- GitHub: [@usuario](https://github.com/usuario)
- Email: tu.email@ejemplo.com

## 🙏 Agradecimientos

- Inspirado en la necesidad de una mejor experiencia en YouTube
- Gracias a la comunidad de desarrolladores de extensiones de Chrome
- Chrome DevTools por facilitar el debugging

## 📧 Soporte

Si tienes problemas o preguntas:

1. Revisa la sección de [Issues](https://github.com/usuario/youtube-reloader/issues)
2. Abre un nuevo Issue si tu problema no está listado
3. Proporciona información detallada:
   - Versión de Chrome
   - Pasos para reproducir el problema
   - Capturas de pantalla si es posible

---

**Nota**: Esta extensión está en desarrollo activo. Las funcionalidades pueden cambiar en futuras versiones.

⭐ Si te resulta útil, ¡deja una estrella en GitHub!
