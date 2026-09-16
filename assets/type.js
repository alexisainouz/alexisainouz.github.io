/* Rejeu de frappe sur l'accueil.
   ─────────────────────────────────────────────────────────────────────
   Le texte final est déjà dans le HTML : moteurs de recherche, lecteurs
   d'écran et navigation sans JavaScript voient la page entière. Ce script
   le masque le temps de rejouer l'écriture, puis lui rend la main.
   Il se joue une fois, à la première visite. Ensuite un bouton permet de
   le relancer à volonté.                                                */
(() => {
  const real = document.querySelector('.say');
  if (!real) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  /* ---------- le son, synthétisé : aucun fichier à télécharger ---------- */
  const Keys = (() => {
    let ac = null;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    if (!ac) return null;

    /* Les frappes se chevauchent au rythme réel : deux ou trois sons coexistent
       en permanence et leurs amplitudes s'additionnent. Sans ce limiteur, le
       niveau choisi saturerait sur les rafales — un grésillement, pas un son
       plus fort. Il ne s'entend pas, il empêche seulement le débordement.     */
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -6; comp.knee.value = 10;
    comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.05;
    // Rétablissement court : une frappe survient toutes les ~45 ms. Un temps
    // plus long et le limiteur reste serré en permanence, fondant les frappes
    // les unes dans les autres au lieu d'écrêter les seules crêtes.
    const bus = ac.createGain();
    bus.connect(comp); comp.connect(ac.destination);

    /* Bruit rose (-3 dB/octave) plutôt que blanc : le blanc porte autant
       d'énergie dans les aigus que dans les graves, d'où le sifflement.      */
    const noise = ac.createBuffer(1, ac.sampleRate * 0.12, ac.sampleRate);
    const d = noise.getChannelData(0);
    let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886*b0 + w*0.0555179;  b1 = 0.99332*b1 + w*0.0750759;
      b2 = 0.96900*b2 + w*0.1538520;  b3 = 0.86650*b3 + w*0.3104856;
      b4 = 0.55000*b4 + w*0.5329522;  b5 = -0.7616*b5 - w*0.0168980;
      d[i] = (b0+b1+b2+b3+b4+b5+b6 + w*0.5362) * 0.11;
      b6 = w * 0.115926;
    }

    const LEVEL = 0.32;   // amplitude crête, réglée à l'oreille sur banc d'essai

    const hit = (mul, cut, decay) => {
      if (ac.state !== 'running') return;
      const t = ac.currentTime;

      const src = ac.createBufferSource(); src.buffer = noise;
      src.playbackRate.value = 0.9 + Math.random() * 0.2;

      const hp = ac.createBiquadFilter();       // coupe le grave inutile
      hp.type = 'highpass'; hp.frequency.value = 90; hp.Q.value = 0.7;

      const lp = ac.createBiquadFilter(); lp.type = 'lowpass';
      lp.frequency.value = cut * (0.88 + Math.random() * 0.24);
      lp.Q.value = 0.7;   // sous 1 : pas de bosse de résonance, donc pas de métal

      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(LEVEL * mul * (0.72 + Math.random() * 0.56),
                                     t + 0.012);   // 12 ms : une frappe, pas un clic
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);

      src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(bus);
      src.start(t); src.stop(t + decay + 0.02);
    };
    return {
      wake:  () => ac.resume(),
      key:   () => hit(1,    1500, 0.042),
      space: () => hit(1.28,  930, 0.061),
      back:  () => hit(0.72, 1170, 0.036),
    };
  })();

  /* Une frappe humaine ne claque pas à chaque caractère. On sonne le début
     de chaque mot — c'est lui qu'on entend vraiment — et un peu plus d'un
     caractère sur deux ensuite, au hasard. Un « une lettre sur deux » strict
     recréerait une pulsation régulière, donc une autre mitraillette. */
  /* Densité sonore. L'espace sonne toujours — c'est la touche la plus large
     d'un vrai clavier, et elle donne le rythme des mots. Les autres lettres
     sonnent une fois sur quatre environ. Faire sonner en plus la première
     lettre de chaque mot, comme avant, ajoutait un son garanti tous les cinq
     caractères : c'est ce qui donnait la mitraillette.                      */
  const SOUND_RATE = 0.22;

  const L = {
    yt:   real.querySelector('a[href*="youtube"]')?.href      || '#',
    book: real.querySelector('a[href*="amazon"]')?.href       || '#',
    co:   real.querySelector('a[href*="salutcompany"]')?.href || '#',
    li:   real.querySelector('a[href*="linkedin"]')?.href     || '#',
    malt: real.querySelector('a[href*="malt"]')?.href         || '#',
    ig:   real.querySelector('a[href*="instagram"]')?.href    || '#',
    lab: '/lab/', contact: '/contact/',
  };

  // t = texte · a = lien · c = mot pensé puis corrigé · typo = faute rattrapée
  const SCRIPT = [
    { t: 'I’m Alexis Gabriel Aïnouz — Alex is fine.' }, { br: 1 },
    { t: 'I started making ' }, { c: ['pathological', 'obsessive'] },
    { t: ' food films on ' }, { a: [L.yt, 'YouTube'] },
    { t: ', 235 million views ago. Along the way I wrote ' },
    { a: [L.book, 'a bestselling cookbook'] },
    { t: ', and started ' }, { a: [L.co, 'a company'] },
    { t: ' that makes ' }, { c: ['expensive', 'dream'] },
    { t: ' tools for cooks.' }, { p: 1 },
    { t: 'I have been an ' }, { a: [L.li, 'entrepreneur'] },
    { t: ' for more than twenty years. I now ' }, { a: [L.malt, 'freelance'] },
    { t: ' with teams who need creativity, and spend the rest of my time ' },
    { a: [L.ig, 'dancing, sailing, cycling'] },
    { t: ', and finding ' },
    { a: [L.lab, 'solutions to problems nobody else has'] },
    { t: '.' }, { p: 1 },
    { a: [L.contact, 'Say hello'] }, { t: '.' },
  ];

  const REST = { '.': 540, '!': 540, '?': 540, ':': 300, ';': 300, ',': 190, '—': 240 };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const pace = () => 30 + Math.random() * 30;

  /* ---------- les deux boutons du coin ---------- */
  const dock = document.createElement('div');
  dock.className = 'dock';

  const mk = (cls, svg, label) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'dock-btn ' + cls;
    b.innerHTML = svg; b.setAttribute('aria-label', label); b.title = label;
    b.addEventListener('pointerdown', e => e.stopPropagation());
    dock.appendChild(b);
    return b;
  };
  const SPK = '<path d="M3 8v6h4l5 4V4L7 8H3z"/>';
  const OFF = '<line x1="16" y1="8" x2="22" y2="14"/><line x1="22" y1="8" x2="16" y2="14"/>';
  const ON  = '<path d="M15.5 8.5a4 4 0 0 1 0 5"/><path d="M18 6a7.5 7.5 0 0 1 0 10"/>';
  const wrap = inner => '<svg viewBox="0 0 24 22" aria-hidden="true">' + inner + '</svg>';

  const btnSound = mk('is-sound', wrap(SPK + OFF), 'Turn typing sound on');
  const btnAgain = mk('is-again',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 3v5h-5"/></svg>',
    'Play the intro again');
  document.body.appendChild(dock);

  let sound = store.get('sound') === '1';
  const paintSound = () => {
    btnSound.innerHTML = wrap(SPK + (sound ? ON : OFF));
    const l = sound ? 'Turn typing sound off' : 'Turn typing sound on';
    btnSound.setAttribute('aria-label', l); btnSound.title = l;
    btnSound.setAttribute('aria-pressed', String(sound));
  };
  paintSound();
  btnSound.addEventListener('click', async e => {
    e.stopPropagation();
    sound = !sound; store.set('sound', sound ? '1' : '0');
    if (sound && Keys) { await Keys.wake().catch(() => {}); Keys.key(); }
    paintSound();
  });
  btnAgain.addEventListener('click', e => { e.stopPropagation(); run(); });

  const portrait = document.querySelector('video.hero-bg');
  let holding = false;
  if (portrait) portrait.addEventListener('play', () => {
    if (holding) { portrait.pause(); portrait.currentTime = 0; }
  });

  let running = false, stopped = true, stage = null, para = null, node = null, prev = ' ';

  const put = ch => {
    if (node.lastChild && node.lastChild.nodeType === 3) node.lastChild.data += ch;
    else node.appendChild(document.createTextNode(ch));
  };
  const drop = () => {
    const last = node.lastChild; if (!last) return;
    if (last.nodeType === 3 && last.data.length > 1) last.data = last.data.slice(0, -1);
    else last.remove();
  };
  const audible = ch => ch === ' ' || Math.random() < SOUND_RATE;

  async function type(str, ms) {
    for (const ch of str) {
      if (stopped) return;
      put(ch);
      if (sound && Keys && audible(ch)) (ch === ' ' ? Keys.space : Keys.key)();
      prev = ch;
      await wait(ms ? ms() : pace());
      if (REST[ch]) await wait(REST[ch]);
    }
  }
  async function erase(n, ms = 34) {
    for (let i = 0; i < n; i++) {
      if (stopped) return;
      drop(); if (sound && Keys && Math.random() < 0.38) Keys.back();
      await wait(ms);
    }
  }

  function skip(e) { if (!e || !e.target.closest('.dock')) finish(); }

  function finish() {
    if (!running) return;
    running = false; stopped = true;
    stage?.remove(); stage = null;
    real.hidden = false;
    holding = false;
    if (portrait) portrait.play().catch(() => {});
    store.set('typed', '1');
    dock.classList.remove('is-playing');
    document.removeEventListener('pointerdown', skip);
    document.removeEventListener('keydown', skip);
    window.removeEventListener('wheel', skip);
    window.removeEventListener('touchmove', skip);
  }

  async function run() {
    if (running) return;
    running = true; stopped = false; prev = ' ';
    real.hidden = true;
    stage?.remove();
    stage = document.createElement('div');
    stage.className = 'say say-stage';
    stage.setAttribute('aria-hidden', 'true');
    real.parentNode.insertBefore(stage, real);
    para = document.createElement('p'); stage.appendChild(para); node = para;

    dock.classList.add('is-playing');
    if (sound && Keys) Keys.wake().catch(() => {});
    if (portrait) { holding = true; portrait.pause(); portrait.currentTime = 0; }

    document.addEventListener('pointerdown', skip);
    document.addEventListener('keydown', skip);
    window.addEventListener('wheel', skip, { passive: true });
    window.addEventListener('touchmove', skip, { passive: true });

    await wait(600);
    for (const step of SCRIPT) {
      if (stopped) return;
      if (step.t) await type(step.t);
      else if (step.a) {
        const link = document.createElement('a');
        link.href = step.a[0]; node.appendChild(link); node = link;
        await type(step.a[1]); node = para;
      }
      else if (step.typo) {
        await type(step.typo); await wait(300);
        await erase(step.typo.length); await type(step.fix);
      }
      else if (step.c) {
        await type(step.c[0]); await wait(520);
        await erase(step.c[0].length, 26); await wait(140);
        await type(step.c[1]);
      }
      else if (step.br) { node.appendChild(document.createElement('br')); prev = ' '; await wait(320); }
      else if (step.p) {
        await wait(560);
        para = document.createElement('p'); stage.appendChild(para); node = para; prev = ' ';
      }
    }
    await wait(700);
    finish();
  }

  if (store.get('typed') === '1') { if (portrait) portrait.play().catch(() => {}); }
  else run();
})();
