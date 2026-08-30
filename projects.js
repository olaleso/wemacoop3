(() => {
  const $=(s,scope=document)=>scope.querySelector(s), $$=(s,scope=document)=>[...scope.querySelectorAll(s)];
  const icon=window.WEMACOOP_ICON;
  const projects=window.WEMACOOP_PROJECTS || [];
  const filters=['All','Residential','Land','Completed'];
  let active='All';
  const filterRoot=$('#projectFilters'), grid=$('#projectDirectory'), count=$('#projectCount');
  function matches(p){ if(active==='All')return true; if(active==='Completed')return p.status==='Completed'; return p.type===active; }
  function renderFilters(){filterRoot.innerHTML=filters.map(x=>`<button class="filter-tab ${x===active?'active':''}" type="button" data-filter="${x}">${x}</button>`).join('');$$('.filter-tab',filterRoot).forEach(b=>b.addEventListener('click',()=>{active=b.dataset.filter;renderFilters();renderProjects();}));}
  function renderProjects(){const items=projects.filter(matches);count.textContent=`${items.length} project${items.length===1?'':'s'}`;grid.innerHTML=items.map(p=>`<article class="directory-card"><div class="directory-media"><img src="${p.image}" alt="${p.title}" loading="lazy"><span class="directory-status">${p.status}</span></div><div class="directory-body"><div class="directory-subtitle">${p.subtitle}</div><h3>${p.title}</h3><div class="directory-location">${icon('pin')}<span>${p.location}</span></div><p>${p.summary}</p><div class="directory-actions"><button type="button" data-project="${p.id}">View project →</button><a href="index.html#contact">Enquire</a></div></div></article>`).join('');$$('[data-project]',grid).forEach(b=>b.addEventListener('click',()=>openProject(b.dataset.project)));}
  renderFilters();renderProjects();

  const modal=$('#detailModal'),dialog=$('.detail-dialog',modal),content=$('#detailContent'),media=$('#detailMedia');
  function openProject(id){const p=projects.find(x=>x.id===id);if(!p)return;media.innerHTML=`<img src="${p.image}" alt="${p.title}">`;content.innerHTML=`<span class="detail-kicker">${p.status} · ${p.type}</span><h2>${p.title}</h2><div class="directory-location">${icon('pin')}<span>${p.location}</span></div><p>${p.summary}</p><ul class="detail-list">${p.details.map(x=>`<li>${icon('check')}<span>${x}</span></li>`).join('')}</ul><div class="detail-terms"><strong>Availability note:</strong> ${p.availability}</div><div class="detail-actions"><a class="btn btn-dark" href="index.html#contact">Enquire about this project</a><a class="btn btn-outline" href="products.html#property">Property products</a></div>`;modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('no-scroll');dialog.focus();}
  function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('no-scroll')}
  $('#detailClose')?.addEventListener('click',closeModal);modal?.addEventListener('click',e=>{if(e.target===modal)closeModal()});window.WEMACOOP_CLOSE_MODAL=closeModal;
})();
