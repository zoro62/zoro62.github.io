document.getElementById('year').textContent = new Date().getFullYear();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');


// The page remains readable if JavaScript or an animation API is unavailable.
const revealElements = document.querySelectorAll('.section-head, .about > div, .project, .other-projects article, .journey > div, .skill-row, .contact h2, .email');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
  }), { threshold: .12 });
  revealElements.forEach(element => { element.classList.add('reveal'); observer.observe(element); });
}

const progress = document.createElement('div'); progress.className = 'reading-progress'; progress.setAttribute('aria-hidden', 'true'); document.body.prepend(progress);
const motionToggle = document.createElement('button'); motionToggle.className = 'motion-toggle'; motionToggle.type = 'button'; motionToggle.setAttribute('aria-pressed', 'false'); motionToggle.textContent = 'Ⅱ Pause motion';
document.body.append(motionToggle);
let paused = reducedMotion.matches;
function setMotion() {
  document.body.classList.toggle('motion-paused', paused);
  motionToggle.setAttribute('aria-pressed', String(paused));
  motionToggle.textContent = paused ? '▶ Resume motion' : 'Ⅱ Pause motion';
}
motionToggle.addEventListener('click', () => { paused = !paused; setMotion(); });
reducedMotion.addEventListener('change', event => { paused = event.matches; setMotion(); }); setMotion();

const ticker = document.querySelector('.ticker');
const tickerTrack = document.createElement('div'); tickerTrack.className = 'ticker-track';
const tickerGroup = document.createElement('div'); tickerGroup.className = 'ticker-group';
while (ticker.firstChild) tickerGroup.append(ticker.firstChild);
tickerTrack.append(tickerGroup, tickerGroup.cloneNode(true)); ticker.append(tickerTrack);

const art = document.querySelector('.hero-art');
const pitch = art.querySelector('svg');
const stick = pitch.querySelector('g[filter="url(#shadow)"]');
stick.classList.add('hockey-stick');
const ball = pitch.querySelector('circle[filter="url(#shadow)"]');
const ballGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
ballGroup.classList.add('hockey-ball'); ball.before(ballGroup); ballGroup.append(ball);
const dimples = pitch.querySelector('g[fill="#c9cbb8"]'); ballGroup.append(dimples);
pitch.querySelector('path[stroke="#f47742"]').classList.add('hit-trail');
const gameScript = document.createElement('script'); gameScript.src = 'game.js'; document.body.append(gameScript);

const heroTitle = document.querySelector('h1');
heroTitle.innerHTML = '<span class="title-line"><span>A sharp eye.</span></span><span class="title-line"><span>A clear goal.</span></span><span class="title-line"><em>Always building.</em></span>';
const role = document.createElement('div'); role.className = 'live-role';
role.innerHTML = '<span class="role-marker">CURRENT PLAY</span><span class="role-value">Privacy-first software</span><span aria-hidden="true" class="role-caret">▌</span>';
document.querySelector('.intro').after(role);
const roles = ['Privacy-first software', 'Network diagnostics', 'Cybersecurity exploration', 'Ideas into working tools']; let roleIndex = 0;
setInterval(() => {
  if (paused || document.hidden) return;
  const label = role.querySelector('.role-value');
  label.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 220, fill: 'forwards' }).finished.then(() => {
    label.textContent = roles[++roleIndex % roles.length];
    label.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 300, fill: 'forwards' });
  });
}, 3400);

let scrollPending = false;
function updateScroll() {
  const distance = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${distance > 0 ? scrollY / distance : 0})`;
  if (!paused) art.style.setProperty('--scroll-shift', `${Math.min(scrollY * .08, 45)}px`);
  document.querySelector('header').classList.toggle('has-scrolled', scrollY > 30);
  scrollPending = false;
}
addEventListener('scroll', () => { if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); } }, { passive: true }); updateScroll();

if (finePointer.matches) {
  document.querySelectorAll('.project-visual, .hero-art').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (paused) return;
      const box = card.getBoundingClientRect(); const x = (event.clientX - box.left) / box.width; const y = (event.clientY - box.top) / box.height;
      card.style.setProperty('--pointer-x', `${x * 100}%`); card.style.setProperty('--pointer-y', `${y * 100}%`);
      if (card !== art) { card.style.transform = `perspective(1000px) rotateX(${(y - .5) * -7}deg) rotateY(${(x - .5) * 7}deg)`; }
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
  document.querySelectorAll('.button, .nav-contact').forEach(button => {
    button.addEventListener('pointermove', event => {
      if (paused) return;
      const box = button.getBoundingClientRect(); button.style.transform = `translate(${(event.clientX - box.left - box.width / 2) * .12}px, ${(event.clientY - box.top - box.height / 2) * .18}px)`;
    });
    button.addEventListener('pointerleave', () => { button.style.transform = ''; });
  });
}

const navLinks = document.querySelectorAll('nav a');
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) navLinks.forEach(link => {
      const active = link.getAttribute('href') === '#' + entry.target.id;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }), { rootMargin: '-15% 0px -55% 0px' });
  document.querySelectorAll('section[id]').forEach(section => sectionObserver.observe(section));
}
