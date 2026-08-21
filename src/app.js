/* Clawmark - Twitch Shoutout Overlay for OBS
 * Created by Hardclaws · twitch.tv/hardclaws · thehardclaws@gmail.com
 * MIT licence. Free to use, modify and fork.
 */
/* =============================================================
   OVERLAY APP - config, queue, commands, render.
   ============================================================= */
(function () {
  'use strict';

  const qs = new URLSearchParams(location.search);
  const q = (k, d) => (qs.has(k) ? qs.get(k) : d);
  const qb = (k, d) => (qs.has(k) ? qs.get(k) === '1' || qs.get(k) === 'true' : d);
  const qn = (k, d) => (qs.has(k) ? +qs.get(k) : d);

  const CFG = {
    channel: (q('channel', '') || '').toLowerCase(),
    clientId: q('client_id', ''),
    token: q('token', ''),
    command: (q('cmd', 'so') || 'so').replace(/^!/, ''),
    layout: q('layout', 'banner'),
    genSpec: q('lg', ''),          // base64 generated-layout spec
    asset: q('asset', ''),         // custom ornament image (URL or relative path)
    backplate: q('backplate', ''), // custom backdrop image behind the info block
    skin: q('skin', 'twitch-purple'),
    skinCustom: q('sk', ''),          // base64 generated skin opts
    skinExplicit: q('sx', ''),        // base64 explicit-token skin (theme editor)
    /* Default to a transparent background. An OBS browser source composites
       over your scene, so a solid fill is almost never what is wanted, and it
       is the single most confusing failure mode when it is wrong. */
    transparency: q('bg', 'panels'),  // none | panels | full
    holdInfo: q('hold_info', ''),     // always|long|medium|short - clears the info panel
    detail: q('detail', ''),          // minimal|standard|rich - how much data is shown
    fit: q('fit', ''),                // cover|contain - video cropping
    /* How the clip is framed against the info panels.
       smart  = move the clip into the layout's measured clear area so no
                panel ever sits on the picture. Default: the panels were
                covering up to 47% of the video before this existed.
       cover  = old behaviour, clip fills the canvas and panels overlay it
       shrink = smart, at 88% scale, for very busy scenes */
    videoFit: q('videofit', 'smart'),  // smart | cover | shrink
    backdrop: q('backdrop', ''),      // none|blur|dim|scrim - behind the info block
    expand: qb('expand', false),      // grow the clip when the info clears
    randomPool: q('pool', ''),        // comma-separated layout ids to pick from
    size: q('size', ''),              // 1920x1080 | 1280x720 | 960x540 | 640x360
    textScale: qn('textscale', 0),    // manual override, % (e.g. 130)
    poolForce: q('force', ''),        // preview only: always show this pool entry

    showClip: qb('clip', true),
    preferFeatured: qb('featured', false),
    profileFallback: qb('fallback', true),
    autoRaid: qb('raid', false),
    raidCount: qn('raidcount', 0),      // min viewers to trigger
    raidDelay: qn('raiddelay', 0),      // seconds to wait before firing
    days: qn('days', 0),
    maxDuration: qn('max', 60),
    minDuration: qn('min', 0),
    modsOnly: qb('mods', false),
    vipsOnly: qb('vips', false),
    volume: qn('vol', 70) / 100,
    muted: qb('mute', false),
    kicker: q('kicker', 'Go check out {channel}'),
    cta: q('cta', 'Go give them a follow'),
    tag: q('tag', ''),
    holdMs: qn('hold', 8000),          // dwell when no clip
    showProgress: qb('progress', true),
    chatMsg: q('chatmsg', ''),
    debug: qb('debug', false),
    /* Optional on-stream credit badge. OFF by default on purpose: anyone who
       forks this should not unknowingly broadcast someone else's name. Turn it
       on with credit=1, or set your own text with credit=Your%20Name. */
    credit: q('credit', ''),
  };

  const stage = document.getElementById('stage');
  const log = (...a) => { if (CFG.debug) console.log('[shoutout]', ...a); };

  /* inline default avatar - works with no network (OBS/iframe safe) */
  const DEMO_AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2a1a4a"/><stop offset="1" stop-color="#12203a"/></linearGradient></defs>
      <rect width="200" height="200" fill="url(#g)"/>
      <circle cx="100" cy="78" r="34" fill="#8a7fd6"/>
      <path d="M28 190c0-40 32-64 72-64s72 24 72 64z" fill="#8a7fd6"/>
    </svg>`);

  /* ---------------- render size & text scale ----------------
     The overlay is authored at 1920x1080. When the browser source is
     smaller, type that is fine at full size becomes unreadable. We scale
     the whole 1920x1080 canvas down to fit, then push type back UP by a
     compensating factor so it stays legible at the smaller size. */
  function applySize() {
    const SIZES = {
      '1920x1080': [1920, 1080, 1.00],
      '1280x720':  [1280, 720,  1.14],
      '960x540':   [960,  540,  1.30],
      '854x480':   [854,  480,  1.38],
      '640x360':   [640,  360,  1.55],
    };
    const key = SIZES[CFG.size] ? CFG.size : null;
    const [w, h, boost] = key ? SIZES[key] : [1920, 1080, 1.00];

    const root = document.documentElement;
    root.style.setProperty('--canvas-w', w + 'px');
    root.style.setProperty('--canvas-h', h + 'px');
    const scale = CFG.textScale ? CFG.textScale / 100 : boost;
    root.style.setProperty('--text-scale', String(scale));
    root.setAttribute('data-size', key || '1920x1080');

    if (key && key !== '1920x1080') {
      document.body.classList.add('scaled');
      const f = w / 1920;
      stage.style.transform = `scale(${f})`;
      stage.style.transformOrigin = 'top left';
      document.body.style.width = w + 'px';
      document.body.style.height = h + 'px';
    }
    log('size', key || '1920x1080', 'text scale', scale);
  }
  applySize();

  /* custom image assets - AI-generated or hand-made.
     Kept as URLs, never inlined: a data-URI image would blow past the
     practical length limit for an OBS browser-source URL. */
  window.SHOUTOUT_ASSET = { ornament: CFG.asset, backplate: CFG.backplate };

  /* ---------------- skin ---------------- */
  function applySkin() {
    let skin;
    if (CFG.skinExplicit) {
      try {
        const o = JSON.parse(atob(CFG.skinExplicit));
        if (CFG.transparency) o.transparency = CFG.transparency;
        skin = Skins.customSkin(o);
      } catch (e) { skin = Skins.presetSkin(CFG.skin); }
      skin.apply(document.documentElement);
      return skin;
    }
    if (CFG.skinCustom) {
      try { skin = Skins.generateSkin(JSON.parse(atob(CFG.skinCustom))); }
      catch (e) { skin = Skins.presetSkin(CFG.skin); }
    } else {
      skin = Skins.presetSkin(CFG.skin);
    }
    skin.apply(document.documentElement);
    // transparency can be forced on any preset/generated skin
    if (CFG.transparency && CFG.transparency !== 'none') {
      document.documentElement.setAttribute('data-transparency', CFG.transparency);
      document.documentElement.style.setProperty('--bg', 'transparent');
      document.documentElement.style.setProperty('--panel-alpha',
        CFG.transparency === 'full' ? '0' : '1');
    } else {
      document.documentElement.setAttribute('data-transparency', 'none');
    }
    return skin;
  }
  const SKIN = applySkin();

  /* motif glyph svg */
  const MOTIF_SVG = {
    d20: `<svg viewBox="0 0 100 100"><polygon points="50,4 92,28 92,72 50,96 8,72 8,28" fill="none" stroke="currentColor" stroke-width="7"/><text x="50" y="68" text-anchor="middle" font-family="Georgia,serif" font-size="38" font-weight="700" fill="currentColor">20</text></svg>`,
    hex: `<svg viewBox="0 0 100 100"><polygon points="50,4 92,28 92,72 50,96 8,72 8,28" fill="none" stroke="currentColor" stroke-width="8"/></svg>`,
    circuit: `<svg viewBox="0 0 100 100"><polygon points="50,8 88,30 88,70 50,92 12,70 12,30" fill="none" stroke="currentColor" stroke-width="7"/><circle cx="50" cy="50" r="12" fill="currentColor"/></svg>`,
    /* Hardclaws mark: five tapered claw slashes, longest in the middle,
       fanned like the logo. Uses currentColor so it inherits the theme. */
    claw: `<svg viewBox="0 0 100 100"><g fill="currentColor">
      <path d="M14 12 C19 34 22 58 21 86 C17 60 14 36 14 12 Z"/>
      <path d="M32 6  C38 32 41 60 40 92 C35 62 32 32 32 6 Z"/>
      <path d="M50 2  C57 30 60 62 59 96 C53 64 50 30 50 2 Z"/>
      <path d="M68 6  C74 32 76 60 75 92 C70 62 68 32 68 6 Z"/>
      <path d="M86 12 C91 34 93 58 92 86 C88 60 86 36 86 12 Z"/>
    </g></svg>`,
  };
  function motifHTML() {
    const m = SKIN.motif;
    if (!m || m === 'none') return '';
    if (MOTIF_SVG[m]) return MOTIF_SVG[m];
    const g = (Skins.MOTIFS[m] || {}).glyph || '';
    return `<span style="font-size:30px;line-height:1">${g}</span>`;
  }

  /* ---------------- template strings ---------------- */
  const tpl = (s, d) =>
    String(s || '')
      .replace(/\{channel\}/g, d.user.name)
      .replace(/\{url\}/g, d.user.url)
      .replace(/\{game\}/g, d.user.game || '')
      .replace(/\{title\}/g, d.user.title || '')
      .replace(/\{creator_name\}/g, d.clip ? d.clip.creator : '')
      .replace(/\{created_at\}/g, d.clip ? d.clip.created : '');

  /* ---------------- data assembly ---------------- */
  const FORCE_DEMO = qb('demo', false);
  /* Helix is OPTIONAL and only used when the user supplied credentials.
     The default data source is public GQL, which needs nothing at all. */
  const api = (!FORCE_DEMO && CFG.clientId && CFG.token) ? Twitch.Api(CFG.clientId, CFG.token) : null;
  const gql = FORCE_DEMO ? null : Twitch.Gql();
  let shoutCount = 0;

  async function build(login) {
    const d = {
      user: { login: String(login).toLowerCase(), name: login, url: 'twitch.tv/' + login, avatar: '', bio: '', game: '', title: '', followers: null, years: null, created: '', live: false, lang: '', badge: '' },
      clip: null, muted: CFG.muted, index: String(++shoutCount).padStart(2, '0'), copy: {},
    };

    if (gql) {
      /* ---------- default path: public GQL, no credentials ---------- */
      const u = await gql.user(login, { days: CFG.days, limit: 40 });
      if (!u) throw new Error('No such user: ' + login);

      d.user.name = u.displayName || u.login;
      d.user.login = u.login;
      d.user.url = 'twitch.tv/' + u.login;
      d.user.avatar = u.profileImageURL || '';
      d.user.bio = u.description || '';
      if (u.roles && u.roles.isPartner) d.user.badge = 'Partner';
      else if (u.roles && u.roles.isAffiliate) d.user.badge = 'Affiliate';
      if (u.createdAt) {
        const c = new Date(u.createdAt);
        d.user.created = c.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
        d.user.years = Math.max(1, Math.floor((Date.now() - c) / 3.156e10));
      }
      if (u.followers && typeof u.followers.totalCount === 'number') {
        d.user.followers = u.followers.totalCount;
      }
      const lb = u.lastBroadcast || {};
      d.user.game = (lb.game && lb.game.name) || '';
      d.user.title = lb.title || '';
      if (u.stream) {
        d.user.live = true;
        if (u.stream.game && u.stream.game.name) d.user.game = u.stream.game.name;
        if (u.stream.title) d.user.title = u.stream.title;
      }

      if (CFG.showClip) {
        let nodes = ((u.clips && u.clips.edges) || []).map((e) => e.node).filter(Boolean);
        if (CFG.maxDuration) {
          const fits = nodes.filter((c) => c.durationSeconds <= CFG.maxDuration);
          if (fits.length) nodes = fits;
        }
        if (nodes.length) {
          const c = nodes[Math.floor(Math.random() * nodes.length)];
          const src = await gql.clipSource(c.slug, 1080).catch(() => null);
          if (src) {
            d.clip = {
              src,
              title: c.title,
              views: c.viewCount,
              duration: Math.round(c.durationSeconds),
              creator: (c.curator && c.curator.displayName) || 'someone',
              created: new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
            };
          }
        }
      }

      /* Helix, if credentials were given, only fills gaps GQL missed */
      if (api) {
        try {
          const hu = await api.user(login);
          if (hu) {
            if (!d.user.avatar) d.user.avatar = hu.profile_image_url;
            if (!d.user.bio) d.user.bio = hu.description || '';
            if (d.user.followers == null) {
              const f = await api.followers(hu.id);
              if (f != null) d.user.followers = f;
            }
          }
        } catch (e) { log('helix supplement skipped:', e.message); }
      }
    } else {
      // ---- demo mode: no credentials, synthesise a plausible channel ----
      Object.assign(d.user, {
        name: 'NovaStrike', login: 'novastrike', url: 'twitch.tv/novastrike',
        avatar: DEMO_AVATAR,
        bio: 'Aussie Zwift racer, WTRL Tuesdays, coffee-powered. Sub goal: one more watt.',
        game: 'Zwift', title: 'WTRL TTT - Zone 5 and regret',
        followers: 48214, years: 6, created: 'Mar 2019', live: true, lang: 'en',
        badge: 'Partner',
      });
      if (qb('nodata', false)) {
        // simulate the sparsest possible channel: no bio, clip, followers, game
        Object.assign(d.user, { bio: '', game: '', title: '', followers: null,
          years: null, badge: '', live: false });
      }
      if (CFG.showClip && !qb('noclip', false) && !qb('nodata', false)) {
        d.clip = { src: '', title: 'Absolutely cooked on the final ramp', views: 12402,
          duration: 32, creator: 'wheelspinwendy', created: 'Apr 2025' };
        d.demoClip = true;
      }
    }

    d.copy = {
      kicker: tpl(CFG.kicker, d),
      cta: tpl(CFG.cta, d),
      tag: CFG.tag ? tpl(CFG.tag, d) : (CFG.channel ? CFG.channel.toUpperCase() : 'SHOUTOUT'),
    };
    return d;
  }

  /* ---------------- render ---------------- */
  let current = null, timer = null, holdTimer = null, lastLayoutId = null, activePoolOpts = null;

  /* Pool entries may carry their own options:
       id                       inherit the global options
       id-m-s-n-b-1             detail-hold-fit-backdrop-expand
     Single letters keep the URL short enough for an OBS field.       */
  const DET = { m: 'minimal', s: 'standard', r: 'rich' };
  const HLD = { a: 'always', l: 'long', m: 'medium', s: 'short' };
  const FIT = { c: 'cover', n: 'contain' };
  const BKD = { b: 'blur', d: 'dim', s: 'scrim', n: 'none' };

  function parsePool() {
    if (!CFG.randomPool) return [];
    return CFG.randomPool.split(',').map((raw) => {
      const bits = raw.trim().split('-');
      const id = bits[0];
      if (!id || !Layouts.all.some((l) => l.id === id)) return null;
      const at = (i, map) => (bits[i] && bits[i] !== '_' ? map[bits[i]] : '');
      return {
        id,
        detail: at(1, DET),
        hold: at(2, HLD),
        fit: at(3, FIT),
        backdrop: at(4, BKD),
        expand: bits[5] === '1' ? true : bits[5] === '0' ? false : null,
      };
    }).filter(Boolean);
  }

  function pickLayout() {
    const pool = parsePool();
    if (!pool.length) return null;
    /* The builder passes force= so the preview shows the layout you just
       clicked rather than a random one. Never used in a live overlay. */
    if (CFG.poolForce) {
      const forced = pool.find((x) => x.id === CFG.poolForce);
      if (forced) { lastLayoutId = forced.id; activePoolOpts = forced; return Layouts.byId(forced.id); }
    }
    let pick = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && pick.id === lastLayoutId) {
      const rest = pool.filter((x) => x.id !== lastLayoutId);
      pick = rest[Math.floor(Math.random() * rest.length)];
    }
    lastLayoutId = pick.id;
    activePoolOpts = pick;
    return Layouts.byId(pick.id);
  }

  function render(d) {
    let layout;
    const rnd = pickLayout();
    if (rnd) {
      layout = rnd;
      log('random layout ->', rnd.id);
    } else
    if (CFG.genSpec) {
      try { layout = LayoutGen.fromSpec(JSON.parse(atob(CFG.genSpec))); }
      catch (e) { layout = Layouts.byId(CFG.layout); }
    } else {
      layout = Layouts.byId(CFG.layout);
    }
    stage.className = '';
    document.body.classList.toggle('demo', !!d.demoClip);
    // nodemobg=1 suppresses demo-only preview backdrops (used by the
    // transparency check, which must see the real OBS output)
    document.body.classList.toggle('nodemobg', qb('nodemobg', false));
    stage.innerHTML = layout.html(d);
    stage.querySelectorAll('.motif').forEach((el) => { el.innerHTML = motifHTML(); });
    if (CFG.backplate) {
      const bp = document.createElement('div');
      bp.className = 'backplate';
      bp.style.backgroundImage = `url('${CFG.backplate}')`;
      const host = stage.querySelector('.lo');
      if (host) host.insertBefore(bp, host.firstChild);
    }
    if (!CFG.showProgress) stage.querySelectorAll('.progress').forEach((e) => (e.style.display = 'none'));

    /* optional credit badge (credit=1 or credit=Some%20Text) */
    if (CFG.credit && CFG.credit !== '0' && CFG.credit !== 'false') {
      const host = stage.querySelector('.lo');
      if (host) {
        const cb = document.createElement('div');
        cb.className = 'creditbadge';
        cb.textContent = (CFG.credit === '1' || CFG.credit === 'true')
          ? 'Clawmark by Hardclaws' : CFG.credit;
        host.appendChild(cb);
      }
    }

    const vids = stage.querySelectorAll('video');
    let dur = CFG.holdMs;
    vids.forEach((v) => { v.volume = CFG.volume; v.muted = CFG.muted; });

    const po = activePoolOpts || {};
    const optDetail   = po.detail   || CFG.detail;
    const optFit      = po.fit      || CFG.fit;
    const optBackdrop = po.backdrop || CFG.backdrop;
    const optExpand   = po.expand !== null && po.expand !== undefined ? po.expand : CFG.expand;
    const optHold     = po.hold     || CFG.holdInfo;

    const loRoot = stage.querySelector('.lo');
    if (loRoot) {
      if (optDetail) loRoot.classList.add('detail-' + optDetail);
      if (optFit) loRoot.classList.add('forcefit-' + optFit);
      if (optBackdrop && optBackdrop !== 'none') loRoot.classList.add('backdrop-' + optBackdrop);
      if (optExpand) loRoot.classList.add('expands');

      /* ---- video framing ----
         Only meaningful when the clip is a full-bleed direct child; the
         windowed layouts already give the clip its own slot. We check for a
         measured clear box before switching, so a layout without one keeps
         its original behaviour rather than getting a guessed rectangle. */
      const vf = po.videoFit || CFG.videoFit;
      const fullBleed = loRoot.querySelector(
        ':scope > .clipvid.fill, :scope > .clipwrap.fill, :scope > .clipfallback.fill')
        /* raceboard wraps its full-bleed clip one level down */
        || loRoot.querySelector(':scope > .rc-bgclip');
      if (fullBleed && (vf === 'smart' || vf === 'shrink')) {
        loRoot.classList.add('vfit');
        if (vf === 'shrink') loRoot.classList.add('vfit-shrink');
        // no measured box for this layout? fall back to a safe centred frame
        const probe = getComputedStyle(loRoot).getPropertyValue('--vf-w').trim();
        if (!probe) loRoot.classList.add('vfit-generic');
      } else if (fullBleed && vf === 'cover') {
        loRoot.classList.add('vfit-cover');
      }
    }

    if (optHold) {
      const lo = stage.querySelector('.lo');
      if (lo) {
        lo.classList.remove('hold-always', 'hold-long', 'hold-medium', 'hold-short');
        lo.classList.add('hold-' + optHold);
        lo.classList.add('holdable');
      }
    }

    /* roll any [data-count] numbers up from zero - used by the gaming layouts */
    stage.querySelectorAll('[data-count]').forEach((el) => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      if (!isFinite(target) || target <= 0) { el.textContent = '0'; return; }
      const dur = 1200, t0 = performance.now();
      const fmt = (v) => v.toLocaleString();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(target * eased));
        if (p < 1 && current === d) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });

    /* speedrun clock */
    const clock = stage.querySelector('.sr-clock');
    if (clock) {
      const t0 = performance.now();
      const tick = (now) => {
        if (current !== d || !clock.isConnected) return;
        const s = (now - t0) / 1000;
        clock.textContent = Math.floor(s / 60) + ':' +
          String(Math.floor(s % 60)).padStart(2, '0') + '.' + Math.floor((s * 10) % 10);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    void stage.offsetWidth;
    stage.classList.add('playing');

    /* Drive the info-clear from JS. Doing it in CSS meant the entrance
       animation and the hold animation fought over `animation-name`. */
    const loEl = stage.querySelector('.lo');
    const holdKey = optHold
      || (loEl && ['short','medium','long'].find((k) => loEl.classList.contains('hold-' + k)));
    const HOLD_MS = { short: 3000, medium: 5000, long: 8000 };
    if (loEl && holdKey && HOLD_MS[holdKey]) {
      clearTimeout(holdTimer);
      holdTimer = setTimeout(() => {
        if (current === d) loEl.classList.add('cleared');
      }, HOLD_MS[holdKey] + 900);
    }

    if (d.clip && vids.length) {
      /* Guard the duration maths. A clip with a missing/zero duration made
         Math.min(undefined, 60) === NaN, so the safety timeout below was
         setTimeout(fn, NaN) - which fires immediately and killed the shoutout. */
      const rawDur = Number(d.clip.duration) > 0 ? Number(d.clip.duration) : 30;
      const playFor = CFG.maxDuration > 0 ? Math.min(rawDur, CFG.maxDuration) : rawDur;
      dur = playFor * 1000 + 900;
      stage.style.setProperty('--clipdur', playFor + 's');

      /* ---- WHICH video is the one the viewer watches? --------------------
         Six layouts (dossier, receipt, filmstrip, boardingpass, holocard,
         chatapp) render the clip TWICE: a blurred full-frame copy as a
         backdrop, and the sharp inset you actually look at. The backdrop is
         first in the markup, so `vids[0]` was the blurred one - meaning the
         sharp clip never had play() called on it at all and sat frozen on its
         first frame while the blur animated behind it.

         That is the real cause of the "random freeze": it depended entirely on
         which layout came up. Retrying harder never helped because the retries
         were aimed at the wrong element.

         Fix: start EVERY video, and treat the sharp one as the timing source. */
      const BG_WRAP = '.bgblur,.ho-bg,.fbg,.rbg,.pa-bg,.ch-bg,.gbleed,.nbg,.pbg,.vs-bg,.rc-bgclip';
      const isBackdrop = (v) => !!v.closest(BG_WRAP);
      const main = Array.prototype.find.call(vids, (v) => !isBackdrop(v)) || vids[0];

      /* ---- robust autoplay ----------------------------------------------
         The old code was:
             main.play().catch(() => { main.muted = true; main.play()... });
         Two problems, both of which show as "the clip is frozen on its first
         frame, but the next shoutout is fine":

         1. play() was called the instant the element was in the DOM, while
            readyState was still 0. On a cold Twitch CDN fetch the promise
            rejects with AbortError, and the single retry fired immediately -
            failing for exactly the same reason. Second time round the file is
            in the browser cache, so it works. Hence the randomness.

         2. Nothing listened for 'canplay'. Once both attempts had failed there
            was no path back: the element just sat there showing frame one.

         Now: retry with backoff, and also attempt whenever the element tells
         us it has data. Whichever happens first wins.                       */
      /* Kick every video element, backdrop included, each with its own retry
         chain. Previously only one element was ever started. */
      Array.prototype.forEach.call(vids, (v) => {
        let tries = 0, started = false;
        v.addEventListener('playing', () => { started = true; }, { once: true });
        const attempt = () => {
          if (started || tries > 6 || current !== d) return;
          tries++;
          const pr = v.play();
          if (pr && typeof pr.catch === 'function') {
            pr.catch(() => { setTimeout(attempt, 120 * tries); });
          }
        };
        v.addEventListener('loadeddata', attempt);
        v.addEventListener('canplay', attempt);
        attempt();
      });

      /* If the clip genuinely cannot load (404, expired signature, codec),
         don't strand the overlay on a dead frame - hold briefly, then move on. */
      main.addEventListener('error', () => {
        log('clip failed to load, falling back to hold');
        clearTimeout(timer);
        timer = setTimeout(() => { if (current === d) finish(); }, 2500);
      });

      /* A stalled download used to run the full safety timeout showing a frozen
         frame. Give it a moment to recover, then end early rather than sit there. */
      main.addEventListener('stalled', () => {
        setTimeout(() => {
          /* `started` is now per-element and scoped to the loop above, so ask
             the element itself instead of a stale closure variable. */
          if (current === d && main.paused && main.readyState < 3) {
            log('clip stalled with no data, ending early');
            finish();
          }
        }, 4000);
      });

      main.onended = finish;
      /* Safety net: never let a shoutout outlive its clip. */
      setTimeout(() => { if (current === d) finish(); }, dur);
    } else {
      stage.style.setProperty('--clipdur', CFG.holdMs / 1000 + 's');
      timer = setTimeout(finish, CFG.holdMs);
    }
    current = d;
  }

  function finish() {
    clearTimeout(timer);
    clearTimeout(holdTimer);
    stage.classList.add('leaving');
    setTimeout(() => {
      stage.innerHTML = '';
      stage.className = 'hidden';
      current = null;
      next();
    }, 520);
  }

  /* pull a clip slug out of a twitch.tv/clip.twitch.tv URL, or accept a bare slug */
  function clipSlug(text) {
    const t = String(text || '').trim();
    let m = t.match(/clips\.twitch\.tv\/([A-Za-z0-9_-]+)/i)
         || t.match(/twitch\.tv\/[^/]+\/clip\/([A-Za-z0-9_-]+)/i);
    if (m) return m[1].split('?')[0];
    // bare slug: Twitch slugs are long mixed-case words, never a plain username
    if (/^[A-Za-z0-9]{20,}$/.test(t) && /[A-Z]/.test(t)) return t;
    return null;
  }

  /* build a shoutout directly from a clip slug */
  async function buildFromClip(slug) {
    if (!gql) throw new Error('clip lookup needs the public API');
    const c = await gql.clipInfo(slug);
    if (!c || !c.broadcaster) throw new Error('clip not found: ' + slug);
    const bc = c.broadcaster;
    const d = {
      user: { login: bc.login, name: bc.displayName || bc.login, url: 'twitch.tv/' + bc.login,
        avatar: bc.profileImageURL || '', bio: bc.description || '', game: '', title: '',
        followers: (bc.followers && bc.followers.totalCount) != null ? bc.followers.totalCount : null,
        years: null, created: '', live: !!bc.stream, lang: '',
        badge: bc.roles && bc.roles.isPartner ? 'Partner'
             : bc.roles && bc.roles.isAffiliate ? 'Affiliate' : '' },
      clip: null, muted: CFG.muted, index: String(++shoutCount).padStart(2, '0'), copy: {},
    };
    if (bc.createdAt) {
      const cd = new Date(bc.createdAt);
      d.user.created = cd.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
      d.user.years = Math.max(1, Math.floor((Date.now() - cd) / 3.156e10));
    }
    const lb = bc.lastBroadcast || {};
    d.user.game = (bc.stream && bc.stream.game && bc.stream.game.name) || (lb.game && lb.game.name) || '';
    d.user.title = (bc.stream && bc.stream.title) || lb.title || '';

    const src = await gql.clipSource(c.slug, 1080).catch(() => null);
    if (src) {
      d.clip = { src, title: c.title, views: c.viewCount,
        duration: Math.round(c.durationSeconds),
        creator: (c.curator && c.curator.displayName) || 'someone',
        created: new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) };
    }
    d.copy = { kicker: tpl(CFG.kicker, d), cta: tpl(CFG.cta, d),
      tag: CFG.tag ? tpl(CFG.tag, d) : (CFG.channel ? CFG.channel.toUpperCase() : 'SHOUTOUT') };
    return d;
  }

  /* ---------------- queue ---------------- */
  const queue = [];
  let busy = false, lastShout = null;

  function enqueue(login) {
    if (!login) return;
    login = String(login).toLowerCase().replace(/^@/, '').trim();
    if (!/^[a-z0-9_]{3,25}$/.test(login)) return;
    if (queue.some((q) => q.login === login) || (current && current.user.login === login)) return;
    queue.push({ login });
    log('queued', login, 'depth', queue.length);
    next();
  }

  function enqueueClip(slug) {
    if (!slug || queue.some((q) => q.slug === slug)) return;
    queue.push({ slug });
    log('queued clip', slug, 'depth', queue.length);
    next();
  }

  async function next() {
    if (busy || current || !queue.length) return;
    busy = true;
    const item = queue.shift();
    try {
      const d = item.slug ? await buildFromClip(item.slug) : await build(item.login);
      lastShout = d;
      render(d);
      if (CFG.chatMsg && api) sayInChat(d);
    } catch (e) {
      console.warn('[shoutout]', e.message);
    } finally {
      busy = false;
    }
  }

  async function sayInChat(d) {
    try {
      const v = await api.validate();
      if (!v) return;
      const me = await api.user(CFG.channel);
      if (me) await api.say(me.id, v.user_id, tpl(CFG.chatMsg, d));
    } catch (e) { log('chat post failed', e.message); }
  }

  function stopClip() {
    if (current) finish();
    else { queue.length = 0; }
  }

  function replay() {
    if (lastShout && !current) { stage.className = ''; render(lastShout); }
  }

  /* ---------------- chat commands ---------------- */
  const CMD = {
    so: (m, arg) => { if (allowed(m)) enqueue(arg); },
    watchclip: (m, arg) => {
      if (!arg) return;
      const slug = clipSlug(arg);
      if (slug) enqueueClip(slug);       // a clip link
      else enqueue(arg);                  // a plain username
    },
    replayso: (m) => { if (allowed(m)) replay(); },
    soreplay: (m) => { if (allowed(m)) replay(); },
    clipreplay: (m) => { if (allowed(m)) replay(); },
    replayclip: (m) => { if (allowed(m)) replay(); },
    stopclip: (m) => { if (mod(m)) stopClip(); },
    sostop: (m) => { if (mod(m)) stopClip(); },
    clipstop: (m) => { if (mod(m)) stopClip(); },
    clipreload: (m) => { if (mod(m)) location.reload(); },
    soreload: (m) => { if (mod(m)) location.reload(); },
  };
  const mod = (m) => m.isMod || m.isBroadcaster;
  const allowed = (m) => {
    if (CFG.modsOnly && !mod(m)) return false;
    if (CFG.vipsOnly && !(m.isVip || mod(m))) return false;
    return true;
  };

  if (CFG.channel) {
    Twitch.Chat(CFG.channel, {
      onOpen: () => log('chat connected to #' + CFG.channel),
      onRaid: (r) => {
        if (!CFG.autoRaid || !r.login) return;
        if (CFG.raidCount && r.viewers < CFG.raidCount) {
          log('raid from', r.login, 'ignored -', r.viewers, '<', CFG.raidCount);
          return;
        }
        log('raid from', r.login, 'with', r.viewers, 'viewers');
        if (CFG.raidDelay > 0) setTimeout(() => enqueue(r.login), CFG.raidDelay * 1000);
        else enqueue(r.login);
      },
      onMessage: (m) => {
        const t = m.text.trim();
        if (t[0] !== '!') return;
        const [rawCmd, ...rest] = t.slice(1).split(/\s+/);
        const cmd = rawCmd.toLowerCase();
        const arg = rest[0];
        if (cmd === CFG.command) return CMD.so(m, arg);
        if (CMD[cmd]) return CMD[cmd](m, arg);
      },
    });
  }

  /* ---------------- test hooks ---------------- */
  window.shoutout = enqueue;
  window.shoutoutClip = (urlOrSlug) => {
    const sl = clipSlug(urlOrSlug);
    if (sl) enqueueClip(sl); else console.warn('[shoutout] not a clip url/slug:', urlOrSlug);
  };
  window.shoutoutStop = stopClip;
  window.shoutoutReplay = replay;
  if (q('test')) setTimeout(() => enqueue(q('test')), 600);

  log('ready', CFG);
})();
