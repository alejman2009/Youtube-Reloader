(function () {
    'use strict';

    console.log('YouTube Reloader cargado');

    let reloadCount = 0;
    let MAX_RELOADS = 5;
    let isEnabled = true;
    let lastKnownTime = 0;
    let videoCheckInterval = null;

    // Cargar configuración
    chrome.storage.sync.get(['enabled', 'maxReloads'], function (result) {
        isEnabled = result.enabled !== false;
        if (result.maxReloads) {
            MAX_RELOADS = result.maxReloads;
        }
    });

    // Escuchar cambios de configuración
    chrome.storage.onChanged.addListener(function (changes) {
        if (changes.enabled) {
            isEnabled = changes.enabled.newValue;
            console.log('Extensión ' + (isEnabled ? 'activada' : 'desactivada'));
        }
        if (changes.maxReloads) {
            MAX_RELOADS = changes.maxReloads.newValue;
        }
    });

    // Guardar continuamente el tiempo del video
    function trackVideoTime() {
        const video = document.querySelector('video');
        if (video && !isNaN(video.currentTime) && video.currentTime > 0) {
            lastKnownTime = video.currentTime;
            sessionStorage.setItem('yt_last_time', lastKnownTime.toString());
        }
    }

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

    // Verificar si estamos en una página de video válida
    function isValidVideoPage() {
        const url = window.location.href;

        // No ejecutar en shorts
        if (url.includes('/shorts/')) {
            console.log('📱 Shorts detectados - Plugin desactivado');
            return false;
        }

        // No ejecutar en búsqueda
        if (url.includes('/results?')) {
            console.log('🔍 Página de búsqueda - Plugin desactivado');
            return false;
        }

        // No ejecutar en home/feed
        if (url === 'https://www.youtube.com/' || url === 'https://www.youtube.com') {
            console.log('🏠 Página principal - Plugin desactivado');
            return false;
        }

        // Solo ejecutar en páginas de watch
        if (!url.includes('/watch?')) {
            console.log('📄 No es página de video - Plugin desactivado');
            return false;
        }

        return true;
    }

    function handleEventDetection() {
        if (!isEnabled) return;

        // Verificar que estamos en una página válida
        if (!isValidVideoPage()) return;

        if (checkForEvent()) {
            console.log('🚫 Evento detectado en tiempo:', lastKnownTime);

            // Guardar el tiempo actual JUSTO ANTES de recargar
            const video = document.querySelector('video');
            if (video && video.currentTime > 0) {
                lastKnownTime = video.currentTime;
            }

            // Notificar al background script (con verificación de chrome.runtime)
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({
                    action: 'EventDetected',
                    url: window.location.href,
                    timestamp: lastKnownTime
                }, function (response) {
                    if (chrome.runtime.lastError) {
                        console.log('Error comunicando con background:', chrome.runtime.lastError);
                    } else if (response && response.success) {
                        console.log('Recargas totales:', response.reloadCount);
                    }
                });
            }

            if (reloadCount < MAX_RELOADS) {
                reloadCount++;

                // Guardar información detallada
                sessionStorage.setItem('yt_video_time', lastKnownTime.toString());
                sessionStorage.setItem('yt_reload_count', reloadCount.toString());

                console.log('💾 Guardando tiempo:', lastKnownTime, 'segundos');

                // Recargar
                setTimeout(() => location.reload(), 150);
            } else {
                console.warn('⚠️ Límite de recargas alcanzado');
                // Resetear después de 30 segundos
                setTimeout(() => { reloadCount = 0; }, 10000);
            }
        }
    }

    // Restaurar tiempo del video
    window.addEventListener('load', function () {
        const savedTime = sessionStorage.getItem('yt_video_time');
        const savedCount = sessionStorage.getItem('yt_reload_count');

        if (savedCount) {
            reloadCount = parseInt(savedCount);
        }

        if (savedTime) {
            const timeToRestore = parseFloat(savedTime);
            console.log('⏰ Intentando restaurar tiempo:', timeToRestore, 'segundos');

            let attemptCount = 0;
            const maxAttempts = 50;

            const waitForVideo = setInterval(() => {
                attemptCount++;
                const video = document.querySelector('video');

                if (video && video.readyState >= 2) {
                    const timeDifference = Math.abs(video.currentTime - timeToRestore);

                    if (timeDifference > 1) {
                        video.currentTime = timeToRestore;
                        console.log('✅ Tiempo restaurado a:', timeToRestore, 'segundos');

                        // Ajuste fino
                        setTimeout(() => {
                            if (video && Math.abs(video.currentTime - timeToRestore) > 0.5) {
                                video.currentTime = timeToRestore;
                                console.log('🔧 Ajuste fino del tiempo');
                            }
                        }, 500);

                        clearInterval(waitForVideo);

                        setTimeout(() => {
                            sessionStorage.removeItem('yt_video_time');
                        }, 2000);
                    } else {
                        console.log('✓ El video ya está en el tiempo correcto');
                        clearInterval(waitForVideo);
                        sessionStorage.removeItem('yt_video_time');
                    }
                }

                if (attemptCount >= maxAttempts) {
                    console.warn('⚠️ Timeout restaurando tiempo del video');
                    clearInterval(waitForVideo);
                    sessionStorage.removeItem('yt_video_time');
                }
            }, 100);
        }
    });

    // Iniciar observación
    function initObserver() {
        // Verificar que estamos en una página válida antes de iniciar
        if (!isValidVideoPage()) {
            console.log('⏸️ Plugin en pausa - No es una página de video');
            return;
        }

        const player = document.querySelector('.html5-video-player');
        if (!player) {
            setTimeout(initObserver, 500);
            return;
        }

        console.log('✅ Reproductor encontrado, iniciando observación');

        // Iniciar tracking continuo del tiempo
        videoCheckInterval = setInterval(trackVideoTime, 2000);

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

    // Reiniciar observador cuando cambia la URL (navegación SPA de YouTube)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            console.log('🔄 URL cambió, reevaluando página...');

            // Limpiar interval anterior si existe
            if (videoCheckInterval) {
                clearInterval(videoCheckInterval);
                videoCheckInterval = null;
            }

            // Reiniciar observador
            setTimeout(initObserver, 1000);
        }
    }).observe(document.querySelector('title'), {
        subtree: true,
        characterData: true,
        childList: true
    });

    // Limpiar interval cuando se cierra la página
    window.addEventListener('beforeunload', function () {
        if (videoCheckInterval) {
            clearInterval(videoCheckInterval);
        }
    });

})();