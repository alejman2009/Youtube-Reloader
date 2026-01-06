// Service Worker para Manifest V3
console.log('Background script iniciado');

// Estado global
let extensionEnabled = true;
let reloadStats = {};

// Inicializar configuración al instalar
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extensión instalada');
  
  chrome.storage.sync.set({
    enabled: true,
    maxReloads: 5,
    reloadDelay: 100
  });
});

// Escuchar mensajes desde content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  if (request.action === 'EventDetected') {
    console.log('🚫 Evento detectado en tab:', sender.tab.id);
    
    // Registrar estadísticas
    const tabId = sender.tab.id;
    if (!reloadStats[tabId]) {
      reloadStats[tabId] = { count: 0, lastReload: Date.now() };
    }
    reloadStats[tabId].count++;
    reloadStats[tabId].lastReload = Date.now();
    
    // Enviar respuesta
    sendResponse({ 
      success: true, 
      reloadCount: reloadStats[tabId].count 
    });
  }
  
  if (request.action === 'getStats') {
    const tabId = sender.tab.id;
    sendResponse(reloadStats[tabId] || { count: 0 });
  }
  
  if (request.action === 'resetStats') {
    const tabId = sender.tab.id;
    delete reloadStats[tabId];
    sendResponse({ success: true });
  }
  
  return true; // Mantener el canal abierto para respuesta asíncrona
});

// Limpiar estadísticas cuando se cierra una pestaña
chrome.tabs.onRemoved.addListener((tabId) => {
  delete reloadStats[tabId];
});

// Escuchar cambios en storage
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.enabled) {
    extensionEnabled = changes.enabled.newValue;
    console.log('Extensión ' + (extensionEnabled ? 'activada' : 'desactivada'));
  }
});

// Opcional: Bloquear peticiones de anuncios (experimental)
// Descomenta si quieres probar este enfoque alternativo
/*
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    // Lista de dominios de anuncios conocidos
    const adDomains = [
      'doubleclick.net',
      'googleadservices.com',
      'googlesyndication.com'
    ];
    
    const url = new URL(details.url);
    if (adDomains.some(domain => url.hostname.includes(domain))) {
      console.log('Bloqueando anuncio:', url.hostname);
      return { cancel: true };
    }
  },
  {
    urls: ["*://*.youtube.com/*"],
    types: ["xmlhttprequest", "script", "image"]
  },
  ["blocking"]
);
*/