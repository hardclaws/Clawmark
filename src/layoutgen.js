/* Clawmark - Twitch Shoutout Overlay for OBS
 * Created by Hardclaws · twitch.tv/hardclaws · thehardclaws@gmail.com
 * MIT licence. Free to use, modify and fork.
 */
/* =============================================================
   LAYOUT GENERATOR
   The 20 built-in layouts are hand-written. This module *composes*
   new ones from a small set of structural parameters, so a user can
   ask for "cycling style with a spinning cog" and get real variants
   back - not a fixed list.

   A generated layout = a SPEC object:
     {
       frame     where the clip sits        (fullbleed|window|split|circle|strip|card|none)
       infoPos   where the info block sits  (bottom|top|left|right|centre|corner)
       infoStyle how the info is presented  (band|panel|stack|rail|sheet|chip)
       ornament  decorative motif           (cog|wheel|chain|d20|hex|none|...)
       ornPos    where ornaments go         (behind|corner|flank|orbit|none)
       entrance  how it animates in         (slide|rise|spin|wipe|pop|flip)
       density   how much data is shown     (minimal|standard|rich)
       accentBar edge accent                (none|left|top|underline|frame)
     }
   Specs are deterministic from a seed, so a shared URL reproduces
   the exact layout.
   ============================================================= */
(function (root) {
  'use strict';

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const n = (v) => (v == null ? '' : Number(v).toLocaleString());

  /* ---------------- deterministic RNG ---------------- */
  function rng(seed) {
    let h = 1779033703 ^ String(seed).length;
    for (let i = 0; i < String(seed).length; i++) {
      h = Math.imul(h ^ String(seed).charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    };
  }
  const pick = (a, r) => a[Math.floor(r() * a.length)];

  /* =============================================================
     ORNAMENTS - inline SVG, animated via CSS.
     These are what make a layout feel "cycling" or "tabletop".
     ============================================================= */
  const ORNAMENTS = {
    cog: (cls) => `<svg class="orn ${cls || ''}" viewBox="0 0 100 100" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="5">
        <circle cx="50" cy="50" r="20"/>
        <circle cx="50" cy="50" r="34"/>
      </g>
      <g fill="currentColor">${Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30) * Math.PI / 180;
        const x = 50 + Math.cos(a) * 41, y = 50 + Math.sin(a) * 41;
        return `<rect x="${(x - 4).toFixed(1)}" y="${(y - 4).toFixed(1)}" width="8" height="8"
          transform="rotate(${i * 30} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
      }).join('')}</g></svg>`,

    chainring: (cls) => `<svg class="orn ${cls || ''}" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="3"/>
      <circle cx="50" cy="50" r="9" fill="none" stroke="currentColor" stroke-width="4"/>
      ${Array.from({ length: 5 }, (_, i) => {
        const a = (i * 72 - 90) * Math.PI / 180;
        return `<line x1="50" y1="50" x2="${(50 + Math.cos(a) * 34).toFixed(1)}"
          y2="${(50 + Math.sin(a) * 34).toFixed(1)}" stroke="currentColor" stroke-width="5"/>`;
      }).join('')}
      ${Array.from({ length: 28 }, (_, i) => {
        const a = (i * 12.85) * Math.PI / 180;
        const x = 50 + Math.cos(a) * 43, y = 50 + Math.sin(a) * 43;
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4" fill="currentColor"/>`;
      }).join('')}</svg>`,

    wheel: (cls) => `<svg class="orn ${cls || ''}" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" stroke-width="4"/>
      <circle cx="50" cy="50" r="6" fill="currentColor"/>
      ${Array.from({ length: 24 }, (_, i) => {
        const a = (i * 15) * Math.PI / 180;
        return `<line x1="50" y1="50" x2="${(50 + Math.cos(a) * 43).toFixed(1)}"
          y2="${(50 + Math.sin(a) * 43).toFixed(1)}" stroke="currentColor" stroke-width="1.1" opacity=".75"/>`;
      }).join('')}</svg>`,

    chain: (cls) => `<svg class="orn ${cls || ''}" viewBox="0 0 240 40" preserveAspectRatio="none" aria-hidden="true">
      ${Array.from({ length: 10 }, (_, i) =>
        `<g transform="translate(${i * 24},0)">
          <circle cx="8" cy="20" r="6" fill="none" stroke="currentColor" stroke-width="3"/>
          <rect x="12" y="17" width="14" height="6" fill="currentColor"/>
        </g>`).join('')}</svg>`,

    d20: (cls) => `<svg class="orn ${cls || ''}" viewBox="0 0 100 100" aria-hidden="true">
      <polygon points="50,4 92,28 92,72 50,96 8,72 8,28" fill="none" stroke="currentColor" stroke-width="5"/>
      <polygon points="50,22 74,36 74,64 50,78 26,64 26,36" fill="none" stroke="currentColor" stroke-width="3" opacity=".7"/>
      <text x="50" y="60" text-anchor="middle" font-family="Georgia,serif" font-size="26"
        font-weight="700" fill="currentColor">20</text></svg>`,

    hex: (cls) => `<svg class="orn ${cls || ''}" viewBox="0 0 100 100" aria-hidden="true">
      <polygon points="50,4 92,28 92,72 50,96 8,72 8,28" fill="none" stroke="currentColor" stroke-width="6"/></svg>`,

    speedo: (cls) => `<svg class="orn ${cls || ''}" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M12 72 A42 42 0 1 1 88 72" fill="none" stroke="currentColor" stroke-width="5" opacity=".5"/>
      <path d="M12 72 A42 42 0 0 1 34 26" fill="none" stroke="currentColor" stroke-width="7"/>
      <circle cx="50" cy="72" r="6" fill="currentColor"/>
      <line x1="50" y1="72" x2="76" y2="40" stroke="currentColor" stroke-width="5"/></svg>`,

    mountain: (cls) => `<svg class="orn ${cls || ''}" viewBox="0 0 120 60" preserveAspectRatio="none" aria-hidden="true">
      <polyline points="0,58 18,30 30,42 48,12 64,38 80,20 96,44 120,16"
        fill="none" stroke="currentColor" stroke-width="3"/></svg>`,

    bolt: (cls) => `<svg class="orn ${cls || ''}" viewBox="0 0 100 100" aria-hidden="true">
      <polygon points="56,4 24,56 46,56 40,96 76,40 52,40" fill="currentColor"/></svg>`,

    star: (cls) => `<svg class="orn ${cls || ''}" viewBox="0 0 100 100" aria-hidden="true">
      <polygon points="50,4 61,37 96,37 68,58 79,92 50,71 21,92 32,58 4,37 39,37" fill="currentColor"/></svg>`,

    none: () => '',
  };

  /* =============================================================
     VOCABULARY - words -> spec fragments
     ============================================================= */
  const WORDS = {
    // ornaments
    cog: { ornament: 'cog' }, gear: { ornament: 'cog' }, cogs: { ornament: 'cog' },
    chainring: { ornament: 'chainring' }, crank: { ornament: 'chainring' },
    wheel: { ornament: 'wheel' }, spoke: { ornament: 'wheel' }, spokes: { ornament: 'wheel' },
    chain: { ornament: 'chain' },
    speedo: { ornament: 'speedo' }, speed: { ornament: 'speedo' }, gauge: { ornament: 'speedo' },
    dial: { ornament: 'speedo' }, watt: { ornament: 'speedo' }, watts: { ornament: 'speedo' },
    power: { ornament: 'speedo' },
    climb: { ornament: 'mountain' }, mountain: { ornament: 'mountain' },
    hill: { ornament: 'mountain' }, elevation: { ornament: 'mountain' },
    alpe: { ornament: 'mountain' }, gradient: { ornament: 'mountain' },
    d20: { ornament: 'd20' }, dice: { ornament: 'd20' }, dnd: { ornament: 'd20' },
    rpg: { ornament: 'd20' }, tabletop: { ornament: 'd20' }, quest: { ornament: 'd20' },
    hex: { ornament: 'hex' }, hexagon: { ornament: 'hex' },
    bolt: { ornament: 'bolt' }, lightning: { ornament: 'bolt' }, sprint: { ornament: 'bolt' },
    star: { ornament: 'star' },

    // themes that imply an ornament
    cycling: { ornament: 'cog', ornPos: 'behind' },
    bike: { ornament: 'chainring', ornPos: 'behind' },
    zwift: { ornament: 'cog', ornPos: 'behind' },
    peloton: { ornament: 'wheel', ornPos: 'flank' },
    race: { ornament: 'speedo', ornPos: 'corner' },
    racing: { ornament: 'speedo', ornPos: 'corner' },

    // frame
    fullscreen: { frame: 'fullbleed' }, fullbleed: { frame: 'fullbleed' },
    full: { frame: 'fullbleed' }, immersive: { frame: 'fullbleed' },
    window: { frame: 'window' }, boxed: { frame: 'window' }, framed: { frame: 'window' },
    split: { frame: 'split' }, half: { frame: 'split' }, side: { frame: 'split' },
    circle: { frame: 'circle' }, circular: { frame: 'circle' }, round: { frame: 'circle' },
    strip: { frame: 'strip' }, band: { frame: 'strip' },
    card: { frame: 'card' }, tile: { frame: 'card' },

    // position
    bottom: { infoPos: 'bottom' }, lower: { infoPos: 'bottom' },
    top: { infoPos: 'top' }, upper: { infoPos: 'top' },
    left: { infoPos: 'left' }, right: { infoPos: 'right' },
    centre: { infoPos: 'centre' }, center: { infoPos: 'centre' }, middle: { infoPos: 'centre' },
    corner: { infoPos: 'corner', infoStyle: 'chip' },

    // density
    minimal: { density: 'minimal' }, clean: { density: 'minimal' }, simple: { density: 'minimal' },
    tiny: { density: 'minimal', infoStyle: 'chip' }, small: { density: 'minimal' },
    detailed: { density: 'rich' }, rich: { density: 'rich' }, stats: { density: 'rich' },
    data: { density: 'rich' }, full_info: { density: 'rich' }, everything: { density: 'rich' },

    // entrance
    spin: { entrance: 'spin' }, spinning: { entrance: 'spin' }, rotate: { entrance: 'spin' },
    rolling: { entrance: 'spin' }, roll: { entrance: 'spin' },
    slide: { entrance: 'slide' }, sliding: { entrance: 'slide' },
    rise: { entrance: 'rise' }, up: { entrance: 'rise' },
    wipe: { entrance: 'wipe' }, flip: { entrance: 'flip' }, pop: { entrance: 'pop' },
    bounce: { entrance: 'pop' },
  };

  const FRAMES = ['fullbleed', 'window', 'split', 'portrait', 'strip', 'card', 'inset'];

  /* How the video sits in its frame.
       cover   fill the frame, crop the overflow
       contain letterbox - never crops, always shows the whole clip
     Frames whose aspect is far from 16:9 default to 'contain', because
     'cover' was throwing away up to 47% of the picture. */
  const FITS = ['cover', 'contain'];
  const DEFAULT_FIT = {
    fullbleed: 'cover', window: 'cover', card: 'cover', strip: 'cover',
    split: 'contain', portrait: 'contain', inset: 'cover',
  };

  /* How long the info block stays before it clears the video.
       always  never leaves
       long    ~8s
       medium  ~5s
       short   ~3s then fades, leaving the clip clean */
  const HOLDS = ['always', 'long', 'medium', 'short'];

  /* Which info positions are geometrically safe for each frame.
     Derived by sweeping all 36 combinations and rejecting any that
     overlapped the clip or ran outside 1920x1080. */
  const VALID_POS = {
    fullbleed: ['bottom', 'top', 'corner', 'centre', 'left', 'right'],
    window:    ['bottom', 'left', 'right', 'corner'],
    split:     ['left', 'right'],
    portrait:  ['left', 'right', 'corner'],
    strip:     ['bottom', 'top', 'corner'],
    card:      ['bottom', 'left', 'right', 'corner'],
    inset:     ['bottom', 'left', 'right', 'corner', 'top'],
  };
  const POS = ['bottom', 'top', 'left', 'right', 'centre', 'corner'];
  const STYLES = ['band', 'panel', 'stack', 'rail', 'sheet', 'chip'];
  const ORNPOS = ['behind', 'corner', 'flank', 'orbit', 'none'];
  const ENTR = ['slide', 'rise', 'wipe', 'pop', 'flip',
                'unfold', 'shutter', 'glide', 'stagger', 'mask', 'skew', 'blurin'];
  const DENS = ['minimal', 'standard', 'rich'];
  const BARS = ['none', 'left', 'top', 'underline', 'frame'];

  /* ---------------- spec synthesis ---------------- */
  function specFromWords(text, seed) {
    const words = String(text || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const r = rng(seed === undefined ? words.join('-') || Math.random() : seed);
    const spec = {};
    words.forEach((w) => {
      const frag = WORDS[w];
      if (frag) Object.keys(frag).forEach((k) => { if (spec[k] === undefined) spec[k] = frag[k]; });
    });
    // fill the gaps
    if (!spec.frame) {
      // if the user asked for a position, pick a frame that supports it
      if (spec.infoPos) {
        const ok = FRAMES.filter((f) => VALID_POS[f].includes(spec.infoPos));
        spec.frame = pick(ok.length ? ok : FRAMES, r);
      } else {
        spec.frame = pick(FRAMES, r);
      }
    }
    // VALID_POS: verified combinations that never overlap the clip frame.
    if (!spec.infoPos || !(VALID_POS[spec.frame] || []).includes(spec.infoPos)) {
      spec.infoPos = pick(VALID_POS[spec.frame] || ['bottom'], r);
    }
    if (!spec.infoStyle) {
      const good = { bottom: ['band', 'panel', 'stack'], top: ['band', 'chip'],
        left: ['rail', 'panel', 'sheet'], right: ['rail', 'panel', 'sheet'],
        centre: ['sheet', 'stack'], corner: ['chip', 'panel'] }[spec.infoPos] || STYLES;
      spec.infoStyle = pick(good, r);
    }
    // PROCEDURAL: synthesise an ornament from the phrase itself.
    // Any input produces a shape - no fixed list, no fallback to 'star'.
    if (!spec.feat) {
      spec.feat = root.Ornaments.phraseToFeatures(text || '', seed === undefined ? '' : seed);
      spec.ornament = root.Ornaments.nameFor(spec.feat);
    }
    if (!spec.ornPos) {
      const hasIntent = spec.feat && spec.feat.matched > 0;
      spec.ornPos = pick(hasIntent ? ['behind','corner','flank','orbit'] : ORNPOS, r);
    }
    if (!spec.entrance) spec.entrance = pick(ENTR, r);
    if (!spec.density) spec.density = pick(DENS, r);
    if (!spec.accentBar) spec.accentBar = pick(BARS, r);
    if (!spec.fit) spec.fit = DEFAULT_FIT[spec.frame] || 'cover';
    if (!spec.hold) spec.hold = pick(HOLDS, r);
    // only meaningful when the info actually clears
    if (spec.expand === undefined)
      spec.expand = spec.hold !== 'always' ? (r() > 0.4) : false;
    spec.seed = seed === undefined ? words.join('-') : seed;
    spec.query = text || '';
    return spec;
  }

  /* ---------------- human-readable description ---------------- */
  function describe(spec) {
    const f = { fullbleed: 'Clip fills the frame', window: 'Clip in a floating window',
      split: 'Split screen', portrait: 'Tall pillar', strip: 'Clip in a wide strip',
      card: 'Clip inside a card', inset: 'Inset over blurred backdrop' }[spec.frame];
    const p = { bottom: 'info along the bottom', top: 'info across the top',
      left: 'info down the left', right: 'info down the right',
      centre: 'info centred', corner: 'info in a corner chip' }[spec.infoPos];
    const o = spec.ornPos === 'none' ? 'no ornament'
      : `${spec.ornament} ${spec.ornPos === 'none' ? '' : '(' + spec.ornPos + ')'}`.trim();
    const fitTxt = spec.fit === 'contain' ? 'letterboxed (no cropping)' : 'filled';
    const holdTxt = { always: 'info stays', long: 'info clears after 8s',
      medium: 'info clears after 5s', short: 'info clears after 3s' }[spec.hold || 'always'];
    const expTxt = spec.expand ? ', then the clip grows to fill the frame' : '';
    return `${f} ${fitTxt}, ${p}. ${o}. ${spec.entrance} entrance, ${spec.density} detail, ${holdTxt}${expTxt}.`;
  }

  /* =============================================================
     RENDERER - turn a spec into HTML
     ============================================================= */
  function build(spec) {
    const fsig = spec.feat
      ? [spec.feat.form, spec.feat.sym, spec.feat.teeth, spec.feat.rings, spec.feat.round,
         spec.feat.wobble, spec.feat.spokes, spec.feat.fill].join(':')
      : spec.ornament;
    const id = 'gen-' + [spec.frame, spec.infoPos, spec.infoStyle, fsig,
      spec.ornPos, spec.entrance, spec.density, spec.accentBar,
      spec.hold, spec.fit, spec.expand ? 'exp' : 'noexp'].join('-');

    return {
      id,
      label: 'Generated',
      group: 'Generated',
      spec,
      blurb: describe(spec),
      html: (d) => render(spec, d),
    };
  }

  function render(spec, d) {
    const C = root.Layouts && root.Layouts.helpers;
    const clip = C.clip, credit = C.credit, av = C.av, badge = C.badge, live = C.liveTag;

    // A custom image asset (AI-generated or hand-made) overrides the
    // procedural ornament entirely when supplied.
    const assetUrl = (root.SHOUTOUT_ASSET && root.SHOUTOUT_ASSET.ornament) || spec.assetUrl;
    const orn = assetUrl
      ? (cls) => `<img class="orn asset ${cls || ''}" src="${esc(assetUrl)}" alt="">`
      : spec.feat
        ? (cls) => root.Ornaments.synth(spec.feat, cls)
        : (ORNAMENTS[spec.ornament] || ORNAMENTS.none);
    const ornEl = spec.ornPos === 'none' ? '' : (() => {
      if (spec.ornPos === 'behind') return `<div class="ornwrap behind">${orn('spin-slow')}</div>`;
      if (spec.ornPos === 'corner') return `<div class="ornwrap corner">${orn('spin-slow')}</div>`;
      if (spec.ornPos === 'flank')
        return `<div class="ornwrap flank l">${orn('spin-slow')}</div>
                <div class="ornwrap flank r">${orn('spin-rev')}</div>`;
      if (spec.ornPos === 'orbit')
        return `<div class="ornwrap orbit">${orn('spin-slow')}</div>`;
      return '';
    })();

    /* ---- info block, scaled by density ---- */
    const stats = [];
    if (d.user.followers != null) stats.push(['Followers', n(d.user.followers), 1]);
    if (d.user.game) stats.push(['Last played', esc(d.user.game)]);
    if (spec.density !== 'minimal' && d.user.years) stats.push(['On Twitch', d.user.years + ' yrs']);
    if (spec.density === 'rich' && d.clip) stats.push(['Clip views', n(d.clip.views)]);

    const statHTML = stats.length
      ? `<div class="gstats">${stats.map(([l, v, a]) =>
          `<div class="stat"><div class="stat-v${a ? ' acc' : ''}">${v}</div>
           <div class="stat-l">${l}</div></div>`).join('')}</div>`
      : '';

    const bioHTML = (spec.density === 'rich' && d.user.bio)
      ? `<p class="bio">${esc(d.user.bio)}</p>` : '';

    const creditVariant = spec.infoStyle === 'chip' ? 'micro'
      : spec.density === 'minimal' ? 'micro'
      : spec.density === 'rich' ? 'stack' : 'line';

    const avSize = spec.infoStyle === 'chip' ? 84
      : spec.infoStyle === 'rail' ? 180
      : spec.density === 'rich' ? 150 : 120;

    const info = `
      <div class="ginfo ${spec.infoStyle} at-${spec.infoPos} bar-${spec.accentBar}">
        <div class="gid">
          ${av(d, avSize)}
          <div class="gidtext">
            <div class="kicker">${esc(d.copy.kicker)}</div>
            <div class="gname"><h1>${esc(d.user.name)}</h1>${badge(d)}${live(d)}</div>
            <div class="gurl">${esc(d.user.url)}</div>
          </div>
        </div>
        ${bioHTML}
        ${statHTML}
        <div class="gcred">${credit(d, creditVariant)}</div>
      </div>`;

    /* ---- frame ---- */
    const fit = spec.fit || 'cover';
    let frameHTML;
    switch (spec.frame) {
      case 'window':
        frameHTML = `<div class="gframe window fit-${fit}">${clip(d)}</div>`; break;
      case 'split':
        frameHTML = `<div class="gframe split fit-${fit} ${spec.infoPos === 'left' ? 'onright' : 'onleft'}">${clip(d)}</div>`; break;
      case 'portrait':
        frameHTML = `<div class="gframe portrait fit-${fit} ${spec.infoPos === 'left' ? 'onright' : 'onleft'}">${clip(d)}</div>`; break;
      case 'strip':
        frameHTML = `<div class="gframe strip fit-${fit}">${clip(d)}</div>`; break;
      case 'card':
        frameHTML = `<div class="gframe card fit-${fit}">${clip(d)}</div>`; break;
      case 'inset':
        frameHTML = `<div class="gbleed">${clip(d, 'fill')}</div>
                     <div class="gframe inset fit-${fit}">${clip(d)}</div>`; break;
      default:
        frameHTML = `<div class="gframe fullbleed fit-${fit}">${clip(d, 'fill')}</div>
                     <div class="scrim-b"></div>`;
    }

    return `<div class="lo lo-gen f-${spec.frame} p-${spec.infoPos} e-${spec.entrance}
      o-${spec.ornPos} d-${spec.density} fit-${fit} hold-${spec.hold || 'always'}
      ${spec.expand ? 'expands' : ''}">
      ${ornEl}
      ${frameHTML}
      ${info}
      <div class="progress"><i></i></div>
    </div>`;
  }

  /* ---------------- public API ---------------- */
  function generate(text, opts) {
    opts = opts || {};
    const spec = specFromWords(text, opts.seed);
    Object.keys(opts).forEach((k) => { if (k !== 'seed' && opts[k] !== undefined) spec[k] = opts[k]; });
    return build(spec);
  }

  /* produce N distinct variants for the same request */
  function variants(text, count) {
    count = count || 6;
    const out = [];
    const seen = new Set();
    let i = 0, guard = 0;
    while (out.length < count && guard++ < 200) {
      const l = generate(text, { seed: (text || 'x') + '#' + i++ });
      if (seen.has(l.id)) continue;
      seen.add(l.id);
      out.push(l);
    }
    return out;
  }

  function fromSpec(spec) { return build(spec); }

  /* =============================================================
     enumerate - walk the entire valid combination space.
     No keywords. Optional filters narrow it. Ordered deterministically
     so paging is stable, and interleaved so early pages look varied.
     ============================================================= */
  const STYLE_FOR = {
    bottom: ['band', 'panel', 'stack'],
    top:    ['band', 'chip', 'panel'],
    left:   ['rail', 'panel', 'sheet'],
    right:  ['rail', 'panel', 'sheet'],
    centre: ['sheet', 'stack'],
    corner: ['chip', 'panel'],
  };

  function enumerate(filter) {
    filter = filter || {};
    const out = [];
    const frames = filter.frame ? [filter.frame] : FRAMES;

    frames.forEach((frame) => {
      const positions = (VALID_POS[frame] || []).filter(
        (p) => !filter.infoPos || p === filter.infoPos);
      positions.forEach((infoPos) => {
        (STYLE_FOR[infoPos] || STYLES).forEach((infoStyle) => {
          DENS.forEach((density) => {
            if (filter.density && density !== filter.density) return;
            ENTR.forEach((entrance) => {
              ORNPOS.forEach((ornPos) => {
                if (filter.ornPos && ornPos !== filter.ornPos) return;
                BARS.forEach((accentBar) => {
                  HOLDS.forEach((hold) => {
                    if (filter.hold && hold !== filter.hold) return;
                    const fits = filter.fit ? [filter.fit]
                      : [DEFAULT_FIT[frame] || 'cover'];
                    fits.forEach((fit) => {
                      const exp = hold === 'always' ? [false] : [true, false];
                      exp.forEach((expand) => {
                        if (filter.expand !== undefined && expand !== filter.expand) return;
                        out.push({ frame, infoPos, infoStyle, density, entrance,
                          ornPos, accentBar, hold, fit, expand });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });

    /* Interleave so consecutive results differ on the big axes rather than
       showing six near-identical cards in a row. */
    const stride = 7;
    const woven = [];
    for (let off = 0; off < stride; off++)
      for (let i = off; i < out.length; i += stride) woven.push(out[i]);
    return woven;
  }

  function countCombos(filter) { return enumerate(filter).length; }

  /* build page N of the enumerated space */
  function page(filter, index, size) {
    size = size || 12;
    const all = enumerate(filter);
    if (!all.length) return [];
    const start = (index * size) % all.length;
    const slice = [];
    for (let i = 0; i < Math.min(size, all.length); i++)
      slice.push(all[(start + i) % all.length]);

    return slice.map((base, i) => {
      const spec = Object.assign({}, base);
      // ornament shape derived from the structure itself, not from words
      const sig = [spec.frame, spec.infoPos, spec.infoStyle, spec.entrance,
        spec.density, spec.ornPos, spec.accentBar, index, i].join('-');
      spec.feat = root.Ornaments.phraseToFeatures(sig, sig);
      spec.ornament = root.Ornaments.nameFor(spec.feat);
      spec.seed = sig;
      return build(spec);
    });
  }

  root.LayoutGen = { generate, variants, fromSpec, specFromWords, describe,
    enumerate, countCombos, page, VALID_POS, FITS, HOLDS, DEFAULT_FIT, ORNAMENTS, WORDS };
})(typeof window !== 'undefined' ? window : globalThis);
