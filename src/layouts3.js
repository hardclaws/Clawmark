/* Clawmark - Twitch Shoutout Overlay for OBS
 * Created by Hardclaws · twitch.tv/hardclaws · thehardclaws@gmail.com
 * MIT licence. Free to use, modify and fork.
 */
/* =============================================================
   LAYOUTS - SET 3
   Cycling, tabletop/fantasy and steampunk themes.
   Same contract as sets 1 and 2: skin tokens only, sparse-data safe,
   and every layout surfaces clip title + who clipped it + when.
   ============================================================= */
(function (root) {
  'use strict';
  if (!root.Layouts) throw new Error('layouts.js must load first');

  const H = root.Layouts.helpers;
  const { esc, n, clip, credit, av, badge, liveTag } = H;
  const L = root.Layouts.all;
  const add = (o) => L.push(o);

  /* =========================================================
     CYCLING
     ========================================================= */

  /* ---------- 41. RACE NUMBER BIB ---------- */
  add({
    id: 'racebib', label: 'Race Bib', group: 'Cycling',
    blurb: 'Broadcast race bug: pinned number plate over full-frame footage with a timing strip.',
    html: (d) => `
    <div class="lo lo-bib">
      ${clip(d, 'fill')}
      <div class="scrim-b"></div>
      <div class="bi-topbar a-dn">
        <span class="bi-live">${d.user.live ? 'LIVE' : 'CLIP'}</span>
        <span class="bi-event">${esc(d.copy.tag || 'DUNGEONS & DERAILLEURS')}</span>
        <span class="bi-dist">${d.clip ? d.clip.duration + '\u2033' : ''}</span>
      </div>

      <div class="bi-lower a-inl">
        <div class="bi-plate">
          <div class="bi-pin l"></div><div class="bi-pin r"></div>
          <div class="bi-num">${String(d.user.years || 1).padStart(2, '0')}</div>
        </div>
        <div class="bi-ident">
          <div class="bi-kick">${esc(d.copy.kicker)}</div>
          <h1>${esc(d.user.name)}</h1>
          <div class="bi-sub">${[d.user.game, d.user.url].filter(Boolean).map(esc).join('  \u00b7  ')}</div>
        </div>
        <div class="bi-splits">
          ${d.user.followers != null ? `<div><b>${n(d.user.followers)}</b><span>FOLLOWERS</span></div>` : ''}
          ${d.clip ? `<div><b>${n(d.clip.views)}</b><span>VIEWS</span></div>` : ''}
          ${d.user.created ? `<div><b>${esc(d.user.created)}</b><span>JOINED</span></div>` : ''}
        </div>
      </div>

      <div class="bi-ticker a-inl d1">
        <span class="bi-tk">CLIP</span>
        <span class="bi-tv">${esc(d.clip ? d.clip.title : d.user.title)}</span>
        <span class="bi-td">clipped by ${esc(d.clip ? d.clip.creator : '\u2014')} \u00b7 ${esc(d.clip ? d.clip.created : '')}</span>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 42. POWER METER HUD ---------- */
  add({
    id: 'powerhud', label: 'Power Meter', group: 'Cycling',
    blurb: 'Live cycling-computer telemetry rail: watt gauge, cadence arc and a power trace.',
    html: (d) => `
    <div class="lo lo-pwr">
      ${clip(d, 'fill')}
      <div class="pw-vig"></div>

      <div class="pw-rail a-inl">
        <div class="pw-gauge">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle class="pw-trk" cx="60" cy="60" r="50"/>
            <circle class="pw-val" cx="60" cy="60" r="50"/>
          </svg>
          <div class="pw-gv">
            <b>${d.user.followers != null ? n(d.user.followers) : '\u2014'}</b>
            <span>FOLLOWERS</span>
          </div>
        </div>

        <div class="pw-readout">
          ${d.user.game ? `<div><span>CATEGORY</span><b>${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>JOINED TWITCH</span><b>${esc(d.user.created)}</b></div>` : ''}
          ${d.clip ? `<div><span>CLIP VIEWS</span><b>${n(d.clip.views)}</b></div>` : ''}
        </div>

        <div class="pw-trace">
          <svg viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true">
            <polyline points="0,44 20,30 40,38 60,18 80,26 100,10 120,22 140,8 160,20 180,6 200,18 220,12 240,24 260,10 280,20 300,14"/>
          </svg>
          <span>POWER TRACE</span>
        </div>
      </div>

      <div class="pw-name a-up d2">
        ${av(d, 92)}
        <div class="pw-nt">
          <div class="kicker">${esc(d.copy.kicker)}</div>
          <h1>${esc(d.user.name)}</h1>
        </div>
        <div class="pw-right">
          <div class="pw-credit">${credit(d, 'micro')}</div>
          <div class="pw-url">${esc(d.user.url)}</div>
        </div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 43. TOUR JERSEY ---------- */
  add({
    id: 'jersey', label: 'Tour Jersey', group: 'Cycling',
    blurb: 'Grand-tour leaderboard: yellow leader bar, real jersey swatches, GC standings.',
    html: (d) => `
    <div class="lo lo-jersey">
      ${clip(d, 'fill')}
      <div class="scrim-l"></div>

      <div class="js-panel a-inl">
        <div class="js-lead">
          <div class="js-swatch yellow"><i></i><i></i></div>
          <div class="js-leadtx">
            <span>MAILLOT JAUNE</span>
            <h1>${esc(d.user.name)}</h1>
          </div>
          ${av(d, 84)}
        </div>

        <div class="js-gc">
          <div class="js-row">
            <span class="js-sw green"></span>
            <span class="js-lbl">POINTS</span>
            <b>${d.user.followers != null ? n(d.user.followers) : '\u2014'}</b>
          </div>
          <div class="js-row">
            <span class="js-sw polka"></span>
            <span class="js-lbl">JOINED</span>
            <b>${esc(d.user.created || '\u2014')}</b>
          </div>
          <div class="js-row">
            <span class="js-sw white"></span>
            <span class="js-lbl">STAGE</span>
            <b>${esc(d.user.game || '\u2014')}</b>
          </div>
        </div>

        <div class="js-credit">${credit(d, 'line')}</div>
        <div class="js-url">${esc(d.user.url)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 44. ROUTE PROFILE ---------- */
  add({
    id: 'routeprofile', label: 'Route Profile', group: 'Cycling',
    blurb: 'Stage elevation graphic across the base of the frame, with categorised climbs.',
    html: (d) => `
    <div class="lo lo-route">
      ${clip(d, 'fill')}
      <div class="scrim-b"></div>

      <div class="rt-head a-dn">
        <span class="rt-stage">STAGE ${d.index || '01'}</span>
        <span class="rt-name">${esc(d.user.name)}</span>
        <span class="rt-km">${d.clip ? d.clip.duration + ' KM' : ''}</span>
      </div>

      <div class="rt-band a-up">
        <div class="rt-graph">
          <svg viewBox="0 0 1200 150" preserveAspectRatio="none" aria-hidden="true">
            <polygon points="0,150 0,120 100,112 200,86 300,100 400,58 500,74 600,34 700,56 800,22 900,48 1000,16 1100,40 1200,28 1200,150"/>
            <polyline points="0,120 100,112 200,86 300,100 400,58 500,74 600,34 700,56 800,22 900,48 1000,16 1100,40 1200,28"/>
          </svg>
          <div class="rt-climb" style="left:33%"><b>4</b><span>8%</span></div>
          <div class="rt-climb hc" style="left:66%"><b>HC</b><span>12%</span></div>
          <div class="rt-dot" style="left:66%">${av(d, 58)}</div>
        </div>

        <div class="rt-strip">
          <div class="rt-cell">
            <span>RIDER</span><b>${esc(d.user.name)}</b>
          </div>
          ${d.user.followers != null ? `<div class="rt-cell"><span>FOLLOWERS</span><b>${n(d.user.followers)}</b></div>` : ''}
          ${d.user.game ? `<div class="rt-cell"><span>CATEGORY</span><b>${esc(d.user.game)}</b></div>` : ''}
          <div class="rt-cell wide">
            <span>CLIP</span>
            <b>${esc(d.clip ? d.clip.title : d.user.title)}</b>
            <i>clipped by ${esc(d.clip ? d.clip.creator : '\u2014')} \u00b7 ${esc(d.clip ? d.clip.created : '')}</i>
          </div>
          <div class="rt-cell url"><span>FOLLOW</span><b>${esc(d.user.url)}</b></div>
        </div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* =========================================================
     TABLETOP / FANTASY
     ========================================================= */

  /* ---------- 45. CHARACTER SHEET ---------- */
  add({
    id: 'charsheet', label: 'Character Sheet', group: 'Fantasy',
    blurb: 'Parchment adventurer sheet - ability scores, portrait medallion, wax seal.',
    html: (d) => `
    <div class="lo lo-sheet">
      <div class="cs-sheet a-unroll">
        <div class="cs-rule"></div>
        <div class="cs-head">
          <div>
            <div class="cs-kick">${esc(d.copy.kicker)}</div>
            <h1>${esc(d.user.name)}</h1>
          </div>
          <div class="cs-class">
            ${esc(d.user.game || 'Wandering Streamer')}<br>
            <b>${d.user.created ? 'JOINED ' + esc(d.user.created).toUpperCase() : 'ADVENTURER'}</b>
          </div>
        </div>
        <div class="cs-body">
          <div class="cs-left">
            <div class="cs-port">${av(d, 220)}</div>
            <div class="cs-scores">
              ${d.user.followers != null ? `<div><span>FOLLOWERS</span><b>${n(d.user.followers)}</b></div>` : ''}
              ${d.clip ? `<div><span>CLIP VIEWS</span><b>${n(d.clip.views)}</b></div>` : ''}
              ${d.user.created ? `<div><span>JOINED</span><b>${esc(d.user.created)}</b></div>` : ''}
            </div>
          </div>
          <div class="cs-right">
            <div class="cs-window">${clip(d)}</div>
            <div class="cs-traits">
              ${d.user.bio ? `<p>${esc(d.user.bio)}</p>` : ''}
              <div class="cs-credit">${credit(d, 'line')}</div>
            </div>
          </div>
        </div>
        <div class="cs-foot">
          <i>"${esc(d.copy.cta)}"</i> · ${esc(d.user.url)}
        </div>
        <div class="cs-seal a-seal">${esc((d.user.name || 'D')[0])}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 46. SPELL SCROLL ---------- */
  add({
    id: 'spellscroll', label: 'Spell Scroll', group: 'Fantasy',
    blurb: 'Unfurling scroll with wooden rollers, illuminated capital and rune border.',
    html: (d) => `
    <div class="lo lo-scr2">
      <div class="s2-dark"></div>
      <div class="s2-glow"></div>
      <div class="s2-wrap">
        <div class="s2-roll t a-rollT"></div>
        <div class="s2-paper a-unfurl">
          <div class="s2-runes"></div>
          <div class="s2-inner">
            <div class="s2-kick">${esc(d.copy.kicker)}</div>
            <h1><span class="s2-cap">${esc((d.user.name || 'A')[0])}</span>${esc((d.user.name || '').slice(1))}</h1>
            <div class="s2-window">${clip(d)}</div>
            <div class="s2-lines">
              ${d.user.game ? `<div><span>School</span><b>${esc(d.user.game)}</b></div>` : ''}
              ${d.user.followers != null ? `<div><span>Devoted</span><b>${n(d.user.followers)}</b></div>` : ''}
              ${d.user.created ? `<div><span>Joined Twitch</span><b>${esc(d.user.created)}</b></div>` : ''}
            </div>
            <div class="s2-credit">${credit(d, 'line')}</div>
            <div class="s2-url">${esc(d.user.url)}</div>
          </div>
        </div>
        <div class="s2-roll b a-rollB"></div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 47. TAVERN BOARD ---------- */
  add({
    id: 'tavern', label: 'Tavern Board', group: 'Fantasy',
    blurb: 'Notice board in an inn - hanging sign, nailed parchment, candlelight glow.',
    html: (d) => `
    <div class="lo lo-tav">
      <div class="tv-wall"></div>
      <div class="tv-candle"></div>
      <div class="tv-sign a-swing">
        <div class="tv-signtxt">${esc(d.copy.tag || 'THE PRANCING PELOTON')}</div>
      </div>
      <div class="tv-notice a-nail">
        <div class="tv-nail l"></div><div class="tv-nail r"></div>
        <div class="tv-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="tv-window">${clip(d)}</div>
        <ul class="tv-list">
          ${d.user.game ? `<li>Last seen questing in <b>${esc(d.user.game)}</b></li>` : ''}
          ${d.user.followers != null ? `<li>Followed by <b>${n(d.user.followers)}</b> souls</li>` : ''}
          ${d.user.created ? `<li>Joined Twitch <b>${esc(d.user.created)}</b></li>` : ''}
        </ul>
        <div class="tv-credit">${credit(d, 'micro')}</div>
        <div class="tv-url">${esc(d.user.url)}</div>
      </div>
      <div class="tv-mug a-pop d3"></div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 48. RUNE STONE ---------- */
  add({
    id: 'runestone', label: 'Rune Stone', group: 'Fantasy',
    blurb: 'Carved standing stone with glowing runes, moss and a summoning circle.',
    html: (d) => `
    <div class="lo lo-rune">
      <div class="rn-night"></div>
      <div class="rn-circle a-ring"></div>
      <div class="rn-stone a-rise2">
        <div class="rn-face">
          <div class="rn-glyphs">${'ᚠᚢᚦᚨᚱᚲ'.split('').map((g, i) =>
            `<span style="animation-delay:${i * 0.18}s">${g}</span>`).join('')}</div>
          <div class="rn-kick">${esc(d.copy.kicker)}</div>
          <h1>${esc(d.user.name)}</h1>
          <div class="rn-window">${clip(d)}</div>
          <div class="rn-stats">
            ${d.user.followers != null ? `<span>${n(d.user.followers)} followers</span>` : ''}
            ${d.user.game ? `<span>${esc(d.user.game)}</span>` : ''}
            ${d.user.created ? `<span>Joined ${esc(d.user.created)}</span>` : ''}
          </div>
          <div class="rn-credit">${credit(d, 'micro')}</div>
        </div>
      </div>
      <div class="rn-url a-fade d4">${esc(d.user.url)}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 49. LOOT DROP ---------- */
  add({
    id: 'lootdrop', label: 'Loot Drop', group: 'Fantasy',
    blurb: 'RPG item tooltip - rarity border, stat rolls, flavour text and a rarity beam.',
    html: (d) => `
    <div class="lo lo-loot">
      ${clip(d, 'fill')}
      <div class="lt-beam a-beam"></div>
      <div class="scrim-b"></div>
      <div class="lt-card a-pop">
        <div class="lt-rarity">LEGENDARY</div>
        <div class="lt-head">
          ${av(d, 92)}
          <div>
            <h1>${esc(d.user.name)}</h1>
            <div class="lt-type">${esc(d.user.game || 'Streamer')} ${badge(d)}</div>
          </div>
        </div>
        <div class="lt-stats">
          ${d.user.followers != null ? `<div><span>+${n(d.user.followers)}</span> Followers</div>` : ''}
          ${d.user.created ? `<div><span>${esc(d.user.created)}</span> Joined Twitch</div>` : ''}
          ${d.clip ? `<div><span>+${n(d.clip.views)}</span> Clip views</div>` : ''}
        </div>
        ${d.user.bio ? `<div class="lt-flav">"${esc(d.user.bio)}"</div>` : ''}
        <div class="lt-credit">${credit(d, 'micro')}</div>
        <div class="lt-cta">${esc(d.copy.cta)} · ${esc(d.user.url)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* =========================================================
     STEAMPUNK
     ========================================================= */

  /* ---------- 50. BRASS GAUGE PANEL ---------- */
  add({
    id: 'brassgauge', label: 'Brass Gauges', group: 'Steampunk',
    blurb: 'Riveted brass console with pressure dials, glass portholes and steam vents.',
    html: (d) => `
    <div class="lo lo-brass">
      <div class="br-plate"></div>
      <div class="br-rivets"></div>
      <div class="br-steam"></div>
      <div class="br-port a-pop">
        <div class="br-glass">${clip(d)}</div>
        <div class="br-ring"></div>
      </div>
      <div class="br-panel a-up d1">
        <div class="br-name">
          <div class="kicker">${esc(d.copy.kicker)}</div>
          <h1>${esc(d.user.name)}</h1>
        </div>
        <div class="br-dials">
          ${['followers', 'years', 'views'].map((k, i) => {
            const val = k === 'followers' ? (d.user.followers != null ? n(d.user.followers) : null)
              : k === 'years' ? (d.user.created || null)
              : (d.clip ? n(d.clip.views) : null);
            if (val == null) return '';
            const lbl = k === 'followers' ? 'FOLLOWERS' : k === 'years' ? 'JOINED' : 'VIEWS';
            const deg = [-38, 14, 52][i];
            return `<div class="br-dial">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="44" class="br-d-face"/>
                <circle cx="50" cy="50" r="44" class="br-d-rim"/>
                ${Array.from({ length: 11 }, (_, t) => {
                  const a = (-120 + t * 24) * Math.PI / 180;
                  return `<line x1="${50 + Math.cos(a) * 34}" y1="${50 + Math.sin(a) * 34}"
                    x2="${50 + Math.cos(a) * 40}" y2="${50 + Math.sin(a) * 40}" class="br-d-tick"/>`;
                }).join('')}
                <line x1="50" y1="50" x2="${50 + Math.cos(deg * Math.PI / 180) * 32}"
                  y2="${50 + Math.sin(deg * Math.PI / 180) * 32}" class="br-d-needle"/>
                <circle cx="50" cy="50" r="5" class="br-d-hub"/>
              </svg>
              <b>${val}</b><span>${lbl}</span>
            </div>`;
          }).join('')}
        </div>
        <div class="br-credit">${credit(d, 'line')}</div>
        <div class="br-url">${esc(d.user.url)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 51. AIRSHIP LOG ---------- */
  add({
    id: 'airship', label: 'Airship Log', group: 'Steampunk',
    blurb: 'Leather-bound flight log with brass fittings, compass rose and ink entries.',
    html: (d) => `
    <div class="lo lo-air">
      <div class="ai-leather"></div>
      <div class="ai-book a-open2">
        <div class="ai-corner tl"></div><div class="ai-corner tr"></div>
        <div class="ai-corner bl"></div><div class="ai-corner br"></div>
        <div class="ai-head">
          <span>SHIP'S LOG</span>
          <span>${esc(d.clip ? d.clip.created : d.user.created)}</span>
        </div>
        <div class="ai-body">
          <div class="ai-left">
            <div class="ai-window">${clip(d)}</div>
            <div class="ai-cap">${esc(d.clip ? d.clip.title : d.user.title)}</div>
          </div>
          <div class="ai-right">
            <div class="ai-compass">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="46" class="ai-c-rim"/>
                <circle cx="50" cy="50" r="38" class="ai-c-face"/>
                <polygon points="50,10 56,48 50,90 44,48" class="ai-c-needle"/>
                <text x="50" y="8" class="ai-c-n">N</text>
              </svg>
            </div>
            <h1>${esc(d.user.name)}</h1>
            <div class="ai-entries">
              ${d.user.game ? `<div><span>Cargo</span><b>${esc(d.user.game)}</b></div>` : ''}
              ${d.user.followers != null ? `<div><span>Crew</span><b>${n(d.user.followers)}</b></div>` : ''}
              ${d.user.created ? `<div><span>Joined</span><b>${esc(d.user.created)}</b></div>` : ''}
              <div><span>Logged by</span><b>${esc(d.clip ? d.clip.creator : '-')}</b></div>
            </div>
            <div class="ai-url">${esc(d.user.url)}</div>
          </div>
        </div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 52. CLOCKWORK ---------- */
  add({
    id: 'clockwork', label: 'Clockwork', group: 'Steampunk',
    blurb: 'Interlocking cogs turning behind a brass frame, escapement ticking.',
    html: (d) => `
    <div class="lo lo-clock">
      <div class="ck-dark"></div>
      <div class="ck-cogs">
        <svg viewBox="0 0 100 100" class="ck-cog c1" aria-hidden="true">${cogPath(14)}</svg>
        <svg viewBox="0 0 100 100" class="ck-cog c2" aria-hidden="true">${cogPath(10)}</svg>
        <svg viewBox="0 0 100 100" class="ck-cog c3" aria-hidden="true">${cogPath(18)}</svg>
        <svg viewBox="0 0 100 100" class="ck-cog c4" aria-hidden="true">${cogPath(8)}</svg>
      </div>
      <div class="ck-frame a-pop">
        <div class="ck-window">${clip(d)}</div>
      </div>
      <div class="ck-plate a-up d2">
        <div class="kicker">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="ck-row">
          ${d.user.game ? `<span>${esc(d.user.game)}</span>` : ''}
          ${d.user.followers != null ? `<span>${n(d.user.followers)} followers</span>` : ''}
          ${d.user.created ? `<span>Joined ${esc(d.user.created)}</span>` : ''}
        </div>
        <div class="ck-credit">${credit(d, 'line')}</div>
        <div class="ck-url">${esc(d.user.url)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* A real gear profile: flat-topped teeth with square shoulders, not a star.
     Four points per tooth (root-in, tip-in, tip-out, root-out). */
  function cogPath(teeth) {
    const root = 33, tip = 44, hub = 13;
    const step = (Math.PI * 2) / teeth;
    const tipHalf = step * 0.22;     // tooth width at the tip
    const rootHalf = step * 0.30;    // wider at the base
    const pts = [];
    const at = (a, r) => `${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)}`;
    for (let i = 0; i < teeth; i++) {
      const c = i * step - Math.PI / 2;
      pts.push(at(c - rootHalf, root));
      pts.push(at(c - tipHalf, tip));
      pts.push(at(c + tipHalf, tip));
      pts.push(at(c + rootHalf, root));
    }
    return `<polygon points="${pts.join(' ')}"/>` +
           `<circle cx="50" cy="50" r="${hub}"/>` +
           `<circle cx="50" cy="50" r="${hub * 0.42}"/>`;
  }

  /* ---------- 53. TELEGRAM ---------- */
  add({
    id: 'telegram', label: 'Telegram', group: 'Steampunk',
    blurb: 'Victorian wire message on typed paper, punched tape and a red wax seal.',
    html: (d) => `
    <div class="lo lo-tele">
      <div class="tl-desk"></div>
      <div class="tl-tape a-tapein"></div>
      <div class="tl-sheet a-slide2">
        <div class="tl-head">
          <span>TELEGRAM</span>
          <span>No. ${d.index || '01'}</span>
        </div>
        <div class="tl-rule"></div>
        <div class="tl-to">TO: ALL VIEWERS &nbsp;·&nbsp; FROM: ${esc(d.copy.tag || 'THE STREAM')}</div>
        <div class="tl-msg">
          <p>${esc(d.copy.kicker).toUpperCase()} <b>${esc(d.user.name).toUpperCase()}</b> STOP</p>
          ${d.user.game ? `<p>LAST OBSERVED PLAYING ${esc(d.user.game).toUpperCase()} STOP</p>` : ''}
          ${d.user.followers != null ? `<p>${n(d.user.followers)} FOLLOWERS ALREADY ABOARD STOP</p>` : ''}
          <p>${esc(d.copy.cta).toUpperCase()} STOP</p>
        </div>
        <div class="tl-window">${clip(d)}</div>
        <div class="tl-credit">${credit(d, 'micro')}</div>
        <div class="tl-url">${esc(d.user.url)}</div>
        <div class="tl-seal a-seal2">✦</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  root.Layouts.ids = L.map((x) => x.id);
})(typeof window !== 'undefined' ? window : globalThis);
