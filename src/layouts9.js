/* Clawmark — Twitch Shoutout Overlay for OBS
 * Created by Hardclaws · twitch.tv/hardclaws · thehardclaws@gmail.com
 * MIT licence. Free to use, modify and fork.
 */
/* =============================================================
   LAYOUTS — SET 9
   Travel, print media, craft and toy-box themes.
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
     TRAVEL
     ========================================================= */

  /* ---------- DEPARTURE BOARD ---------- */
  add({
    id: 'departures', label: 'Departure Board', group: 'Travel',
    blurb: 'Split-flap airport board — rows clatter into place, the shouted channel on the top line as BOARDING.',
    html: (d) => `
    <div class="lo lo-dep">
      <div class="dp2-hall"></div>
      <div class="dp2-board a-dp2in">
        <div class="dp2-head">
          <span>DEPARTURES</span>
          <span class="dp2-clock">${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}</span>
        </div>
        <div class="dp2-cols">
          <span>TIME</span><span>DESTINATION</span><span>GATE</span><span>STATUS</span>
        </div>

        <div class="dp2-row lead a-dp2flap">
          <span class="dp2-t">NOW</span>
          <span class="dp2-d">${esc(d.user.name)}</span>
          <span class="dp2-g">${String((d.user.followers || 7) % 40 + 1).padStart(2, '0')}</span>
          <span class="dp2-s go">BOARDING</span>
        </div>
        ${d.user.game ? `<div class="dp2-row a-dp2flap d1"><span class="dp2-t">—</span>
          <span class="dp2-d">${esc(d.user.game)}</span><span class="dp2-g">B4</span>
          <span class="dp2-s">ON TIME</span></div>` : ''}
        ${d.user.followers != null ? `<div class="dp2-row a-dp2flap d2"><span class="dp2-t">—</span>
          <span class="dp2-d">${n(d.user.followers)} PASSENGERS</span><span class="dp2-g">C1</span>
          <span class="dp2-s">CHECKED IN</span></div>` : ''}
        ${d.user.created ? `<div class="dp2-row a-dp2flap d3"><span class="dp2-t">—</span>
          <span class="dp2-d">FLYING SINCE ${esc(d.user.created).toUpperCase()}</span>
          <span class="dp2-g">A2</span><span class="dp2-s">SCHEDULED</span></div>` : ''}
      </div>

      <div class="dp2-gate a-dp2gate">
        <div class="dp2-win">${clip(d)}</div>
        <div class="dp2-cap">${esc(d.clip ? d.clip.title : d.user.title)}</div>
        <div class="dp2-credit">${credit(d, 'micro')}</div>
        <div class="dp2-url">${esc(d.user.url)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- LUGGAGE TAG ---------- */
  add({
    id: 'luggage', label: 'Luggage Tag', group: 'Travel',
    blurb: 'A well-travelled suitcase covered in country stickers, with a swinging airline tag on a loop of elastic.',
    html: (d) => `
    <div class="lo lo-lug">
      <div class="lg-floor"></div>
      <div class="lg-case a-lgin">
        <div class="lg-shell">
          <div class="lg-ribs">${rep(9, () => '<i></i>')}</div>
          <div class="lg-window">${clip(d)}</div>
          <div class="lg-stickers">
            ${['JPN', 'ISL', 'NZL', 'PER'].map((s, i) =>
              `<span class="lg-st s${i}">${s}</span>`).join('')}
          </div>
          <div class="lg-handle"></div>
          <div class="lg-latch l"></div><div class="lg-latch r"></div>
        </div>
      </div>

      <div class="lg-tag a-lgswing">
        <div class="lg-hole"></div>
        <div class="lg-tbody">
          <div class="lg-airline">TWITCH AIR</div>
          <div class="lg-name">${esc(d.user.name)}</div>
          <div class="lg-route">
            <b>HOME</b><i>✈</i><b>${esc((d.user.login || 'live').slice(0, 3).toUpperCase())}</b>
          </div>
          <div class="lg-rows">
            ${d.user.followers != null ? `<div><span>PAX</span><b>${n(d.user.followers)}</b></div>` : ''}
            ${d.user.game ? `<div><span>CLASS</span><b>${esc(d.user.game)}</b></div>` : ''}
            ${d.user.created ? `<div><span>MEMBER</span><b>${esc(d.user.created)}</b></div>` : ''}
          </div>
          <div class="lg-bars">${rep(28, (i) => `<i style="width:${(i % 4) + 1}px"></i>`)}</div>
          <div class="lg-url">${esc(d.user.url)}</div>
        </div>
      </div>
      <div class="lg-credit a-lgup">${credit(d, 'line')}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- SUBWAY MAP ---------- */
  add({
    id: 'subway', label: 'Subway Map', group: 'Travel',
    blurb: 'Transit diagram styling — coloured lines with interchange dots, a roundel station name and a service board.',
    html: (d) => `
    <div class="lo lo-sub">
      <div class="sb2-wall"></div>
      <svg class="sb2-lines" viewBox="0 0 1920 1080" preserveAspectRatio="none">
        <path class="l1" d="M-40 200 H420 L620 400 H1300 L1500 200 H1960"/>
        <path class="l2" d="M-40 520 H300 L520 740 H1180 L1400 520 H1960"/>
        <path class="l3" d="M-40 880 H700 L900 660 H1960"/>
        ${[[420, 200], [620, 400], [1300, 400], [1500, 200], [520, 740], [1180, 740], [700, 880], [900, 660]]
          .map(([x, y]) => `<circle class="sb2-dot" cx="${x}" cy="${y}" r="14"/>`).join('')}
      </svg>

      <div class="sb2-roundel a-sb2in">
        <div class="sb2-ring"></div>
        <div class="sb2-bar">${esc(d.user.name)}</div>
      </div>

      <div class="sb2-screen a-sb2screen">
        <div class="sb2-view">${clip(d)}</div>
        <div class="sb2-scap">PLATFORM CCTV</div>
      </div>

      <div class="sb2-board a-sb2board">
        <div class="sb2-bh">SERVICE INFORMATION</div>
        <div class="sb2-rows">
          <div><span class="sb2-pill a">1</span><b>${esc(d.user.url)}</b><i>GOOD SERVICE</i></div>
          ${d.user.game ? `<div><span class="sb2-pill b">2</span><b>${esc(d.user.game)}</b><i>RUNNING</i></div>` : ''}
          ${d.user.followers != null ? `<div><span class="sb2-pill c">3</span><b>${n(d.user.followers)} travelling</b><i>BUSY</i></div>` : ''}
          ${d.user.created ? `<div><span class="sb2-pill d">4</span><b>Open since ${esc(d.user.created)}</b><i>ON TIME</i></div>` : ''}
        </div>
        <div class="sb2-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* =========================================================
     PRINT MEDIA
     ========================================================= */

  /* ---------- MAGAZINE COVER ---------- */
  add({
    id: 'covershoot', label: 'Cover Shoot', group: 'Print',
    blurb: 'Glossy magazine cover — masthead behind the subject, cover lines down the side and a barcode corner.',
    html: (d) => `
    <div class="lo lo-cover">
      <div class="cv-bleed">${clip(d)}</div>
      <div class="cv-grade"></div>

      <div class="cv-mast a-cvmast">${esc((d.copy.tag || 'STREAM').slice(0, 10)).toUpperCase()}</div>
      <div class="cv-issue a-cvfade">
        ${d.user.created ? esc(d.user.created).toUpperCase() : 'THIS MONTH'} · ISSUE ${(d.user.followers || 12) % 99 + 1}
      </div>

      <div class="cv-lines a-cvlines">
        <div class="cv-l big">${esc(d.user.name)}</div>
        <div class="cv-l sub">${esc(d.copy.kicker)}</div>
        ${d.user.game ? `<div class="cv-l"><b>“${esc(d.user.game)}”</b> and how it took over</div>` : ''}
        ${d.user.followers != null ? `<div class="cv-l"><b>${n(d.user.followers)}</b> reasons to follow</div>` : ''}
        ${d.clip ? `<div class="cv-l">Exclusive: <b>${esc(d.clip.title)}</b></div>` : ''}
      </div>

      <div class="cv-flash a-cvflash">
        <span>FREE</span><b>${esc(d.copy.cta)}</b>
      </div>

      <div class="cv-barcode a-cvfade">
        <div class="cv-bars">${rep(34, (i) => `<i style="width:${(i % 4) + 1}px"></i>`)}</div>
        <span>${esc(d.user.url)}</span>
      </div>
      <div class="cv-credit a-cvfade">${credit(d, 'micro')}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- CROSSWORD ---------- */
  add({
    id: 'crossword', label: 'Crossword', group: 'Print',
    blurb: 'Newspaper puzzle page — the channel name filled into 1 ACROSS, with clues drawn from the profile.',
    html: (d) => {
      const nm = (d.user.name || 'STREAM').replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 11) || 'STREAM';
      return `
    <div class="lo lo-cross">
      <div class="cw-paper">
        <div class="cw-head">
          <b>THE DAILY CRYPTIC</b>
          <span>No. ${(d.user.followers || 4021) % 9999}</span>
        </div>

        <div class="cw-body">
          <div class="cw-gridwrap a-cwin">
            <div class="cw-grid" style="grid-template-columns:repeat(${nm.length},1fr)">
              ${nm.split('').map((c, i) =>
                `<div class="cw-cell" style="animation-delay:${i * 0.07}s">
                   ${i === 0 ? '<span class="cw-num">1</span>' : ''}<b>${esc(c)}</b></div>`).join('')}
            </div>
            <div class="cw-cross">
              ${rep(4, (i) => `<div class="cw-cell dark"></div>`)}
            </div>
          </div>

          <div class="cw-clues a-cwclues">
            <div class="cw-ch">ACROSS</div>
            <ol>
              <li><b>1.</b> ${esc(d.copy.kicker)} <i>(${nm.length})</i></li>
              ${d.user.game ? `<li><b>4.</b> Where they were last seen — ${esc(d.user.game)}</li>` : ''}
              ${d.user.followers != null ? `<li><b>7.</b> ${n(d.user.followers)} of them, and counting</li>` : ''}
              ${d.user.created ? `<li><b>9.</b> Joined Twitch, ${esc(d.user.created)}</li>` : ''}
            </ol>
            <div class="cw-ch dn">DOWN</div>
            <ol>
              <li><b>2.</b> ${esc(d.user.url)}</li>
              ${d.clip ? `<li><b>3.</b> Clipped by ${esc(d.clip.creator)}</li>` : ''}
            </ol>
          </div>

          <div class="cw-photo a-cwphoto">
            <div class="cw-pframe">${clip(d)}</div>
            <div class="cw-pcap">${credit(d, 'micro')}</div>
          </div>
        </div>
        <div class="cw-foot">${esc(d.copy.cta)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`;
    },
  });

  /* ---------- POLAROID WALL ---------- */
  add({
    id: 'photowall', label: 'Photo Wall', group: 'Print',
    blurb: 'A cluster of pinned prints on a string of fairy lights, the main shot front and centre and slightly askew.',
    html: (d) => `
    <div class="lo lo-wall">
      <div class="pw2-wall"></div>
      <div class="pw2-string">
        <svg viewBox="0 0 1920 140" preserveAspectRatio="none">
          <path d="M-20 20 C300 118 620 118 960 62 C1300 6 1620 6 1940 74"/>
        </svg>
        ${rep(14, (i) => `<i class="pw2-bulb" style="left:${4 + i * 7}%;--dl:${(i % 5) * 0.4}s"></i>`)}
      </div>

      <div class="pw2-main a-pw2in">
        <div class="pw2-peg"></div>
        <div class="pw2-photo">${clip(d)}</div>
        <div class="pw2-cap">${esc(d.user.name)}</div>
      </div>

      <div class="pw2-small s1 a-pw2sm">
        <div class="pw2-peg"></div>
        <div class="pw2-inner">${av(d, 150)}</div>
        <span>${esc(d.user.login ? '@' + d.user.login : 'the channel')}</span>
      </div>
      ${d.user.followers != null ? `<div class="pw2-small s2 a-pw2sm d1"><div class="pw2-peg"></div>
        <div class="pw2-stat"><b data-count="${d.user.followers}">0</b></div>
        <span>followers</span></div>` : ''}
      ${d.user.created ? `<div class="pw2-small s3 a-pw2sm d2"><div class="pw2-peg"></div>
        <div class="pw2-stat"><b class="sm">${esc(d.user.created)}</b></div>
        <span>joined twitch</span></div>` : ''}

      <div class="pw2-note a-pw2note">
        <div class="pw2-tape"></div>
        ${d.user.bio ? `<p>${esc(d.user.bio)}</p>` : ''}
        <div class="pw2-credit">${credit(d, 'micro')}</div>
        <div class="pw2-url">${esc(d.user.url)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* =========================================================
     CRAFT / TOY
     ========================================================= */

  /* ---------- BLUEPRINT PATENT ---------- */
  add({
    id: 'patent', label: 'Patent Filing', group: 'Craft',
    blurb: 'A patent drawing sheet — numbered callouts, figure labels, spidery technical linework and an office stamp.',
    html: (d) => `
    <div class="lo lo-patent">
      <div class="pt2-sheet a-pt2in">
        <div class="pt2-border"></div>
        <div class="pt2-head">
          <div><b>UNITED STREAM PATENT OFFICE</b>
            <span>APPLICATION No. ${String((d.user.followers || 8214) % 99999).padStart(5, '0')}</span></div>
          <div class="pt2-date">${d.user.created ? 'FILED ' + esc(d.user.created).toUpperCase() : 'FILED'}</div>
        </div>

        <div class="pt2-body">
          <div class="pt2-figs">
            <div class="pt2-fig">
              <div class="pt2-figframe">${clip(d)}</div>
              <div class="pt2-figlabel">FIG. 1 — APPARATUS IN OPERATION</div>
              <div class="pt2-call c1"><i></i><span>1</span></div>
              <div class="pt2-call c2"><i></i><span>2</span></div>
              <div class="pt2-call c3"><i></i><span>3</span></div>
            </div>
          </div>

          <div class="pt2-claims">
            <div class="pt2-ch">ABSTRACT</div>
            <h1>${esc(d.user.name)}</h1>
            <div class="pt2-url">${esc(d.user.url)}</div>
            ${d.user.bio ? `<p class="pt2-abs">${esc(d.user.bio)}</p>` : ''}
            <div class="pt2-ch">CLAIMS</div>
            <ol class="pt2-list">
              ${d.user.followers != null ? `<li>A following of not fewer than <b>${n(d.user.followers)}</b> persons.</li>` : ''}
              ${d.user.game ? `<li>Means for broadcasting <b>${esc(d.user.game)}</b>.</li>` : ''}
              ${d.clip ? `<li>At least one clip, per <b>${esc(d.clip.creator)}</b>.</li>` : ''}
            </ol>
            <div class="pt2-credit">${credit(d, 'micro')}</div>
          </div>
        </div>
        <div class="pt2-stamp a-pt2stamp">GRANTED</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- BRICK BOX ---------- */
  add({
    id: 'brickbox', label: 'Toy Box', group: 'Craft',
    blurb: 'A boxed collectible on shelf card — blister window, age rating, piece count and a "NEW!" starburst.',
    html: (d) => `
    <div class="lo lo-brick">
      <div class="bk-shelf"></div>
      <div class="bk-box a-bkin">
        <div class="bk-top">
          <div class="bk-logo">${esc((d.copy.tag || 'STREAM').slice(0, 12)).toUpperCase()}</div>
          <div class="bk-age">6+</div>
        </div>

        <div class="bk-mid">
          <div class="bk-blister">
            <div class="bk-win">${clip(d)}</div>
            <div class="bk-gloss"></div>
          </div>
          <div class="bk-side">
            <div class="bk-fig">${av(d, 140)}</div>
            <div class="bk-figname">${esc(d.user.name)}</div>
            <div class="bk-specs">
              ${d.user.followers != null ? `<div><span>PIECES</span><b>${n(d.user.followers)}</b></div>` : ''}
              ${d.user.game ? `<div><span>SERIES</span><b>${esc(d.user.game)}</b></div>` : ''}
              ${d.user.created ? `<div><span>RELEASED</span><b>${esc(d.user.created)}</b></div>` : ''}
            </div>
          </div>
        </div>

        <div class="bk-bottom">
          <div class="bk-url">${esc(d.user.url)}</div>
          <div class="bk-credit">${credit(d, 'micro')}</div>
        </div>
        <div class="bk-new a-bknew">NEW!</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- CROSS STITCH ---------- */
  add({
    id: 'crossstitch', label: 'Cross Stitch', group: 'Craft',
    blurb: 'A stitched sampler in a wooden hoop — visible aida weave, floss-thread lettering and a little house motif.',
    html: (d) => `
    <div class="lo lo-stitch">
      <div class="cs2-table"></div>
      <div class="cs2-hoop a-cs2in">
        <div class="cs2-ring"></div>
        <div class="cs2-cloth">
          <div class="cs2-weave"></div>

          <div class="cs2-border t"></div><div class="cs2-border b"></div>

          <div class="cs2-name">${esc(d.user.name)}</div>
          <div class="cs2-sub">${esc(d.copy.kicker)}</div>

          <div class="cs2-window">${clip(d)}</div>

          <div class="cs2-motifs">
            ${rep(5, (i) => `<span style="animation-delay:${i * 0.1}s">${['✿', '❋', '✚', '❋', '✿'][i]}</span>`)}
          </div>

          <div class="cs2-rows">
            ${d.user.followers != null ? `<div>${n(d.user.followers)} friends</div>` : ''}
            ${d.user.created ? `<div>stitched ${esc(d.user.created)}</div>` : ''}
          </div>
          <div class="cs2-url">${esc(d.user.url)}</div>
        </div>
        <div class="cs2-screw"></div>
      </div>

      <div class="cs2-card a-cs2card">
        <div class="cs2-ch">PATTERN NOTES</div>
        ${d.user.bio ? `<p>${esc(d.user.bio)}</p>` : ''}
        <div class="cs2-rows2">
          ${d.user.game ? `<div><span>Design</span><b>${esc(d.user.game)}</b></div>` : ''}
          ${d.clip ? `<div><span>Photographed by</span><b>${esc(d.clip.creator)}</b></div>` : ''}
        </div>
        <div class="cs2-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- PINBALL ---------- */
  add({
    id: 'pinball', label: 'Pinball Table', group: 'Craft',
    blurb: 'Backglass and playfield — bumpers light up, a score reel rolls and the ball-in-play counter ticks.',
    html: (d) => `
    <div class="lo lo-pin">
      <div class="pb-cab"></div>

      <div class="pb-back a-pbin">
        <div class="pb-glass">
          <div class="pb-title">${esc(d.user.name)}</div>
          <div class="pb-art">${clip(d)}</div>
          <div class="pb-scorebox">
            <div class="pb-score"><span>SCORE</span><b data-count="${d.user.followers != null ? d.user.followers : 125000}">0</b></div>
            <div class="pb-ball"><span>BALL</span><b>3</b></div>
          </div>
        </div>
      </div>

      <div class="pb-field a-pbfield">
        <div class="pb-bumpers">
          ${rep(3, (i) => `<i style="animation-delay:${i * 0.35}s"></i>`)}
        </div>
        <div class="pb-lanes">${rep(5, (i) => `<b style="animation-delay:${i * 0.18}s">${'STREAM'[i]}</b>`)}</div>
        <div class="pb-flippers"><i class="l"></i><i class="r"></i></div>
      </div>

      <div class="pb-panel a-pbpanel">
        <div class="pb-kick">${esc(d.copy.kicker)}</div>
        <div class="pb-url">${esc(d.user.url)}</div>
        <div class="pb-rows">
          ${d.user.game ? `<div><span>TABLE</span><b>${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>INSTALLED</span><b>${esc(d.user.created)}</b></div>` : ''}
          ${d.clip ? `<div><span>REPLAYS</span><b>${n(d.clip.views)}</b></div>` : ''}
        </div>
        <div class="pb-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- WEATHER FORECAST ---------- */
  add({
    id: 'weather', label: 'Weather Forecast', group: 'Broadcast',
    blurb: 'TV weather segment — a presenter chroma wall, a five-day strip and an animated sun/cloud icon set.',
    html: (d) => `
    <div class="lo lo-wx">
      <div class="wx-studio"></div>
      <div class="wx-map">
        <svg viewBox="0 0 600 400" preserveAspectRatio="none">
          <path d="M80 330 C120 240 90 180 150 120 C210 60 300 90 350 60 C420 20 500 70 540 140
                   C580 210 520 300 440 330 C360 360 200 380 80 330 Z"/>
        </svg>
      </div>

      <div class="wx-screen a-wxin">
        <div class="wx-view">${clip(d)}</div>
        <div class="wx-lower">
          <span class="wx-live">LIVE</span>
          <b>${esc(d.user.name)}</b>
          <span class="wx-loc">${esc(d.user.url)}</span>
        </div>
      </div>

      <div class="wx-now a-wxnow">
        <div class="wx-icon"><i class="sun"></i><i class="cloud"></i></div>
        <div class="wx-temp">${d.user.followers != null ? Math.min(45, Math.round(Math.log10(d.user.followers + 10) * 8)) : 22}°</div>
        <div class="wx-desc">${esc(d.copy.kicker)}</div>
      </div>

      <div class="wx-strip a-wxup">
        ${['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day, i) => `
          <div class="wx-day" style="animation-delay:${i * 0.08}s">
            <span>${day}</span>
            <i class="wx-mini ${['s', 'c', 's', 'r', 's'][i]}"></i>
            <b>${20 + ((i * 3) % 9)}°</b>
          </div>`).join('')}
        <div class="wx-out">
          ${d.user.game ? `<div><span>OUTLOOK</span><b>${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>RECORDS FROM</span><b>${esc(d.user.created)}</b></div>` : ''}
        </div>
      </div>
      <div class="wx-credit a-wxup d1">${credit(d, 'line')}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- ELECTION NIGHT ---------- */
  add({
    id: 'election', label: 'Election Night', group: 'Broadcast',
    blurb: 'Results desk graphics — a swingometer needle, called-seat tiles and a rolling percentage bar.',
    html: (d) => `
    <div class="lo lo-elec">
      <div class="ec-desk"></div>
      <div class="ec-head a-ecdn">
        <span class="ec-badge">RESULTS</span>
        <span>DECISION DESK — ${esc(d.user.name).toUpperCase()} DECLARED</span>
        <span class="ec-time">${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}</span>
      </div>

      <div class="ec-screen a-ecin">
        <div class="ec-view">${clip(d)}</div>
        <div class="ec-scap">FROM THE COUNT — ${esc(d.clip ? d.clip.title : d.user.title)}</div>
      </div>

      <div class="ec-swing a-ecswing">
        <svg viewBox="0 0 300 170">
          <path class="ec-arc a" d="M20 155 A130 130 0 0 1 92 44"/>
          <path class="ec-arc b" d="M92 44 A130 130 0 0 1 208 44"/>
          <path class="ec-arc c" d="M208 44 A130 130 0 0 1 280 155"/>
          <line class="ec-needle" x1="150" y1="155" x2="150" y2="40"/>
          <circle cx="150" cy="155" r="12"/>
        </svg>
        <span>SWING TO FOLLOW</span>
      </div>

      <div class="ec-tiles a-ecup">
        ${d.user.followers != null ? `<div class="ec-tile win"><b data-count="${d.user.followers}">0</b><span>VOTES</span></div>` : ''}
        ${d.clip ? `<div class="ec-tile"><b data-count="${d.clip.views}">0</b><span>TURNOUT</span></div>` : ''}
        ${d.user.game ? `<div class="ec-tile"><b class="sm">${esc(d.user.game)}</b><span>CONSTITUENCY</span></div>` : ''}
        ${d.user.created ? `<div class="ec-tile"><b class="sm">${esc(d.user.created)}</b><span>FIRST ELECTED</span></div>` : ''}
      </div>

      <div class="ec-bar a-ecup d1">
        <div class="ec-fill" style="width:72%"><span>${esc(d.user.url)}</span></div>
        <div class="ec-pct">72%</div>
      </div>
      <div class="ec-credit a-ecup d1">${credit(d, 'line')}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

})(typeof window !== 'undefined' ? window : globalThis);
