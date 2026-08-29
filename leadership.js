const executives = Array.isArray(window.WEMACOOP_EXECUTIVES)
  ? window.WEMACOOP_EXECUTIVES.filter(item => item.current).sort((a,b) => a.order - b.order)
  : [];

const grid = document.getElementById('leadershipGrid');
if (grid) {
  grid.innerHTML = executives.map(person => `
    <article class="leadership-profile" id="${person.id}">
      <div class="executive-photo">
        <img src="${person.image}" alt="Placeholder portrait for ${person.role}" loading="lazy" width="800" height="1000">
      </div>
      <div class="leadership-profile-body">
        <span class="executive-role-label">${person.role}</span>
        <h2>${person.name}</h2>
        <h3>Portfolio</h3>
        <p>${person.portfolio}</p>
        <h3>Profile</h3>
        <p>${person.bio}</p>
      </div>
    </article>
  `).join('');
}

document.getElementById('year').textContent = new Date().getFullYear();

const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 20), {passive:true});

const menu = document.getElementById('leadershipMobileMenu');
const overlay = document.getElementById('leadershipOverlay');
const openBtn = document.getElementById('leadershipMenuOpen');
const closeBtn = document.getElementById('leadershipMenuClose');
function setMenu(open){
  menu?.classList.toggle('open',open);
  overlay?.classList.toggle('show',open);
  menu?.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('no-scroll',open);
}
openBtn?.addEventListener('click',()=>setMenu(true));
closeBtn?.addEventListener('click',()=>setMenu(false));
overlay?.addEventListener('click',()=>setMenu(false));
menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
