/* Clawmark — Twitch Shoutout Overlay for OBS
 * Created by Hardclaws · twitch.tv/hardclaws · thehardclaws@gmail.com
 * MIT licence. Free to use, modify and fork.
 */
/* =============================================================
   PROCEDURAL ORNAMENT SYNTHESIS
   Generates ornament SVG from a FEATURE VECTOR rather than picking
   from a fixed list. Any phrase — known or not — maps onto features,
   so "steampunk brass pipes", "underwater bubbles" and "pizza" each
   produce a distinct, repeatable shape.

   Pipeline:
     phrase -> features (semantics + phonetic hash) -> SVG
   ============================================================= */
(function (root) {
  'use strict';

  /* ---------------- deterministic hash / rng ---------------- */
  function hash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }
  function rng(seed) {
    let h = typeof seed === 'number' ? seed >>> 0 : hash(String(seed));
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    };
  }
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* =============================================================
     FEATURE VECTOR
       form      radial | linear | scatter | arc | lattice
       sym       rotational symmetry count (3..36)
       teeth     0..1  toothed/spiky outer edge
       rings     0..4  concentric rings
       spokes    0..1  radial spokes
       round     0..1  polygon (0) .. circle (1)
       fill      0..1  outline (0) .. solid (1)
       weight    1..12 stroke width
       hole      0..0.7 centre hole
       wobble    0..1  organic distortion
       density   0..1  how many repeated elements
       spin      -1..1 rotation speed & direction
       flow      out | up | across
     ============================================================= */

  /* Semantic lexicon: word -> partial feature push.
     Values are targets; multiple words average together. */
  const LEX = {
    /* --- cycling / mechanical --- */
    cog:{form:'radial',sym:12,teeth:.9,rings:2,round:.15,hole:.34,weight:5,spin:.6},
    gear:{form:'radial',sym:10,teeth:.95,rings:2,round:.1,hole:.3,weight:5,spin:.6},
    gears:{form:'radial',sym:14,teeth:.95,rings:2,round:.1,hole:.3,weight:5,spin:.7},
    sprocket:{form:'radial',sym:18,teeth:.85,rings:1,round:.2,hole:.4,weight:4,spin:.6},
    chainring:{form:'radial',sym:28,teeth:.5,rings:2,spokes:.9,round:.6,hole:.12,weight:3,spin:.5},
    crank:{form:'radial',sym:5,teeth:.2,spokes:1,rings:1,round:.3,weight:6,spin:.4},
    wheel:{form:'radial',sym:24,spokes:1,rings:2,round:1,hole:.06,weight:2,spin:.8},
    spoke:{form:'radial',sym:28,spokes:1,rings:1,round:1,weight:1.4,spin:.8},
    spokes:{form:'radial',sym:32,spokes:1,rings:1,round:1,weight:1.4,spin:.8},
    tyre:{form:'radial',sym:36,teeth:.35,rings:3,round:1,hole:.5,weight:6},
    tire:{form:'radial',sym:36,teeth:.35,rings:3,round:1,hole:.5,weight:6},
    chain:{form:'linear',density:.8,round:.9,weight:3,flow:'across'},
    pedal:{form:'radial',sym:4,teeth:.3,round:.1,weight:5,spin:.5},
    bike:{form:'radial',sym:24,spokes:1,rings:2,round:1,hole:.08,weight:2.4,spin:.7},
    bicycle:{form:'radial',sym:24,spokes:1,rings:2,round:1,hole:.08,weight:2.4,spin:.7},
    cycling:{form:'radial',sym:12,teeth:.85,rings:2,round:.2,hole:.32,weight:5,spin:.6},
    zwift:{form:'radial',sym:12,teeth:.8,rings:2,round:.25,hole:.3,weight:5,spin:.6},
    peloton:{form:'scatter',density:.85,round:1,sym:9,weight:3},
    derailleur:{form:'radial',sym:11,teeth:.9,rings:2,round:.15,hole:.3,weight:4,spin:.55},

    /* --- gauges / speed --- */
    speedo:{form:'arc',sym:14,rings:2,round:.9,weight:5,teeth:.3},
    speedometer:{form:'arc',sym:16,rings:2,round:.9,weight:5,teeth:.3},
    gauge:{form:'arc',sym:12,rings:2,round:.9,weight:5,teeth:.25},
    dial:{form:'arc',sym:12,rings:2,round:1,weight:4,teeth:.2},
    watt:{form:'arc',sym:10,rings:1,round:.9,weight:6,teeth:.2},
    watts:{form:'arc',sym:10,rings:1,round:.9,weight:6,teeth:.2},
    power:{form:'arc',sym:9,rings:1,round:.85,weight:7,teeth:.25},
    heart:{form:'linear',density:.5,wobble:.5,weight:5,flow:'across'},
    pulse:{form:'linear',density:.6,wobble:.55,weight:4,flow:'across'},
    cadence:{form:'radial',sym:16,teeth:.4,rings:2,round:.8,weight:3,spin:.9},

    /* --- terrain --- */
    mountain:{form:'linear',density:.45,round:0,weight:3.5,flow:'across',wobble:.25},
    mountains:{form:'linear',density:.5,round:0,weight:3.5,flow:'across',wobble:.3},
    climb:{form:'linear',density:.4,round:0,weight:4,flow:'across',wobble:.2},
    hill:{form:'linear',density:.35,round:.4,weight:4,flow:'across',wobble:.4},
    hills:{form:'linear',density:.45,round:.4,weight:4,flow:'across',wobble:.4},
    elevation:{form:'linear',density:.5,round:.1,weight:3,flow:'across'},
    gradient:{form:'linear',density:.4,round:0,weight:4,flow:'across'},
    alpe:{form:'linear',density:.5,round:0,weight:4,flow:'across',wobble:.2},
    road:{form:'linear',density:.9,round:0,weight:5,flow:'across'},

    /* --- tabletop --- */
    d20:{form:'radial',sym:6,round:0,rings:2,weight:5,teeth:0},
    dice:{form:'radial',sym:6,round:0,rings:2,weight:5},
    dnd:{form:'radial',sym:6,round:0,rings:2,weight:5},
    rpg:{form:'radial',sym:6,round:0,rings:2,weight:5},
    tabletop:{form:'radial',sym:6,round:0,rings:2,weight:5},
    quest:{form:'radial',sym:6,round:0,rings:1,weight:5},
    dungeon:{form:'lattice',sym:4,round:0,density:.6,weight:4},
    sword:{form:'linear',density:.2,round:0,weight:6,flow:'up'},
    shield:{form:'radial',sym:5,round:.25,rings:2,weight:5},
    rune:{form:'lattice',sym:6,round:0,density:.5,weight:4},
    magic:{form:'scatter',sym:8,density:.7,teeth:.8,round:.2,weight:2.5,spin:.4},
    spell:{form:'radial',sym:8,rings:3,teeth:.5,round:.7,weight:2.5,spin:.35},

    /* --- nature / organic --- */
    bubble:{form:'scatter',density:.85,round:1,weight:2.5,wobble:.3},
    bubbles:{form:'scatter',density:1,round:1,weight:2.5,wobble:.35},
    underwater:{form:'scatter',density:.9,round:1,weight:2.5,wobble:.45,flow:'up'},
    ocean:{form:'linear',density:.6,round:1,wobble:.8,weight:4,flow:'across'},
    sea:{form:'linear',density:.6,round:1,wobble:.8,weight:4,flow:'across'},
    wave:{form:'linear',density:.55,round:1,wobble:.85,weight:4,flow:'across'},
    waves:{form:'linear',density:.65,round:1,wobble:.85,weight:4,flow:'across'},
    water:{form:'linear',density:.6,round:1,wobble:.75,weight:3.5,flow:'across'},
    fire:{form:'radial',sym:7,teeth:1,round:.35,wobble:.7,fill:.85,weight:2,flow:'up'},
    flame:{form:'radial',sym:7,teeth:1,round:.35,wobble:.7,fill:.85,weight:2,flow:'up'},
    flaming:{form:'radial',sym:9,teeth:1,round:.3,wobble:.75,fill:.8,weight:2,flow:'up'},
    burning:{form:'radial',sym:8,teeth:1,round:.3,wobble:.7,fill:.8,weight:2,flow:'up'},
    sun:{form:'radial',sym:16,teeth:.8,rings:1,round:.9,fill:.4,weight:3,spin:.25},
    leaf:{form:'radial',sym:5,round:.7,wobble:.6,fill:.5,weight:3},
    tree:{form:'radial',sym:6,round:.55,wobble:.55,weight:4,flow:'up'},
    flower:{form:'radial',sym:8,round:.85,wobble:.4,fill:.5,weight:3,spin:.2},
    snow:{form:'radial',sym:6,teeth:.75,spokes:1,round:.1,weight:2.5,spin:.15},
    ice:{form:'radial',sym:6,teeth:.6,round:0,weight:3},
    storm:{form:'scatter',sym:5,teeth:.9,round:.1,fill:.7,density:.5,weight:3},
    cloud:{form:'scatter',density:.7,round:1,wobble:.5,fill:.35,weight:3},
    star:{form:'radial',sym:5,teeth:1,round:0,fill:.9,weight:2},
    stars:{form:'scatter',sym:5,teeth:1,round:0,fill:.9,density:.8,weight:2},
    moon:{form:'radial',sym:24,round:1,rings:1,fill:.5,weight:3},
    space:{form:'scatter',density:.7,round:1,sym:5,teeth:.9,weight:2},
    galaxy:{form:'radial',sym:3,rings:3,round:1,spokes:.5,wobble:.6,weight:2.5,spin:.3},

    /* --- animals --- */
    dog:{form:'scatter',sym:4,round:.8,wobble:.5,fill:.6,density:.5,weight:3},
    cat:{form:'radial',sym:3,round:.2,teeth:.7,fill:.6,weight:3},
    bird:{form:'linear',density:.4,round:.8,wobble:.6,weight:3,flow:'across'},
    fish:{form:'scatter',density:.6,round:.7,wobble:.5,fill:.5,weight:3},
    dragon:{form:'radial',sym:7,teeth:.9,round:.2,wobble:.5,weight:4},
    skull:{form:'radial',sym:5,round:.6,rings:2,fill:.55,weight:4,hole:.25},
    bone:{form:'linear',density:.3,round:.9,weight:6,flow:'across'},

    /* --- objects / culture --- */
    steampunk:{form:'radial',sym:14,teeth:.85,rings:3,round:.2,hole:.28,weight:5,spin:.4},
    brass:{form:'radial',sym:12,teeth:.7,rings:3,round:.35,weight:5},
    pipe:{form:'lattice',sym:4,round:.3,density:.7,weight:8},
    pipes:{form:'lattice',sym:4,round:.3,density:.8,weight:8},
    valve:{form:'radial',sym:8,teeth:.4,rings:2,round:.7,hole:.3,weight:5,spin:.3},
    clock:{form:'radial',sym:12,rings:2,round:1,spokes:.35,weight:3,spin:.12},
    watch:{form:'radial',sym:12,rings:2,round:1,spokes:.3,weight:3,spin:.12},
    vinyl:{form:'radial',sym:30,rings:4,round:1,hole:.14,weight:1.6,spin:1},
    record:{form:'radial',sym:30,rings:4,round:1,hole:.14,weight:1.6,spin:1},
    turntable:{form:'radial',sym:26,rings:4,round:1,hole:.12,weight:1.8,spin:1},
    disc:{form:'radial',sym:24,rings:3,round:1,hole:.1,weight:2,spin:.9},
    cd:{form:'radial',sym:24,rings:3,round:1,hole:.2,weight:2,spin:.9},
    coffee:{form:'radial',sym:20,rings:3,round:1,hole:.2,weight:4,wobble:.3},
    cup:{form:'radial',sym:18,rings:2,round:1,hole:.3,weight:5},
    pizza:{form:'radial',sym:8,spokes:1,rings:1,round:1,teeth:.25,weight:4,fill:.2},
    donut:{form:'radial',sym:22,rings:2,round:1,hole:.42,weight:6,wobble:.25},
    vhs:{form:'lattice',sym:4,round:.1,density:.5,weight:5},
    tape:{form:'radial',sym:16,rings:3,round:1,hole:.35,weight:4,spin:.5},
    cassette:{form:'radial',sym:14,rings:2,round:1,hole:.38,weight:4,spin:.5},
    camera:{form:'radial',sym:8,rings:3,round:.85,hole:.22,weight:4},
    film:{form:'lattice',sym:8,round:.2,density:.9,weight:3,flow:'across'},
    circuit:{form:'lattice',sym:6,round:.05,density:.75,weight:3},
    tech:{form:'lattice',sym:6,round:.05,density:.7,weight:3},
    pixel:{form:'lattice',sym:4,round:0,density:.85,weight:4},
    retro:{form:'lattice',sym:5,round:.1,density:.6,weight:4},
    arcade:{form:'lattice',sym:5,round:.05,density:.7,weight:4},
    crown:{form:'radial',sym:5,teeth:.95,round:.05,fill:.6,weight:3},
    trophy:{form:'radial',sym:6,round:.4,rings:2,fill:.4,weight:4},
    medal:{form:'radial',sym:14,rings:3,round:1,fill:.3,weight:4},
    coin:{form:'radial',sym:20,rings:2,round:1,fill:.25,weight:4,spin:.5},
    diamond:{form:'radial',sym:4,round:0,rings:2,weight:4},
    gem:{form:'radial',sym:6,round:0,rings:2,weight:4},
    bolt:{form:'radial',sym:4,teeth:1,round:0,fill:.9,weight:2,flow:'up'},
    lightning:{form:'radial',sym:4,teeth:1,round:0,fill:.9,weight:2,flow:'up'},
    electric:{form:'scatter',sym:4,teeth:1,round:0,fill:.85,density:.5,weight:2},
    hex:{form:'radial',sym:6,round:0,weight:6},
    hexagon:{form:'radial',sym:6,round:0,weight:6},
    triangle:{form:'radial',sym:3,round:0,weight:6},
    square:{form:'radial',sym:4,round:0,weight:6},
    grid:{form:'lattice',sym:4,round:0,density:.8,weight:2.5},

    /* --- abstract modifiers --- */
    spinning:{spin:1},
    spin:{spin:1},
    rotating:{spin:.9},
    fast:{spin:1,teeth:.6},
    slow:{spin:.15},
    giant:{weight:8,density:.3},
    big:{weight:7},
    tiny:{weight:2,density:.9},
    small:{weight:2.5,density:.8},
    thick:{weight:9},
    thin:{weight:1.5},
    sharp:{teeth:.95,round:0},
    spiky:{teeth:1,round:0},
    soft:{round:1,wobble:.5,teeth:0},
    smooth:{round:1,teeth:0,wobble:0},
    organic:{wobble:.8,round:.9},
    geometric:{wobble:0,round:0},
    angular:{round:0,wobble:0},
    solid:{fill:1},
    outline:{fill:0},
    dense:{density:1},
    sparse:{density:.2},
    ornate:{rings:4,density:.8,sym:16},
    simple:{rings:0,density:.25,sym:6},
    minimal:{rings:0,density:.2,weight:2},
    busy:{density:1,rings:3},
  };

  /* stop-words that shouldn't influence the shape */
  const STOP = new Set(['a','an','the','with','and','of','in','on','for','to','my','me',
    'i','is','it','that','this','style','layout','overlay','theme','look','like','some',
    'please','want','would','make','create','generate','show','using','use','more','very']);

  /* =============================================================
     phraseToFeatures — ALWAYS produces a shape, known words or not
     ============================================================= */
  function phraseToFeatures(phrase, seed) {
    const raw = String(phrase || '').toLowerCase();
    const words = raw.split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w));
    const r = rng((seed === undefined ? '' : seed) + '|' + raw);

    /* baseline, nudged by a hash of the whole phrase so unknown
       input still lands somewhere specific and repeatable */
    const H = hash(raw || 'x');
    const f = {
      form: ['radial','linear','scatter','arc','lattice'][H % 5],
      sym: 3 + (H >> 3) % 22,
      teeth: ((H >> 7) % 100) / 100,
      rings: (H >> 11) % 4,
      spokes: ((H >> 13) % 100) / 100,
      round: ((H >> 17) % 100) / 100,
      fill: ((H >> 19) % 60) / 100,
      weight: 2 + ((H >> 23) % 70) / 10,
      hole: ((H >> 5) % 45) / 100,
      wobble: ((H >> 9) % 100) / 100,
      density: .3 + ((H >> 15) % 60) / 100,
      spin: (((H >> 21) % 200) - 100) / 100,
      flow: ['out','up','across'][(H >> 25) % 3],
    };

    /* known words pull the vector toward their target */
    let hits = 0;
    const acc = {};
    words.forEach((w) => {
      let e = LEX[w];
      if (!e && w.endsWith('s')) e = LEX[w.slice(0, -1)];   // plurals
      if (!e && w.endsWith('ing')) e = LEX[w.slice(0, -3)];
      if (!e) return;
      hits++;
      Object.keys(e).forEach((k) => {
        if (typeof e[k] === 'string') { acc[k] = e[k]; return; }
        acc[k] = acc[k] === undefined ? [e[k]] : acc[k].concat(e[k]);
      });
    });
    Object.keys(acc).forEach((k) => {
      const v = acc[k];
      if (typeof v === 'string') { f[k] = v; return; }
      const mean = v.reduce((a, b) => a + b, 0) / v.length;
      // known words dominate, but keep a trace of the phrase hash
      f[k] = lerp(f[k], mean, 0.88);
    });

    /* unknown words still shape the result: fold each one's hash in,
       so "pizza" and "vinyl" diverge even with no lexicon entry */
    words.forEach((w) => {
      if (LEX[w]) return;
      const wh = hash(w);
      f.sym = clamp(Math.round(lerp(f.sym, 3 + (wh % 22), 0.5)), 3, 36);
      f.teeth = clamp(lerp(f.teeth, (wh >> 6 & 127) / 127, 0.4), 0, 1);
      f.round = clamp(lerp(f.round, (wh >> 13 & 127) / 127, 0.4), 0, 1);
      f.wobble = clamp(lerp(f.wobble, (wh >> 20 & 127) / 127, 0.35), 0, 1);
      f.rings = clamp(Math.round(lerp(f.rings, (wh >> 3) % 5, 0.4)), 0, 4);
    });

    /* per-variant jitter so "more variations" differ without losing intent */
    if (seed !== undefined && seed !== '') {
      f.sym = clamp(Math.round(f.sym + (r() * 6 - 3)), 3, 36);
      f.rings = clamp(Math.round(f.rings + (r() * 2 - 1)), 0, 4);
      f.teeth = clamp(f.teeth + (r() * .3 - .15), 0, 1);
      f.round = clamp(f.round + (r() * .3 - .15), 0, 1);
      f.wobble = clamp(f.wobble + (r() * .3 - .15), 0, 1);
      f.weight = clamp(f.weight + (r() * 2 - 1), 1, 12);
      if (hits === 0 && r() > .55) f.form = ['radial','linear','scatter','arc','lattice'][Math.floor(r() * 5)];
    }

    f.sym = clamp(Math.round(f.sym), 3, 36);
    f.rings = clamp(Math.round(f.rings), 0, 4);
    ['teeth','spokes','round','fill','hole','wobble','density'].forEach((k) =>
      f[k] = +clamp(f[k], 0, 1).toFixed(3));
    f.weight = +clamp(f.weight, 1, 12).toFixed(2);
    f.spin = +clamp(f.spin, -1, 1).toFixed(2);
    f.matched = hits;
    f.phrase = phrase || '';
    return f;
  }

  /* =============================================================
     SVG SYNTHESIS
     ============================================================= */
  const P = (x, y) => `${(+x).toFixed(1)},${(+y).toFixed(1)}`;

  function radialPath(f, R, r0) {
    const pts = [];
    const n = Math.max(3, f.sym);
    const steps = f.teeth > .12 ? n * 2 : n;
    for (let i = 0; i < steps; i++) {
      const isOuter = f.teeth > .12 ? i % 2 === 0 : true;
      const a = (i / steps) * Math.PI * 2 - Math.PI / 2;
      const wob = 1 + (Math.sin(i * 2.7) * f.wobble * 0.22);
      const rad = (isOuter ? R : R * (1 - f.teeth * 0.42)) * wob;
      pts.push([50 + Math.cos(a) * rad, 50 + Math.sin(a) * rad]);
    }
    if (f.round > .6 && f.teeth < .3) {
      // smooth blob via quadratic curves
      let d = `M ${P(pts[0][0], pts[0][1])}`;
      for (let i = 0; i < pts.length; i++) {
        const cur = pts[i], nx = pts[(i + 1) % pts.length];
        const mx = (cur[0] + nx[0]) / 2, my = (cur[1] + nx[1]) / 2;
        d += ` Q ${P(cur[0], cur[1])} ${P(mx, my)}`;
      }
      return d + ' Z';
    }
    return 'M ' + pts.map((p) => P(p[0], p[1])).join(' L ') + ' Z';
  }

  function synth(f, cls) {
    const col = 'currentColor';
    const sw = f.weight.toFixed(1);
    const fillMode = f.fill > .55;
    const bits = [];

    if (f.form === 'radial' || f.form === 'arc') {
      const R = 44;
      // concentric rings
      for (let i = 0; i < f.rings; i++) {
        const rr = R * (0.34 + (i / Math.max(1, f.rings)) * 0.5);
        if (f.round > .5) {
          bits.push(`<circle cx="50" cy="50" r="${rr.toFixed(1)}" fill="none"
            stroke="${col}" stroke-width="${(f.weight * 0.55).toFixed(1)}" opacity="${(0.5 + i * 0.12).toFixed(2)}"/>`);
        } else {
          const g = Object.assign({}, f, { teeth: 0 });
          bits.push(`<path d="${radialPath(g, rr, 0)}" fill="none" stroke="${col}"
            stroke-width="${(f.weight * 0.5).toFixed(1)}" opacity="${(0.5 + i * 0.12).toFixed(2)}"/>`);
        }
      }
      // spokes
      if (f.spokes > .25) {
        const ns = Math.max(3, Math.round(f.sym * (0.5 + f.spokes)));
        for (let i = 0; i < ns; i++) {
          const a = (i / ns) * Math.PI * 2;
          bits.push(`<line x1="50" y1="50" x2="${(50 + Math.cos(a) * R * .92).toFixed(1)}"
            y2="${(50 + Math.sin(a) * R * .92).toFixed(1)}" stroke="${col}"
            stroke-width="${Math.max(0.8, f.weight * 0.35).toFixed(1)}" opacity=".8"/>`);
        }
      }
      // main body
      if (f.form === 'arc') {
        bits.push(`<path d="M ${P(50 - R, 50 + R * .42)} A ${R} ${R} 0 1 1 ${P(50 + R, 50 + R * .42)}"
          fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"/>`);
        // ticks
        const nt = Math.max(4, Math.round(f.sym * .8));
        for (let i = 0; i <= nt; i++) {
          const a = Math.PI * (1 + i / nt);
          const x1 = 50 + Math.cos(a) * (R - 9), y1 = 50 + Math.sin(a) * (R - 9);
          const x2 = 50 + Math.cos(a) * (R - 2), y2 = 50 + Math.sin(a) * (R - 2);
          bits.push(`<line x1="${P(x1, y1).replace(',', '" y1="')}" x2="${P(x2, y2).replace(',', '" y2="')}"
            stroke="${col}" stroke-width="${Math.max(1, f.weight * .4).toFixed(1)}" opacity=".75"/>`);
        }
        // needle
        const na = Math.PI * (1 + 0.32);
        bits.push(`<line x1="50" y1="50" x2="${(50 + Math.cos(na) * R * .78).toFixed(1)}"
          y2="${(50 + Math.sin(na) * R * .78).toFixed(1)}" stroke="${col}"
          stroke-width="${(f.weight * .9).toFixed(1)}" stroke-linecap="round"/>`);
        bits.push(`<circle cx="50" cy="50" r="${(f.weight * .8).toFixed(1)}" fill="${col}"/>`);
      } else {
        bits.push(`<path d="${radialPath(f, R, 0)}"
          fill="${fillMode ? col : 'none'}" stroke="${col}" stroke-width="${sw}"
          stroke-linejoin="round" ${fillMode ? 'opacity=".9"' : ''}/>`);
      }
      // centre hole
      if (f.hole > .08) {
        bits.push(`<circle cx="50" cy="50" r="${(f.hole * 40).toFixed(1)}"
          fill="none" stroke="${col}" stroke-width="${(f.weight * .8).toFixed(1)}"/>`);
      }
    }

    else if (f.form === 'linear') {
      const n = Math.max(3, Math.round(4 + f.density * 12));
      if (f.wobble > .5 && f.round > .5) {
        // wave
        let d = 'M 0 30';
        for (let i = 0; i <= n; i++) {
          const x = (i / n) * 100;
          const y = 30 + Math.sin(i * 1.1) * (6 + f.wobble * 12);
          d += ` Q ${P(x - 100 / n / 2, 30 - Math.sin(i * 1.1) * (6 + f.wobble * 12))} ${P(x, y)}`;
        }
        bits.push(`<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"/>`);
      } else if (f.round > .6) {
        // chain links
        for (let i = 0; i < n; i++) {
          const x = (i + .5) * (100 / n);
          bits.push(`<circle cx="${x.toFixed(1)}" cy="30" r="${(100 / n * .3).toFixed(1)}"
            fill="none" stroke="${col}" stroke-width="${(f.weight * .7).toFixed(1)}"/>`);
          if (i < n - 1) bits.push(`<rect x="${(x + 100 / n * .22).toFixed(1)}" y="${(30 - f.weight * .35).toFixed(1)}"
            width="${(100 / n * .56).toFixed(1)}" height="${(f.weight * .7).toFixed(1)}" fill="${col}"/>`);
        }
      } else {
        // ridgeline
        const pts = [];
        for (let i = 0; i <= n; i++) {
          const x = (i / n) * 100;
          const h = 12 + ((hash(String(i) + f.sym) % 100) / 100) * (22 + f.wobble * 14);
          pts.push([x, 52 - (i % 2 ? h * .5 : h)]);
        }
        bits.push(`<polyline points="${pts.map((p) => P(p[0], p[1])).join(' ')}"
          fill="none" stroke="${col}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`);
      }
    }

    else if (f.form === 'scatter') {
      const n = Math.max(4, Math.round(5 + f.density * 16));
      const r2 = rng('scatter' + f.sym + f.density);
      for (let i = 0; i < n; i++) {
        const x = 8 + r2() * 84, y = 8 + r2() * 84;
        const rad = 3 + r2() * (6 + f.weight);
        if (f.round > .55) {
          bits.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(1)}"
            fill="${fillMode ? col : 'none'}" stroke="${col}"
            stroke-width="${(f.weight * .5).toFixed(1)}" opacity="${(.45 + r2() * .5).toFixed(2)}"/>`);
        } else {
          const g = { sym: Math.max(3, f.sym > 8 ? 5 : f.sym), teeth: f.teeth, wobble: f.wobble, round: f.round };
          const pts = [];
          const steps = g.teeth > .12 ? g.sym * 2 : g.sym;
          for (let k = 0; k < steps; k++) {
            const a = (k / steps) * Math.PI * 2 - Math.PI / 2;
            const rr = (k % 2 === 0 || g.teeth <= .12) ? rad : rad * (1 - g.teeth * .45);
            pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
          }
          bits.push(`<polygon points="${pts.map((p) => P(p[0], p[1])).join(' ')}"
            fill="${fillMode ? col : 'none'}" stroke="${col}"
            stroke-width="${(f.weight * .45).toFixed(1)}" opacity="${(.5 + r2() * .45).toFixed(2)}"/>`);
        }
      }
    }

    else { /* lattice */
      const n = Math.max(2, Math.round(2 + f.density * 6));
      const cell = 100 / n;
      const rr = f.round * cell * .3;
      for (let gy = 0; gy < n; gy++) {
        for (let gx = 0; gx < n; gx++) {
          if (((gx + gy) % 2 === 1) && f.density < .75) continue;
          const pad = cell * .18;
          bits.push(`<rect x="${(gx * cell + pad).toFixed(1)}" y="${(gy * cell + pad).toFixed(1)}"
            width="${(cell - pad * 2).toFixed(1)}" height="${(cell - pad * 2).toFixed(1)}"
            rx="${rr.toFixed(1)}" fill="${fillMode ? col : 'none'}" stroke="${col}"
            stroke-width="${(f.weight * .5).toFixed(1)}"
            opacity="${(.45 + ((gx * 7 + gy * 13) % 6) / 10).toFixed(2)}"/>`);
        }
      }
      if (f.spokes > .4) {
        bits.push(`<line x1="0" y1="50" x2="100" y2="50" stroke="${col}" stroke-width="${(f.weight*.5).toFixed(1)}" opacity=".6"/>`);
        bits.push(`<line x1="50" y1="0" x2="50" y2="100" stroke="${col}" stroke-width="${(f.weight*.5).toFixed(1)}" opacity=".6"/>`);
      }
    }

    const vb = f.form === 'linear' ? '0 0 100 60' : '0 0 100 100';
    const spinCls = Math.abs(f.spin) < .12 ? '' : (f.spin > 0 ? 'spin-slow' : 'spin-rev');
    const dur = (30 - Math.abs(f.spin) * 22).toFixed(1);
    return `<svg class="orn ${cls || ''} ${spinCls}" viewBox="${vb}"
      style="--ospin:${dur}s" aria-hidden="true">${bits.join('')}</svg>`;
  }

  /* human-readable shape name, for the UI */
  function nameFor(f) {
    const shape = { radial: 'disc', linear: 'ridge', scatter: 'cluster',
      arc: 'gauge', lattice: 'grid' }[f.form];
    const adj = f.teeth > .7 ? 'toothed' : f.teeth > .35 ? 'notched'
      : f.wobble > .6 ? 'organic' : f.round > .7 ? 'round' : 'angular';
    return `${f.sym}-point ${adj} ${shape}`;
  }

  root.Ornaments = { phraseToFeatures, synth, nameFor, LEX, hash, rng };
})(typeof window !== 'undefined' ? window : globalThis);
