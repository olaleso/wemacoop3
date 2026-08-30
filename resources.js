(() => {
  const resources = Array.isArray(window.WEMACOOP_RESOURCES) ? window.WEMACOOP_RESOURCES : [];
  const grid = document.querySelector('#resourceDirectory');
  const filters = document.querySelector('#resourceFilters');
  const search = document.querySelector('#resourceSearch');
  const count = document.querySelector('#resourceCount');
  const featured = document.querySelector('#featuredResources');
  if (!grid || !filters) return;

  const icon = window.WEMACOOP_ICON || (() => '');
  const categories = ['All', ...new Set(resources.map(r => r.category))];
  let activeCategory = 'All';
  let query = '';

  const statusClass = status => status === 'online' ? 'online' : 'pending';

  function card(resource, compact=false) {
    return `
      <article class="resource-directory-card${compact ? ' compact' : ''}">
        <div class="resource-card-top">
          <span class="resource-card-icon">${icon(resource.icon)}</span>
          <span class="resource-status ${statusClass(resource.status)}">${resource.statusLabel}</span>
        </div>
        <div class="resource-card-copy">
          <span class="resource-type">${resource.type}</span>
          <h3>${resource.title}</h3>
          <p>${resource.description}</p>
        </div>
        <div class="resource-card-footer">
          <span>${resource.category}</span>
          <a href="${resource.href}" class="resource-action">${resource.actionLabel} ${icon('arrow')}</a>
        </div>
      </article>`;
  }

  function renderFeatured() {
    if (!featured) return;
    featured.innerHTML = resources.filter(r => r.featured).slice(0,3).map(r => card(r, true)).join('');
  }

  function renderFilters() {
    filters.innerHTML = categories.map(category => `
      <button class="filter-tab${category === activeCategory ? ' active' : ''}" type="button" data-category="${category}" aria-pressed="${category === activeCategory}">${category}</button>
    `).join('');
    filters.querySelectorAll('[data-category]').forEach(button => {
      button.addEventListener('click', () => {
        activeCategory = button.dataset.category;
        renderFilters();
        renderDirectory();
      });
    });
  }

  function renderDirectory() {
    const normalised = query.trim().toLowerCase();
    const matches = resources.filter(resource => {
      const categoryMatch = activeCategory === 'All' || resource.category === activeCategory;
      const searchMatch = !normalised || `${resource.title} ${resource.category} ${resource.type} ${resource.description}`.toLowerCase().includes(normalised);
      return categoryMatch && searchMatch;
    });
    if (count) count.textContent = `${matches.length} resource${matches.length === 1 ? '' : 's'}`;
    grid.innerHTML = matches.length
      ? matches.map(resource => card(resource)).join('')
      : `<div class="resource-empty"><span>${icon('search')}</span><h3>No matching resources</h3><p>Try another search term or category.</p></div>`;
  }

  search?.addEventListener('input', event => {
    query = event.target.value;
    renderDirectory();
  });

  renderFeatured();
  renderFilters();
  renderDirectory();
})();
