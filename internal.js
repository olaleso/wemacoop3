(() => {
  const $ = (s, scope=document) => scope.querySelector(s);
  const $$ = (s, scope=document) => [...scope.querySelectorAll(s)];
  const icons = {
    home:'M3 11.5 12 4l9 7.5M5 10v10h14V10',
    users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    layers:'m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5',
    wallet:'M3 6h15a3 3 0 0 1 3 3v10H5a2 2 0 0 1-2-2V6Zm0 0 11-3v3M16 12h5',
    piggy:'M19 5c-1.5-1-3-1.5-5-1.5-4.4 0-8 2.7-8 6.5 0 .5.1 1 .2 1.5L4 13v3h2.3c.7 1.1 1.6 2 2.7 2.7V21h3v-1.2c.6.1 1.3.2 2 .2s1.4-.1 2-.2V21h3v-2.3c1.8-1.2 3-3.2 3-5.7 0-1-.2-2-.6-2.8L23 8.5 21.5 7M15.5 9h.01',
    building:'M3 21h18M6 21V4h12v17M9 8h.01M13 8h.01M9 12h.01M13 12h.01M9 16h.01M13 16h.01',
    chart:'M4 19V9M10 19V5M16 19v-7M22 19H2',
    coin:'M12 6c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3Zm8-3v5c0 1.7-3.6 3-8 3S4 9.7 4 8V3m16 5v5c0 1.7-3.6 3-8 3s-8-1.3-8-3V8m16 5v5c0 1.7-3.6 3-8 3s-8-1.3-8-3v-5',
    house:'M3 11.5 12 4l9 7.5M5 10v10h14V10M9 20v-6h6v6',
    calculator:'M4 3h16v18H4zM8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01',
    check:'m5 12 4 4L19 6',
    pin:'M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Zm-8 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    arrow:'M5 12h14M13 6l6 6-6 6',
    filter:'M4 5h16M7 12h10M10 19h4',
    info:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 10v7M12 7h.01',
    close:'M18 6 6 18M6 6l12 12',
    headset:'M4 14v-2a8 8 0 0 1 16 0v2M4 14h2v5H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2ZM20 14h-2v5h2a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2ZM18 19c0 2-2 3-4 3h-2',
    file:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
    book:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 5.5v14',
    search:'m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    shield:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3-10 2 2 4-4',
    download:'M12 3v12M7 10l5 5 5-5M5 21h14',
    star:'m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3L5.8 21 7 14.2 2 9.3l6.9-1L12 2'
  };
  const icon = (name, cls='ui-icon') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[name] || icons.check}"></path></svg>`;
  window.WEMACOOP_ICON = icon;
  $$('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));

  const header=$('#siteHeader');
  const menu=$('#internalMobileMenu');
  const overlay=$('#internalOverlay');
  const open=$('#internalMenuOpen');
  const close=$('#internalMenuClose');
  function openMenu(){ if(!menu) return; menu.classList.add('open'); overlay?.classList.add('show'); document.body.classList.add('no-scroll'); menu.setAttribute('aria-hidden','false'); open?.setAttribute('aria-expanded','true'); }
  function closeMenu(){ if(!menu) return; menu.classList.remove('open'); overlay?.classList.remove('show'); document.body.classList.remove('no-scroll'); menu.setAttribute('aria-hidden','true'); open?.setAttribute('aria-expanded','false'); }
  open?.addEventListener('click',openMenu); close?.addEventListener('click',closeMenu); overlay?.addEventListener('click',closeMenu); $$('.drawer-nav a,.drawer-actions a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeMenu(); window.WEMACOOP_CLOSE_MODAL?.(); }});
  const toTop=$('#toTop');
  window.addEventListener('scroll',()=>{ header?.classList.toggle('scrolled',scrollY>32); toTop?.classList.toggle('show',scrollY>600); },{passive:true});
  toTop?.addEventListener('click',()=>scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
  $$('.reveal').forEach(el=>{
    if(!('IntersectionObserver' in window)){el.classList.add('visible');return;}
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.10});io.observe(el);
  });
  const year=$('#year'); if(year) year.textContent=new Date().getFullYear();
})();
