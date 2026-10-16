(() => {
  const host = document.querySelector('.hero-art');
  host.classList.add('game-arena');
  host.querySelector('svg').setAttribute('aria-hidden', 'true');
  host.querySelector('.art-top').innerHTML = '<span>YASH RAJ / HOME TURF</span><span>EST. 62</span>';
  host.querySelector('.art-label').hidden = true;
  host.insertAdjacentHTML('beforeend', `
    <div class="pitch-glow" aria-hidden="true"></div>
    <div class="arena-top"><span class="arena-label">THE PENALTY CORNER</span><span class="arena-live"><i></i> PLAYABLE PORTFOLIO</span></div>
    <div class="arena-heading"><h2>Beat the keeper.</h2><p>Five shots. Pick your corner. Make it count.</p></div>
    <div class="match-board"><div><small>YOU</small><strong class="match-goals">0</strong></div><span class="match-divider">—</span><div><small>KEEPER</small><strong class="match-saves">0</strong></div><div class="match-round"><small>SHOTS</small><span class="shot-dots" aria-label="No shots taken">○ ○ ○ ○ ○</span></div></div>
    <div class="rink"><div class="goal-net" aria-hidden="true"><div class="keeper"><span class="keeper-head"></span><span class="keeper-body">62</span><span class="keeper-pad left"></span><span class="keeper-pad right"></span><span class="keeper-stick"></span></div></div><div class="aim-target" aria-hidden="true">+</div><div class="shot-guide" aria-hidden="true"></div><div class="game-ball" aria-hidden="true"></div><span class="rink-mark">YR / 62</span><span class="rink-caption">SHOOTING CIRCLE</span></div>
    <div class="game-bottom"><div class="aim-control"><label for="shot-aim">PICK YOUR CORNER <span class="aim-label">CENTRE</span></label><input id="shot-aim" type="range" min="0" max="100" value="50" aria-label="Aim shot: left to right"><div class="aim-ends"><span>LEFT POST</span><span>RIGHT POST</span></div></div><button class="shoot-button" type="button">SHOOT <span>↗</span></button></div>
    <div class="game-feedback" role="status" aria-live="polite">Aim with the slider. Shoot when the keeper moves away.</div><button class="replay-match" type="button" hidden>PLAY AGAIN ↻</button>
  `);
  const slider = host.querySelector('input'); const button = host.querySelector('.shoot-button');
  const feedback = host.querySelector('.game-feedback'); const replay = host.querySelector('.replay-match');
  const keeper = host.querySelector('.keeper'); const net = host.querySelector('.goal-net');
  const rink = host.querySelector('.rink'); const gameBall = host.querySelector('.game-ball');
  const phoneLayout = matchMedia('(max-width: 680px)');
  const launch = document.createElement('button'); launch.type = 'button'; launch.className = 'mobile-game-launch';
  launch.setAttribute('aria-expanded', 'false'); launch.setAttribute('aria-controls', 'phone-pitch');
  launch.innerHTML = '<span>HALF-TIME CHALLENGE<small>Five shots against the keeper</small></span><strong>PLAY ↗</strong>';
  host.before(launch); host.id = 'phone-pitch';
  launch.addEventListener('click', () => {
    const open = launch.getAttribute('aria-expanded') !== 'true';
    launch.setAttribute('aria-expanded', String(open)); host.classList.toggle('phone-game-open', open);
    launch.querySelector('strong').textContent = open ? 'CLOSE −' : 'PLAY ↗';
    if (open) host.scrollIntoView({ behavior: lowMotion() ? 'instant' : 'smooth', block: 'start' });
  });
  const corners = document.createElement('div'); corners.className = 'mobile-corners'; corners.setAttribute('role', 'group'); corners.setAttribute('aria-label', 'Choose shot direction');
  corners.innerHTML = '<button type="button" data-aim="8" aria-pressed="false">↖ LEFT</button><button type="button" data-aim="50" aria-pressed="true">↑ CENTRE</button><button type="button" data-aim="92" aria-pressed="false">RIGHT ↗</button>';
  host.querySelector('.game-bottom').before(corners);
  corners.querySelectorAll('button').forEach(corner => corner.addEventListener('click', () => {
    if (busy || shots.length === 5) return;
    slider.value = corner.dataset.aim; aim();
  }));
  let shots = [], saves = 0, busy = false, elapsed = 0, lastTime = 0, keeperX = .5, visible = true;
  const lowMotion = () => document.body.classList.contains('motion-paused') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  function aim() {
    const value = Number(slider.value);
    host.style.setProperty('--aim-x', (15 + value * .7) + '%');
    host.style.setProperty('--aim-phone-x', (9 + value * .82) + '%');
    host.querySelector('.aim-label').textContent = value < 35 ? 'LEFT CORNER' : value > 65 ? 'RIGHT CORNER' : 'CENTRE';
    corners.querySelectorAll('button').forEach(corner => corner.setAttribute('aria-pressed', String(Math.abs(Number(corner.dataset.aim) - value) < 20)));
  }
  slider.addEventListener('input', aim); aim();
  // Pointer and touch aiming share the same visible, keyboard-accessible range value.
  rink.addEventListener('pointerdown', event => {
    if (busy || shots.length === 5) return;
    const bounds = net.getBoundingClientRect();
    slider.value = Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100)); aim();
  });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(host);
  function frame(time) {
    const delta = lastTime ? Math.min(time - lastTime, 50) : 0; lastTime = time;
    if (visible && (!phoneLayout.matches || host.classList.contains('phone-game-open')) && !document.hidden && !busy && shots.length < 5 && !lowMotion()) {
      elapsed += delta; keeperX = .5 + Math.sin(elapsed / 630) * .36;
      keeper.style.left = `${keeperX * 100}%`;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  function score() {
    host.querySelector('.match-goals').textContent = shots.filter(Boolean).length;
    host.querySelector('.match-saves').textContent = saves;
    const dots = host.querySelector('.shot-dots'); dots.textContent = Array.from({ length: 5 }, (_, i) => i >= shots.length ? '○' : shots[i] ? '●' : '×').join(' ');
    dots.setAttribute('aria-label', `${shots.length} of 5 shots taken, ${shots.filter(Boolean).length} goals`);
  }
  button.addEventListener('click', async () => {
    if (busy || shots.length >= 5) return;
    busy = true; button.disabled = true; slider.disabled = true;
    const target = Number(slider.value) / 100;
    const saved = Math.abs(target - keeperX) < .19;
    const netRect = net.getBoundingClientRect(); const ballRect = gameBall.getBoundingClientRect();
    const dx = netRect.left + target * netRect.width - (ballRect.left + ballRect.width / 2);
    const dy = netRect.bottom - 12 - (ballRect.top + ballRect.height / 2);
    const motion = !lowMotion();
    const animation = gameBall.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx}px,${dy}px) scale(.58)`, opacity: 1, offset: .8 },
      { transform: `translate(${dx + (saved ? 35 : 0)}px,${dy + (saved ? 65 : -10)}px) scale(.5)`, opacity: 0 }
    ], { duration: motion ? 650 : 1, easing: 'cubic-bezier(.18,.6,.4,1)' });
    feedback.textContent = 'Shot away…';
    await animation.finished;
    shots.push(!saved); if (saved) saves++;
    score(); host.classList.toggle('net-celebrate', !saved);
    feedback.textContent = saved ? 'SAVED. Find the space beside the keeper.' : 'GOAL! Right into the backboard.';
    if (!saved && motion) net.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.035)' }, { transform: 'scale(1)' }], { duration: 400 });
    setTimeout(() => {
      busy = false; host.classList.remove('net-celebrate');
      if (shots.length === 5) {
        const goals = shots.filter(Boolean).length;
        feedback.textContent = `${goals}/5 goals. ${goals >= 4 ? 'Clinical finishing. Player of the match.' : goals >= 2 ? 'Good game. Ready for another round?' : 'The keeper wins this round. Try the corners.'}`;
        replay.hidden = false;
      } else { button.disabled = false; slider.disabled = false; }
    }, motion ? 650 : 100);
  });
  replay.addEventListener('click', () => {
    shots = []; saves = 0; score(); button.disabled = false; slider.disabled = false; replay.hidden = true;
    feedback.textContent = 'Fresh match. Five shots. Find your corner.'; button.focus();
  });

  // A small, fixed number of decorative balls: no DOM growth or pointer interception.
  const atmosphere = document.createElement('div'); atmosphere.className = 'hockey-atmosphere'; atmosphere.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 5; i++) {
    const lane = document.createElement('span'); lane.className = 'ball-lane';
    lane.style.setProperty('--lane', `${12 + i * 18}%`); lane.style.setProperty('--duration', `${20 + i * 4}s`); lane.style.setProperty('--delay', `${-i * 6}s`);
    lane.innerHTML = '<i class="ambient-ball"></i>'; atmosphere.append(lane);
  }
  document.body.prepend(atmosphere);
  document.querySelectorAll('.section > .eyebrow, .section > div > .eyebrow').forEach(label => label.classList.add('field-label'));
})();
