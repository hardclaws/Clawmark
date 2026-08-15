/* Clawmark - Twitch Shoutout Overlay for OBS
 * Created by Hardclaws · twitch.tv/hardclaws · thehardclaws@gmail.com
 * MIT licence. Free to use, modify and fork.
 */
/* =============================================================
   LAYOUTS - SET 5
   Retro / 8-bit, high fantasy, dragons, spellcasting, and
   Tolkien-flavoured heraldry.

   Design rule for this whole set, learned the hard way: the clip gets
   its OWN 16:9 window that nothing else is allowed to touch. No panel,
   badge, bar or flourish overlaps the picture - the furniture is built
   around the window rather than dropped on top of it.
   ============================================================= */
(function (root) {
  'use strict';
  if (!root.Layouts) throw new Error('layouts.js must load first');

  const H = root.Layouts.helpers;
  const { esc, n, clip, credit, av, badge, liveTag } = H;
  const L = root.Layouts.all;
  const add = (o) => L.push(o);

  /* repeat helper */
  const rep = (k, f) => Array.from({ length: k }, (_, i) => f(i)).join('');

  /* =========================================================
     RETRO / 8-BIT
     ========================================================= */

  /* ---------- 64. PIXEL QUEST ---------- */
  add({
    id: 'pixelquest', label: 'Pixel Quest', group: 'Retro',
    blurb: '8-bit JRPG dialogue box. Chunky pixel border, sprite portrait, blinking advance arrow and a party stat window.',
    html: (d) => `
    <div class="lo lo-pxq">
      <div class="px-stars">${rep(60, (i) => `<i style="left:${(i * 137) % 100}%;top:${(i * 53) % 62}%;animation-delay:${(i % 9) * 0.4}s"></i>`)}</div>

      <div class="px-window a-pxpop">
        <div class="px-screen">${clip(d)}</div>
        <div class="px-scan"></div>
      </div>

      <div class="px-party a-pxslide">
        <div class="px-pname">PARTY</div>
        ${d.user.followers != null ? `<div class="px-prow"><span>FOLLOW</span><b data-count="${d.user.followers}">0</b></div>` : ''}
        ${d.clip ? `<div class="px-prow"><span>VIEWS</span><b data-count="${d.clip.views}">0</b></div>` : ''}
        ${d.user.created ? `<div class="px-prow"><span>SINCE</span><b class="sm">${esc(d.user.created)}</b></div>` : ''}
        <div class="px-hp"><span>HP</span><i class="px-bar"><u></u></i></div>
        <div class="px-hp"><span>MP</span><i class="px-bar mp"><u></u></i></div>
      </div>

      <div class="px-box a-pxbox">
        <div class="px-face">${av(d, 108)}</div>
        <div class="px-txt">
          <div class="px-kick">${esc(d.copy.kicker).toUpperCase()}</div>
          <h1 class="px-name">${esc(d.user.name)}</h1>
          <p class="px-line">${esc(d.user.bio || d.copy.cta)}</p>
          <div class="px-credit">${credit(d, 'micro')}</div>
        </div>
        <div class="px-arrow"></div>
        <div class="px-url">${esc(d.user.url)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 65. HANDHELD ---------- */
  add({
    id: 'handheld', label: 'Handheld', group: 'Retro',
    blurb: 'Chunky grey handheld console. Dot-matrix green LCD, D-pad, A/B buttons and a battery light that actually blinks.',
    html: (d) => `
    <div class="lo lo-hh">
      <div class="hh-shell a-hhin">
        <div class="hh-top">
          <span class="hh-dot"></span>
          <span class="hh-brand">${esc(d.copy.tag || 'SHOUT-BOY')}</span>
          <span class="hh-model">COLOR</span>
        </div>
        <div class="hh-bezel">
          <div class="hh-led"><i></i>BATTERY</div>
          <div class="hh-lcd">
            <div class="hh-screen">${clip(d)}</div>
            <div class="hh-matrix"></div>
            <div class="hh-glare"></div>
          </div>
          <div class="hh-caption">${esc(d.clip ? d.clip.title : d.user.title)}</div>
        </div>
        <div class="hh-logo">SHOUTOUT<span>&nbsp;SYSTEM</span></div>
        <div class="hh-controls">
          <div class="hh-dpad"><i class="u"></i><i class="d"></i><i class="l"></i><i class="r"></i><i class="c"></i></div>
          <div class="hh-ab"><span class="b">B</span><span class="a">A</span></div>
        </div>
        <div class="hh-startsel"><i></i><i></i></div>
        <div class="hh-speaker">${rep(18, () => '<i></i>')}</div>
      </div>

      <div class="hh-card a-hhcard">
        <div class="hh-label">NOW PLAYING CARTRIDGE</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="hh-sub">${esc(d.user.url)}</div>
        <div class="hh-stats">
          ${d.user.followers != null ? `<div><b data-count="${d.user.followers}">0</b><span>FOLLOWERS</span></div>` : ''}
          ${d.user.game ? `<div><b class="sm">${esc(d.user.game)}</b><span>CATEGORY</span></div>` : ''}
          ${d.user.created ? `<div><b class="sm">${esc(d.user.created)}</b><span>JOINED</span></div>` : ''}
        </div>
        ${d.user.bio ? `<p class="hh-bio">${esc(d.user.bio)}</p>` : ''}
        <div class="hh-credit">${credit(d, 'stack')}</div>
        <div class="hh-cta">${esc(d.copy.cta)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 66. TAPE LOADER ---------- */
  add({
    id: 'tapeload', label: 'Tape Loader', group: 'Retro',
    blurb: '1982 home computer loading from cassette. Screaming colour loading stripes down both borders, blocky BASIC readout.',
    html: (d) => `
    <div class="lo lo-tape">
      <div class="tp-stripe l"></div>
      <div class="tp-stripe r"></div>
      <div class="tp-inner">
        <div class="tp-basic a-tpline">
          <div><span class="tp-p">&gt;</span> LOAD "${esc(d.user.login || d.user.name).toUpperCase()}"</div>
          <div class="d1"><span class="tp-p">&gt;</span> PROGRAM: <b>${esc(d.user.name).toUpperCase()}</b></div>
          <div class="d2"><span class="tp-p">&gt;</span> BYTES: <b>${d.user.followers != null ? n(d.user.followers) : 'MANY'}</b> FOLLOWERS</div>
          <div class="d3"><span class="tp-p">&gt;</span> VER: <b>${esc(d.user.created || 'ORIGINAL')}</b></div>
        </div>

        <div class="tp-crt a-tpcrt">
          <div class="tp-screen">${clip(d)}</div>
          <div class="tp-lines"></div>
          <div class="tp-curve"></div>
        </div>

        <div class="tp-bar a-tpline d4">
          <span>LOADING</span><i><u></u></i><span class="tp-pct">OK</span>
        </div>
        <div class="tp-foot a-tpline d5">
          <div class="tp-title">${esc(d.clip ? d.clip.title : d.user.title)}</div>
          <div class="tp-meta">${credit(d, 'micro')}</div>
          <div class="tp-url">${esc(d.user.url)}</div>
        </div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 67. DEMOSCENE ---------- */
  add({
    id: 'demoscene', label: 'Demoscene', group: 'Retro',
    blurb: 'Amiga cracktro. Copper bars sliding behind a bouncing chrome logo, starfield, and a sine-wave scroller along the bottom.',
    html: (d) => `
    <div class="lo lo-demo">
      <div class="dm-copper">${rep(14, (i) => `<i style="--i:${i}"></i>`)}</div>
      <div class="dm-field">${rep(70, (i) => `<b style="left:${(i * 91) % 100}%;top:${(i * 37) % 100}%;--sp:${3 + (i % 5)}s"></b>`)}</div>

      <div class="dm-logo a-dmbounce">
        <span data-txt="${esc(d.user.name)}">${esc(d.user.name)}</span>
      </div>

      <div class="dm-screen a-dmzoom">
        <div class="dm-inner">${clip(d)}</div>
      </div>

      <div class="dm-greets">
        <div class="dm-h">GREETINGS FLY OUT TO</div>
        <div class="dm-g">
          ${d.clip ? `<span>${esc(d.clip.creator)}</span>` : ''}
          ${d.user.game ? `<span>${esc(d.user.game)}</span>` : ''}
          ${d.user.followers != null ? `<span>${n(d.user.followers)} FOLLOWERS</span>` : ''}
          ${d.user.created ? `<span>SINCE ${esc(d.user.created).toUpperCase()}</span>` : ''}
        </div>
      </div>

      <div class="dm-scroller">
        <div class="dm-run">
          ${rep(2, () => `<span>${esc(d.copy.kicker).toUpperCase()} &nbsp;***&nbsp; ${esc(d.user.url).toUpperCase()} &nbsp;***&nbsp; ${esc(d.clip ? d.clip.title : d.copy.cta).toUpperCase()} &nbsp;***&nbsp; ${esc(d.copy.cta).toUpperCase()} &nbsp;***&nbsp; </span>`)}
        </div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 68. HIGH SCORE ---------- */
  add({
    id: 'highscore', label: 'High Score', group: 'Retro',
    blurb: 'Arcade attract-mode leaderboard. The shouted channel slams into first place and the whole row flashes.',
    html: (d) => `
    <div class="lo lo-hs">
      <div class="hs-grid"></div>
      <div class="hs-title a-hstitle">HIGH SCORES</div>

      <div class="hs-board">
        <div class="hs-row lead a-hsrow">
          <span class="hs-rank">1ST</span>
          <span class="hs-ini">${esc((d.user.name || 'AAA').replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase() || 'AAA')}</span>
          <span class="hs-nm">${esc(d.user.name).toUpperCase()}</span>
          <span class="hs-sc" data-count="${d.user.followers != null ? d.user.followers : 999999}">0</span>
        </div>
        ${d.clip ? `<div class="hs-row a-hsrow d1"><span class="hs-rank">2ND</span><span class="hs-ini">CLP</span>
          <span class="hs-nm">${esc(d.clip.creator).toUpperCase()}</span><span class="hs-sc" data-count="${d.clip.views}">0</span></div>` : ''}
        ${d.user.game ? `<div class="hs-row a-hsrow d2"><span class="hs-rank">3RD</span><span class="hs-ini">GME</span>
          <span class="hs-nm">${esc(d.user.game).toUpperCase()}</span><span class="hs-sc sm">PLAYED</span></div>` : ''}
        ${d.user.created ? `<div class="hs-row a-hsrow d3"><span class="hs-rank">4TH</span><span class="hs-ini">EST</span>
          <span class="hs-nm">JOINED TWITCH</span><span class="hs-sc sm">${esc(d.user.created).toUpperCase()}</span></div>` : ''}
      </div>

      <div class="hs-cab a-hscab">
        <div class="hs-screen">${clip(d)}</div>
        <div class="hs-cabscan"></div>
      </div>

      <div class="hs-insert">${esc(d.copy.cta).toUpperCase()}</div>
      <div class="hs-url">${esc(d.user.url).toUpperCase()}</div>
      <div class="hs-credit">${credit(d, 'micro')}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* =========================================================
     MAGIC / DRAGONS
     ========================================================= */

  /* ---------- 69. ARCANE CIRCLE ---------- */
  add({
    id: 'arcane', label: 'Arcane Circle', group: 'Magic',
    blurb: 'A spell being cast. Three counter-rotating rune rings, a rising column of light, and motes drifting up the frame.',
    html: (d) => `
    <div class="lo lo-arc">
      <div class="ar2-void"></div>
      <div class="ar2-beam a-arbeam"></div>
      <div class="ar2-motes">${rep(38, (i) => `<i style="left:${(i * 83) % 100}%;--dl:${(i % 12) * 0.5}s;--dur:${5 + (i % 6)}s;--sz:${3 + (i % 4)}px"></i>`)}</div>

      <div class="ar2-rings a-arspin">
        <svg viewBox="0 0 600 600" class="ar2-r1">
          <circle cx="300" cy="300" r="290" />
          <circle cx="300" cy="300" r="268" />
          <g class="ar2-glyphs">${rep(24, (i) =>
            `<text x="300" y="42" transform="rotate(${i * 15} 300 300)">${'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'[i]}</text>`)}</g>
        </svg>
        <svg viewBox="0 0 600 600" class="ar2-r2">
          <circle cx="300" cy="300" r="230" />
          <polygon points="300,80 490,410 110,410" />
          <polygon points="300,520 110,190 490,190" />
        </svg>
        <svg viewBox="0 0 600 600" class="ar2-r3">
          <circle cx="300" cy="300" r="180" />
          ${rep(8, (i) => `<line x1="300" y1="120" x2="300" y2="480" transform="rotate(${i * 22.5} 300 300)"/>`)}
        </svg>
      </div>

      <div class="ar2-window a-arwin">
        <div class="ar2-frame">${clip(d)}</div>
        <div class="ar2-corner tl"></div><div class="ar2-corner tr"></div>
        <div class="ar2-corner bl"></div><div class="ar2-corner br"></div>
      </div>

      <div class="ar2-name a-arname">
        <div class="ar2-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="ar2-url">${esc(d.user.url)}</div>
      </div>

      <div class="ar2-side a-arside">
        ${av(d, 118)}
        <div class="ar2-stats">
          ${d.user.followers != null ? `<div><span>Devoted</span><b data-count="${d.user.followers}">0</b></div>` : ''}
          ${d.user.game ? `<div><span>School</span><b class="sm">${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>Joined</span><b class="sm">${esc(d.user.created)}</b></div>` : ''}
        </div>
        ${d.user.bio ? `<p class="ar2-bio">${esc(d.user.bio)}</p>` : ''}
        <div class="ar2-credit">${credit(d, 'stack')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 70. DRAGONFIRE ---------- */
  add({
    id: 'dragonfire', label: 'Dragonfire', group: 'Magic',
    blurb: 'A dragon breathes across the frame. Layered flame tongues, drifting embers, and an obsidian plate cracked with molten light.',
    html: (d) => `
    <div class="lo lo-dfire">
      <div class="df-dark"></div>
      <div class="df-flame f1"></div>
      <div class="df-flame f2"></div>
      <div class="df-flame f3"></div>
      <div class="df-embers">${rep(46, (i) => `<i style="left:${(i * 71) % 100}%;--dl:${(i % 14) * 0.42}s;--dur:${4 + (i % 5)}s;--sz:${2 + (i % 5)}px;--dx:${((i % 7) - 3) * 30}px"></i>`)}</div>

      <div class="df-head a-dfhead">
        <svg viewBox="0 0 360 210" class="df-silhouette">
          <!-- Drawn as a profile facing right, with the jaws apart so the
               flame reads as coming out of the mouth. Three separate shapes
               (skull, jaw, horns) keep the silhouette legible; one blobby
               path did not. -->
          <path d="M0 168 C40 122 92 82 142 68 C172 60 202 64 228 76
                   L344 106 L236 120 L152 118 C112 120 58 142 18 180 Z"/>
          <path d="M158 134 C198 132 250 142 316 162 L222 162
                   C194 162 174 150 158 140 Z"/>
          <path d="M148 68 C160 30 202 10 246 10 C210 24 186 44 176 72 Z"/>
          <path d="M124 78 C130 48 156 28 186 24 C162 40 148 58 142 84 Z"/>
          <path d="M236 106 l9 16 l9 -16 Z" class="df-tooth"/>
          <path d="M262 106 l8 15 l8 -15 Z" class="df-tooth"/>
          <path d="M228 140 l8 -15 l9 15 Z" class="df-tooth"/>
          <circle cx="196" cy="92" r="8" class="df-eye"/>
        </svg>
      </div>

      <div class="df-window a-dfwin">
        <div class="df-scales"></div>
        <div class="df-frame">${clip(d)}</div>
        <div class="df-glowline"></div>
      </div>

      <div class="df-plate a-dfplate">
        <div class="df-crack"></div>
        <div class="df-id">
          ${av(d, 122)}
          <div>
            <div class="df-kick">${esc(d.copy.kicker)}</div>
            <h1>${esc(d.user.name)}</h1>
            <div class="df-url">${esc(d.user.url)}</div>
          </div>
        </div>
        <div class="df-stats">
          ${d.user.followers != null ? `<div><b data-count="${d.user.followers}">0</b><span>HOARD</span></div>` : ''}
          ${d.clip ? `<div><b data-count="${d.clip.views}">0</b><span>WITNESSES</span></div>` : ''}
          ${d.user.created ? `<div><b class="sm">${esc(d.user.created)}</b><span>AWOKEN</span></div>` : ''}
        </div>
        <div class="df-credit">${credit(d, 'line')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 71. GRIMOIRE ---------- */
  add({
    id: 'grimoire', label: 'Grimoire', group: 'Magic',
    blurb: 'A spellbook thrown open. The right page holds the scrying window, gold leaf creeps along the border and the ribbon marker swings.',
    html: (d) => `
    <div class="lo lo-grim">
      <div class="gr-room"></div>
      <div class="gr-book a-gropen">
        <div class="gr-spine"></div>
        <div class="gr-page l">
          <div class="gr-gild"></div>
          <div class="gr-drop">${esc((d.user.name || 'A')[0]).toUpperCase()}</div>
          <div class="gr-kick">${esc(d.copy.kicker)}</div>
          <h1>${esc(d.user.name)}</h1>
          <div class="gr-rule"></div>
          ${d.user.bio ? `<p class="gr-body">${esc(d.user.bio)}</p>` : ''}
          <div class="gr-entries">
            ${d.user.followers != null ? `<div><span>Followers</span><b>${n(d.user.followers)}</b></div>` : ''}
            ${d.user.game ? `<div><span>Last conjured</span><b>${esc(d.user.game)}</b></div>` : ''}
            ${d.user.created ? `<div><span>Joined Twitch</span><b>${esc(d.user.created)}</b></div>` : ''}
          </div>
          <div class="gr-url">${esc(d.user.url)}</div>
        </div>
        <div class="gr-page r">
          <div class="gr-gild"></div>
          <div class="gr-plate">
            <div class="gr-window">${clip(d)}</div>
            <div class="gr-sigil"></div>
          </div>
          <div class="gr-caption">${credit(d, 'stack')}</div>
          <div class="gr-foot">${esc(d.copy.cta)}</div>
        </div>
        <div class="gr-ribbon a-grrib"></div>
      </div>
      <div class="gr-motes">${rep(26, (i) => `<i style="left:${(i * 97) % 100}%;--dl:${(i % 10) * 0.6}s;--dur:${6 + (i % 5)}s"></i>`)}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 72. SCRYING ORB ---------- */
  add({
    id: 'scrying', label: 'Scrying Orb', group: 'Magic',
    blurb: 'A crystal ball on a clawed stand. The clip plays inside the glass, mist curls under it and the whole orb refracts.',
    html: (d) => `
    <div class="lo lo-scry">
      <div class="sy-veil"></div>
      <div class="sy-halo a-sypulse"></div>

      <div class="sy-orbwrap a-syrise">
        <div class="sy-orb">
          <div class="sy-glass">${clip(d)}</div>
          <div class="sy-refract"></div>
          <div class="sy-spec"></div>
        </div>
        <div class="sy-stand">
          <i class="c1"></i><i class="c2"></i><i class="c3"></i>
          <div class="sy-base"></div>
        </div>
        <div class="sy-mist"></div>
      </div>

      <div class="sy-panel a-syslide">
        <div class="sy-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="sy-url">${esc(d.user.url)}</div>
        <div class="sy-div"><i></i><span>✦</span><i></i></div>
        ${d.user.bio ? `<p class="sy-bio">${esc(d.user.bio)}</p>` : ''}
        <div class="sy-rows">
          ${d.user.followers != null ? `<div><span>Souls watching</span><b data-count="${d.user.followers}">0</b></div>` : ''}
          ${d.user.game ? `<div><span>Last vision</span><b class="sm">${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>Joined Twitch</span><b class="sm">${esc(d.user.created)}</b></div>` : ''}
        </div>
        <div class="sy-credit">${credit(d, 'stack')}</div>
        <div class="sy-cta">${esc(d.copy.cta)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 73. ALCHEMY BENCH ---------- */
  add({
    id: 'alchemy', label: 'Alchemy Bench', group: 'Magic',
    blurb: 'A potion-maker\'s bench - bubbling flasks whose liquid level reads out the channel stats, plus a bound recipe card.',
    html: (d) => `
    <div class="lo lo-alch">
      <div class="al-wall"></div>
      <div class="al-shelf"></div>

      <div class="al-flasks a-alrise">
        ${[
          d.user.followers != null ? { l: 'FOLLOWERS', v: n(d.user.followers), f: 84, c: 'a' } : null,
          d.clip ? { l: 'CLIP VIEWS', v: n(d.clip.views), f: 62, c: 'b' } : null,
          d.user.created ? { l: 'VINTAGE', v: esc(d.user.created), f: 48, c: 'c' } : null,
        ].filter(Boolean).map((s, i) => `
          <div class="al-flask ${s.c}" style="animation-delay:${i * 0.16}s">
            <div class="al-glass">
              <div class="al-liquid" style="height:${s.f}%">
                <i class="al-surf"></i>
                ${rep(5, (j) => `<b style="left:${12 + j * 19}%;--dl:${j * 0.5}s"></b>`)}
              </div>
            </div>
            <div class="al-cork"></div>
            <div class="al-tag"><b>${s.v}</b><span>${s.l}</span></div>
          </div>`).join('')}
      </div>

      <div class="al-window a-alwin">
        <div class="al-brass"></div>
        <div class="al-frame">${clip(d)}</div>
        <div class="al-label">${esc(d.clip ? d.clip.title : d.user.title)}</div>
      </div>

      <div class="al-recipe a-alcard">
        <div class="al-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="al-url">${esc(d.user.url)}</div>
        ${d.user.bio ? `<p class="al-bio">${esc(d.user.bio)}</p>` : ''}
        <div class="al-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="al-smoke">${rep(14, (i) => `<i style="left:${8 + (i * 61) % 84}%;--dl:${(i % 7) * 0.8}s"></i>`)}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* =========================================================
     HIGH FANTASY / TOLKIEN FLAVOUR
     ========================================================= */

  /* ---------- 74. RING OF POWER ---------- */
  add({
    id: 'ringpower', label: 'Ring of Power', group: 'Epic Fantasy',
    blurb: 'A gold band heated until the inscription burns through. Fire-script rises around a black slab; the clip sits inside the ring.',
    html: (d) => `
    <div class="lo lo-ring">
      <div class="rg-black"></div>
      <div class="rg-heat"></div>

      <div class="rg-ringwrap a-rgrise">
        <div class="rg-ring">
          <div class="rg-hole">${clip(d)}</div>
          <svg viewBox="0 0 840 840" class="rg-script" preserveAspectRatio="xMidYMid meet">
            <defs><path id="rgpath" d="M420,420 m-378,0 a378,378 0 1,1 756,0 a378,378 0 1,1 -756,0"/></defs>
            <text><textPath href="#rgpath" startOffset="0">${
              esc((d.user.name + ' \u00b7 ' + (d.user.url || '') + ' \u00b7 ').repeat(3)).slice(0, 96)
            }</textPath></text>
          </svg>
          <div class="rg-sheen"></div>
        </div>
      </div>

      <div class="rg-title a-rgtitle">
        <div class="rg-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
      </div>

      <div class="rg-verse a-rgverse">
        ${d.user.followers != null ? `<div>${n(d.user.followers)} followers, to find them</div>` : ''}
        ${d.user.game ? `<div>Last seen in ${esc(d.user.game)}</div>` : ''}
        ${d.user.created ? `<div>Joined Twitch ${esc(d.user.created)}</div>` : ''}
      </div>

      <div class="rg-foot a-rgfoot">
        <div class="rg-credit">${credit(d, 'line')}</div>
        <div class="rg-url">${esc(d.user.url)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 75. HERALD'S BANNER ---------- */
  add({
    id: 'heraldry', label: "Herald's Banner", group: 'Epic Fantasy',
    blurb: 'A stone hall with hanging house banners. Torchlight flickers on the wall, the crest unrolls and the clip hangs framed between the columns.',
    html: (d) => `
    <div class="lo lo-her">
      <div class="hr-stone"></div>
      <div class="hr-arch"></div>
      <div class="hr-torch l"><i></i></div>
      <div class="hr-torch r"><i></i></div>

      <div class="hr-banner a-hrdrop">
        <div class="hr-crest">
          <svg viewBox="0 0 120 140">
            <path d="M60 6 L112 26 V72 C112 106 88 126 60 136 C32 126 8 106 8 72 V26 Z"/>
            <path class="hr-tree" d="M60 34 V104 M60 52 L40 38 M60 52 L80 38 M60 68 L36 54 M60 68 L84 54 M60 84 L44 72 M60 84 L76 72"/>
            ${rep(7, (i) => `<circle cx="${34 + i * 9}" cy="${112 - Math.abs(3 - i) * 4}" r="2.6"/>`)}
          </svg>
        </div>
        <div class="hr-house">${esc(d.copy.tag || 'HOUSE OF STREAMS')}</div>
      </div>

      <div class="hr-window a-hrwin">
        <div class="hr-wframe">${clip(d)}</div>
        <div class="hr-wcap">${esc(d.clip ? d.clip.title : d.user.title)}</div>
      </div>

      <div class="hr-plaque a-hrplaq">
        <div class="hr-ident">
          <div class="hr-kick">${esc(d.copy.kicker)}</div>
          <h1>${esc(d.user.name)}</h1>
          <div class="hr-url">${esc(d.user.url)}</div>
          ${d.user.bio ? `<p class="hr-bio">${esc(d.user.bio)}</p>` : ''}
        </div>
        <div class="hr-orn"></div>
        <div class="hr-rows">
          ${d.user.followers != null ? `<div><span>Sworn</span><b data-count="${d.user.followers}">0</b></div>` : ''}
          ${d.user.game ? `<div><span>Realm</span><b class="sm">${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>Since</span><b class="sm">${esc(d.user.created)}</b></div>` : ''}
          <div class="hr-credit">${credit(d, 'micro')}</div>
        </div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 76. WAYFARER'S MAP ---------- */
  add({
    id: 'wayfarer', label: "Wayfarer's Map", group: 'Epic Fantasy',
    blurb: 'A hand-inked map of an imagined land. The route draws itself across mountains and forest to an X, where the clip is pinned.',
    html: (d) => `
    <div class="lo lo-way">
      <div class="wy-parch"></div>
      <div class="wy-stain a"></div><div class="wy-stain b"></div>

      <svg viewBox="0 0 1920 1080" class="wy-ink" preserveAspectRatio="none">
        <path class="wy-coast" d="M60 300 C220 250 300 340 430 320 C560 300 610 210 760 240
          C900 268 940 360 1080 350 C1210 340 1250 250 1400 280 C1540 308 1600 400 1720 380"/>
        <path class="wy-coast" d="M80 860 C240 900 340 820 470 850 C610 882 700 960 840 940
          C980 920 1030 830 1180 856 C1320 880 1380 960 1520 940"/>
        ${rep(8, (i) => `<path class="wy-mtn" d="M${420 + i * 74} 250 l36 -58 l36 58 z"/>`)}
        ${rep(12, (i) => `<g class="wy-tree" transform="translate(${880 + (i % 4) * 62},${880 + Math.floor(i / 4) * 52})">
            <path d="M0 0 l-15 26 h30 z"/><path d="M0 14 l-19 30 h38 z"/><rect x="-3" y="42" width="6" height="12"/></g>`)}
        <path class="wy-route a-wyroute" d="M300 300 C520 250 640 400 820 430 C1000 460 1080 620 1230 690
          C1310 726 1380 744 1440 752"/>
        <g class="wy-x a-wyx" transform="translate(1440,752)">
          <path d="M-26 -26 L26 26 M26 -26 L-26 26"/>
        </g>
      </svg>

      <div class="wy-compass a-wyspin">
        <svg viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="88"/><circle cx="100" cy="100" r="70"/>
          <path d="M100 18 L118 100 L100 182 L82 100 Z"/>
          <path d="M18 100 L100 82 L182 100 L100 118 Z"/>
          <text x="100" y="14">N</text>
        </svg>
      </div>

      <div class="wy-pin a-wypin">
        <div class="wy-tape tl"></div><div class="wy-tape br"></div>
        <div class="wy-photo">${clip(d)}</div>
        <div class="wy-cap">${esc(d.clip ? d.clip.title : d.user.title)}</div>
      </div>

      <div class="wy-legend a-wyleg">
        <div class="wy-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="wy-url">${esc(d.user.url)}</div>
        <div class="wy-hr"></div>
        <div class="wy-rows">
          ${d.user.followers != null ? `<div><span>Travellers</span><b>${n(d.user.followers)}</b></div>` : ''}
          ${d.user.game ? `<div><span>Territory</span><b>${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>Charted</span><b>${esc(d.user.created)}</b></div>` : ''}
        </div>
        ${d.user.bio ? `<p class="wy-bio">${esc(d.user.bio)}</p>` : ''}
        <div class="wy-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 77. DARK TOWER ---------- */
  add({
    id: 'darktower', label: 'Dark Tower', group: 'Epic Fantasy',
    blurb: 'A burning eye atop a black spire, sweeping its gaze across the scene. Ash falls; the clip is the thing it has found.',
    html: (d) => `
    <div class="lo lo-tower">
      <div class="dt-sky"></div>
      <div class="dt-ridge"></div>
      <div class="dt-spire"></div>
      <div class="dt-ash">${rep(50, (i) => `<i style="left:${(i * 67) % 100}%;--dl:${(i % 13) * 0.55}s;--dur:${7 + (i % 6)}s;--dx:${((i % 5) - 2) * 24}px"></i>`)}</div>

      <div class="dt-eye a-dteye">
        <div class="dt-flame"></div>
        <div class="dt-pupil"></div>
        <div class="dt-lidt"></div><div class="dt-lidb"></div>
      </div>
      <div class="dt-gaze a-dtgaze"></div>

      <div class="dt-window a-dtwin">
        <div class="dt-wframe">${clip(d)}</div>
      </div>

      <div class="dt-slab a-dtslab">
        <div class="dt-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="dt-url">${esc(d.user.url)}</div>
        <div class="dt-stats">
          ${d.user.followers != null ? `<div><b data-count="${d.user.followers}">0</b><span>ARMIES</span></div>` : ''}
          ${d.clip ? `<div><b data-count="${d.clip.views}">0</b><span>SEEN BY</span></div>` : ''}
          ${d.user.created ? `<div><b class="sm">${esc(d.user.created)}</b><span>RISEN</span></div>` : ''}
        </div>
        <div class="dt-credit">${credit(d, 'line')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 78. BLADE OATH ---------- */
  add({
    id: 'bladeoath', label: 'Blade Oath', group: 'Epic Fantasy',
    blurb: 'A legendary sword drawn from stone. The blade slides up the frame with a light bloom, runes ignite along the fuller.',
    html: (d) => `
    <div class="lo lo-blade">
      <div class="bl-mist"></div>
      <div class="bl-shaft a-blshaft"></div>

      <div class="bl-sword a-bldraw">
        <div class="bl-pommel"></div>
        <div class="bl-grip"></div>
        <div class="bl-guard"></div>
        <div class="bl-blade">
          <div class="bl-fuller"></div>
          <div class="bl-runes">${rep(9, (i) => `<i style="--dl:${0.9 + i * 0.09}s">${'ᛗᛖᚾᛞᛁᛚᚨᚱᚦ'[i]}</i>`)}</div>
          <div class="bl-shine"></div>
        </div>
      </div>
      <div class="bl-stone"></div>
      <div class="bl-sparks">${rep(24, (i) => `<i style="--a:${i * 15}deg;--dl:${0.8 + (i % 6) * 0.06}s"></i>`)}</div>

      <div class="bl-left a-blleft">
        <div class="bl-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="bl-url">${esc(d.user.url)}</div>
        ${d.user.bio ? `<p class="bl-bio">${esc(d.user.bio)}</p>` : ''}
        <div class="bl-rows">
          ${d.user.followers != null ? `<div><span>Oathsworn</span><b data-count="${d.user.followers}">0</b></div>` : ''}
          ${d.user.game ? `<div><span>Campaign</span><b class="sm">${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>Forged</span><b class="sm">${esc(d.user.created)}</b></div>` : ''}
        </div>
      </div>

      <div class="bl-right a-blright">
        <div class="bl-window">${clip(d)}</div>
        <div class="bl-credit">${credit(d, 'stack')}</div>
        <div class="bl-cta">${esc(d.copy.cta)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

})(typeof window !== 'undefined' ? window : globalThis);
