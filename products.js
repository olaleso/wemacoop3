(() => {
  const $=(s,scope=document)=>scope.querySelector(s), $$=(s,scope=document)=>[...scope.querySelectorAll(s)];
  const icon=window.WEMACOOP_ICON;
  const families=window.WEMACOOP_PRODUCT_FAMILIES || [];
  const loans=window.WEMACOOP_LOAN_PRODUCTS || [];
  const familyRoot=$('#familyGrid');
  if(familyRoot){
    familyRoot.innerHTML=families.map(f=>`<article class="family-card tone-${f.tone}" id="${f.id}"><div class="family-icon">${icon(f.icon)}</div><h3>${f.label}</h3><p>${f.summary}</p><ul class="family-points">${f.points.map(x=>`<li>${icon('check')}<span>${x}</span></li>`).join('')}</ul><p class="family-note">${f.note}</p></article>`).join('');
  }
  const filters=['All',...new Set(loans.map(x=>x.category))];
  let active='All';
  const filterRoot=$('#loanFilters'), grid=$('#loanGrid'), count=$('#loanCount');
  function renderFilters(){ filterRoot.innerHTML=filters.map(x=>`<button class="filter-tab ${x===active?'active':''}" type="button" data-filter="${x}">${x}</button>`).join(''); $$('.filter-tab',filterRoot).forEach(b=>b.addEventListener('click',()=>{active=b.dataset.filter;renderFilters();renderLoans();})); }
  function renderLoans(){ const items=active==='All'?loans:loans.filter(x=>x.category===active); count.textContent=`${items.length} product${items.length===1?'':'s'}`; grid.innerHTML=items.map(p=>`<article class="loan-card"><div class="loan-card-top"><div class="loan-card-icon">${icon(p.icon)}</div><span class="loan-category">${p.category}</span></div><h3>${p.name}</h3><p class="loan-tagline">${p.tagline}</p><ul class="loan-best">${p.bestFor.map(x=>`<li>${icon('check')}<span>${x}</span></li>`).join('')}</ul><div class="loan-card-actions"><button type="button" data-loan="${p.id}">View details →</button><a href="index.html#calculator">Estimate repayment</a></div></article>`).join(''); $$('[data-loan]',grid).forEach(b=>b.addEventListener('click',()=>openLoan(b.dataset.loan))); }
  renderFilters(); renderLoans();

  const modal=$('#detailModal'), dialog=$('.detail-dialog',modal), content=$('#detailContent');
  function openLoan(id){ const p=loans.find(x=>x.id===id); if(!p)return; content.innerHTML=`<span class="detail-kicker">${p.category} loan</span><h2 id="detailTitle">${p.name}</h2><p>${p.description}</p><ul class="detail-list">${p.bestFor.map(x=>`<li>${icon('check')}<span>${x}</span></li>`).join('')}</ul><div class="detail-terms"><strong>Official terms:</strong> ${p.terms}</div><div class="detail-actions"><a class="btn btn-dark" href="index.html#calculator">Estimate repayment</a><a class="btn btn-outline" href="index.html#contact">Ask the Secretariat</a></div>`; modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('no-scroll');dialog.focus(); }
  function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('no-scroll')}
  $('#detailClose')?.addEventListener('click',closeModal);modal?.addEventListener('click',e=>{if(e.target===modal)closeModal()});window.WEMACOOP_CLOSE_MODAL=closeModal;
})();
