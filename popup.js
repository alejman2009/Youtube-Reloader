document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('toggle');
  const status = document.getElementById('status');
  
  // Cargar estado actual
  chrome.storage.sync.get(['enabled'], function(result) {
    const enabled = result.enabled !== false;
    toggle.checked = enabled;
    updateStatus(enabled);
  });
  
  // Escuchar cambios
  toggle.addEventListener('change', function() {
    const enabled = toggle.checked;
    chrome.storage.sync.set({ enabled: enabled }, function() {
      console.log('Estado guardado:', enabled);
      updateStatus(enabled);
    });
  });
  
  function updateStatus(enabled) {
    if (enabled) {
      status.textContent = '✅ Extensión activa';
      status.className = 'status active';
    } else {
      status.textContent = '⛔ Extensión desactivada';
      status.className = 'status inactive';
    }
  }
});