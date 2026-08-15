/* Clawmark - Twitch Shoutout Overlay for OBS
 * Created by Hardclaws · twitch.tv/hardclaws · thehardclaws@gmail.com
 * MIT licence. Free to use, modify and fork.
 */
/* =============================================================
   SKIN ENGINE
   A "theme" = LAYOUT (structure) x SKIN (look).
   A skin is nothing but a bag of CSS custom properties, so any
   skin can be applied to any of the 20 layouts.
   Skins can be: (a) a named preset, or (b) SYNTHESISED from
   plain-language descriptors -> generateSkin({...}).
   ============================================================= */
(function (root) {
  'use strict';

  /* ---------- colour helpers (HSL space, no deps) ---------- */
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const hsl = (h, s, l, a) =>
    a === undefined
      ? `hsl(${((h % 360) + 360) % 360} ${clamp(s, 0, 100)}% ${clamp(l, 0, 100)}%)`
      : `hsl(${((h % 360) + 360) % 360} ${clamp(s, 0, 100)}% ${clamp(l, 0, 100)}% / ${a})`;

  /* deterministic PRNG so a given seed always yields the same skin */
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

  /* ---------- font stacks (all websafe-ish + optional webfont) ---------- */
  const FONTS = {
    geometric: `"Poppins","Century Gothic",system-ui,sans-serif`,
    grotesk: `"Inter","Segoe UI",system-ui,-apple-system,sans-serif`,
    condensed: `"Oswald","Arial Narrow",Impact,system-ui,sans-serif`,
    serif: `Georgia,"Palatino Linotype","Book Antiqua",serif`,
    slab: `"Roboto Slab",Rockwell,Georgia,serif`,
    blackletter: `"Grenze Gotisch","UnifrakturCook",Georgia,serif`,
    mono: `"JetBrains Mono","Cascadia Code",Consolas,"Courier New",monospace`,
    display: `Impact,"Haettenschweiler","Arial Black",system-ui,sans-serif`,
    rounded: `"Nunito","Trebuchet MS",system-ui,sans-serif`,
  };

  /* ---------- MOODS: high-level personality presets ---------- */
  const MOODS = {
    clean:    { sat: 55, dark: true,  radius: 14, borderW: 1, fontD: 'grotesk',    fontB: 'grotesk',   tracking: '-0.02em', upper: false, texture: 'none',      glow: 0.25, weightD: 800 },
    minimal:  { sat: 18, dark: true,  radius: 4,  borderW: 1, fontD: 'grotesk',    fontB: 'grotesk',   tracking: '0.01em',  upper: false, texture: 'none',      glow: 0.05, weightD: 600 },
    bold:     { sat: 85, dark: true,  radius: 6,  borderW: 3, fontD: 'condensed',  fontB: 'grotesk',   tracking: '0.01em',  upper: true,  texture: 'none',      glow: 0.5,  weightD: 900 },
    cyber:    { sat: 95, dark: true,  radius: 2,  borderW: 2, fontD: 'condensed',  fontB: 'mono',      tracking: '0.16em',  upper: true,  texture: 'scan',      glow: 0.9,  weightD: 800 },
    retro:    { sat: 88, dark: true,  radius: 0,  borderW: 4, fontD: 'display',    fontB: 'mono',      tracking: '0.08em',  upper: true,  texture: 'scan',      glow: 0.75, weightD: 900 },
    fantasy:  { sat: 42, dark: false, radius: 8,  borderW: 3, fontD: 'serif',      fontB: 'serif',     tracking: '0.02em',  upper: false, texture: 'parchment', glow: 0.15, weightD: 700 },
    grimdark: { sat: 30, dark: true,  radius: 4,  borderW: 2, fontD: 'blackletter',fontB: 'serif',     tracking: '0.03em',  upper: false, texture: 'grunge',    glow: 0.3,  weightD: 700 },
    sport:    { sat: 90, dark: true,  radius: 3,  borderW: 0, fontD: 'condensed',  fontB: 'grotesk',   tracking: '0.06em',  upper: true,  texture: 'none',      glow: 0.35, weightD: 800 },
    cozy:     { sat: 45, dark: false, radius: 22, borderW: 0, fontD: 'rounded',    fontB: 'rounded',   tracking: '0em',     upper: false, texture: 'paper',     glow: 0.1,  weightD: 800 },
    editorial:{ sat: 25, dark: false, radius: 0,  borderW: 1, fontD: 'serif',      fontB: 'grotesk',   tracking: '-0.01em', upper: false, texture: 'none',      glow: 0.05, weightD: 700 },
    terminal: { sat: 80, dark: true,  radius: 0,  borderW: 1, fontD: 'mono',       fontB: 'mono',      tracking: '0.05em',  upper: true,  texture: 'scan',      glow: 0.6,  weightD: 700 },
    pastel:   { sat: 62, dark: false, radius: 26, borderW: 0, fontD: 'rounded',    fontB: 'rounded',   tracking: '0em',     upper: false, texture: 'none',      glow: 0.18, weightD: 800 },
  };

  /* ---------- MOTIFS: the small flavour glyph a layout may show ---------- */
  const MOTIFS = {
    none:    { glyph: '', label: '' },
    d20:     { glyph: 'd20', label: 'PARTY MEMBER' },
    hex:     { glyph: 'hex', label: '' },
    bolt:    { glyph: '⚡', label: '' },
    star:    { glyph: '★', label: '' },
    skull:   { glyph: '☠', label: '' },
    heart:   { glyph: '♥', label: '' },
    sword:   { glyph: '⚔', label: '' },
    bike:    { glyph: '🚲', label: '' },
    crown:   { glyph: '♛', label: '' },
    diamond: { glyph: '◆', label: '' },
    circuit: { glyph: '⬡', label: '' },
    claw:    { glyph: '', label: '' },   /* Hardclaws slash - drawn as SVG in app.js */
  };

  /* ---------- TEXTURES ---------- */
  function textureCSS(kind, ink) {
    switch (kind) {
      case 'scan':
        return `repeating-linear-gradient(0deg,rgba(0,0,0,.28) 0 1px,transparent 1px 3px)`;
      case 'parchment':
        return `radial-gradient(${ink} .6px,transparent .6px)`;
      case 'paper':
        return `radial-gradient(rgba(0,0,0,.10) .5px,transparent .5px)`;
      case 'grunge':
        return `repeating-linear-gradient(115deg,rgba(0,0,0,.16) 0 2px,transparent 2px 7px)`;
      case 'grid':
        return `linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)`;
      case 'dots':
        return `radial-gradient(rgba(255,255,255,.10) 1px,transparent 1px)`;
      default:
        return 'none';
    }
  }
  const TEXTURE_SIZE = { scan: 'auto', parchment: '7px 7px', paper: '5px 5px', grunge: 'auto', grid: '48px 48px', dots: '6px 6px', none: 'auto' };

  /* =============================================================
     generateSkin - the "describe it and get a theme" entry point
     opts: { mood, hue, hue2, contrast, radius, texture, motif,
             fontDisplay, fontBody, uppercase, glow, seed, name }
     Every field optional. Missing fields are synthesised from
     the mood + seed, so { mood:'cyber' } alone is a valid call.
     ============================================================= */
  function generateSkin(opts) {
    opts = opts || {};
    const seed = opts.seed !== undefined ? opts.seed : Math.floor(Math.random() * 1e9);
    const r = rng(seed);

    const moodKey = opts.mood && MOODS[opts.mood] ? opts.mood : pick(Object.keys(MOODS), r);
    const M = MOODS[moodKey];

    // base hue
    const hue = opts.hue !== undefined ? +opts.hue : Math.floor(r() * 360);
    // secondary hue: complementary-ish, nudged
    const scheme = opts.scheme || pick(['analogous', 'complementary', 'triadic', 'split'], r);
    const offsets = { analogous: 34, complementary: 180, triadic: 120, split: 150 };
    const hue2 = opts.hue2 !== undefined ? +opts.hue2 : hue + offsets[scheme] * (r() > 0.5 ? 1 : -1);
    const hue3 = hue + (hue2 - hue) / 2 + 40;

    const dark = opts.dark !== undefined ? !!opts.dark : M.dark;
    const contrast = opts.contrast !== undefined ? +opts.contrast : 0.5 + r() * 0.4; // 0..1
    const sat = opts.sat !== undefined ? +opts.sat : M.sat;
    const glow = opts.glow !== undefined ? +opts.glow : M.glow;
    const radius = opts.radius !== undefined ? +opts.radius : M.radius;
    const borderW = opts.borderW !== undefined ? +opts.borderW : M.borderW;
    const texture = opts.texture || M.texture;
    const motif = opts.motif || 'none';
    const upper = opts.uppercase !== undefined ? !!opts.uppercase : M.upper;

    const fontD = FONTS[opts.fontDisplay] || FONTS[M.fontD];
    const fontB = FONTS[opts.fontBody] || FONTS[M.fontB];

    // ---- build the palette ----
    let bg, surface, surface2, ink, inkDim, line, chip;
    if (dark) {
      const L = 5 + (1 - contrast) * 7;
      bg = hsl(hue, sat * 0.28, L);
      surface = hsl(hue, sat * 0.24, L + 5);
      surface2 = hsl(hue, sat * 0.22, L + 10);
      ink = hsl(hue, 12, 96);
      inkDim = hsl(hue, 14, 62);
      line = hsl(hue, sat * 0.3, L + 18);
      chip = hsl(hue, sat * 0.3, L + 8);
    } else {
      const L = 90 - (1 - contrast) * 6;
      bg = hsl(hue, sat * 0.35, L);
      surface = hsl(hue, sat * 0.42, L - 4);
      surface2 = hsl(hue, sat * 0.5, L - 10);
      ink = hsl(hue, 55, 14);
      inkDim = hsl(hue, 35, 34);
      line = hsl(hue, 45, 46);
      chip = hsl(hue, sat * 0.4, L - 2);
    }

    const accent = hsl(hue, clamp(sat + 8, 30, 100), dark ? 62 : 42);
    const accent2 = hsl(hue2, clamp(sat, 30, 100), dark ? 58 : 40);
    const accent3 = hsl(hue3, clamp(sat - 10, 25, 95), dark ? 66 : 46);
    const accentInk = dark ? hsl(hue, 30, 8) : hsl(hue, 20, 98);

    const name = opts.name || `${moodKey}-${Math.round(hue)}`;

    const tokens = {
      '--sk-name': `"${name}"`,
      '--bg': bg,
      '--surface': surface,
      '--surface-2': surface2,
      '--chip': chip,
      '--ink': ink,
      '--ink-dim': inkDim,
      '--line': line,
      '--accent': accent,
      '--accent-2': accent2,
      '--accent-3': accent3,
      '--accent-ink': accentInk,
      '--radius': radius + 'px',
      '--radius-sm': Math.max(0, radius * 0.45) + 'px',
      '--border-w': borderW + 'px',
      '--font-display': fontD,
      '--font-body': fontB,
      '--weight-display': String(opts.weightDisplay || M.weightD),
      '--tracking': opts.tracking || M.tracking,
      '--label-tracking': upper ? '0.24em' : '0.12em',
      '--transform': upper ? 'uppercase' : 'none',
      '--glow': String(glow),
      '--glow-accent': `0 0 ${Math.round(glow * 60)}px ${hsl(hue, sat, 60, clamp(glow, 0, 1) * 0.75)}`,
      '--shadow': dark
        ? `0 30px 80px rgba(0,0,0,${0.5 + contrast * 0.35})`
        : `0 24px 60px rgba(40,30,10,${0.25 + contrast * 0.2})`,
      '--texture': textureCSS(texture, dark ? 'rgba(255,255,255,.06)' : 'rgba(90,60,20,.22)'),
      '--texture-size': TEXTURE_SIZE[texture] || 'auto',
      '--texture-blend': dark ? 'screen' : 'multiply',
      '--scrim': dark ? 'rgba(4,4,8,.88)' : 'rgba(10,7,2,.88)',
      // ink used for anything sitting directly on top of clip video.
      // ALWAYS light: a light skin must not put dark text on footage.
      '--on-media': 'hsl(0 0% 98%)',
      '--on-media-dim': 'hsl(' + (((hue % 360) + 360) % 360) + ' 16% 78%)',
      '--on-media-acc': hsl(hue2, clamp(sat + 10, 45, 100), 68),
      '--live': hsl(355, 82, 52),
    };

    return {
      name, seed, mood: moodKey, hue: Math.round(((hue % 360) + 360) % 360),
      hue2: Math.round(((hue2 % 360) + 360) % 360),
      dark, motif, texture, scheme, tokens,
      css: ':root{' + Object.entries(tokens).map(([k, v]) => k + ':' + v).join(';') + '}',
      apply(el) {
        const t = el || document.documentElement;
        Object.entries(tokens).forEach(([k, v]) => t.style.setProperty(k, v));
        t.setAttribute('data-motif', motif);
        t.setAttribute('data-dark', dark ? '1' : '0');
        return t;
      },
    };
  }

  function pick(arr, r) { return arr[Math.floor((r ? r() : Math.random()) * arr.length)]; }

  /* =============================================================
     COLOUR ROLES - the contract between skins and layouts.
     Every layout only ever references these. Documented here so the
     theme editor can explain exactly what each one paints.
     ============================================================= */
  const ROLES = [
    { key: 'bg',        token: '--bg',        label: 'Page background',
      help: 'Fills the whole 1920x1080 frame. Set transparency to Full to remove it in OBS.' },
    { key: 'surface',   token: '--surface',   label: 'Panel background',
      help: 'The main info panel / band / card behind your text.' },
    { key: 'surface2',  token: '--surface-2', label: 'Panel background (raised)',
      help: 'Headers, stat tiles and anything layered on top of a panel.' },
    { key: 'chip',      token: '--chip',      label: 'Chip / pill background',
      help: 'Small rounded stat pills and tags.' },
    { key: 'ink',       token: '--ink',       label: 'Heading & body text',
      help: 'The streamer name and main copy. Must contrast with Panel background.' },
    { key: 'inkDim',    token: '--ink-dim',   label: 'Muted text',
      help: 'Labels, bio, clip credit line. Should be quieter but still readable.' },
    { key: 'line',      token: '--line',      label: 'Borders & dividers',
      help: 'Panel outlines, rules between stats.' },
    { key: 'accent',    token: '--accent',    label: 'Primary accent',
      help: 'Kicker text, follower count, CTA button, ornament colour, progress bar.' },
    { key: 'accent2',   token: '--accent-2',  label: 'Secondary accent',
      help: 'Gradient partner for the primary accent.' },
    { key: 'accent3',   token: '--accent-3',  label: 'Tertiary accent',
      help: 'Motif / badge highlights and third gradient stop.' },
    { key: 'accentInk', token: '--accent-ink',label: 'Text on accent',
      help: 'Text sitting on top of the CTA button. Must contrast with Primary accent.' },
    { key: 'onMedia',   token: '--on-media',  label: 'Text over video',
      help: 'Anything drawn straight onto clip footage. Keep this light.' },
    { key: 'live',      token: '--live',      label: 'LIVE badge',
      help: 'The red "LIVE" tag when the channel is streaming.' },
  ];

  /* relative luminance + contrast ratio, for the editor's warnings */
  function _lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function _rgb(css) {
    const s = String(css).trim();
    let m = s.match(/^#?([0-9a-f]{3})$/i);
    if (m) return [0, 1, 2].map((i) => parseInt(m[1][i] + m[1][i], 16));
    m = s.match(/^#?([0-9a-f]{6})$/i);
    if (m) return [0, 2, 4].map((i) => parseInt(m[1].substr(i, 2), 16));
    m = s.match(/rgba?\(([^)]+)\)/i);
    if (m) return m[1].split(',').slice(0, 3).map((v) => parseFloat(v));
    return null;
  }
  function contrast(a, b) {
    const A = _rgb(a), B = _rgb(b);
    if (!A || !B) return null;
    const la = 0.2126 * _lin(A[0]) + 0.7152 * _lin(A[1]) + 0.0722 * _lin(A[2]);
    const lb = 0.2126 * _lin(B[0]) + 0.7152 * _lin(B[1]) + 0.0722 * _lin(B[2]);
    const hi = Math.max(la, lb), lo = Math.min(la, lb);
    return +(((hi + 0.05) / (lo + 0.05))).toFixed(2);
  }

  /* =============================================================
     customSkin - build a skin from EXPLICIT values.
     No mood, no hue guessing. What you set is what you get.
     ============================================================= */
  const CUSTOM_DEFAULTS = {
    bg: '#0a0a10', surface: '#12121c', surface2: '#1a1a28', chip: '#16162a',
    ink: '#f0f0f6', inkDim: '#9a9ab4', line: '#2a2a44',
    accent: '#9146ff', accent2: '#00e6c3', accent3: '#c9a44c', accentInk: '#0a0710',
    onMedia: '#fafafa', live: '#e91916',
    radius: 14, borderW: 1, glow: 0.3,
    fontDisplay: 'grotesk', fontBody: 'grotesk',
    weightDisplay: 800, uppercase: false, texture: 'none',
    transparency: 'none',   // none | panels | full
    panelOpacity: 1,        // 0..1, used when transparency = 'panels'
    name: 'Custom',
  };

  function customSkin(opts) {
    const o = Object.assign({}, CUSTOM_DEFAULTS, opts || {});
    const dark = (() => {
      const c = _rgb(o.surface);
      if (!c) return true;
      return (0.2126 * _lin(c[0]) + 0.7152 * _lin(c[1]) + 0.0722 * _lin(c[2])) < 0.4;
    })();

    /* transparency modes:
         none   - solid background, solid panels
         panels - background removed, panels keep (optionally reduced) opacity
         full   - background removed AND panels go fully see-through  */
    const bgVal = o.transparency === 'none' ? o.bg : 'transparent';
    const pa = o.transparency === 'full' ? 0
             : o.transparency === 'panels' ? clamp(+o.panelOpacity, 0, 1)
             : 1;

    const tokens = {
      '--sk-name': `"${o.name}"`,
      '--bg': bgVal,
      '--surface': o.surface,
      '--surface-2': o.surface2,
      '--chip': o.chip,
      '--ink': o.ink,
      '--ink-dim': o.inkDim,
      '--line': o.line,
      '--accent': o.accent,
      '--accent-2': o.accent2,
      '--accent-3': o.accent3,
      '--accent-ink': o.accentInk,
      '--on-media': o.onMedia,
      '--on-media-dim': 'rgba(255,255,255,.76)',
      '--on-media-acc': o.accent2,
      '--live': o.live,
      '--radius': (+o.radius) + 'px',
      '--radius-sm': Math.max(0, (+o.radius) * 0.45) + 'px',
      '--border-w': (+o.borderW) + 'px',
      '--font-display': FONTS[o.fontDisplay] || FONTS.grotesk,
      '--font-body': FONTS[o.fontBody] || FONTS.grotesk,
      '--weight-display': String(o.weightDisplay || 800),
      '--tracking': o.tracking || '-0.02em',
      '--label-tracking': o.uppercase ? '0.24em' : '0.12em',
      '--transform': o.uppercase ? 'uppercase' : 'none',
      '--glow': String(o.glow),
      '--glow-accent': `0 0 ${Math.round(o.glow * 60)}px ${o.accent}${
        o.glow > 0 ? Math.round(clamp(o.glow, 0, 1) * 190).toString(16).padStart(2, '0') : '00'}`,
      '--shadow': dark ? '0 30px 80px rgba(0,0,0,.65)' : '0 24px 60px rgba(40,30,10,.35)',
      '--texture': textureCSS(o.texture, dark ? 'rgba(255,255,255,.06)' : 'rgba(90,60,20,.22)'),
      '--texture-size': TEXTURE_SIZE[o.texture] || 'auto',
      '--texture-blend': dark ? 'screen' : 'multiply',
      '--scrim': dark ? 'rgba(4,4,8,.88)' : 'rgba(10,7,2,.88)',
      '--panel-alpha': String(pa),
    };

    return {
      name: o.name, mood: 'custom', dark, motif: o.motif || 'none',
      texture: o.texture, opts: o, tokens, transparency: o.transparency,
      css: ':root{' + Object.entries(tokens).map(([k, v]) => k + ':' + v).join(';') + '}',
      apply(el) {
        const t = el || document.documentElement;
        Object.entries(tokens).forEach(([k, v]) => t.style.setProperty(k, v));
        t.setAttribute('data-motif', o.motif || 'none');
        t.setAttribute('data-dark', dark ? '1' : '0');
        t.setAttribute('data-transparency', o.transparency);
        return t;
      },
    };
  }

  /* hsl()/rgb() -> #rrggbb, because <input type=color> only accepts hex */
  function toHex(css) {
    const s = String(css).trim();
    if (/^#[0-9a-f]{6}$/i.test(s)) return s.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(s)) return '#' + s.slice(1).split('').map((c) => c + c).join('');
    let m = s.match(/hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/i)
         || s.match(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/i);
    if (m) {
      const h = +m[1] / 360, sa = +m[2] / 100, l = +m[3] / 100;
      const f = (n) => {
        const k = (n + h * 12) % 12;
        const a = sa * Math.min(l, 1 - l);
        return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))));
      };
      return '#' + [f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, '0')).join('');
    }
    m = s.match(/rgba?\(([^)]+)\)/i);
    if (m) {
      const p = m[1].split(',').map((v) => parseFloat(v));
      return '#' + p.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
    }
    return '#000000';
  }

  /* turn any generated/preset skin into editable explicit values */
  function toCustomOpts(skin) {
    const t = skin.tokens;
    return {
      bg: toHex(t['--bg']), surface: toHex(t['--surface']),
      surface2: toHex(t['--surface-2']), chip: toHex(t['--chip']),
      ink: toHex(t['--ink']), inkDim: toHex(t['--ink-dim']), line: toHex(t['--line']),
      accent: toHex(t['--accent']), accent2: toHex(t['--accent-2']),
      accent3: toHex(t['--accent-3']), accentInk: toHex(t['--accent-ink']),
      onMedia: toHex(t['--on-media'] || '#fafafa'),
      live: toHex(t['--live'] || '#e91916'),
      radius: parseFloat(t['--radius']) || 14,
      borderW: parseFloat(t['--border-w']) || 1,
      glow: parseFloat(t['--glow']) || 0.3,
      weightDisplay: parseInt(t['--weight-display']) || 800,
      uppercase: t['--transform'] === 'uppercase',
      texture: skin.texture || 'none',
      motif: skin.motif || 'none',
      transparency: 'none', panelOpacity: 1,
      name: skin.name || 'Custom',
    };
  }

  /* =============================================================
     PRESET SKINS - the curated ones shipped in the dropdown.
     Each is just a call to generateSkin with pinned values.
     ============================================================= */
  /* =============================================================
     PRESETS - hand-picked explicit palettes.
     Previously these were generated from a hue + mood, which meant the
     swatch never matched the rendered overlay and names like
     "Old Parchment" produced arbitrary colours. Now every value is
     chosen, so what you see in the swatch is what you get on screen.
     ============================================================= */
  const PRESETS = [
    /* Sampled straight from the Hardclaws logo: claw cyan #1ffdff, deep navy
       #0c2336, steel blue #327295. This is the house theme. */
    { id:'hardclaws', label:'Hardclaws', dark:true, p:{
      bg:'#08192a', surface:'#0c2336', surface2:'#13344b', chip:'#163a52',
      ink:'#e8f8fc', inkDim:'#8fb8cc', line:'#265777',
      accent:'#1ffdff', accent2:'#3fd3e2', accent3:'#7fe8f2', accentInk:'#04202c' } },
    { id:'twitch-purple', label:'Twitch Purple', dark:true, p:{
      bg:'#0e0b16', surface:'#1a1526', surface2:'#241d33', chip:'#2a2140',
      ink:'#f2eefb', inkDim:'#b3a8d2', line:'#3a2f56',
      accent:'#9146ff', accent2:'#00e5c0', accent3:'#c9a4ff', accentInk:'#0d0716' } },

    { id:'derailleur', label:'Dungeons & Derailleurs', dark:false, p:{
      bg:'#e8dfc7', surface:'#f3ead2', surface2:'#e2d5b4', chip:'#e8dcbe',
      ink:'#2f2410', inkDim:'#5d4b28', line:'#b39b66',
      accent:'#9a6b1f', accent2:'#5c7f3a', accent3:'#c9a44c', accentInk:'#fdf8ec' } },

    { id:'midnight', label:'Midnight Glass', dark:true, p:{
      bg:'#080b12', surface:'#111722', surface2:'#1a2231', chip:'#1d2634',
      ink:'#eef3fa', inkDim:'#8fa0b8', line:'#2b3848',
      accent:'#5b8dd9', accent2:'#7fd4e8', accent3:'#b9c9de', accentInk:'#05080e' } },

    { id:'neon-city', label:'Neon City', dark:true, p:{
      bg:'#0a0512', surface:'#160b24', surface2:'#1f0f33', chip:'#26123d',
      ink:'#fdeaff', inkDim:'#b98fd0', line:'#3d1c5e',
      accent:'#ff2fd0', accent2:'#00e5ff', accent3:'#ffd166', accentInk:'#12001a' } },

    { id:'synthwave', label:'Synthwave', dark:true, p:{
      bg:'#100626', surface:'#1c0c3d', surface2:'#2a1252', chip:'#301660',
      ink:'#ffeaf7', inkDim:'#c095e0', line:'#4a1f7d',
      accent:'#ff3d8b', accent2:'#8b5cf6', accent3:'#ffc857', accentInk:'#14002b' } },

    { id:'peloton', label:'Peloton', dark:true, p:{
      bg:'#0d1014', surface:'#161b21', surface2:'#1f262e', chip:'#232b34',
      ink:'#f4f7fa', inkDim:'#93a1af', line:'#2f3a45',
      accent:'#ff5f2e', accent2:'#00b4d8', accent3:'#ffd166', accentInk:'#0a0d10' } },

    { id:'grimoire', label:'Grimoire', dark:true, p:{
      bg:'#0c0810', surface:'#171020', surface2:'#20172c', chip:'#251b33',
      ink:'#ece4f2', inkDim:'#b3a3c6', line:'#37294a',
      accent:'#7b4bd6', accent2:'#9b1c14', accent3:'#c9a44c', accentInk:'#0a0610' } },

    { id:'parchment', label:'Old Parchment', dark:false, p:{
      bg:'#e5d8b8', surface:'#f2e7c9', surface2:'#e0d0a6', chip:'#e9dcb9',
      ink:'#3c2a10', inkDim:'#7a6338', line:'#b09660',
      accent:'#8a5a1e', accent2:'#6b7f3a', accent3:'#c9a44c', accentInk:'#fdf9ee' } },

    { id:'matrix', label:'Terminal Green', dark:true, p:{
      bg:'#020604', surface:'#07120a', surface2:'#0b1c10', chip:'#0d2214',
      ink:'#c8ffd8', inkDim:'#5f9c74', line:'#173a22',
      accent:'#22ff77', accent2:'#7cf5b0', accent3:'#b6ffcf', accentInk:'#01180a' } },

    { id:'cotton', label:'Cotton Candy', dark:false, p:{
      bg:'#fbeef5', surface:'#ffffff', surface2:'#fce4f0', chip:'#fdeaf4',
      ink:'#4a2038', inkDim:'#7a4f66', line:'#f0c4dc',
      accent:'#ff5fa2', accent2:'#5fd0e8', accent3:'#ffc2dd', accentInk:'#ffffff' } },

    { id:'espresso', label:'Espresso', dark:true, p:{
      bg:'#140f0b', surface:'#211812', surface2:'#2e211a', chip:'#33251c',
      ink:'#f5ece1', inkDim:'#b09479', line:'#453227',
      accent:'#c98a3f', accent2:'#7a9a55', accent3:'#e0b878', accentInk:'#160f08' } },

    { id:'broadsheet', label:'Broadsheet', dark:false, p:{
      bg:'#f4f1e8', surface:'#fffdf7', surface2:'#eae5d6', chip:'#f0ece0',
      ink:'#17140f', inkDim:'#5f594c', line:'#c9c2ae',
      accent:'#b3261e', accent2:'#2d4a7c', accent3:'#8a7f63', accentInk:'#fffdf7' } },

    { id:'vaporwave', label:'Vaporwave', dark:true, p:{
      bg:'#12082a', surface:'#1e1040', surface2:'#2a1857', chip:'#301c63',
      ink:'#f0e6ff', inkDim:'#a98fd6', line:'#432a78',
      accent:'#b46bff', accent2:'#4fe3d0', accent3:'#ff9ecd', accentInk:'#150634' } },

    { id:'blood-moon', label:'Blood Moon', dark:true, p:{
      bg:'#0f0607', surface:'#1c0b0d', surface2:'#281114', chip:'#2e1417',
      ink:'#ffe9ea', inkDim:'#cb9fa3', line:'#452024',
      accent:'#d92d3c', accent2:'#e08a2f', accent3:'#f0c0a0', accentInk:'#120405' } },

    { id:'arctic', label:'Arctic', dark:false, p:{
      bg:'#eef4f8', surface:'#ffffff', surface2:'#dfeaf2', chip:'#e8f0f6',
      ink:'#12222e', inkDim:'#55707f', line:'#c2d6e2',
      accent:'#0a7ea4', accent2:'#3fbfae', accent3:'#8fc7dd', accentInk:'#ffffff' } },

    { id:'gold-rush', label:'Gold Rush', dark:true, p:{
      bg:'#12100a', surface:'#1e1a10', surface2:'#2a2418', chip:'#30291b',
      ink:'#fbf3dd', inkDim:'#b8a678', line:'#463c24',
      accent:'#e0b040', accent2:'#3f7fb0', accent3:'#f0d488', accentInk:'#14100a' } },

    { id:'toxic', label:'Toxic', dark:true, p:{
      bg:'#080d05', surface:'#111a09', surface2:'#19260d', chip:'#1d2c10',
      ink:'#eeffdc', inkDim:'#93b075', line:'#2c4218',
      accent:'#9fe814', accent2:'#c026d3', accent3:'#d6f77a', accentInk:'#0a1204' } },

    { id:'sakura', label:'Sakura', dark:false, p:{
      bg:'#fdf1f3', surface:'#ffffff', surface2:'#fbe0e6', chip:'#fce8ec',
      ink:'#3f1c26', inkDim:'#6e4854', line:'#f0c8d2',
      accent:'#e75a7c', accent2:'#6aab7c', accent3:'#f7b8c6', accentInk:'#ffffff' } },

    { id:'deep-sea', label:'Deep Sea', dark:true, p:{
      bg:'#05121a', surface:'#0b1f2c', surface2:'#112b3c', chip:'#143244',
      ink:'#e4f4fb', inkDim:'#7ea3b8', line:'#1e4459',
      accent:'#17a2b8', accent2:'#4fd1a5', accent3:'#8fd8e8', accentInk:'#03121a' } },

    { id:'inferno', label:'Inferno', dark:true, p:{
      bg:'#120803', surface:'#1f0f06', surface2:'#2c160a', chip:'#33190b',
      ink:'#ffeee0', inkDim:'#c0906c', line:'#4a2611',
      accent:'#ff6a1f', accent2:'#ffc93c', accent3:'#ff9d5c', accentInk:'#140703' } },

    /* ---- blues ---- */
    { id:'ice-blue', label:'Ice Blue', dark:false, p:{
      bg:'#eef6fb', surface:'#ffffff', surface2:'#dcecf7', chip:'#e6f2fa',
      ink:'#0f2635', inkDim:'#527a86', line:'#bcd9ea',
      accent:'#3aa8e0', accent2:'#7fd4f0', accent3:'#a8dcf2', accentInk:'#04212f' } },

    { id:'sky', label:'Sky', dark:false, p:{
      bg:'#f0f7ff', surface:'#ffffff', surface2:'#e0edfd', chip:'#e9f2ff',
      ink:'#122740', inkDim:'#4d6a84', line:'#c3dbf5',
      accent:'#2f80ed', accent2:'#56ccf2', accent3:'#9dc6f5', accentInk:'#ffffff' } },

    { id:'steel-blue', label:'Steel Blue', dark:true, p:{
      bg:'#0c1218', surface:'#151f29', surface2:'#1e2b38', chip:'#223140',
      ink:'#e8f1f8', inkDim:'#8aa2b8', line:'#2e4256',
      accent:'#4a90c2', accent2:'#6fb3d4', accent3:'#9dc2d8', accentInk:'#06101a' } },

    { id:'navy', label:'Navy', dark:true, p:{
      bg:'#05091a', surface:'#0c1430', surface2:'#131e42', chip:'#16234d',
      ink:'#e6ecff', inkDim:'#9ba7d4', line:'#22326b',
      accent:'#3d6fe8', accent2:'#6f9bff', accent3:'#b0c4ff', accentInk:'#040a1c' } },

    { id:'electric-blue', label:'Electric Blue', dark:true, p:{
      bg:'#03080f', surface:'#08131f', surface2:'#0d1d2e', chip:'#102437',
      ink:'#e0f6ff', inkDim:'#6f9fbb', line:'#173a52',
      accent:'#00b4ff', accent2:'#00e5ff', accent3:'#7fe3ff', accentInk:'#001420' } },

    { id:'cobalt', label:'Cobalt', dark:true, p:{
      bg:'#070a1c', surface:'#101637', surface2:'#181f4c', chip:'#1c2456',
      ink:'#eceeff', inkDim:'#8f96cc', line:'#28316f',
      accent:'#5566ff', accent2:'#00d4ff', accent3:'#a3adff', accentInk:'#05071a' } },

    { id:'glacier', label:'Glacier', dark:true, p:{
      bg:'#08131a', surface:'#0f2029', surface2:'#163039', chip:'#1a3642',
      ink:'#e6f7fb', inkDim:'#7fa8b5', line:'#224d5c',
      accent:'#5ecfd6', accent2:'#9fe8e0', accent3:'#c2eff2', accentInk:'#04161c' } },

    { id:'denim', label:'Denim', dark:false, p:{
      bg:'#e9eef5', surface:'#f8fafd', surface2:'#d6e0ee', chip:'#e0e8f4',
      ink:'#1a2739', inkDim:'#5a6b83', line:'#b5c5da',
      accent:'#3b5f8f', accent2:'#6b93c4', accent3:'#9fb8d4', accentInk:'#ffffff' } },
  ];

  const PRESET_EXTRA = {
    derailleur:{ fontDisplay:'serif', fontBody:'serif', radius:8, texture:'parchment', motif:'d20' },
    parchment:{ fontDisplay:'serif', fontBody:'serif', radius:8, texture:'parchment', motif:'sword' },
    broadsheet:{ fontDisplay:'serif', fontBody:'grotesk', radius:0, borderW:1 },
    matrix:{ fontDisplay:'mono', fontBody:'mono', radius:0, texture:'scan', uppercase:true },
    'neon-city':{ fontDisplay:'condensed', fontBody:'mono', radius:2, glow:.9, uppercase:true, texture:'scan', motif:'circuit' },
    synthwave:{ fontDisplay:'display', fontBody:'mono', radius:0, glow:.8, uppercase:true, texture:'scan', motif:'star' },
    vaporwave:{ fontDisplay:'display', fontBody:'mono', radius:0, glow:.7, uppercase:true, motif:'diamond' },
    peloton:{ fontDisplay:'condensed', radius:3, uppercase:true, motif:'bike' },
    grimoire:{ fontDisplay:'blackletter', fontBody:'serif', radius:4, texture:'grunge', motif:'skull' },
    'blood-moon':{ fontDisplay:'blackletter', fontBody:'serif', radius:4, texture:'grunge', motif:'skull' },
    espresso:{ fontDisplay:'rounded', fontBody:'rounded', radius:22, texture:'paper' },
    cotton:{ fontDisplay:'rounded', fontBody:'rounded', radius:26, motif:'heart' },
    sakura:{ fontDisplay:'rounded', fontBody:'rounded', radius:24, motif:'star' },
    arctic:{ radius:6, borderW:1 },
    midnight:{ radius:4, glow:.08 },
    'gold-rush':{ fontDisplay:'condensed', radius:6, uppercase:true, motif:'crown' },
    toxic:{ fontDisplay:'condensed', radius:2, glow:.9, uppercase:true, motif:'bolt' },
    inferno:{ fontDisplay:'condensed', radius:6, glow:.5, uppercase:true, motif:'bolt' },
    'deep-sea':{ radius:14 },
    'twitch-purple':{ radius:14, glow:.3 },
    'ice-blue':{ radius:16, borderW:1, glow:.15 },
    sky:{ radius:18, borderW:0, glow:.2 },
    'steel-blue':{ radius:6, borderW:2, glow:.2 },
    navy:{ radius:8, glow:.35 },
    'electric-blue':{ fontDisplay:'condensed', radius:2, glow:.95, uppercase:true, texture:'scan', motif:'circuit' },
    cobalt:{ radius:10, glow:.5 },
    glacier:{ radius:20, glow:.3 },
    denim:{ fontDisplay:'slab', fontBody:'grotesk', radius:6, borderW:1, texture:'paper' },
    /* house theme: claw motif, hard edges, strong glow to match the logo */
    hardclaws:{ fontDisplay:'grotesk', radius:6, borderW:2, glow:.85,
                texture:'scan', motif:'claw' },
  };

  const presetSkin = (id) => {
    const p = PRESETS.find((x) => x.id === id) || PRESETS[0];
    const opts = Object.assign({ name: p.label }, p.p, PRESET_EXTRA[p.id] || {});
    /* Guarantee button text is readable on the accent. Hand-picking this per
       preset is easy to get wrong, so pick whichever of white / near-black
       actually clears the contrast bar. */
    const white = contrast('#ffffff', opts.accent);
    const black = contrast('#101014', opts.accent);
    if (Math.max(white, black) > contrast(opts.accentInk, opts.accent)) {
      opts.accentInk = white >= black ? '#ffffff' : '#101014';
    }
    return customSkin(opts);
  };

  /* =============================================================
     describeToSkin - loose natural-language -> skin opts.
     Lets the generator UI accept "dark cyberpunk pink" etc.
     ============================================================= */
  const WORD_HUE = {
    red: 358, crimson: 350, blood: 355, orange: 24, amber: 38, gold: 44, yellow: 52,
    lime: 88, green: 132, emerald: 152, teal: 174, cyan: 188, sky: 200, blue: 220,
    indigo: 248, violet: 268, purple: 278, magenta: 302, pink: 330, rose: 344,
    brown: 26, sepia: 34, silver: 220, mono: 220,
  };
  const WORD_MOOD = {
    clean: 'clean', modern: 'clean', sleek: 'clean', minimal: 'minimal', simple: 'minimal',
    bold: 'bold', loud: 'bold', punchy: 'bold', cyber: 'cyber', cyberpunk: 'cyber',
    neon: 'cyber', futuristic: 'cyber', tech: 'cyber', retro: 'retro', arcade: 'retro',
    vintage: 'retro', synthwave: 'retro', vaporwave: 'retro', fantasy: 'fantasy',
    medieval: 'fantasy', parchment: 'fantasy', dnd: 'fantasy', rpg: 'fantasy',
    tabletop: 'fantasy', grim: 'grimdark', gothic: 'grimdark',
    horror: 'grimdark', metal: 'grimdark', sport: 'sport', sports: 'sport',
    racing: 'sport', broadcast: 'sport', athletic: 'sport', cozy: 'cozy', warm: 'cozy',
    soft: 'cozy', editorial: 'editorial', magazine: 'editorial', print: 'editorial',
    terminal: 'terminal', hacker: 'terminal', code: 'terminal', matrix: 'terminal',
    pastel: 'pastel', cute: 'pastel', kawaii: 'pastel',
  };
  const WORD_MOTIF = {
    dnd: 'd20', dice: 'd20', d20: 'd20', rpg: 'd20', tabletop: 'd20',
    bike: 'bike', cycling: 'bike', zwift: 'bike', hex: 'hex', tech: 'circuit',
    skull: 'skull', horror: 'skull', star: 'star', crown: 'crown', king: 'crown',
    lightning: 'bolt', electric: 'bolt', heart: 'heart', love: 'heart', sword: 'sword',
  };

  function describeToSkin(text, extra) {
    const words = String(text || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const o = Object.assign({}, extra || {});

    // 1. mood - first explicit mood word wins (ignores 'dark'/'light')
    if (!o.mood) {
      for (const w of words) { if (WORD_MOOD[w]) { o.mood = WORD_MOOD[w]; break; } }
    }
    // 2. colour - first colour word wins
    if (o.hue === undefined) {
      for (const w of words) { if (WORD_HUE[w] !== undefined) { o.hue = WORD_HUE[w]; break; } }
    }
    // 3. motif
    if (!o.motif) {
      for (const w of words) { if (WORD_MOTIF[w]) { o.motif = WORD_MOTIF[w]; break; } }
    }
    // 4. lightness is independent of mood
    if (words.some((w) => ['light', 'bright', 'white', 'day', 'daylight'].includes(w))) o.dark = false;
    else if (words.some((w) => ['dark', 'night', 'black', 'midnight'].includes(w))) o.dark = true;
    // 'dark' with no other mood implies grimdark
    if (!o.mood && words.includes('dark')) o.mood = 'grimdark';

    if (o.seed === undefined) o.seed = words.join('-') || Math.floor(Math.random() * 1e9);
    if (!o.name) o.name = (text || 'Custom').slice(0, 40);
    return generateSkin(o);
  }

  root.Skins = { generateSkin, describeToSkin, presetSkin, customSkin, toCustomOpts,
    ROLES, contrast, toHex, CUSTOM_DEFAULTS, PRESETS, MOODS, MOTIFS, FONTS, rng };
})(typeof window !== 'undefined' ? window : globalThis);
