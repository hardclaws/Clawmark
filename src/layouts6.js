/* Clawmark - Twitch Shoutout Overlay for OBS
 * Created by Hardclaws · twitch.tv/hardclaws · thehardclaws@gmail.com
 * MIT licence. Free to use, modify and fork.
 */
/* =============================================================
   LAYOUTS - SET 6
   Sci-fi and cyberpunk.

   Same rule as set 5: the clip owns a dedicated 16:9 window and no
   furniture is drawn over it.
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
     SCI-FI
     ========================================================= */

  /* ---------- STARSHIP BRIDGE ---------- */
  add({
    id: 'starship', label: 'Starship Bridge', group: 'Sci-fi',
    blurb: 'Command console of a capital ship - curved viewport, system readouts, and a hull-status wireframe that pulses.',
    html: (d) => `
    <div class="lo lo-ship">
      <div class="ss-void"></div>
      <div class="ss-stars">${rep(80, (i) => `<i style="left:${(i * 79) % 100}%;top:${(i * 43) % 100}%;--sp:${6 + (i % 7)}s"></i>`)}</div>

      <div class="ss-viewport a-ssopen">
        <div class="ss-glass">${clip(d)}</div>
        <div class="ss-hud">
          <span class="ss-tl"></span><span class="ss-tr"></span>
          <span class="ss-bl"></span><span class="ss-br"></span>
        </div>
        <div class="ss-vlabel">FORWARD VIEW · ${esc(d.clip ? d.clip.title : d.user.title)}</div>
      </div>

      <div class="ss-rail l a-ssleft">
        <div class="ss-rhead">CREW MANIFEST</div>
        <div class="ss-crew">${av(d, 92)}<div>
          <b>${esc(d.user.name)}</b><span>${esc(d.user.url)}</span></div></div>
        <div class="ss-bars">
          ${[['SHIELDS', 88], ['ENGINES', 72], ['SIGNAL', 95]].map((s, i) => `
            <div class="ss-bar"><span>${s[0]}</span><i><u style="width:${s[1]}%;animation-delay:${i * 0.15}s"></u></i></div>`).join('')}
        </div>
        ${d.user.bio ? `<p class="ss-log">${esc(d.user.bio)}</p>` : ''}
      </div>

      <div class="ss-rail r a-ssright">
        <div class="ss-rhead">TELEMETRY</div>
        <div class="ss-tel">
          ${d.user.followers != null ? `<div><span>CREW</span><b data-count="${d.user.followers}">0</b></div>` : ''}
          ${d.clip ? `<div><span>SCANS</span><b data-count="${d.clip.views}">0</b></div>` : ''}
          ${d.user.game ? `<div><span>SECTOR</span><b class="sm">${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>LAUNCHED</span><b class="sm">${esc(d.user.created)}</b></div>` : ''}
        </div>
        <div class="ss-wire">
          <svg viewBox="0 0 200 120">
            <path d="M20 60 L60 30 L140 30 L180 60 L140 90 L60 90 Z"/>
            <path d="M60 30 L60 90 M140 30 L140 90 M20 60 L180 60"/>
          </svg>
          <span>HULL NOMINAL</span>
        </div>
        <div class="ss-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- HOLOGRAM ---------- */
  add({
    id: 'hologram', label: 'Hologram', group: 'Sci-fi',
    blurb: 'A projected light-field - the panel flickers, scan bands roll upward and everything sits on a glowing emitter disc.',
    html: (d) => `
    <div class="lo lo-holo2">
      <div class="hg-dark"></div>
      <div class="hg-emitter a-hgspin"></div>
      <div class="hg-cone"></div>

      <div class="hg-body a-hgflick">
        <div class="hg-screen">
          <div class="hg-frame">${clip(d)}</div>
          <div class="hg-bands"></div>
        </div>
        <div class="hg-info">
          <div class="hg-kick">${esc(d.copy.kicker)}</div>
          <h1>${esc(d.user.name)}</h1>
          <div class="hg-url">${esc(d.user.url)}</div>
          <div class="hg-grid">
            ${d.user.followers != null ? `<div><b data-count="${d.user.followers}">0</b><span>FOLLOWERS</span></div>` : ''}
            ${d.clip ? `<div><b data-count="${d.clip.views}">0</b><span>VIEWS</span></div>` : ''}
            ${d.user.created ? `<div><b class="sm">${esc(d.user.created)}</b><span>JOINED</span></div>` : ''}
          </div>
          <div class="hg-credit">${credit(d, 'line')}</div>
        </div>
      </div>
      <div class="hg-motes">${rep(24, (i) => `<i style="left:${(i * 89) % 100}%;--dl:${(i % 8) * 0.5}s;--dur:${4 + (i % 4)}s"></i>`)}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- MECH COCKPIT ---------- */
  add({
    id: 'mech', label: 'Mech Cockpit', group: 'Sci-fi',
    blurb: 'Inside a piloted mech - armoured strut frame, targeting reticle, ammo and coolant gauges, warning lamps.',
    html: (d) => `
    <div class="lo lo-mech">
      <div class="mk-cab"></div>
      <div class="mk-strut l"></div><div class="mk-strut r"></div>

      <div class="mk-screen a-mkboot">
        <div class="mk-view">${clip(d)}</div>
        <div class="mk-recticle"><i class="h"></i><i class="v"></i><i class="ring"></i></div>
        <div class="mk-lock">TARGET LOCK · ${esc(d.user.login || d.user.name)}</div>
      </div>

      <div class="mk-left a-mkin">
        <div class="mk-pilot">${av(d, 96)}<div class="mk-pname">
          <span>PILOT</span><b>${esc(d.user.name)}</b></div></div>
        <div class="mk-gauges">
          ${[['AMMO', 74, 'a'], ['COOLANT', 52, 'b'], ['ARMOUR', 91, 'c']].map((g, i) => `
            <div class="mk-g ${g[2]}"><span>${g[0]}</span>
              <i><u style="height:${g[1]}%;animation-delay:${i * 0.12}s"></u></i>
              <b>${g[1]}</b></div>`).join('')}
        </div>
      </div>

      <div class="mk-right a-mkin2">
        <div class="mk-warn"><i></i>SYSTEMS ONLINE</div>
        <div class="mk-rows">
          ${d.user.followers != null ? `<div><span>SQUADRON</span><b data-count="${d.user.followers}">0</b></div>` : ''}
          ${d.user.game ? `<div><span>THEATRE</span><b class="sm">${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>COMMISSIONED</span><b class="sm">${esc(d.user.created)}</b></div>` : ''}
        </div>
        <div class="mk-credit">${credit(d, 'micro')}</div>
        <div class="mk-url">${esc(d.user.url)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- WARP JUMP ---------- */
  add({
    id: 'warp', label: 'Warp Jump', group: 'Sci-fi',
    blurb: 'Streaking starlines converging on a central viewport, with a jump countdown and destination readout.',
    html: (d) => `
    <div class="lo lo-warp">
      <div class="wp-tunnel">${rep(56, (i) => `<i style="--a:${i * 6.42}deg;--dl:${(i % 11) * 0.16}s;--len:${120 + (i % 5) * 90}px"></i>`)}</div>
      <div class="wp-flash a-wpflash"></div>

      <div class="wp-port a-wpport">
        <div class="wp-inner">${clip(d)}</div>
        <div class="wp-ring"></div>
      </div>

      <div class="wp-top a-wpdn">
        <span class="wp-tag">JUMP ENGAGED</span>
        <span class="wp-dest">DESTINATION · ${esc(d.user.url).toUpperCase()}</span>
      </div>

      <div class="wp-bottom a-wpup">
        <div class="wp-id">${av(d, 104)}
          <div><div class="wp-kick">${esc(d.copy.kicker)}</div>
          <h1>${esc(d.user.name)}</h1></div></div>
        <div class="wp-stats">
          ${d.user.followers != null ? `<div><b data-count="${d.user.followers}">0</b><span>ABOARD</span></div>` : ''}
          ${d.clip ? `<div><b data-count="${d.clip.views}">0</b><span>VIEWS</span></div>` : ''}
          ${d.user.created ? `<div><b class="sm">${esc(d.user.created)}</b><span>SINCE</span></div>` : ''}
        </div>
      </div>
      <div class="wp-credit a-wpup d1">${credit(d, 'line')}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- XENO SCAN ---------- */
  add({
    id: 'xenoscan', label: 'Xeno Scan', group: 'Sci-fi',
    blurb: 'Lifeform analysis terminal - a sweeping scan line crosses the subject while classification data types itself in.',
    html: (d) => `
    <div class="lo lo-xeno">
      <div class="xn-grid"></div>
      <div class="xn-head a-xndn">
        <span class="xn-dot"></span>XENOBIOLOGY TERMINAL · SPECIMEN ${esc((d.user.login || 'unknown').toUpperCase())}
      </div>

      <div class="xn-view a-xnopen">
        <div class="xn-frame">${clip(d)}</div>
        <div class="xn-sweep"></div>
        <div class="xn-ticks">${rep(20, (i) => `<i style="left:${i * 5}%"></i>`)}</div>
      </div>

      <div class="xn-panel a-xnin">
        <div class="xn-ph">CLASSIFICATION</div>
        <div class="xn-rows">
          <div><span>DESIGNATION</span><b>${esc(d.user.name)}</b></div>
          ${d.user.game ? `<div><span>HABITAT</span><b>${esc(d.user.game)}</b></div>` : ''}
          ${d.user.followers != null ? `<div><span>COLONY SIZE</span><b>${n(d.user.followers)}</b></div>` : ''}
          ${d.user.created ? `<div><span>FIRST CONTACT</span><b>${esc(d.user.created)}</b></div>` : ''}
          <div><span>BEACON</span><b>${esc(d.user.url)}</b></div>
        </div>
        ${d.user.bio ? `<p class="xn-note">FIELD NOTE - ${esc(d.user.bio)}</p>` : ''}
        <div class="xn-credit">${credit(d, 'stack')}</div>
        <div class="xn-status"><i></i>SCAN COMPLETE - ${esc(d.copy.cta).toUpperCase()}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- ORBITAL STATION ---------- */
  add({
    id: 'station', label: 'Orbital Station', group: 'Sci-fi',
    blurb: 'A window seat above the planet - curved horizon glow, docking chatter, and a slow rotating station ring.',
    html: (d) => `
    <div class="lo lo-stn">
      <div class="st2-space"></div>
      <div class="st2-planet"></div>
      <div class="st2-limb"></div>
      <div class="st2-ring a-st2spin"></div>

      <div class="st2-port a-st2in">
        <div class="st2-glass">${clip(d)}</div>
        <div class="st2-seal"></div>
        <div class="st2-plate">OBSERVATION DECK 7</div>
      </div>

      <div class="st2-card a-st2card">
        <div class="st2-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="st2-url">${esc(d.user.url)}</div>
        <div class="st2-div"></div>
        ${d.user.bio ? `<p class="st2-bio">${esc(d.user.bio)}</p>` : ''}
        <div class="st2-rows">
          ${d.user.followers != null ? `<div><span>Residents</span><b data-count="${d.user.followers}">0</b></div>` : ''}
          ${d.user.game ? `<div><span>Module</span><b class="sm">${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>In orbit since</span><b class="sm">${esc(d.user.created)}</b></div>` : ''}
        </div>
        <div class="st2-credit">${credit(d, 'stack')}</div>
        <div class="st2-cta">${esc(d.copy.cta)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* =========================================================
     CYBERPUNK
     ========================================================= */

  /* ---------- NEON STREET ---------- */
  add({
    id: 'neonstreet', label: 'Neon Street', group: 'Cyberpunk',
    blurb: 'Rain-slick alley at night - stacked kanji signage, wet reflections and a billboard playing the clip.',
    html: (d) => `
    <div class="lo lo-street">
      <div class="ns-night"></div>
      <div class="ns-rain">${rep(60, (i) => `<i style="left:${(i * 67) % 100}%;--dl:${(i % 13) * 0.13}s;--dur:${0.7 + (i % 5) * 0.12}s"></i>`)}</div>

      <div class="ns-signs">
        ${['夜', '電', '雨', '光'].map((k, i) => `
          <div class="ns-sign s${i}" style="animation-delay:${i * 0.7}s">${k}</div>`).join('')}
      </div>

      <div class="ns-board a-nsin">
        <div class="ns-bframe">${clip(d)}</div>
        <div class="ns-bglow"></div>
        <div class="ns-bcap">${esc(d.clip ? d.clip.title : d.user.title)}</div>
      </div>
      <div class="ns-reflect"></div>

      <div class="ns-panel a-nsup">
        <div class="ns-tag">${esc(d.copy.kicker)}</div>
        <h1 data-txt="${esc(d.user.name)}">${esc(d.user.name)}</h1>
        <div class="ns-url">${esc(d.user.url)}</div>
        <div class="ns-chips">
          ${d.user.followers != null ? `<span>${n(d.user.followers)} FOLLOWERS</span>` : ''}
          ${d.user.game ? `<span>${esc(d.user.game)}</span>` : ''}
          ${d.user.created ? `<span>EST ${esc(d.user.created).toUpperCase()}</span>` : ''}
        </div>
        <div class="ns-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- NETRUNNER ---------- */
  add({
    id: 'netrunner', label: 'Netrunner', group: 'Cyberpunk',
    blurb: 'Breaching a system - cascading code rain, an ICE-break progress meter and a stolen-data readout.',
    html: (d) => `
    <div class="lo lo-net">
      <div class="nr-rain">${rep(26, (i) => `<b style="left:${i * 4}%;--dl:${(i % 9) * 0.4}s;--dur:${3 + (i % 5)}s">${rep(14, () => String.fromCharCode(0x30a0 + Math.floor(Math.random() * 90)))}</b>`)}</div>

      <div class="nr-term a-nrin">
        <div class="nr-tbar"><i></i><i></i><i></i><span>ICE BREAKER v9.2 - ${esc((d.user.login || 'target').toUpperCase())}</span></div>
        <div class="nr-body">
          <div class="nr-log">
            <div>&gt; handshake .......... <b class="ok">OK</b></div>
            <div class="d1">&gt; bypass daemon ...... <b class="ok">OK</b></div>
            <div class="d2">&gt; extracting profile . <b class="ok">DONE</b></div>
            <div class="d3">&gt; identity: <b>${esc(d.user.name)}</b></div>
            ${d.user.followers != null ? `<div class="d4">&gt; net presence: <b>${n(d.user.followers)}</b></div>` : ''}
            ${d.user.created ? `<div class="d5">&gt; first seen: <b>${esc(d.user.created)}</b></div>` : ''}
            <div class="d6">&gt; node: <b>${esc(d.user.url)}</b></div>
          </div>
          <div class="nr-feed">
            <div class="nr-fhead">LIVE FEED</div>
            <div class="nr-fwin">${clip(d)}</div>
            <div class="nr-fcap">${credit(d, 'micro')}</div>
          </div>
        </div>
        <div class="nr-meter"><span>ICE</span><i><u></u></i><span class="nr-pct">BROKEN</span></div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- AUGMENT SHOP ---------- */
  add({
    id: 'augment', label: 'Augment Clinic', group: 'Cyberpunk',
    blurb: 'Back-alley chrome clinic - an exploded-view implant diagram with callout lines to the channel stats.',
    html: (d) => `
    <div class="lo lo-aug">
      <div class="ag-wall"></div>
      <div class="ag-head a-agdn">
        <span class="ag-logo">◈</span> CHROME CLINIC - INSTALL MANIFEST
        <span class="ag-price">NO CHARGE</span>
      </div>

      <div class="ag-diagram a-agin">
        <svg viewBox="0 0 420 420" class="ag-arm">
          <path d="M210 40 L210 380" class="ag-spine"/>
          <circle cx="210" cy="120" r="46"/><circle cx="210" cy="230" r="62"/>
          <circle cx="210" cy="330" r="38"/>
          <path d="M148 230 L60 190 M272 230 L360 190 M172 120 L80 96 M248 330 L340 356"/>
          ${rep(6, (i) => `<circle class="ag-node" cx="${150 + (i % 3) * 60}" cy="${150 + Math.floor(i / 3) * 120}" r="5"/>`)}
        </svg>
        <div class="ag-callout c1">${d.user.followers != null ? `<b>${n(d.user.followers)}</b><span>NEURAL LINKS</span>` : `<b>-</b><span>NEURAL LINKS</span>`}</div>
        <div class="ag-callout c2">${d.clip ? `<b>${n(d.clip.views)}</b><span>OPTIC PLAYS</span>` : `<b>-</b><span>OPTIC PLAYS</span>`}</div>
        <div class="ag-callout c3">${d.user.created ? `<b>${esc(d.user.created)}</b><span>INSTALLED</span>` : `<b>-</b><span>INSTALLED</span>`}</div>
      </div>

      <div class="ag-screen a-agpop">
        <div class="ag-sframe">${clip(d)}</div>
        <div class="ag-scap">PROCEDURE FOOTAGE</div>
      </div>

      <div class="ag-card a-agup">
        <div class="ag-id">${av(d, 92)}<div>
          <div class="ag-kick">${esc(d.copy.kicker)}</div>
          <h1>${esc(d.user.name)}</h1>
          <div class="ag-url">${esc(d.user.url)}</div></div></div>
        <div class="ag-credit">${credit(d, 'line')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- MEGACORP ---------- */
  add({
    id: 'megacorp', label: 'Megacorp Memo', group: 'Cyberpunk',
    blurb: 'A cold corporate directive - watermarked letterhead, clearance stamp, and a surveillance still of the subject.',
    html: (d) => `
    <div class="lo lo-corp">
      <div class="mc-sheet a-mcin">
        <div class="mc-mark">CLASSIFIED</div>
        <div class="mc-head">
          <div class="mc-logo">▚</div>
          <div><b>ARASHI-KANE INDUSTRIES</b><span>INTERNAL DIRECTIVE // TIER 4</span></div>
          <div class="mc-ref">REF ${String((d.user.followers || 4021) % 9999).padStart(4, '0')}-B</div>
        </div>

        <div class="mc-body">
          <div class="mc-col">
            <div class="mc-label">SUBJECT</div>
            <h1>${esc(d.user.name)}</h1>
            <div class="mc-url">${esc(d.user.url)}</div>
            <div class="mc-fields">
              ${d.user.game ? `<div><span>OPERATING SECTOR</span><b>${esc(d.user.game)}</b></div>` : ''}
              ${d.user.followers != null ? `<div><span>INFLUENCE INDEX</span><b>${n(d.user.followers)}</b></div>` : ''}
              ${d.user.created ? `<div><span>ON FILE SINCE</span><b>${esc(d.user.created)}</b></div>` : ''}
            </div>
            ${d.user.bio ? `<p class="mc-note">${esc(d.user.bio)}</p>` : ''}
            <div class="mc-action">DIRECTIVE - ${esc(d.copy.cta).toUpperCase()}</div>
          </div>
          <div class="mc-col right">
            <div class="mc-shot">${clip(d)}<span class="mc-scap">SURVEILLANCE CAPTURE</span></div>
            <div class="mc-credit">${credit(d, 'stack')}</div>
          </div>
        </div>
        <div class="mc-stamp a-mcstamp">APPROVED</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- DRONE FEED ---------- */
  add({
    id: 'dronefeed', label: 'Drone Feed', group: 'Cyberpunk',
    blurb: 'Live downlink from a surveillance drone - battery and altitude telemetry, REC dot, and a jittering crosshair.',
    html: (d) => `
    <div class="lo lo-drone">
      <div class="dr-frame a-drin">
        <div class="dr-feed">${clip(d)}</div>
        <div class="dr-vig"></div>
        <div class="dr-cross a-drjit"><i class="h"></i><i class="v"></i></div>
        <div class="dr-corner tl"></div><div class="dr-corner tr"></div>
        <div class="dr-corner bl"></div><div class="dr-corner br"></div>

        <div class="dr-top">
          <span class="dr-rec"><i></i>REC</span>
          <span>UNIT DX-${String((d.user.followers || 77) % 99).padStart(2, '0')}</span>
          <span class="dr-right">ALT 420m · BAT 63%</span>
        </div>
        <div class="dr-bot">
          <span>TRACKING · ${esc(d.user.name).toUpperCase()}</span>
          <span class="dr-right">${esc(d.user.url).toUpperCase()}</span>
        </div>
      </div>

      <div class="dr-side a-drside">
        <div class="dr-sh">TARGET DOSSIER</div>
        <div class="dr-av">${av(d, 110)}</div>
        <h1>${esc(d.user.name)}</h1>
        ${d.user.bio ? `<p class="dr-bio">${esc(d.user.bio)}</p>` : ''}
        <div class="dr-rows">
          ${d.user.followers != null ? `<div><span>FOLLOWERS</span><b data-count="${d.user.followers}">0</b></div>` : ''}
          ${d.user.game ? `<div><span>LAST SEEN IN</span><b class="sm">${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>ON RECORD</span><b class="sm">${esc(d.user.created)}</b></div>` : ''}
        </div>
        <div class="dr-credit">${credit(d, 'stack')}</div>
        <div class="dr-cta">${esc(d.copy.cta)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- SYNTH GRID ---------- */
  add({
    id: 'synthgrid', label: 'Synth Grid', group: 'Cyberpunk',
    blurb: 'Outrun horizon - chrome sun, endless perspective grid, and a mirrored chrome nameplate.',
    html: (d) => `
    <div class="lo lo-synth">
      <div class="sg2-sky"></div>
      <div class="sg2-sun"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="sg2-grid a-sg2roll"></div>
      <div class="sg2-haze"></div>

      <div class="sg2-name a-sg2drop">
        <span data-txt="${esc(d.user.name)}">${esc(d.user.name)}</span>
      </div>

      <div class="sg2-screen a-sg2pop">
        <div class="sg2-inner">${clip(d)}</div>
      </div>

      <div class="sg2-bar a-sg2up">
        <div class="sg2-cell">${av(d, 78)}</div>
        ${d.user.followers != null ? `<div class="sg2-cell"><b data-count="${d.user.followers}">0</b><span>FOLLOWERS</span></div>` : ''}
        ${d.user.game ? `<div class="sg2-cell"><b class="sm">${esc(d.user.game)}</b><span>PLAYING</span></div>` : ''}
        ${d.user.created ? `<div class="sg2-cell"><b class="sm">${esc(d.user.created)}</b><span>JOINED</span></div>` : ''}
        <div class="sg2-cell url"><b class="sm">${esc(d.user.url)}</b><span>${esc(d.copy.cta).toUpperCase()}</span></div>
      </div>
      <div class="sg2-credit a-sg2up d1">${credit(d, 'line')}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

})(typeof window !== 'undefined' ? window : globalThis);
