/* Clawmark - Twitch Shoutout Overlay for OBS
 * Created by Hardclaws · twitch.tv/hardclaws · thehardclaws@gmail.com
 * MIT licence. Free to use, modify and fork.
 */
/* =============================================================
   LAYOUTS - SET 7
   Horror / occult, and anime / manga.
   Clip window is dedicated 16:9; nothing is drawn over it.
   ============================================================= */
(function (root) {
  'use strict';
  if (!root.Layouts) throw new Error('layouts.js must load first');

  const H = root.Layouts.helpers;
  const { esc, n, clip, credit, av, badge, liveTag } = H;
  const L = root.Layouts.all;
  const add = (o) => L.push(o);
  const rep = (k, f) => Array.from({ length: k }, (_, i) => f(i)).join('');

  /* =========================================================
     HORROR / OCCULT
     ========================================================= */

  /* ---------- FOUND FOOTAGE ---------- */
  add({
    id: 'foundfootage', label: 'Found Footage', group: 'Horror',
    blurb: 'Camcorder tape recovered from the scene - timecode, low battery, night-vision tint and a jittering handheld frame.',
    html: (d) => `
    <div class="lo lo-found">
      <div class="ff-dark"></div>
      <div class="ff-cam a-ffjit">
        <div class="ff-view">${clip(d)}</div>
        <div class="ff-nv"></div>
        <div class="ff-vig"></div>
        <div class="ff-scan"></div>

        <div class="ff-hud t">
          <span class="ff-rec"><i></i>REC</span>
          <span class="ff-bat">BATT <b>12%</b></span>
          <span class="ff-tc">00:0${(new Date().getSeconds() % 9) + 1}:${String(new Date().getSeconds()).padStart(2, '0')}</span>
        </div>
        <div class="ff-hud b">
          <span>TAPE ${String((d.user.followers || 13) % 99).padStart(2, '0')} - DO NOT ERASE</span>
          <span class="ff-r">SP · AUTO</span>
        </div>
        <div class="ff-corner tl"></div><div class="ff-corner br"></div>
      </div>

      <div class="ff-slip a-ffslip">
        <div class="ff-stamp">EVIDENCE</div>
        <div class="ff-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="ff-url">${esc(d.user.url)}</div>
        <div class="ff-rows">
          ${d.user.followers != null ? `<div><span>WITNESSES</span><b data-count="${d.user.followers}">0</b></div>` : ''}
          ${d.user.game ? `<div><span>LAST LOCATION</span><b class="sm">${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>CASE OPENED</span><b class="sm">${esc(d.user.created)}</b></div>` : ''}
        </div>
        ${d.user.bio ? `<p class="ff-note">${esc(d.user.bio)}</p>` : ''}
        <div class="ff-credit">${credit(d, 'stack')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- SEANCE ---------- */
  add({
    id: 'seance', label: 'Séance Board', group: 'Horror',
    blurb: 'A spirit board lit by candles - the planchette slides across to spell out the channel name.',
    html: (d) => `
    <div class="lo lo-seance">
      <div class="se-room"></div>
      <div class="se-candle l"><i></i></div>
      <div class="se-candle r"><i></i></div>

      <div class="se-board a-sein">
        <div class="se-sun">☉</div><div class="se-moon">☾</div>
        <div class="se-yes">YES</div><div class="se-no">NO</div>
        <div class="se-alpha">${'ABCDEFGHIJKLM'.split('').map((c) => `<span>${c}</span>`).join('')}</div>
        <div class="se-alpha b">${'NOPQRSTUVWXYZ'.split('').map((c) => `<span>${c}</span>`).join('')}</div>
        <div class="se-nums">${'1234567890'.split('').map((c) => `<span>${c}</span>`).join('')}</div>
        <div class="se-bye">GOODBYE</div>

        <div class="se-window">${clip(d)}</div>
        <div class="se-plan a-seplan"><i></i></div>
      </div>

      <div class="se-msg a-semsg">
        <div class="se-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="se-url">${esc(d.user.url)}</div>
        <div class="se-lines">
          ${d.user.followers != null ? `<div><span>Souls gathered</span><b>${n(d.user.followers)}</b></div>` : ''}
          ${d.user.game ? `<div><span>Last seen doing</span><b>${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>Crossed over</span><b>${esc(d.user.created)}</b></div>` : ''}
        </div>
        <div class="se-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- ELDRITCH ---------- */
  add({
    id: 'eldritch', label: 'Eldritch', group: 'Horror',
    blurb: 'Something vast and wrong - writhing tentacle silhouettes, a non-euclidean sigil and text that breathes.',
    html: (d) => `
    <div class="lo lo-eld">
      <div class="el-abyss"></div>
      <div class="el-tents">
        ${rep(6, (i) => `<svg class="el-t t${i}" viewBox="0 0 200 700" style="animation-delay:${i * 0.8}s">
          <path d="M100 700 C60 560 140 500 90 380 C50 280 130 220 100 90 C88 46 96 20 100 0"/></svg>`)}
      </div>
      <div class="el-sigil a-elspin">
        <svg viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="180"/><circle cx="200" cy="200" r="140"/>
          <polygon points="200,40 341,300 59,300"/>
          <polygon points="200,360 59,100 341,100"/>
          ${rep(12, (i) => `<line x1="200" y1="20" x2="200" y2="380" transform="rotate(${i * 15} 200 200)"/>`)}
        </svg>
      </div>

      <div class="el-window a-elopen">
        <div class="el-frame">${clip(d)}</div>
        <div class="el-warp"></div>
      </div>

      <div class="el-text a-elbreathe">
        <div class="el-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="el-url">${esc(d.user.url)}</div>
      </div>

      <div class="el-side a-elside">
        <div class="el-rows">
          ${d.user.followers != null ? `<div><span>CULTISTS</span><b data-count="${d.user.followers}">0</b></div>` : ''}
          ${d.clip ? `<div><span>GLIMPSES</span><b data-count="${d.clip.views}">0</b></div>` : ''}
          ${d.user.created ? `<div><span>AWOKEN</span><b class="sm">${esc(d.user.created)}</b></div>` : ''}
        </div>
        <div class="el-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="el-eyes">${rep(9, (i) => `<i style="left:${(i * 97) % 92 + 4}%;top:${(i * 53) % 80 + 8}%;--dl:${(i % 6) * 0.9}s"></i>`)}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- SLASHER TITLE ---------- */
  add({
    id: 'slasher', label: 'Slasher Title', group: 'Horror',
    blurb: '80s video-nasty title card - grain, a knife-slash wipe revealing the name, and blood-drip lettering.',
    html: (d) => `
    <div class="lo lo-slash">
      <div class="sl2-black"></div>
      <div class="sl2-grain"></div>
      <div class="sl2-slash a-sl2cut"></div>

      <div class="sl2-screen a-sl2in">
        <div class="sl2-inner">${clip(d)}</div>
        <div class="sl2-flick"></div>
      </div>

      <div class="sl2-title a-sl2title">
        <h1 data-txt="${esc(d.user.name)}">${esc(d.user.name)}</h1>
        <div class="sl2-drips">${rep(7, (i) => `<i style="left:${8 + i * 14}%;--dl:${1 + i * 0.14}s;--h:${20 + (i % 4) * 22}px"></i>`)}</div>
      </div>

      <div class="sl2-billing a-sl2bill">
        <div class="sl2-tag">${esc(d.copy.kicker).toUpperCase()}</div>
        <div class="sl2-row">
          ${d.user.followers != null ? `<span>${n(d.user.followers)} SURVIVORS</span>` : ''}
          ${d.user.game ? `<span>${esc(d.user.game).toUpperCase()}</span>` : ''}
          ${d.user.created ? `<span>SINCE ${esc(d.user.created).toUpperCase()}</span>` : ''}
        </div>
        <div class="sl2-credit">${credit(d, 'line')}</div>
        <div class="sl2-url">${esc(d.user.url).toUpperCase()}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- HAUNTED MIRROR ---------- */
  add({
    id: 'mirror', label: 'Haunted Mirror', group: 'Horror',
    blurb: 'An antique mirror in a dark hall - cracked glass, fogged edges, and a name written in the condensation.',
    html: (d) => `
    <div class="lo lo-mirror">
      <div class="mr-hall"></div>
      <div class="mr-frame a-mrin">
        <div class="mr-orn t"></div><div class="mr-orn b"></div>
        <div class="mr-glass">
          <div class="mr-view">${clip(d)}</div>
          <div class="mr-fog"></div>
          <svg class="mr-crack" viewBox="0 0 400 300" preserveAspectRatio="none">
            <path d="M210 0 L196 90 L228 140 L188 210 L206 300"/>
            <path d="M196 90 L120 60 M196 90 L288 74 M228 140 L320 168 M188 210 L96 236"/>
          </svg>
          <div class="mr-written">${esc(d.user.name)}</div>
        </div>
      </div>

      <div class="mr-side a-mrside">
        <div class="mr-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="mr-url">${esc(d.user.url)}</div>
        <div class="mr-div"></div>
        ${d.user.bio ? `<p class="mr-bio">${esc(d.user.bio)}</p>` : ''}
        <div class="mr-rows">
          ${d.user.followers != null ? `<div><span>Reflections</span><b data-count="${d.user.followers}">0</b></div>` : ''}
          ${d.user.game ? `<div><span>Last glimpsed</span><b class="sm">${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>Hung since</span><b class="sm">${esc(d.user.created)}</b></div>` : ''}
        </div>
        <div class="mr-credit">${credit(d, 'stack')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- ASYLUM FILE ---------- */
  add({
    id: 'asylum', label: 'Asylum File', group: 'Horror',
    blurb: 'A patient file that should have stayed buried - typewriter notes, a redaction bar and a paperclipped photo.',
    html: (d) => `
    <div class="lo lo-asy">
      <div class="as-desk"></div>
      <div class="as-folder a-asin">
        <div class="as-tab">PATIENT ${String((d.user.followers || 231) % 999).padStart(3, '0')}</div>
        <div class="as-paper">
          <div class="as-head">
            <div><b>ST. ALDEN INSTITUTE</b><span>ADMISSION RECORD - CONFIDENTIAL</span></div>
            <div class="as-seal">✚</div>
          </div>

          <div class="as-grid">
            <div class="as-left">
              <div class="as-f"><span>NAME</span><b>${esc(d.user.name)}</b></div>
              <div class="as-f"><span>REFERRED AS</span><b>${esc(d.user.url)}</b></div>
              ${d.user.game ? `<div class="as-f"><span>FIXATION</span><b>${esc(d.user.game)}</b></div>` : ''}
              ${d.user.followers != null ? `<div class="as-f"><span>VISITORS</span><b>${n(d.user.followers)}</b></div>` : ''}
              ${d.user.created ? `<div class="as-f"><span>ADMITTED</span><b>${esc(d.user.created)}</b></div>` : ''}
              <div class="as-redact"></div>
              ${d.user.bio ? `<p class="as-note">OBSERVATION: ${esc(d.user.bio)}</p>` : ''}
              <div class="as-redact short"></div>
            </div>
            <div class="as-right">
              <div class="as-clip"></div>
              <div class="as-photo">${clip(d)}</div>
              <div class="as-pcap">SESSION RECORDING</div>
              <div class="as-credit">${credit(d, 'stack')}</div>
            </div>
          </div>
          <div class="as-foot">${esc(d.copy.cta)}</div>
        </div>
        <div class="as-stamp a-asstamp">DO NOT RELEASE</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* =========================================================
     ANIME / MANGA
     ========================================================= */

  /* ---------- SHONEN POWER-UP ---------- */
  add({
    id: 'shonen', label: 'Shonen Power-Up', group: 'Anime',
    blurb: 'Speed lines converge, an aura column erupts and the power level counts up past a ridiculous number.',
    html: (d) => `
    <div class="lo lo-shonen">
      <div class="sn-sky"></div>
      <div class="sn-speed">${rep(46, (i) => `<i style="--a:${i * 7.83}deg;--dl:${(i % 9) * 0.07}s"></i>`)}</div>
      <div class="sn-aura a-snaura"></div>
      <div class="sn-rocks">${rep(14, (i) => `<b style="left:${(i * 71) % 96}%;--dl:${(i % 7) * 0.2}s;--dur:${1.6 + (i % 4) * 0.3}s;--sz:${8 + (i % 5) * 6}px"></b>`)}</div>

      <div class="sn-window a-snpop">
        <div class="sn-frame">${clip(d)}</div>
        <div class="sn-burst"></div>
      </div>

      <div class="sn-name a-snslam">
        <span data-txt="${esc(d.user.name)}">${esc(d.user.name)}</span>
      </div>

      <div class="sn-power a-snpow">
        <span>POWER LEVEL</span>
        <b data-count="${d.user.followers != null ? d.user.followers : 9001}">0</b>
      </div>

      <div class="sn-strip a-snup">
        ${d.user.game ? `<div><b>${esc(d.user.game)}</b><span>TECHNIQUE</span></div>` : ''}
        ${d.clip ? `<div><b data-count="${d.clip.views}">0</b><span>WITNESSES</span></div>` : ''}
        ${d.user.created ? `<div><b class="sm">${esc(d.user.created)}</b><span>DEBUT</span></div>` : ''}
        <div class="url"><b class="sm">${esc(d.user.url)}</b><span>${esc(d.copy.cta).toUpperCase()}</span></div>
      </div>
      <div class="sn-credit a-snup d1">${credit(d, 'line')}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- MANGA PAGE ---------- */
  add({
    id: 'mangapage', label: 'Manga Page', group: 'Anime',
    blurb: 'Right-to-left manga spread - screentone shading, a diagonal action panel and a hand-lettered sound effect.',
    html: (d) => `
    <div class="lo lo-manga">
      <div class="mg-page">
        <div class="mg-tone"></div>

        <div class="mg-p1 a-mgin">
          <div class="mg-inner">${clip(d)}</div>
          <div class="mg-sfx">ドン!</div>
        </div>

        <div class="mg-p2 a-mgin d1">
          <div class="mg-face">${av(d, 150)}</div>
          <div class="mg-bubble">
            <b>${esc(d.user.name)}</b>
            <span>${esc(d.copy.kicker)}</span>
          </div>
        </div>

        <div class="mg-p3 a-mgin d2">
          <div class="mg-stats">
            ${d.user.followers != null ? `<div><b>${n(d.user.followers)}</b><span>読者</span></div>` : ''}
            ${d.user.game ? `<div><b class="sm">${esc(d.user.game)}</b><span>舞台</span></div>` : ''}
            ${d.user.created ? `<div><b class="sm">${esc(d.user.created)}</b><span>連載開始</span></div>` : ''}
          </div>
        </div>

        <div class="mg-p4 a-mgin d3">
          ${d.user.bio ? `<p class="mg-narr">${esc(d.user.bio)}</p>` : ''}
          <div class="mg-credit">${credit(d, 'micro')}</div>
          <div class="mg-url">${esc(d.user.url)}</div>
        </div>

        <div class="mg-num">83</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- MECHA LAUNCH ---------- */
  add({
    id: 'mechalaunch', label: 'Mecha Launch', group: 'Anime',
    blurb: 'Catapult launch sequence - bay doors, a countdown, klaxon stripes and a pilot ident slate.',
    html: (d) => `
    <div class="lo lo-launch">
      <div class="ml-bay"></div>
      <div class="ml-hazard t"></div><div class="ml-hazard b"></div>
      <div class="ml-door l a-mldoorl"></div>
      <div class="ml-door r a-mldoorr"></div>

      <div class="ml-screen a-mlin">
        <div class="ml-view">${clip(d)}</div>
        <div class="ml-rails"><i></i><i></i></div>
        <div class="ml-cap">CATAPULT 03 - CLEAR FOR LAUNCH</div>
      </div>

      <div class="ml-count a-mlcount">GO</div>

      <div class="ml-slate a-mlslate">
        <div class="ml-sh">PILOT IDENT</div>
        <div class="ml-id">${av(d, 96)}<div>
          <h1>${esc(d.user.name)}</h1>
          <div class="ml-url">${esc(d.user.url)}</div></div></div>
        <div class="ml-rows">
          ${d.user.followers != null ? `<div><span>SORTIES</span><b data-count="${d.user.followers}">0</b></div>` : ''}
          ${d.user.game ? `<div><span>UNIT</span><b class="sm">${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>ENLISTED</span><b class="sm">${esc(d.user.created)}</b></div>` : ''}
        </div>
        <div class="ml-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- MAGICAL GIRL ---------- */
  add({
    id: 'magicalgirl', label: 'Magical Girl', group: 'Anime',
    blurb: 'Transformation sequence - ribbons spiral, hearts and stars burst, and everything is drenched in pastel sparkle.',
    html: (d) => `
    <div class="lo lo-mgirl">
      <div class="mgl-sky"></div>
      <div class="mgl-rays a-mglspin"></div>
      <div class="mgl-hearts">${rep(20, (i) => `<i style="left:${(i * 83) % 96}%;--dl:${(i % 9) * 0.4}s;--dur:${4 + (i % 5)}s;--sz:${12 + (i % 4) * 8}px">${i % 2 ? '♥' : '★'}</i>`)}</div>
      <div class="mgl-ribbon r1 a-mglrib"></div>
      <div class="mgl-ribbon r2 a-mglrib"></div>

      <div class="mgl-window a-mglpop">
        <div class="mgl-frame">${clip(d)}</div>
        <div class="mgl-sparkle">${rep(8, (i) => `<b style="--a:${i * 45}deg;--dl:${i * 0.09}s"></b>`)}</div>
      </div>

      <div class="mgl-card a-mglcard">
        <div class="mgl-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="mgl-url">${esc(d.user.url)}</div>
        <div class="mgl-rows">
          ${d.user.followers != null ? `<div><b data-count="${d.user.followers}">0</b><span>BELIEVERS</span></div>` : ''}
          ${d.clip ? `<div><b data-count="${d.clip.views}">0</b><span>SPARKLES</span></div>` : ''}
          ${d.user.created ? `<div><b class="sm">${esc(d.user.created)}</b><span>AWAKENED</span></div>` : ''}
        </div>
        ${d.user.bio ? `<p class="mgl-bio">${esc(d.user.bio)}</p>` : ''}
        <div class="mgl-credit">${credit(d, 'micro')}</div>
        <div class="mgl-cta">${esc(d.copy.cta)} ♡</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- VISUAL NOVEL ---------- */
  add({
    id: 'visualnovel', label: 'Visual Novel', group: 'Anime',
    blurb: 'Dialogue box over a scene, with a nameplate, typing indicator and a row of save-slot style stats.',
    html: (d) => `
    <div class="lo lo-vn">
      <div class="vn-scene">
        <div class="vn-bg">${clip(d)}</div>
        <div class="vn-tint"></div>
      </div>

      <div class="vn-menu a-vndn">
        ${['SAVE', 'LOAD', 'AUTO', 'SKIP', 'LOG'].map((m) => `<span>${m}</span>`).join('')}
      </div>

      <div class="vn-portrait a-vnport">${av(d, 260)}</div>

      <div class="vn-box a-vnup">
        <div class="vn-name">${esc(d.user.name)}</div>
        <p class="vn-line">${esc(d.user.bio || d.copy.cta)}</p>
        <div class="vn-meta">
          ${d.user.followers != null ? `<span>♥ ${n(d.user.followers)}</span>` : ''}
          ${d.user.game ? `<span>◆ ${esc(d.user.game)}</span>` : ''}
          ${d.user.created ? `<span>✦ ${esc(d.user.created)}</span>` : ''}
          <span class="vn-url">${esc(d.user.url)}</span>
        </div>
        <div class="vn-next a-vnblink">▼</div>
      </div>
      <div class="vn-credit a-vnup d1">${credit(d, 'micro')}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- TITLE CARD ---------- */
  add({
    id: 'animetitle', label: 'Episode Title', group: 'Anime',
    blurb: 'End-of-cold-open title card - vertical Japanese type, a thin rule that draws itself, and an episode number.',
    html: (d) => `
    <div class="lo lo-atitle">
      <div class="at-wash"></div>
      <div class="at-window a-atin">
        <div class="at-frame">${clip(d)}</div>
        <div class="at-grade"></div>
      </div>

      <div class="at-vert a-atvert">
        <span>第${(d.user.followers || 12) % 99 + 1}話</span>
      </div>

      <div class="at-block a-atblock">
        <div class="at-rule a-atrule"></div>
        <div class="at-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="at-sub">${esc(d.clip ? d.clip.title : d.user.title)}</div>
        <div class="at-rows">
          ${d.user.followers != null ? `<span>${n(d.user.followers)} followers</span>` : ''}
          ${d.user.game ? `<span>${esc(d.user.game)}</span>` : ''}
          ${d.user.created ? `<span>since ${esc(d.user.created)}</span>` : ''}
        </div>
        <div class="at-url">${esc(d.user.url)}</div>
        <div class="at-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

})(typeof window !== 'undefined' ? window : globalThis);
