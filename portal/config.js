(function () {
  const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
  window.WEMACOOP_PORTAL = {
    apiBase: localStorage.getItem('wemacoop_api_base') || (isLocal ? 'https://localhost:7080/api' : '/api'),
    demoMode: new URLSearchParams(location.search).get('demo') === '1'
  };
})();
