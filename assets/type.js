/* Rejeu de frappe sur l'accueil.
   Principe : le texte final est déjà dans le HTML (moteurs, lecteurs d'écran,
   navigation sans JS). Ce script le masque, rejoue l'écriture par-dessus, puis
   rend la main au vrai texte. Il ne joue qu'une fois par visiteur, et n'importe
   quelle interaction l'interrompt. */
(() => {
  const real = document.querySelector('.say');
  if (!real) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Le texte reste écrit tant qu'on est dans la même journée. On le rejoue
     si le visiteur revient un autre jour — pas à chaque rechargement. */
  const today = new Date().toLocaleDateString('en-CA');   // AAAA-MM-JJ, heure locale
  let seen = false;
  try { seen = localStorage.getItem('typed') === today; } catch (e) {}
  if (reduced || seen) return;

  const L = {                       // les URL sont lues sur le vrai texte
    yt:   real.querySelector('a[href*="youtube"]')?.href   || '#',
    book: '/book/',
    co:   real.querySelector('a[href*="salutcompany"]')?.href || '#',
    li:   real.querySelector('a[href*="linkedin"]')?.href  || '#',
    malt: real.querySelector('a[href*="malt"]')?.href      || '#',
    ig:   real.querySelector('a[href*="instagram"]')?.href || '#',
    lab:  '/lab/', contact: '/contact/',
  };

  // t = texte · a = lien · c = correction (mot pensé -> mot écrit) · br / p = sauts
  const SCRIPT = [
    { t: 'I’m Alexis Gabriel A' }, { typo: 'ïnozu', fix: 'ïnouz' },
    { t: ' — Alex is fine.' }, { br: 1 },
    { t: 'I started making ' },
    { c: ['pathological', 'obsessive'] },
    { t: ' food films on ' }, { a: [L.yt, 'YouTube'] },
    { t: ', 235 million views ago. Along the way I wrote ' },
    { a: [L.book, 'a bestselling cookbook'] },
    { t: ', and started ' }, { a: [L.co, 'a company'] },
    { t: ' that makes ' }, { c: ['expensive', 'dream'] },
    { t: ' tools for cooks.' }, { p: 1 },

    { t: 'I have been an ' }, { a: [L.li, 'entrepreneur'] },
    { t: ' for more than ' }, { typo: 'twenyt', fix: 'twenty' },
    { t: ' years. I now ' }, { a: [L.malt, 'freelance'] },
    { t: ' with teams who need ' },
    { c: ['help', 'creativity'] },
    { t: ', and spend the rest of my time ' },
    { a: [L.lab, 'finding solutions to problems nobody else has'] },
    { t: '.' }, { p: 1 },

    { a: [L.contact, 'Here is how to reach out to me'] }, { t: '.' },
  ];

  /* Le portrait sourit en boucle : pendant la frappe il entre en concurrence
     avec la lecture. On le fige sur l'image sérieuse, et on lance la boucle
     quand le texte est posé — le sourire arrive avec la dernière phrase. */
  const portrait = document.querySelector('video.hero-bg');
  let holding = true;                 // le drapeau évite que le garde-fou
  if (portrait) {                     // ne reprenne notre propre commande de lecture
    const hold = () => { if (holding) { portrait.pause(); portrait.currentTime = 0; } };
    hold();
    portrait.addEventListener('play', hold);
  }

  /* Bruit de frappe, synthétisé au vol : une bouffée de bruit filtrée, très
     courte. Aucun fichier à télécharger. Les navigateurs interdisent le son
     tant que le visiteur n'a pas cliqué quelque part : si c'est refusé, la
     frappe se joue simplement en silence. */
  const Keys = (() => {
    let ac = null;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    if (!ac) return null;

    const noise = ac.createBuffer(1, ac.sampleRate * 0.06, ac.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    const hit = (level, cut, decay) => {
      if (ac.state !== 'running') return;
      const src = ac.createBufferSource(); src.buffer = noise;
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass';
      lp.frequency.value = cut * (0.88 + Math.random() * 0.24);
      const g = ac.createGain();
      const t = ac.currentTime;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(level * (0.8 + Math.random() * 0.4), t + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      src.connect(lp); lp.connect(g); g.connect(ac.destination);
      src.start(t); src.stop(t + decay + 0.01);
    };

    return {
      ctx:   ac,
      ready: () => ac.state === 'running',
      wake:  () => ac.resume(),
      key:   () => hit(0.040, 2100, 0.030),   // touche ordinaire
      space: () => hit(0.050, 1250, 0.045),   // barre d'espace, plus sourde
      back:  () => hit(0.028, 1500, 0.026),   // effacement, plus mat
      off:   () => { try { ac.close(); } catch (e) {} },
    };
  })();

  /* Petit bouton dans un coin. Il est créé en JavaScript : sans JS il n'existe
     pas, et il disparaît avec l'animation — un réglage de son inerte sur une
     page silencieuse ne sert à rien. Il est exclu du raccourci « tout afficher »,
     sinon le clic qui allume le son terminerait la frappe au même instant. */
  let sound = false;
  try { sound = localStorage.getItem('sound') === '1'; } catch (e) {}

  const SPK = '<path d="M3 8v6h4l5 4V4L7 8H3z"/>';
  const OFF = '<line x1="16" y1="8" x2="22" y2="14"/><line x1="22" y1="8" x2="16" y2="14"/>';
  const ON  = '<path d="M15.5 8.5a4 4 0 0 1 0 5"/><path d="M18 6a7.5 7.5 0 0 1 0 10"/>';

  const btn = document.createElement('button');
  btn.className = 'sound-toggle';
  btn.type = 'button';
  const paint = () => {
    btn.innerHTML = '<svg viewBox="0 0 24 22" aria-hidden="true">' + SPK + (sound ? ON : OFF) + '</svg>';
    btn.setAttribute('aria-label', sound ? 'Turn typing sound off' : 'Turn typing sound on');
    btn.title = btn.getAttribute('aria-label');
    btn.setAttribute('aria-pressed', String(sound));
  };
  paint();
  btn.addEventListener('pointerdown', e => e.stopPropagation());
  btn.addEventListener('click', async e => {
    e.stopPropagation();
    sound = !sound;
    try { localStorage.setItem('sound', sound ? '1' : '0'); } catch (err) {}
    if (sound && Keys) { await Keys.wake().catch(() => {}); Keys.key(); }
    paint();
  });
  document.body.appendChild(btn);
  if (sound && Keys) Keys.wake().catch(() => {});

  const stage = document.createElement('div');
  stage.className = 'say say-stage';
  stage.setAttribute('aria-hidden', 'true');
  real.hidden = true;
  real.parentNode.insertBefore(stage, real);

  let para = document.createElement('p');
  stage.appendChild(para);
  let node = para;                                  // où l'on écrit en ce moment
  let stopped = false;

  const wait = ms => new Promise(r => setTimeout(r, ms));
  const pace = () => 30 + Math.random() * 30;       // frappe irrégulière, calée sur la lecture

  /* On ne lit pas à vitesse constante : on souffle à chaque ponctuation.
     C'est ce silence-là qui rend la frappe lisible plutôt que pressée. */
  const REST = { '.': 540, '!': 540, '?': 540, ':': 300, ';': 300, ',': 190, '—': 240 };

  const put = ch => {
    if (node.lastChild && node.lastChild.nodeType === 3) node.lastChild.data += ch;
    else node.appendChild(document.createTextNode(ch));
  };
  const drop = () => {
    const last = node.lastChild;
    if (!last) return;
    if (last.nodeType === 3 && last.data.length > 1) last.data = last.data.slice(0, -1);
    else last.remove();
  };

  async function type(str, ms) {
    for (const ch of str) {
      if (stopped) return;
      put(ch);
      if (sound && Keys) (ch === ' ' ? Keys.space : Keys.key)();
      await wait(ms ? ms() : pace());
      if (REST[ch]) await wait(REST[ch]);
    }
  }
  async function erase(n, ms = 34) {
    for (let i = 0; i < n; i++) { if (stopped) return; drop(); if (sound && Keys) Keys.back(); await wait(ms); }
  }

  function finish() {
    stopped = true;
    stage.remove();
    btn.remove();
    if (Keys) Keys.off();
    holding = false;
    if (portrait) portrait.play().catch(() => {});
    real.hidden = false;
    try { localStorage.setItem('typed', today); } catch (e) {}
    document.removeEventListener('pointerdown', finish);
    document.removeEventListener('keydown', finish);
    window.removeEventListener('wheel', finish);
    window.removeEventListener('touchmove', finish);
  }
  document.addEventListener('pointerdown', e => { if (!e.target.closest('.sound-toggle')) finish(); });
  document.addEventListener('keydown', finish);
  window.addEventListener('wheel', finish, { passive: true });
  window.addEventListener('touchmove', finish, { passive: true });

  (async () => {
    await wait(600);
    for (const step of SCRIPT) {
      if (stopped) return;

      if (step.t) { await type(step.t); }

      else if (step.a) {                            // on écrit à l'intérieur du lien
        const [href, label] = step.a;
        const link = document.createElement('a');
        link.href = href;
        node.appendChild(link);
        node = link;
        await type(label);
        node = para;
      }

      else if (step.typo) {                         // faute, temps mort, correction
        await type(step.typo);
        await wait(300);
        await erase(step.typo.length);
        await type(step.fix);
      }

      else if (step.c) {                            // le mot pensé, puis le mot choisi
        const [thought, chosen] = step.c;
        await type(thought);
        await wait(520);                            // le temps de se relire
        await erase(thought.length, 26);
        await wait(140);
        await type(chosen);
      }

      else if (step.br) { node.appendChild(document.createElement('br')); await wait(320); }

      else if (step.p) {
        await wait(560);
        para = document.createElement('p');
        stage.appendChild(para);
        node = para;
      }
    }
    await wait(700);
    if (!stopped) finish();
  })();
})();
