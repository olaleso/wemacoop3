const PortalApi = (() => {
  const cfg = window.WEMACOOP_PORTAL;
  let csrfToken = '';
  async function request(path, options = {}) {
    const unsafe = !['GET','HEAD','OPTIONS'].includes((options.method || 'GET').toUpperCase());
    if (unsafe && !csrfToken) await csrf();
    const headers = new Headers(options.headers || {});
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    if (options.body && !isFormData && !headers.has('Content-Type')) headers.set('Content-Type','application/json');
    if (unsafe && csrfToken) headers.set('X-CSRF-TOKEN', csrfToken);
    const response = await fetch(`${cfg.apiBase}${path}`, { ...options, headers, credentials:'include' });
    const type = response.headers.get('content-type') || '';
    const body = type.includes('application/json') ? await response.json() : null;
    if (!response.ok) {
      const error = new Error(body?.message || body?.title || `Request failed (${response.status})`);
      error.status = response.status; error.details = body; throw error;
    }
    return body;
  }
  async function csrf(){
    const r = await fetch(`${cfg.apiBase}/auth/csrf`, {credentials:'include'});
    if(!r.ok) throw new Error('Could not initialize secure session.');
    const body = await r.json(); csrfToken = body.token; return body;
  }
  return {
    request, csrf,
    login: body => request('/auth/login',{method:'POST',body:JSON.stringify(body)}),
    logout: () => request('/auth/logout',{method:'POST'}),
    me: () => request('/auth/me'),
    activationRequest: body => request('/auth/activation/request',{method:'POST',body:JSON.stringify(body)}),
    activationComplete: body => request('/auth/activation/complete',{method:'POST',body:JSON.stringify(body)}),
    forgot: body => request('/auth/password/forgot',{method:'POST',body:JSON.stringify(body)}),
    resetPassword: body => request('/auth/password/reset',{method:'POST',body:JSON.stringify(body)}),
    changePassword: body => request('/auth/password/change',{method:'POST',body:JSON.stringify(body)})
  };
})();
function showMessage(el, text, type='error') { el.textContent=text; el.className=`form-message show ${type}`; }
function setupPasswordToggles(){document.querySelectorAll('[data-password-toggle]').forEach(btn=>btn.addEventListener('click',()=>{const input=document.getElementById(btn.dataset.passwordToggle);const show=input.type==='password';input.type=show?'text':'password';btn.textContent=show?'Hide':'Show';}));}
