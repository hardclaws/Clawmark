/* Clawmark — Twitch Shoutout Overlay for OBS
 * Created by Hardclaws · twitch.tv/hardclaws · thehardclaws@gmail.com
 * MIT licence. Free to use, modify and fork.
 */
/* =============================================================
   LAYOUTS — SET 2
   Hand-designed themed layouts in the spirit of Terminal / Magazine /
   Receipt from set 1. Each has a distinct visual world rather than
   being a parametric box-and-panel arrangement.

   Registers itself into Layouts.all so the builder picks it up
   automatically. Same contract: skin tokens only, sparse-data safe,
   and every layout shows clip title + clipped-by + date.
   ============================================================= */
(function (root) {
  'use strict';
  if (!root.Layouts) throw new Error('layouts.js must load first');

  const H = root.Layouts.helpers;
  const { esc, n, clip, credit, av, badge, liveTag } = H;
  const L = root.Layouts.all;
  const add = (o) => L.push(o);

  /* ---------- 21. COMIC STRIP ---------- */
  add({
    id: 'comic', label: 'Comic Strip', group: 'Themed',
    blurb: 'Halftone panels, bold ink borders, a speech bubble and a jagged POW! burst.',
    html: (d) => `
    <div class="lo lo-comic">
      <div class="cm-halftone"></div>
      <div class="cm-page">
        <div class="cm-panel cm-p1 a-pop">
          <div class="cm-clip">${clip(d)}</div>
          <div class="cm-caption">${esc(d.clip ? d.clip.title : d.user.title)}</div>
        </div>

        <div class="cm-panel cm-p2 a-pop d1">
          <div class="cm-avwrap">${av(d, 150)}</div>
          <div class="cm-bubble">
            <b>${esc(d.user.name)}</b>
            ${d.user.bio ? `<span>${esc(d.user.bio)}</span>` : ''}
          </div>
        </div>

        <div class="cm-panel cm-p3 a-pop d2">
          <div class="cm-stats">
            ${d.user.followers != null ? `<div><b>${n(d.user.followers)}</b><span>FOLLOWERS</span></div>` : ''}
            ${d.user.game ? `<div><b>${esc(d.user.game)}</b><span>LAST PLAYED</span></div>` : ''}
            ${d.user.created ? `<div><b>${esc(d.user.created)}</b><span>JOINED</span></div>` : ''}
          </div>
          <div class="cm-credit">${credit(d, 'micro')}</div>
        </div>
      </div>

      <div class="cm-burst a-burst">
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <polygon points="100,2 118,44 164,28 150,74 196,84 158,110 188,148 141,143 140,190 104,161 74,196 62,150 16,160 30,114 0,84 42,70 24,26 70,40" />
        </svg>
        <span>${esc(d.copy.cta)}</span>
      </div>
      <div class="cm-url a-up d3">${esc(d.user.url)}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 22. CARTOON / STICKER ---------- */
  add({
    id: 'cartoon', label: 'Cartoon Sticker', group: 'Themed',
    blurb: 'Thick outlines, drop-shadow stickers, wobbling tape and a bouncy entrance.',
    html: (d) => `
    <div class="lo lo-cartoon">
      <div class="ct-sky"></div>
      <div class="ct-rays"></div>
      <div class="ct-clipwrap a-bounce">
        <div class="ct-clip">${clip(d)}</div>
        <div class="ct-tape tl"></div><div class="ct-tape br"></div>
      </div>
      <div class="ct-blob a-bounce d1">
        <div class="ct-av">${av(d, 132)}</div>
        <div class="ct-name">
          <div class="kicker">${esc(d.copy.kicker)}</div>
          <h1>${esc(d.user.name)}</h1>
        </div>
      </div>
      <div class="ct-chips a-bounce d2">
        ${d.user.game ? `<span class="ct-chip">${esc(d.user.game)}</span>` : ''}
        ${d.user.followers != null ? `<span class="ct-chip alt">${n(d.user.followers)} followers</span>` : ''}
        ${d.user.created ? `<span class="ct-chip">Joined ${esc(d.user.created)}</span>` : ''}
      </div>
      <div class="ct-credit a-up d3">${credit(d, 'line')}</div>
      <div class="ct-cta a-bounce d4">${esc(d.copy.cta)}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 23. VHS / RETRO TAPE ---------- */
  add({
    id: 'vhs', label: 'VHS Tape', group: 'Themed',
    blurb: 'Tracking lines, chromatic fringing, timecode and a blinking REC dot.',
    html: (d) => `
    <div class="lo lo-vhs">
      ${clip(d, 'fill')}
      <div class="vh-scan"></div>
      <div class="vh-noise"></div>
      <div class="vh-tear"></div>
      <div class="vh-top a-fade">
        <span class="vh-rec"><i></i>REC</span>
        <span class="vh-sp">SP</span>
        <span class="vh-tc" id="vh-tc">00:00:${String(d.clip ? Math.min(59, d.clip.duration) : 12).padStart(2, '0')}</span>
      </div>
      <div class="vh-bl a-fade d1">
        <div class="vh-line">▶ PLAY</div>
        <div class="vh-line dim">CH 02 &nbsp; STEREO</div>
      </div>
      <div class="vh-main a-up d2">
        <div class="vh-name"><h1 data-txt="${esc(d.user.name)}">${esc(d.user.name)}</h1></div>
        <div class="vh-meta">${[d.user.game, d.user.followers != null ? n(d.user.followers) + ' FOLLOWERS' : '', d.user.url]
          .filter(Boolean).map(esc).join('  ·  ').toUpperCase()}</div>
        <div class="vh-credit">${credit(d, 'line')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 24. NEWSPAPER ---------- */
  add({
    id: 'newspaper', label: 'Newspaper', group: 'Themed',
    blurb: 'Broadsheet front page — masthead, rules, columns, halftone photo.',
    html: (d) => `
    <div class="lo lo-news">
      <div class="nw-paper a-unroll">
        <div class="nw-masthead">
          <span class="nw-date">${esc(d.clip ? d.clip.created : d.user.created)}</span>
          <span class="nw-title">${esc(d.copy.tag || 'THE DAILY SHOUTOUT')}</span>
          <span class="nw-price">No. ${d.index || '01'}</span>
        </div>
        <div class="nw-rule"></div>
        <div class="nw-headline a-up d1">${esc(d.user.name)}</div>
        <div class="nw-sub a-up d2">${esc(d.clip ? d.clip.title : (d.user.title || 'Live on Twitch'))}</div>
        <div class="nw-rule thin"></div>
        <div class="nw-body">
          <div class="nw-col a-up d3">
            <div class="nw-photo">${clip(d)}<span class="nw-cap">${esc(d.user.name)} in action</span></div>
          </div>
          <div class="nw-col a-up d4">
            <p class="nw-lead">${d.user.bio ? esc(d.user.bio) : 'Broadcasting live on Twitch to an audience of dedicated viewers.'}</p>
            <dl class="nw-facts">
              ${d.user.followers != null ? `<dt>Followers</dt><dd>${n(d.user.followers)}</dd>` : ''}
              ${d.user.game ? `<dt>Category</dt><dd>${esc(d.user.game)}</dd>` : ''}
              ${d.user.created ? `<dt>Joined Twitch</dt><dd>${esc(d.user.created)}</dd>` : ''}
            </dl>
          </div>
          <div class="nw-col narrow a-up d5">
            <div class="nw-box">
              <div class="nw-boxh">CLIP FILED BY</div>
              <div class="nw-boxb">${esc(d.clip ? d.clip.creator : '—')}</div>
              <div class="nw-boxs">${esc(d.clip ? d.clip.created : '')}</div>
            </div>
            <div class="nw-cta">${esc(d.copy.cta)}<br><b>${esc(d.user.url)}</b></div>
          </div>
        </div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 25. ARCADE CABINET ---------- */
  add({
    id: 'arcade', label: 'Arcade Cabinet', group: 'Themed',
    blurb: 'CRT bezel, pixel type, INSERT COIN blink and a high-score table.',
    html: (d) => `
    <div class="lo lo-arcade">
      <div class="ar-grid"></div>
      <div class="ar-sun"></div>
      <div class="ar-marquee a-slam">${esc(d.copy.kicker)}</div>
      <div class="ar-cab a-pop d1">
        <div class="ar-screen">
          ${clip(d)}
          <div class="ar-scan"></div>
          <div class="ar-glare"></div>
        </div>
      </div>
      <div class="ar-panel a-pop d2">
        <div class="ar-player">
          <div class="ar-avbox">${av(d, 118)}</div>
          <div>
            <div class="ar-p1">PLAYER SELECT</div>
            <h1>${esc(d.user.name)}</h1>
          </div>
        </div>
        <div class="ar-score">
          ${d.user.followers != null ? `<div><span>FOLLOWERS</span><b>${n(d.user.followers)}</b></div>` : ''}
          ${d.clip ? `<div><span>CLIP VIEWS</span><b>${n(d.clip.views)}</b></div>` : ''}
          ${d.user.created ? `<div><span>JOINED</span><b>${esc(d.user.created)}</b></div>` : ''}
          ${d.user.game ? `<div><span>STAGE</span><b>${esc(d.user.game)}</b></div>` : ''}
        </div>
        <div class="ar-credit">${credit(d, 'micro')}</div>
        <div class="ar-coin">INSERT COIN — ${esc(d.user.url)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 26. BLUEPRINT ---------- */
  add({
    id: 'blueprint', label: 'Blueprint', group: 'Themed',
    blurb: 'Technical drawing — grid paper, dimension lines, title block, mono type.',
    html: (d) => `
    <div class="lo lo-blue">
      <div class="bp-grid"></div>
      <div class="bp-frame a-fade"></div>
      <div class="bp-clip a-up">
        ${clip(d)}
        <div class="bp-dim top"><span>${d.clip ? d.clip.duration + 's' : 'PROFILE'}</span></div>
        <div class="bp-dim left"><span>16:9</span></div>
        <div class="bp-corner tl"></div><div class="bp-corner tr"></div>
        <div class="bp-corner bl"></div><div class="bp-corner br"></div>
      </div>
      <div class="bp-title a-up d2">
        <div class="bp-row"><span>SUBJECT</span><b>${esc(d.user.name)}</b></div>
        <div class="bp-row"><span>REF</span><b>@${esc(d.user.login)}</b></div>
        ${d.user.game ? `<div class="bp-row"><span>CATEGORY</span><b>${esc(d.user.game)}</b></div>` : ''}
        ${d.user.followers != null ? `<div class="bp-row"><span>AUDIENCE</span><b>${n(d.user.followers)}</b></div>` : ''}
        ${d.user.created ? `<div class="bp-row"><span>EST.</span><b>${esc(d.user.created)}</b></div>` : ''}
        <div class="bp-row"><span>SOURCE</span><b>${esc(d.clip ? d.clip.creator : '—')} · ${esc(d.clip ? d.clip.created : '')}</b></div>
        <div class="bp-row wide"><span>TITLE</span><b>${esc(d.clip ? d.clip.title : d.user.title)}</b></div>
      </div>
      <div class="bp-stamp a-pop d3">${esc(d.copy.cta)}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 27. SPORTS BROADCAST ---------- */
  add({
    id: 'sportscast', label: 'Sports Broadcast', group: 'Themed',
    blurb: 'Angled network bug, wipe-in lower third, rolling stat ribbon.',
    html: (d) => `
    <div class="lo lo-sport">
      ${clip(d, 'fill')}
      <div class="scrim-b"></div>
      <div class="sp-bug a-inl">
        <div class="sp-bug-a">${esc((d.copy.tag || 'LIVE').slice(0, 14))}</div>
        <div class="sp-bug-b">${liveTag(d) || 'CLIP'}</div>
      </div>
      <div class="sp-l3">
        <div class="sp-l3-main a-wipeR">
          <div class="sp-av">${av(d, 108)}</div>
          <div class="sp-txt">
            <div class="sp-kick">${esc(d.copy.kicker)}</div>
            <h1>${esc(d.user.name)}</h1>
          </div>
          <div class="sp-nums">
            ${d.user.followers != null ? `<div><b>${n(d.user.followers)}</b><span>FOLLOWERS</span></div>` : ''}
            ${d.clip ? `<div><b>${n(d.clip.views)}</b><span>VIEWS</span></div>` : ''}
          </div>
        </div>
        <div class="sp-ribbon a-wipeR d1">
          <span class="sp-tag">CLIP</span>
          <marquee-like>${esc(d.clip ? d.clip.title : d.user.title)} &nbsp;·&nbsp; clipped by ${esc(d.clip ? d.clip.creator : '—')} &nbsp;·&nbsp; ${esc(d.clip ? d.clip.created : '')} &nbsp;·&nbsp; ${esc(d.user.game || '')} &nbsp;·&nbsp; ${esc(d.user.url)}</marquee-like>
        </div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 28. POLAROID WALL / SCRAPBOOK ---------- */
  add({
    id: 'scrapbook', label: 'Scrapbook', group: 'Themed',
    blurb: 'Cork board with pinned photos, torn paper notes and handwritten labels.',
    html: (d) => `
    <div class="lo lo-scrap">
      <div class="sc-board"></div>
      <div class="sc-photo big a-tilt">
        <div class="sc-inner">${clip(d)}</div>
        <div class="sc-pin"></div>
        <div class="sc-hand">${esc(d.clip ? d.clip.title : d.user.title)}</div>
      </div>
      <div class="sc-note a-tilt2 d1">
        <div class="sc-avrow">${av(d, 104)}<div>
          <h1>${esc(d.user.name)}</h1>
          <div class="sc-url">${esc(d.user.url)}</div>
        </div></div>
        ${d.user.bio ? `<p>${esc(d.user.bio)}</p>` : ''}
        <ul class="sc-list">
          ${d.user.game ? `<li>playing <b>${esc(d.user.game)}</b></li>` : ''}
          ${d.user.followers != null ? `<li><b>${n(d.user.followers)}</b> followers</li>` : ''}
          ${d.user.created ? `<li>joined Twitch <b>${esc(d.user.created)}</b></li>` : ''}
        </ul>
        <div class="sc-tape"></div>
      </div>
      <div class="sc-tag a-pop d3">${esc(d.copy.cta)}</div>
      <div class="sc-credit a-up d4">${credit(d, 'micro')}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 29. BOARDING PASS ---------- */
  add({
    id: 'boardingpass', label: 'Boarding Pass', group: 'Themed',
    blurb: 'Perforated ticket with barcode, seat block and a tear-off stub.',
    html: (d) => `
    <div class="lo lo-pass">
      <div class="pa-bg">${clip(d, 'fill')}</div>
      <div class="pa-veil"></div>
      <div class="pa-ticket a-slidein">
        <div class="pa-main">
          <div class="pa-head">
            <span class="pa-brand">${esc(d.copy.tag || 'SHOUTOUT AIRWAYS')}</span>
            <span class="pa-cls">${esc(d.user.badge || 'STREAMER')}</span>
          </div>
          <div class="pa-route">
            <div class="pa-port"><b>YOU</b><span>viewer</span></div>
            <div class="pa-plane">
              <svg viewBox="0 0 120 24" aria-hidden="true">
                <line x1="0" y1="12" x2="120" y2="12" stroke-dasharray="5 6"/>
                <polygon points="66,4 92,12 66,20 72,12"/>
              </svg>
            </div>
            <div class="pa-port"><b>${esc(d.user.name.slice(0, 12))}</b><span>${esc(d.user.game || 'twitch')}</span></div>
          </div>
          <div class="pa-grid">
            <div><span>PASSENGER</span><b>${esc(d.user.name)}</b></div>
            <div><span>HANDLE</span><b>@${esc(d.user.login)}</b></div>
            ${d.user.followers != null ? `<div><span>FOLLOWERS</span><b>${n(d.user.followers)}</b></div>` : ''}
            ${d.user.created ? `<div><span>MEMBER SINCE</span><b>${esc(d.user.created)}</b></div>` : ''}
          </div>
          <div class="pa-clipbox">${clip(d)}</div>
          <div class="pa-credit">${credit(d, 'micro')}</div>
        </div>
        <div class="pa-perf"></div>
        <div class="pa-stub">
          <div class="pa-avwrap">${av(d, 96)}</div>
          <div class="pa-seat"><span>SEAT</span><b>${(d.user.years || 1)}A</b></div>
          <div class="pa-barcode"></div>
          <div class="pa-go">${esc(d.copy.cta)}</div>
        </div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 30. GLITCH / DATAMOSH ---------- */
  add({
    id: 'glitch', label: 'Glitch', group: 'Themed',
    blurb: 'RGB split, slice displacement, scan jitter and a corrupted-text reveal.',
    html: (d) => `
    <div class="lo lo-glitch">
      ${clip(d, 'fill')}
      <div class="gl-rgb r"></div>
      <div class="gl-rgb b"></div>
      <div class="gl-slice s1"></div>
      <div class="gl-slice s2"></div>
      <div class="gl-slice s3"></div>
      <div class="scrim-b"></div>
      <div class="gl-panel a-glitchin">
        <div class="gl-kick">${esc(d.copy.kicker)}</div>
        <h1 class="gl-name" data-txt="${esc(d.user.name)}">${esc(d.user.name)}</h1>
        <div class="gl-rows">
          ${d.user.game ? `<div><span>CATEGORY</span><b>${esc(d.user.game)}</b></div>` : ''}
          ${d.user.followers != null ? `<div><span>FOLLOWERS</span><b>${n(d.user.followers)}</b></div>` : ''}
          ${d.user.created ? `<div><span>JOINED</span><b>${esc(d.user.created)}</b></div>` : ''}
        </div>
        <div class="gl-credit">${credit(d, 'line')}</div>
        <div class="gl-url">${esc(d.user.url)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 31. TRADING CARD PACK (holo) ---------- */
  add({
    id: 'holocard', label: 'Holo Card', group: 'Themed',
    blurb: 'Foil-shimmer collectible card that tilts in 3D, rarity gems and a set number.',
    html: (d) => `
    <div class="lo lo-holo">
      <div class="ho-bg">${clip(d, 'fill')}</div>
      <div class="ho-veil"></div>
      <div class="ho-stage">
        <div class="ho-card a-tiltin">
          <div class="ho-foil"></div>
          <div class="ho-inner">
            <div class="ho-top">
              <span class="ho-name">${esc(d.user.name)}</span>
              <span class="ho-hp">${d.user.followers != null ? n(d.user.followers) : '—'}</span>
            </div>
            <div class="ho-art">${clip(d)}<div class="ho-shine"></div></div>
            <div class="ho-type">${esc(d.user.game || 'Streamer')} ${badge(d)}</div>
            <div class="ho-move">
              <div class="ho-mv">
                <b>${esc(d.clip ? d.clip.title : (d.user.title || 'Live Broadcast'))}</b>
                <span>${d.clip ? n(d.clip.views) + ' views' : ''}</span>
              </div>
              ${d.user.bio ? `<p class="ho-flav">${esc(d.user.bio)}</p>` : ''}
            </div>
            <div class="ho-foot">
              <span>${esc(d.clip ? 'clipped by ' + d.clip.creator + ' · ' + d.clip.created : d.user.url)}</span>
              <span class="ho-set">${d.index || '01'}/99</span>
            </div>
          </div>
        </div>
      </div>
      <div class="ho-cta a-up d3">${esc(d.copy.cta)} · ${esc(d.user.url)}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 32. WANTED POSTER ---------- */
  add({
    id: 'wanted', label: 'Wanted Poster', group: 'Themed',
    blurb: 'Weathered western bill nailed to a board, with a reward figure.',
    html: (d) => `
    <div class="lo lo-wanted">
      <div class="wa-wood"></div>
      <div class="wa-poster a-nail">
        <div class="wa-nail tl"></div><div class="wa-nail tr"></div>
        <div class="wa-w">WANTED</div>
        <div class="wa-sub">— ${esc(d.user.live ? 'LIVE RIGHT NOW' : 'LAST SEEN STREAMING')} —</div>
        <div class="wa-photo">${clip(d)}</div>
        <div class="wa-name">${esc(d.user.name)}</div>
        <div class="wa-for">for <i>${esc(d.clip ? d.clip.title : (d.user.title || 'outstanding streams'))}</i></div>
        <div class="wa-reward">
          <span>REWARD</span>
          <b>${d.user.followers != null ? n(d.user.followers) : '∞'}</b>
          <span>FOLLOWERS</span>
        </div>
        <div class="wa-foot">
          ${esc(d.clip ? 'reported by ' + d.clip.creator + ' · ' + d.clip.created : '')}
          <br><b>${esc(d.user.url)}</b>
        </div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 33. CHAT / MESSAGING ---------- */
  add({
    id: 'chatapp', label: 'Chat App', group: 'Themed',
    blurb: 'Messaging thread — typing indicator, bubbles landing one by one, read ticks.',
    html: (d) => {
      const msgs = [];
      msgs.push(`<div class="ch-msg in a-msg d1"><span>${esc(d.copy.kicker)}</span></div>`);
      if (d.user.game) msgs.push(`<div class="ch-msg in a-msg d2"><span>they were playing <b>${esc(d.user.game)}</b></span></div>`);
      if (d.user.followers != null) msgs.push(`<div class="ch-msg in a-msg d3"><span><b>${n(d.user.followers)}</b> people already follow them</span></div>`);
      if (d.clip) msgs.push(`<div class="ch-msg in a-msg d4"><span>check this clip 👇<br><b>${esc(d.clip.title)}</b><br><i>clipped by ${esc(d.clip.creator)} · ${esc(d.clip.created)}</i></span></div>`);
      msgs.push(`<div class="ch-msg out a-msg d5"><span>${esc(d.copy.cta)} ✅</span></div>`);
      return `
    <div class="lo lo-chat">
      <div class="ch-bg">${clip(d, 'fill')}</div>
      <div class="ch-veil"></div>
      <div class="ch-phone a-rise">
        <div class="ch-head">
          ${av(d, 76)}
          <div>
            <b>${esc(d.user.name)}</b>
            <span>${d.user.live ? 'online now' : 'last seen streaming'}</span>
          </div>
          <div class="ch-dots"><i></i><i></i><i></i></div>
        </div>
        <div class="ch-body">
          ${msgs.join('')}
          <div class="ch-typing a-msg d6"><i></i><i></i><i></i></div>
        </div>
        <div class="ch-bar"><span>${esc(d.user.url)}</span></div>
      </div>
      <div class="ch-clipcard a-inr d2">${clip(d)}</div>
      <div class="progress"><i></i></div>
    </div>`;
    },
  });

  /* ---------- 34. VINYL / NOW PLAYING ---------- */
  add({
    id: 'vinyl', label: 'Now Spinning', group: 'Themed',
    blurb: 'Record deck — spinning label, tonearm, VU meters and a track listing.',
    html: (d) => `
    <div class="lo lo-vinyl">
      <div class="vy-felt"></div>
      <div class="vy-disc a-spinup">
        <div class="vy-grooves"></div>
        <div class="vy-label">${av(d, 210)}</div>
        <div class="vy-shine"></div>
      </div>
      <div class="vy-arm a-arm"></div>
      <div class="vy-info a-up d1">
        <div class="kicker">NOW SPINNING</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="vy-track">${esc(d.clip ? d.clip.title : (d.user.title || 'Live set'))}</div>
        <div class="vy-meta">${esc(d.clip ? 'cut by ' + d.clip.creator + ' · ' + d.clip.created : esc(d.user.url))}</div>
        <div class="vy-vu">
          <div class="vy-bar"><i style="--h:.8"></i><i style="--h:.55"></i><i style="--h:.9"></i>
            <i style="--h:.42"></i><i style="--h:.7"></i><i style="--h:.95"></i><i style="--h:.6"></i></div>
        </div>
        <div class="vy-side">
          ${d.user.game ? `<span>${esc(d.user.game)}</span>` : ''}
          ${d.user.followers != null ? `<span>${n(d.user.followers)} followers</span>` : ''}
          ${d.user.created ? `<span>Joined ${esc(d.user.created)}</span>` : ''}
        </div>
      </div>
      <div class="vy-clip a-inr d2">${clip(d)}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 35. STORYBOOK ---------- */
  add({
    id: 'storybook', label: 'Storybook', group: 'Themed',
    blurb: 'Open picture book — two pages, drop cap, gilt edges and a page-turn entrance.',
    html: (d) => `
    <div class="lo lo-story">
      <div class="st-book a-open">
        <div class="st-spine"></div>
        <div class="st-page left">
          <div class="st-frame">${clip(d)}</div>
          <div class="st-cap">${esc(d.clip ? d.clip.title : d.user.title)}</div>
        </div>
        <div class="st-page right">
          <div class="st-chapter">${esc(d.copy.kicker)}</div>
          <h1 class="st-name">${esc(d.user.name)}</h1>
          <p class="st-para">
            <span class="st-drop">${esc((d.user.name || 'A')[0])}</span>${
              d.user.bio ? esc(d.user.bio) : 'nce upon a stream, a rider appeared on the horizon and the peloton was never quite the same again.'}
          </p>
          <ul class="st-facts">
            ${d.user.game ? `<li>Last seen in <b>${esc(d.user.game)}</b></li>` : ''}
            ${d.user.followers != null ? `<li>Followed by <b>${n(d.user.followers)}</b></li>` : ''}
            ${d.user.created ? `<li>Joined Twitch <b>${esc(d.user.created)}</b></li>` : ''}
          </ul>
          <div class="st-credit">${credit(d, 'micro')}</div>
          <div class="st-page-no">${esc(d.user.url)}</div>
        </div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 36. BOSS HEALTH BAR ---------- */
  add({
    id: 'bossbar', label: 'Boss Bar', group: 'Themed',
    blurb: 'Game boss-encounter UI — name plate, segmented health bar, stagger meter.',
    html: (d) => `
    <div class="lo lo-boss">
      ${clip(d, 'fill')}
      <div class="scrim-b"></div>
      <div class="bo-top a-dn">
        <div class="bo-title">${esc(d.copy.kicker)}</div>
        <div class="bo-name"><h1>${esc(d.user.name)}</h1>${badge(d)}</div>
        <div class="bo-hp"><i style="--w:88%"></i><span class="bo-seg"></span><span class="bo-seg s2"></span></div>
        <div class="bo-sub">
          ${d.user.followers != null ? `<span>${n(d.user.followers)} FOLLOWERS</span>` : ''}
          ${d.user.game ? `<span>${esc(d.user.game)}</span>` : ''}
          ${d.user.created ? `<span>JOINED ${esc(d.user.created).toUpperCase()}</span>` : ''}
        </div>
      </div>
      <div class="bo-bl a-up d2">
        <div class="bo-av">${av(d, 116)}</div>
        <div class="bo-credit">${credit(d, 'line')}</div>
      </div>
      <div class="bo-url a-up d3">${esc(d.user.url)}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 37. NEON TUBE SIGN ---------- */
  add({
    id: 'neontube', label: 'Neon Tube', group: 'Themed',
    blurb: 'Bent glass tubing on a brick wall, buzzing flicker and a reflected glow pool.',
    html: (d) => `
    <div class="lo lo-tube">
      <div class="nt-wall"></div>
      <div class="nt-glow"></div>
      <div class="nt-clip a-pop">${clip(d)}</div>
      <div class="nt-sign a-flicker2">
        <div class="nt-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
      </div>
      <div class="nt-rail a-up d2">
        ${d.user.game ? `<span>${esc(d.user.game)}</span>` : ''}
        ${d.user.followers != null ? `<span>${n(d.user.followers)} followers</span>` : ''}
        ${d.user.created ? `<span>Joined ${esc(d.user.created)}</span>` : ''}
      </div>
      <div class="nt-credit a-up d3">${credit(d, 'line')}</div>
      <div class="nt-url a-fade d4">${esc(d.user.url)}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 38. RACE RESULTS BOARD ---------- */
  add({
    id: 'raceboard', label: 'Race Board', group: 'Themed',
    blurb: 'Live timing screen — position rows, split times, the shouted rider highlighted.',
    html: (d) => `
    <div class="lo lo-race">
      <div class="rc-bgclip">${clip(d, 'fill')}</div>
      <div class="rc-veil"></div>
      <div class="rc-board a-inl">
        <div class="rc-head">
          <span>POS</span><span>RIDER</span><span>CATEGORY</span><span class="ra">GAP</span>
        </div>
        <div class="rc-row lead a-up d1">
          <span class="rc-pos">1</span>
          <span class="rc-rider">${av(d, 62)}<b>${esc(d.user.name)}</b>${badge(d)}</span>
          <span>${esc(d.user.game || '—')}</span>
          <span class="ra">${d.user.followers != null ? n(d.user.followers) : '—'}</span>
        </div>
        <div class="rc-row a-up d2"><span class="rc-pos">2</span>
          <span class="rc-rider"><i></i>The Peloton</span><span>Chasing</span><span class="ra">+0:14</span></div>
        <div class="rc-row a-up d3"><span class="rc-pos">3</span>
          <span class="rc-rider"><i></i>Everyone Else</span><span>Dropped</span><span class="ra">+1:52</span></div>
        <div class="rc-foot a-up d4">
          <div class="rc-credit">${credit(d, 'micro')}</div>
          <div class="rc-url">${esc(d.user.url)}</div>
        </div>
      </div>
      <div class="rc-flag a-fade"></div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 39. STAMP / PASSPORT ---------- */
  add({
    id: 'passport', label: 'Passport Stamp', group: 'Themed',
    blurb: 'Travel page with inked stamps, a photo window and a thumping approval mark.',
    html: (d) => `
    <div class="lo lo-port">
      <div class="pt-page">
        <div class="pt-head">
          <span>PASSPORT · TWITCH</span>
          <span>${esc(d.user.created || '')}</span>
        </div>
        <div class="pt-body">
          <div class="pt-photo a-up">${clip(d)}</div>
          <div class="pt-fields a-up d1">
            <div><span>NAME</span><b>${esc(d.user.name)}</b></div>
            <div><span>HANDLE</span><b>@${esc(d.user.login)}</b></div>
            ${d.user.game ? `<div><span>ORIGIN</span><b>${esc(d.user.game)}</b></div>` : ''}
            ${d.user.followers != null ? `<div><span>PARTY SIZE</span><b>${n(d.user.followers)}</b></div>` : ''}
            <div><span>ENTRY</span><b>${esc(d.clip ? d.clip.created : '—')}</b></div>
          </div>
        </div>
        <div class="pt-credit a-up d2">${credit(d, 'micro')}</div>
        <div class="pt-mrz">P&lt;TWITCH&lt;&lt;${esc(d.user.login.toUpperCase())}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
      </div>
      <div class="pt-stamp a-stamp">
        <span>${esc(d.copy.cta)}</span>
        <i>${esc(d.user.url)}</i>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 40. SPOTLIGHT STAGE ---------- */
  add({
    id: 'stage', label: 'Stage Spotlight', group: 'Themed',
    blurb: 'Theatre curtains part, a spotlight cone lands on the clip, dust motes drift.',
    html: (d) => `
    <div class="lo lo-stage">
      <div class="sg-dark"></div>
      <div class="sg-cone a-cone"></div>
      <div class="sg-motes"></div>
      <div class="sg-curtain l a-curtL"></div>
      <div class="sg-curtain r a-curtR"></div>
      <div class="sg-clip a-pop d1">${clip(d)}</div>
      <div class="sg-plaque a-up d2">
        <div class="kicker">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="sg-meta">
          ${[d.user.game, d.user.followers != null ? n(d.user.followers) + ' followers' : '', d.user.url]
            .filter(Boolean).map(esc).join('  ·  ')}
        </div>
        <div class="sg-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* rebuild the id index now that we've appended */
  root.Layouts.ids = L.map((x) => x.id);
})(typeof window !== 'undefined' ? window : globalThis);
