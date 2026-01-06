(function() {
  'use strict';
  
  console.log('YouTube Reloader cargado');
  
  let reloadCount = 0;
  let MAX_RELOADS = 5;
  let isEnabled = true;
  
  // Cargar configuración
  chrome.storage.sync.get(['enabled', 'maxReloads'], function(result) {
    isEnabled = result.enabled !== false;
    if (result.maxReloads) {
      MAX_RELOADS = result.maxReloads;
    }
  });
  
  // Escuchar cambios de configuración
  chrome.storage.onChanged.addListener(function(changes) {
    if (changes.enabled) {
      isEnabled = changes.enabled.newValue;
      console.log('Extensión ' + (isEnabled ? 'activada' : 'desactivada'));
    }
    if (changes.maxReloads) {
      MAX_RELOADS = changes.maxReloads.newValue;
    }
  });
  
  function checkForEvent() {
    // Método 1: Contenedor de eventos
    const eventContainer = document.querySelector('.video-ads.ytp-ad-module');
    const eventPlaying = eventContainer && eventContainer.children.length > 0;
    
    // Método 2: Indicador de evento
    const eventBadge = document.querySelector('.ytp-ad-text');
    
    // Método 3: Botón de saltar
    const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-skip-ad-button');
    
    // Método 4: Clase del reproductor
    const player = document.querySelector('.html5-video-player');
    const hasEventClass = player && (
      player.classList.contains('ad-showing') ||
      player.classList.contains('ad-interrupting')
    );
    
    // Método 5: Overlay de evento
    const eventOverlay = document.querySelector('.ytp-ad-player-overlay');
    
    return eventPlaying || eventBadge || skipButton || hasEventClass || eventOverlay;
  }
  
  function handleEventDetection() {
    if (!isEnabled) return;
    
    if (checkForEvent()) {
      console.log('🚫 Evento detectado');
      
      // Notificar al background script
      chrome.runtime.sendMessage({
        action: 'EventDetected',
        url: window.location.href
      }, function(response) {
        if (response && response.success) {
          console.log('Recargas totales:', response.reloadCount);
        }
      });
      
      if (reloadCount < MAX_RELOADS) {
        reloadCount++;
        
        // Guardar tiempo del video
        const video = document.querySelector('video');
        if (video && video.currentTime > 0) {
          sessionStorage.setItem('yt_video_time', video.currentTime.toString());
          sessionStorage.setItem('yt_reload_count', reloadCount.toString());
        }
        
        // Recargar
        setTimeout(() => location.reload(), 100);
      } else {
        console.warn('⚠️ Límite de recargas alcanzado');
        // Resetear después de 30 segundos
        setTimeout(() => { reloadCount = 0; }, 30000);
      }
    }
  }
  
  // Restaurar tiempo del video
  window.addEventListener('load', function() {
    const savedTime = sessionStorage.getItem('yt_video_time');
    const savedCount = sessionStorage.getItem('yt_reload_count');
    
    if (savedCount) {
      reloadCount = parseInt(savedCount);
    }
    
    if (savedTime) {
      const waitForVideo = setInterval(() => {
        const video = document.querySelector('video');
        if (video && video.readyState >= 2) {
          clearInterval(waitForVideo);
          video.currentTime = parseFloat(savedTime);
          console.log('⏰ Tiempo restaurado:', savedTime);
          
          // Limpiar después de restaurar
          setTimeout(() => {
            sessionStorage.removeItem('yt_video_time');
          }, 1000);
        }
      }, 100);
      
      // Timeout de seguridad
      setTimeout(() => clearInterval(waitForVideo), 5000);
    }
  });
  
  // Iniciar observación
  function initObserver() {
    const player = document.querySelector('.html5-video-player');
    if (!player) {
      setTimeout(initObserver, 500);
      return;
    }
    
    console.log('✅ Reproductor encontrado, iniciando observación');
    
    // Observer para cambios en el DOM
    const observer = new MutationObserver(handleEventDetection);
    observer.observe(player, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Verificación inicial
    handleEventDetection();
    
    // Verificación periódica
    setInterval(handleEventDetection, 2000);
  }
  
  // Esperar a que la página cargue
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }
  
})();