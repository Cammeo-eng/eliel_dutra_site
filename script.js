(() => {
  'use strict';

  /* ===== Configuração ===== */
  // Número do WhatsApp com DDI + DDD, só dígitos. Ex.: 5511987654321
  const WHATSAPP_NUMBER = '5541995694266';
  const WHATSAPP_MSG = 'Olá, Eliel! Vim pelo site e gostaria de agendar uma conversa.';

  const QUESTIONS = [
    'Você sente que carrega mais peso emocional do que consegue sustentar no dia a dia?',
    'Você percebe os mesmos conflitos ou dores se repetindo, mesmo quando tenta virar a página?',
    'Você tem dificuldade em se sentir bem com quem é, mesmo diante de conquistas?',
    'Alguma perda ou mudança do passado ainda pesa mais do que você gostaria?',
    'Seus relacionamentos mais próximos têm sido motivo de desgaste ultimamente?',
    'Falta um sentido claro para o que você está vivendo agora?',
    'Você sente falta da paz ou esperança que já teve em outros momentos da vida?'
  ];
  const SCALE = ['nunca', 'raramente', 'às vezes', 'frequentemente', 'quase sempre'];

  // Soma das 7 respostas (1–5 cada) = 7 a 35 pontos. Faixas: 7–13 · 14–20 · 21–27 · 28–35
  const RESULTS = [
    {
      max: 13,
      title: 'Você parece estar em um bom momento',
      text: 'Pelo que você me contou, parece que você tem conseguido atravessar bem o que a vida trouxe até aqui. Isso não quer dizer que não doeu — quer dizer que você encontrou seus próprios caminhos. E olha, mesmo assim, eu acredito que todo mundo merece um espaço só seu pra pensar em voz alta de vez em quando.'
    },
    {
      max: 20,
      title: 'Eu percebo alguns sinais que merecem seu cuidado',
      text: 'Pelas suas respostas, sinto que tem coisa pesando mais do que você talvez perceba no dia a dia. Isso não é fraqueza nenhuma — é só um sinal de que vale a pena a gente olhar com mais calma pra entender de onde isso vem.'
    },
    {
      max: 27,
      title: 'Eu acho que você já está carregando bastante coisa',
      text: 'Pelo que você compartilhou, dá pra ver que você tem lidado com bastante peso, e talvez com os mesmos ciclos se repetindo sem conseguir resolver sozinho. É exatamente esse tipo de raiz que eu gosto de ajudar a encontrar, com calma, no seu tempo.'
    },
    {
      max: 35,
      crisis: true,
      title: 'Você não precisa carregar isso sozinho, e eu quero te ouvir',
      text: 'Pelo que você me contou, parece que tem sido pesado demais ultimamente. E eu quero que você saiba: você não precisa ter todas as respostas prontas pra dar o primeiro passo. Só precisa de alguém disposto a caminhar com você até a raiz disso — e eu estou aqui pra isso.'
    }
  ];

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== WhatsApp ===== */
  $$('[data-wa]').forEach((a) => {
    const msg = a.dataset.waMsg || WHATSAPP_MSG;
    a.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    a.target = '_blank';
    a.rel = 'noopener';
  });

  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* ===== Copa da árvore: folhas ===== */
  const canopy = $('[data-canopy]');
  if (canopy) {
    const NS = 'http://www.w3.org/2000/svg';
    const LEAF = 'M0 -6 C3.4 -2.5 3.4 2.5 0 6 C-3.4 2.5 -3.4 -2.5 0 -6Z';
    const layers = $$('.sway', canopy);
    let seed = 11;
    const rand = () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    let count = 0;
    for (let tries = 0; count < 175 && tries < 6000; tries++) {
      const x = -6 + rand() * 312;
      const y = 28 + rand() * 152;
      const inCrown = ((x - 150) / 150) ** 2 + ((y - 120) / 56) ** 2 < 1;
      const inTop = ((x - 150) / 104) ** 2 + ((y - 80) / 50) ** 2 < 1;
      if (!inCrown && !inTop) continue;

      const angle = (Math.atan2(y - 196, x - 150) * 180) / Math.PI + 90 + (rand() - 0.5) * 60;
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(0)}) scale(${(0.75 + rand() * 0.8).toFixed(2)})`);

      const p = document.createElementNS(NS, 'path');
      const tone = rand();
      p.setAttribute('d', LEAF);
      p.setAttribute('class', 'leaf');
      p.setAttribute('fill', tone < 0.55 ? '#B8860B' : tone < 0.9 ? '#D9AE4F' : '#F2ECDF');
      p.setAttribute('fill-opacity', (tone < 0.9 ? 0.3 + rand() * 0.6 : 0.2 + rand() * 0.25).toFixed(2));
      const dist = Math.hypot(x - 150, y - 170) / 170;
      p.style.setProperty('--d', `${(1.25 + dist * 1.2 + rand() * 0.35).toFixed(2)}s`);

      g.appendChild(p);
      layers[count % layers.length].appendChild(g);
      count++;
    }
  }

  /* ===== Revelações ===== */
  const hero = $('#inicio');
  const heroItems = hero ? [$('[data-hero-art]', hero), ...$$('.wipe, .fade', hero)] : [];

  // Checagem por bounding box (IntersectionObserver ignora elementos 100% recortados por clip-path)
  let pending = $$('.wipe, .fade, [data-reveal]')
    .filter((el) => !heroItems.includes(el) && !el.closest('[data-quiz-stage], [data-quiz-result]'));

  function reveal() {
    if (!pending.length) return;
    const limit = innerHeight * 0.88;
    pending = pending.filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < limit && r.bottom > 0) {
        el.classList.add('is-in');
        return false;
      }
      return true;
    });
  }

  const replay = (el) => {
    el.style.transition = 'none';
    el.classList.remove('is-in');
    void el.offsetWidth;
    el.style.transition = '';
    el.classList.add('is-in');
  };

  const start = () => {
    if (document.body.classList.contains('is-ready')) return;
    document.body.classList.add('is-ready');
    heroItems.forEach((el) => el && el.classList.add('is-in'));
    measure();
  };

  /* ===== Linha-raiz de scroll ===== */
  const railRoot = $('[data-rail-root]');
  const railLine = $('.rail-line', railRoot);
  const railTip = $('.rail-tip', railRoot);
  const sections = $$('[data-rail]');
  const lightSections = $$('[data-light]');
  const nodes = sections.map((s) => {
    const a = document.createElement('a');
    a.className = 'rail-node';
    a.href = `#${s.id}`;
    a.tabIndex = -1;
    a.innerHTML = `<span class="rail-label">${s.dataset.rail}</span>`;
    railRoot.appendChild(a);
    return a;
  });
  let fracs = [];

  const topbar = $('[data-topbar]');
  const dock = $('[data-dock]');
  const art = $('[data-hero-art]');
  const quizSection = $('#autoavaliacao');
  const contact = $('#contato');

  function measure() {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    fracs = sections.map((s, i) => {
      if (i === 0) return 0;
      const top = s.getBoundingClientRect().top + scrollY;
      return clamp((top - innerHeight * 0.5) / max);
    });
    nodes.forEach((n, i) => { n.style.top = `${fracs[i] * 100}%`; });
    update();
  }

  function update() {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const p = clamp(scrollY / max);

    reveal();

    railLine.style.transform = `scaleY(${p})`;
    railTip.style.top = `${p * 100}%`;

    let current = 0;
    nodes.forEach((n, i) => {
      const lit = p >= fracs[i] - 0.001;
      n.classList.toggle('is-lit', lit);
      if (lit) current = i;
    });
    nodes.forEach((n, i) => n.classList.toggle('is-current', i === current));

    const mid = innerHeight * 0.5;
    const onLight = lightSections.some((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= mid && r.bottom >= mid;
    });
    railRoot.classList.toggle('on-light', onLight);

    if (topbar) {
      topbar.classList.toggle('is-scrolled', scrollY > 24);
      const topOnLight = lightSections.some((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= 40 && r.bottom >= 40;
      });
      topbar.classList.toggle('is-light', topOnLight);
    }

    if (art && hero) {
      art.style.setProperty('--settle', clamp(scrollY / (hero.offsetHeight * 0.55)).toFixed(3));
    }

    if (dock && hero) {
      const vh = innerHeight;
      const q = quizSection.getBoundingClientRect();
      const c = contact.getBoundingClientRect();
      const inQuiz = q.top < vh * 0.8 && q.bottom > vh * 0.2;
      const nearEnd = c.top < vh * 0.9;
      dock.classList.toggle('is-shown', scrollY > hero.offsetHeight * 0.7 && !inQuiz && !nearEnd);
    }
  }

  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });
  addEventListener('resize', measure);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);

  /* ===== Autoavaliação ===== */
  const quiz = $('[data-quiz]');
  if (quiz) {
    const intro = $('[data-quiz-intro]', quiz);
    const stage = $('[data-quiz-stage]', quiz);
    const result = $('[data-quiz-result]', quiz);
    const qEl = $('[data-quiz-q]', quiz);
    const countEl = $('[data-quiz-count]', quiz);
    const stepsEl = $('[data-quiz-steps]', quiz);
    const scaleEl = $('[data-quiz-scale]', quiz);
    const backBtn = $('[data-quiz-back]', quiz);

    let index = 0;
    let answers = [];
    let locked = false;

    QUESTIONS.forEach(() => stepsEl.appendChild(document.createElement('i')));

    const options = SCALE.map((label, k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', 'false');
      b.dataset.value = String(k + 1);
      b.innerHTML = `<span class="opt-n">${k + 1}</span><span class="opt-l">${label}</span>`;
      b.addEventListener('click', () => choose(k + 1));
      scaleEl.appendChild(b);
      return b;
    });

    function render() {
      qEl.textContent = QUESTIONS[index];
      reduceMotion ? qEl.classList.add('is-in') : replay(qEl);
      countEl.textContent = `Pergunta ${index + 1} de ${QUESTIONS.length}`;
      [...stepsEl.children].forEach((s, k) => {
        s.classList.toggle('is-done', k < index);
        s.classList.toggle('is-current', k === index);
      });
      options.forEach((b) => b.setAttribute('aria-checked', String(answers[index] === Number(b.dataset.value))));
      backBtn.hidden = index === 0;
      locked = false;
    }

    function choose(value) {
      if (locked) return;
      locked = true;
      answers[index] = value;
      options.forEach((b) => b.setAttribute('aria-checked', String(Number(b.dataset.value) === value)));
      setTimeout(() => {
        if (index < QUESTIONS.length - 1) {
          index++;
          render();
        } else {
          showResult();
        }
      }, 420);
    }

    function begin() {
      index = 0;
      answers = [];
      intro.hidden = true;
      result.hidden = true;
      stage.hidden = false;
      render();
      quiz.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      qEl.focus({ preventScroll: true });
    }

    function showResult() {
      const total = answers.reduce((a, b) => a + b, 0);
      const band = RESULTS.find((r) => total <= r.max);
      stage.hidden = true;
      result.hidden = false;

      $('[data-quiz-score]', result).textContent = `${total} de 35 pontos`;
      const title = $('[data-quiz-title]', result);
      title.textContent = band.title;
      $('[data-quiz-text]', result).textContent = band.text;
      $('[data-quiz-crisis]', result).hidden = !band.crisis;

      const marker = $('[data-quiz-marker]', result);
      marker.style.transition = 'none';
      marker.style.left = '0%';
      void marker.offsetWidth;
      marker.style.transition = '';
      setTimeout(() => { marker.style.left = `${((total - 7) / 28) * 100}%`; }, 40);

      reduceMotion ? title.classList.add('is-in') : replay(title);
      quiz.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      title.focus({ preventScroll: true });
    }

    $('[data-quiz-start]', quiz).addEventListener('click', begin);
    $('[data-quiz-restart]', quiz).addEventListener('click', begin);
    backBtn.addEventListener('click', () => {
      if (index === 0) return;
      index--;
      render();
    });

    // atalho de teclado: 1–5
    addEventListener('keydown', (e) => {
      if (stage.hidden || e.altKey || e.ctrlKey || e.metaKey) return;
      if (/^[1-5]$/.test(e.key)) choose(Number(e.key));
    });
  }

  /* ===== Início ===== */
  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([ready, new Promise((r) => setTimeout(r, 900))]).then(() => requestAnimationFrame(start));
  measure();
})();
