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

  /* ---------- le son : de vraies frappes, échantillonnées ----------
     assets/keys.mp3 contient 18 frappes réelles mises bout à bout, une par
     fente de 220 ms, rangées du timbre le plus grave au plus aigu. Une
     synthèse ne peut pas imiter un clavier : un clavier, ce n'est pas un
     son dont les paramètres varient, c'est trente touches physiquement
     différentes. D'où la banque.                                          */
  const Keys = (() => {
    let ac = null;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    if (!ac) return null;

    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -6; comp.knee.value = 10;
    comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.05;
    const bus = ac.createGain();
    bus.connect(comp); comp.connect(ac.destination);

    const SLOT = 0.220, N = 18, DUR = 0.155;
    const LEVEL = 0.38;          // les échantillons sont normalisés à 0,85 de crête
    let buf = null, at = null, loading = null;

    const load = () => loading ||= fetch('/assets/keys.mp3')
      .then(r => r.arrayBuffer())
      .then(d => ac.decodeAudioData(d))
      .then(b => {
        buf = b;
        /* L'encodage MP3 décale tout d'un silence de tête variable. Plutôt
           que de le supposer, on retrouve l'attaque réelle dans chaque fente. */
        const d2 = b.getChannelData(0), sr = b.sampleRate, ns = Math.round(SLOT * sr);
        at = [];
        for (let i = 0; i < N; i++) {
          const s0 = i * ns, s1 = Math.min(s0 + ns, d2.length);
          let pk = 0;
          for (let j = s0; j < s1; j++) { const v = Math.abs(d2[j]); if (v > pk) pk = v; }
          let k = s0;
          for (let j = s0; j < s1; j++) if (Math.abs(d2[j]) > pk * 0.06) { k = j; break; }
          at.push(Math.max(s0, k - Math.round(0.002 * sr)) / sr);
        }
      })
      .catch(() => { buf = null; });

    /* Trois familles puisées dans la même banque : les graves pour la barre
       d'espace, le milieu pour les lettres, les plus secs pour l'effacement. */
    const pick = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
    const play = (i, mul) => {
      if (!buf || ac.state !== 'running') return;
      const src = ac.createBufferSource(); src.buffer = buf;
      src.playbackRate.value = 0.94 + Math.random() * 0.13;
      const g = ac.createGain();
      g.gain.value = LEVEL * mul * (0.82 + Math.random() * 0.34);
      src.connect(g); g.connect(bus);
      src.start(ac.currentTime, at[i], DUR);
    };
    return {
      wake:  () => { load(); return ac.resume(); },
      key:   () => play(pick(3, 15), 1),
      space: () => play(pick(0, 2),  1.2),
      back:  () => play(pick(12, 17), 1.05),
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
  /* Une frappe humaine n'est pas métronomique : des rafales courtes, puis
     une hésitation — on cherche un mot, on repositionne la main. Une plage
     unique et étroite recrée une pulsation régulière, qu'on entend comme
     mécanique quelles que soient les bornes.                              */
  const pace = () => Math.random() < 0.06
    ? 120 + Math.random() * 160      // l'hésitation, rare mais franche
    : 24  + Math.random() * 40;      // le flux courant

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

  /* Le curseur d'un éditeur est fixe tant qu'on tape et se remet à clignoter
     dès qu'on s'arrête. C'est ce contraste qui donne à voir l'hésitation —
     un clignotement continu, lui, ne signale rien.                         */
  let idle = null;
  const tick = () => {
    stage?.classList.add('is-typing');
    clearTimeout(idle);
    idle = setTimeout(() => stage?.classList.remove('is-typing'), 160);
  };

  async function type(str, ms) {
    for (const ch of str) {
      if (stopped) return;
      put(ch);
      if (sound && Keys && audible(ch)) (ch === ' ' ? Keys.space : Keys.key)();
      tick();
      prev = ch;
      await wait(ms ? ms() : pace());
      if (REST[ch]) await wait(REST[ch]);
    }
  }
  /* L'effacement est le seul moment où la frappe redevient une rafale : on a
     regardé le mot, on a décidé qu'il n'allait pas, et le doigt reste appuyé.
     Chaque retour arrière sonne, et vite. C'est le contraste avec le reste
     qui le rend lisible.                                                    */
  async function erase(n, ms = 24) {
    for (let i = 0; i < n; i++) {
      if (stopped) return;
      drop(); if (sound && Keys) Keys.back();
      tick();
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
        await type(step.c[0]); await wait(760);
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
