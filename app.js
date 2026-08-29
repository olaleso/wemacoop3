const $ = (s, scope=document) => scope.querySelector(s);
const $$ = (s, scope=document) => [...scope.querySelectorAll(s)];

const icons = {
  home:'M3 11.5 12 4l9 7.5M5 10v10h14V10',
  users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  repeat:'M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3',
  layers:'m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5',
  calculator:'M4 3h16v18H4zM8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01',
  building:'M3 21h18M6 21V4h12v17M9 8h.01M13 8h.01M9 12h.01M13 12h.01M9 16h.01M13 16h.01',
  userPlus:'M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6M22 11h-6',
  download:'M12 3v12m0 0 4-4m-4 4-4-4M5 21h14',
  help:'M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4M12 18h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
  headset:'M4 14v-2a8 8 0 0 1 16 0v2M4 14h2v5H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2ZM20 14h-2v5h2a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2ZM18 19c0 2-2 3-4 3h-2',
  check:'m5 12 4 4L19 6',
  piggy:'M19 5c-1.5-1-3-1.5-5-1.5-4.4 0-8 2.7-8 6.5 0 .5.1 1 .2 1.5L4 13v3h2.3c.7 1.1 1.6 2 2.7 2.7V21h3v-1.2c.6.1 1.3.2 2 .2s1.4-.1 2-.2V21h3v-2.3c1.8-1.2 3-3.2 3-5.7 0-1-.2-2-.6-2.8L23 8.5 21.5 7M15.5 9h.01',
  wallet:'M3 6h15a3 3 0 0 1 3 3v10H5a2 2 0 0 1-2-2V6Zm0 0 11-3v3M16 12h5',
  chart:'M4 19V9M10 19V5M16 19v-7M22 19H2',
  house:'M3 11.5 12 4l9 7.5M5 10v10h14V10M9 20v-6h6v6',
  coin:'M12 6c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3Zm8-3v5c0 1.7-3.6 3-8 3S4 9.7 4 8V3m16 5v5c0 1.7-3.6 3-8 3s-8-1.3-8-3V8m16 5v5c0 1.7-3.6 3-8 3s-8-1.3-8-3v-5',
  file:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8M8 17h6',
  book:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Zm0 0A2.5 2.5 0 0 0 6.5 22H20',
  mail:'M3 6h18v12H3zM3 7l9 6 9-6',
  map:'M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Zm0-15v15m6-12v15',
  clock:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-15v5l3 2',
  message:'M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z',
  pin:'M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Zm-8 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  leadership:'M4 21v-7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v7M9 10V7a3 3 0 0 1 6 0v3M8 21v-4h8v4M4 4h4M16 4h4',
  briefcase:'M4 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm4 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M2 12h20M10 12v2h4v-2'
};

function icon(name, cls='ui-icon'){
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[name] || icons.check}"></path></svg>`;
}
$$('[data-icon]').forEach(el => { const name=el.dataset.icon; el.innerHTML=icon(name); });

const projects = [
  {title:'Purple Villa — Alakuko',location:'Alakuko, Lagos',status:'Completed milestone',image:'assets/purple-villa.webp',text:'A completed residential milestone that turns cooperative contributions into tangible member value.'},
  {title:'Somolu Serviced Flats',location:'Somolu, Lagos',status:'Property milestone',image:'assets/somolu-flats.webp',text:'Serviced residential flats that broaden the cooperative’s property portfolio and member housing options.'},
  {title:'Oko-Omi Land Acquisition',location:'Oko-Omi',status:'Land scheme',image:'assets/oko-omi-land.webp',text:'Land acquired to widen property ownership opportunities, with particular focus on junior staff.'}
];

const services = [
  {title:'Savings',text:'Build a disciplined monthly balance.',icon:'piggy',tone:'purple',href:'#products'},
  {title:'Loans',text:'Member-friendly credit for real needs.',icon:'wallet',tone:'teal',href:'#calculator'},
  {title:'Shares',text:'Participate in annual surplus returns.',icon:'chart',tone:'gold',href:'#products'},
  {title:'Properties',text:'Explore cooperative property milestones.',icon:'house',tone:'green',href:'#projects'}
];

const productData = [
  {id:'savings',label:'Savings Scheme',icon:'piggy',title:'Savings that happen quietly in the background.',text:'Automatic monthly contributions help members build financial discipline while strengthening the shared cooperative fund.',features:['Payroll-based monthly contributions','Builds member savings over time','Forms the foundation for wider cooperative benefits'],cta:'Ask about savings'},
  {id:'loans',label:'Staff Loans',icon:'wallet',title:'Credit designed around members, not complexity.',text:'WEMACOOP supports eligible members with staff loan options intended for emergencies, planned expenses and other approved needs.',features:['Member-focused eligibility','Convenient payroll repayment','Official terms set by the Cooperative'],cta:'Estimate repayment'},
  {id:'shares',label:'Shares & Dividends',icon:'coin',title:'Own a stake in the cooperative’s growth.',text:'Members can hold shares in the Society and may receive dividends from annual surplus, subject to approved declarations and cooperative rules.',features:['Member shareholding','Annual surplus participation','Governed by approved cooperative rules'],cta:'Learn about shares'},
  {id:'property',label:'Property & Investment',icon:'building',title:'Collective strength that becomes real assets.',text:'Property acquisitions such as Purple Villa, Somolu serviced flats and Oko-Omi illustrate how pooled participation can translate into tangible assets.',features:['Property acquisition milestones','Member-focused ownership opportunities','Long-term cooperative asset building'],cta:'View projects'}
];

const cycleData = [
  {title:'Contribute',sub:'Monthly savings',icon:'piggy'},
  {title:'Pool',sub:'Shared fund',icon:'coin'},
  {title:'Borrow',sub:'Member loans',icon:'wallet'},
  {title:'Grow',sub:'Property & shares',icon:'building'},
  {title:'Return',sub:'Member value',icon:'repeat'}
];

const membershipData = [
  ['01','Get the form','Collect or download the approved membership form.'],
  ['02','Complete & submit','Provide the required staff and payroll information.'],
  ['03','Approval','The cooperative reviews the membership request.'],
  ['04','Start contributing','Approved members begin regular contributions.']
];

const faqs = [
  ['Who can join WEMACOOP?','The current site copy states that confirmed Wema Bank staff can apply for membership, subject to the Cooperative’s approval process.'],
  ['How are monthly contributions made?','The current site explains that contributions are deducted through payroll, helping members save consistently each month.'],
  ['When can a member apply for a loan?','Loan eligibility depends on the qualifying contribution period and other rules approved by the Cooperative.'],
  ['How are dividends handled?','Dividends, where declared, are linked to the Society’s annual surplus and the rules approved for members.']
];

// Hero / project slideshow
const slidesRoot = $('#heroSlides');
projects.forEach((p,i)=>{ const el=document.createElement('div'); el.className='hero-slide'+(i===0?' active':''); el.innerHTML=`<img src="${p.image}" alt="${p.title}" ${i===0?'fetchpriority="high"':'loading="lazy"'}>`; slidesRoot.appendChild(el); });
projects.forEach((_,i)=>{ const b=document.createElement('button'); b.type='button'; b.setAttribute('aria-label',`Show project ${i+1}`); if(i===0)b.classList.add('active'); b.addEventListener('click',()=>setHero(i,true)); $('#heroDots').appendChild(b); });
let heroIndex=0, heroTimer;
function updateHeroCard(){ const p=projects[heroIndex]; $('#heroProjectStatus').textContent=p.status; $('#heroProjectTitle').textContent=p.title; $('#heroProjectText').textContent=p.text; $('#heroProjectLocation').textContent=p.location; $('#heroProjectCount').textContent=`${String(heroIndex+1).padStart(2,'0')} / ${String(projects.length).padStart(2,'0')}`; }
function restartHeroProgress(){ const p=$('#heroProgress'); p.classList.remove('animate'); void p.offsetWidth; p.classList.add('animate'); }
function setHero(index,user=false){ heroIndex=(index+projects.length)%projects.length; $$('.hero-slide').forEach((s,i)=>s.classList.toggle('active',i===heroIndex)); $$('#heroDots button').forEach((d,i)=>d.classList.toggle('active',i===heroIndex)); updateHeroCard(); restartHeroProgress(); if(user) startHeroTimer(); }
function nextHero(){setHero(heroIndex+1)}
function startHeroTimer(){clearInterval(heroTimer);heroTimer=setInterval(nextHero,6000)}
$('#heroPrev').addEventListener('click',()=>setHero(heroIndex-1,true)); $('#heroNext').addEventListener('click',()=>setHero(heroIndex+1,true));
const heroSection=$('.hero'); heroSection.addEventListener('mouseenter',()=>clearInterval(heroTimer)); heroSection.addEventListener('mouseleave',startHeroTimer);
let heroTouch=0; heroSection.addEventListener('touchstart',e=>heroTouch=e.changedTouches[0].clientX,{passive:true}); heroSection.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-heroTouch;if(Math.abs(dx)>45)setHero(heroIndex+(dx<0?1:-1),true)},{passive:true});
updateHeroCard(); restartHeroProgress(); startHeroTimer();

// Quick services
services.forEach(s=>{ const a=document.createElement('a'); a.href=s.href; a.className=`quick-card quick-${s.tone}`; a.innerHTML=`<span class="quick-icon">${icon(s.icon)}</span><span><h3>${s.title}</h3><p>${s.text}</p></span><span class="quick-arrow">→</span>`; $('#quickGrid').appendChild(a); });

// Cooperation cycle
cycleData.forEach(s=>{ const d=document.createElement('div'); d.className='cycle-step'; d.innerHTML=`<span class="step-icon">${icon(s.icon)}</span><strong>${s.title}</strong><small>${s.sub}</small>`; $('#cycleSteps').appendChild(d); });

// Product tabs/panel
function renderProduct(index){ const p=productData[index]; $$('.product-tab').forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-selected',i===index?'true':'false')}); $('#productPanel').innerHTML=`<div class="product-content"><span class="product-icon">${icon(p.icon)}</span><div><h3>${p.title}</h3><p>${p.text}</p><ul class="product-features">${p.features.map(f=>`<li>${icon('check')}<span>${f}</span></li>`).join('')}</ul></div></div><div class="product-cta"><p>Need more detail? The Cooperative can confirm the current rules and approved terms.</p><a class="btn btn-dark" href="${p.id==='loans'?'#calculator':p.id==='property'?'#projects':'#contact'}">${p.cta}</a></div>`; }
productData.forEach((p,i)=>{ const b=document.createElement('button'); b.type='button'; b.className='product-tab'+(i===0?' active':''); b.setAttribute('role','tab'); b.setAttribute('aria-selected',i===0?'true':'false'); b.textContent=p.label; b.addEventListener('click',()=>renderProduct(i)); $('#productTabs').appendChild(b); }); renderProduct(0);

// Calculator
const amountRange=$('#amountRange'), tenureRange=$('#tenureRange'), rateRange=$('#rateRange');
function money(n){return new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(Math.round(n)).replace('NGN','₦').replace(/\s/g,'');}
function calculate(){ const amount=Number(amountRange.value), months=Number(tenureRange.value), rate=Number(rateRange.value); const interest=amount*(rate/100)*(months/12); const total=amount+interest; const monthly=total/months; $('#amountOutput').textContent=money(amount); $('#tenureOutput').textContent=`${months} month${months===1?'':'s'}`; $('#rateOutput').textContent=`${rate}%`; $('#monthlyOutput').textContent=money(monthly); $('#interestOutput').textContent=money(interest); $('#repaymentOutput').textContent=money(total); }
[amountRange,tenureRange,rateRange].forEach(el=>el.addEventListener('input',calculate)); calculate();
const calcShell=$('.calculator-shell'); $('#calculatorToggle').addEventListener('click',()=>{ const collapsed=calcShell.classList.toggle('collapsed'); $('#calculatorToggle').setAttribute('aria-expanded',String(!collapsed)); $('#calculatorToggle em').textContent=collapsed?'+':'−'; });
if(matchMedia('(max-width:760px)').matches){calcShell.classList.add('collapsed');$('#calculatorToggle').setAttribute('aria-expanded','false');$('#calculatorToggle em').textContent='+';}

// Project cards
projects.forEach((p,i)=>{ const card=document.createElement('article'); card.className='project-card'; card.innerHTML=`<div class="project-image"><img src="${p.image}" alt="${p.title}" loading="lazy"><span class="project-badge">${p.status}</span></div><div class="project-body"><h3>${p.title}</h3><div class="project-location">${icon('pin')}<span>${p.location}</span></div><p>${p.text}</p><a href="#contact">Enquire about project →</a></div>`; $('#projectTrack').appendChild(card); const dot=document.createElement('button');dot.type='button';dot.setAttribute('aria-label',`Show ${p.title}`);if(i===0)dot.classList.add('active');dot.addEventListener('click',()=>card.scrollIntoView({behavior:'smooth',inline:'start',block:'nearest'}));$('#projectDots').appendChild(dot); });
const track=$('#projectTrack'); function projectStep(dir){const card=$('.project-card',track);if(!card)return;track.scrollBy({left:dir*(card.getBoundingClientRect().width+18),behavior:'smooth'});} $('#projectPrev').addEventListener('click',()=>projectStep(-1));$('#projectNext').addEventListener('click',()=>projectStep(1)); track.addEventListener('scroll',()=>{const cards=$$('.project-card',track);const first=cards[0];if(!first)return;const gap=18;const idx=Math.max(0,Math.min(cards.length-1,Math.round(track.scrollLeft/(first.offsetWidth+gap)))); $$('#projectDots button').forEach((d,i)=>d.classList.toggle('active',i===idx));},{passive:true});

// Membership
membershipData.forEach(([n,t,d])=>{const el=document.createElement('div');el.className='member-step';el.innerHTML=`<span>${n}</span><div><h3>${t}</h3><p>${d}</p></div>`;$('#membershipSteps').appendChild(el);});

// FAQ
faqs.forEach(([q,a],i)=>{const item=document.createElement('div');item.className='faq-item'+(i===0?' open':'');item.innerHTML=`<button class="faq-question" type="button" aria-expanded="${i===0?'true':'false'}"><span>${q}</span><span>+</span></button><div class="faq-answer"><div><p>${a}</p></div></div>`;$('.faq-question',item).addEventListener('click',()=>{const open=item.classList.contains('open');$$('.faq-item').forEach(x=>{x.classList.remove('open');$('.faq-question',x)?.setAttribute('aria-expanded','false')});if(!open){item.classList.add('open');$('.faq-question',item).setAttribute('aria-expanded','true')}});$('#faqList').appendChild(item);});

// Resource preview actions
$$('[data-demo-resource]').forEach(btn=>btn.addEventListener('click',()=>showToast('Preview resource — attach the approved cooperative document before production.')));

// Mobile menu
const menu=$('#mobileMenu'),overlay=$('#drawerOverlay'),openBtn=$('#menuOpen');
function openMenu(){menu.classList.add('open');overlay.classList.add('show');document.body.classList.add('no-scroll');menu.setAttribute('aria-hidden','false');openBtn.setAttribute('aria-expanded','true')}
function closeMenu(){menu.classList.remove('open');overlay.classList.remove('show');document.body.classList.remove('no-scroll');menu.setAttribute('aria-hidden','true');openBtn.setAttribute('aria-expanded','false')}
openBtn.addEventListener('click',openMenu);$('#menuClose').addEventListener('click',closeMenu);overlay.addEventListener('click',closeMenu);$$('.drawer-nav a,.drawer-actions a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});

// Smooth navigation and active state
$$('a[href^="#"]').forEach(a=>{const id=a.getAttribute('href').slice(1);if(!id)return;const target=document.getElementById(id);if(!target)return;a.addEventListener('click',e=>{e.preventDefault();closeMenu();target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});history.replaceState(null,'','#'+id)})});
const navTargets=['about','products','calculator','projects','membership','contact'];const navObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){$$('.desktop-nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id));$$('[data-dock]').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id))}})},{rootMargin:'-35% 0px -55% 0px',threshold:0}); navTargets.forEach(id=>{const el=document.getElementById(id);if(el)navObserver.observe(el)});

// Header / back to top
const header=$('#siteHeader'),toTop=$('#toTop');window.addEventListener('scroll',()=>{header.classList.toggle('scrolled',scrollY>40);toTop.classList.toggle('show',scrollY>650)},{passive:true});toTop.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

// Reveal animations
const revealObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObserver.unobserve(e.target)}})},{threshold:.12});$$('.reveal').forEach(el=>revealObserver.observe(el));

// Counters preserve real HTML value, animate visually only
const counterObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(!e.isIntersecting)return;const el=e.target,target=Number(el.dataset.target),noComma=el.dataset.noComma==='true';if(matchMedia('(prefers-reduced-motion: reduce)').matches){el.textContent=noComma?target:target.toLocaleString();counterObserver.unobserve(el);return;}let start=performance.now(),duration=850;function frame(now){const p=Math.min(1,(now-start)/duration);const eased=1-Math.pow(1-p,3);const val=Math.round(target*eased);el.textContent=noComma?String(val):val.toLocaleString();if(p<1)requestAnimationFrame(frame)}requestAnimationFrame(frame);counterObserver.unobserve(el)})},{threshold:.7});$$('.counter').forEach(c=>counterObserver.observe(c));

// Form preview
$('#contactForm').addEventListener('submit',e=>{e.preventDefault();const name=$('#contactName').value.trim().split(' ')[0]||'there';const status=$('#formStatus');status.textContent=`Thanks, ${name}. This preview form is not connected to the Secretariat yet. Connect it to your backend or email service before launch.`;status.classList.add('show');showToast('Preview message captured locally — no email was sent.');});

function showToast(message){const t=$('#toast');t.textContent=message;t.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove('show'),3600)}
$('#year').textContent=new Date().getFullYear();


// Executive committee — shared data comes from executives.js.
const executiveRoot = $('#executiveTrack');
if (executiveRoot && Array.isArray(window.WEMACOOP_EXECUTIVES)) {
  const executives = window.WEMACOOP_EXECUTIVES
    .filter(item => item.current && item.featured)
    .sort((a,b) => a.order - b.order);

  executiveRoot.innerHTML = executives.map((person, index) => `
    <article class="executive-card" data-executive-card>
      <div class="executive-photo">
        <img src="${person.image}" alt="Placeholder portrait for ${person.role}" loading="lazy" width="800" height="1000">
        <span class="executive-role">${person.role}</span>
      </div>
      <div class="executive-body">
        <p class="executive-index">0${index + 1}</p>
        <h3>${person.name}</h3>
        <div class="executive-portfolio">${icon('briefcase')}<span>${person.portfolio}</span></div>
        <a href="leadership.html#${person.id}">View profile →</a>
      </div>
    </article>
  `).join('');

  const dotsRoot = $('#executiveDots');
  if (dotsRoot) {
    dotsRoot.innerHTML = executives.map((_, i) => `<button type="button" class="${i===0?'active':''}" aria-label="Show executive ${i+1}"></button>`).join('');
    const dots = $$('#executiveDots button');
    const cards = $$('[data-executive-card]', executiveRoot);
    const updateExecutiveDots = () => {
      if (!cards.length) return;
      const left = executiveRoot.scrollLeft;
      let idx = 0;
      let best = Infinity;
      cards.forEach((card,i) => {
        const d = Math.abs(card.offsetLeft - executiveRoot.offsetLeft - left);
        if (d < best) { best = d; idx = i; }
      });
      dots.forEach((dot,i)=>dot.classList.toggle('active', i===idx));
    };
    executiveRoot.addEventListener('scroll', () => requestAnimationFrame(updateExecutiveDots), {passive:true});
    dots.forEach((dot,i)=>dot.addEventListener('click',()=>cards[i]?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'start'})));
  }
}
