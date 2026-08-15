/* Clawmark — Twitch Shoutout Overlay for OBS
 * Created by Hardclaws · twitch.tv/hardclaws · thehardclaws@gmail.com
 * MIT licence. Free to use, modify and fork.
 */
/* =============================================================
   LAYOUTS — 20 structural arrangements.
   Every layout is skin-agnostic: it only ever references CSS
   custom properties defined by skins.js. That's what makes
   20 layouts x N skins work.

   Each layout: { id, label, group, needsClip, blurb, html(d) }
   `d` is the normalised shoutout data object (see app.js).
   ============================================================= */
(function (root) {
  'use strict';

  /* ---------- tiny html helpers ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const n = (v) => (v == null ? '' : Number(v).toLocaleString());

  /* clip element, demo animation, or profile-image fallback */
  const DEMO = `<div class="democlip"><i class="sky"></i><i class="hills"></i><i class="road"><i class="dash"></i></i><i class="rider"></i><i class="grain"></i><i class="hud">242 w · 88 rpm · 34.1 km/h</i></div>`;
  const clip = (d, cls) => {
    if (d.demoClip) return `<div class="clipwrap ${cls || ''}">${DEMO}</div>`;
    if (d.clip && d.clip.src)
      return `<video class="clipvid ${cls || ''}" src="${esc(d.clip.src)}" autoplay ${d.muted ? 'muted' : ''} playsinline></video>`;
    return `<div class="clipfallback ${cls || ''}" style="background-image:url('${esc(d.user.avatar)}')"></div>`;
  };

  const motif = () => `<span class="motif" data-m></span>`;
  const badge = (d) => (d.user.badge ? `<span class="badge">${esc(d.user.badge)}</span>` : '');
  const liveTag = (d) => (d.user.live ? `<span class="livetag">LIVE</span>` : '');

  /* Join date, phrased so it is never ambiguous.
     "6" or "6 yrs" on its own reads as nothing in particular; "Joined Mar 2019"
     is self-explanatory at any size. */
  const joined = (d) => (d.user.created ? 'Joined ' + d.user.created : '');
  const joinedShort = (d) => (d.user.created ? d.user.created : '');

  /* stat cell */
  const stat = (label, value, accent) =>
    `<div class="stat"><div class="stat-v${accent ? ' acc' : ''}">${value}</div><div class="stat-l">${label}</div></div>`;

  /* avatar ring */
  const av = (d, size) =>
    `<div class="av" style="--s:${size}px"><img src="${esc(d.user.avatar)}" alt=""></div>`;

  const clipMeta = (d) =>
    d.clip
      ? `${n(d.clip.views)} views · ${d.clip.duration}s · clipped by ${esc(d.clip.creator)} · ${esc(d.clip.created)}`
      : '';

  /* Clip credit block — title + who clipped it + when.
     Every layout must surface these three. `variant` picks the shape:
       'line'  single inline row
       'stack' title on its own line, credit beneath
       'micro' compact one-liner for tight corners  */
  const credit = (d, variant) => {
    if (!d.clip) return '';
    const t = esc(d.clip.title);
    const by = esc(d.clip.creator);
    const on = esc(d.clip.created);
    const views = n(d.clip.views);
    if (variant === 'micro')
      return `<div class="credit micro"><b>${t}</b><span>clipped by ${by} · ${on}</span></div>`;
    if (variant === 'line')
      return `<div class="credit line"><b>${t}</b><span>clipped by ${by} · ${on} · ${views} views</span></div>`;
    return `<div class="credit stack"><b>${t}</b>
      <span>clipped by <i>${by}</i> · ${on} · ${views} views · ${d.clip.duration}s</span></div>`;
  };

  /* ============================================================= */
  const L = [];
  const add = (o) => L.push(o);

  /* ---------- 1. BANNER ---------- */
  add({
    id: 'banner', label: 'Stat Band', group: 'Lower third', needsClip: false,
    blurb: 'Full-bleed clip with a single information band across the bottom. Cleanest, most readable.',
    html: (d) => `
    <div class="lo lo-banner">
      ${clip(d, 'fill')}
      <div class="scrim-b"></div>
      <div class="topstrip a-dn">
        ${liveTag(d)}
        <span class="ct">${esc(d.clip ? d.clip.title : d.user.title)}</span>
        <span class="cm">${clipMeta(d)}</span>
        <span class="spacer"></span>${motif()}
      </div>
      <div class="band a-up">
        <div class="a-pop">${av(d, 190)}</div>
        <div class="bandmain">
          <div class="row a-up d1"><h1>${esc(d.user.name)}</h1><span class="url">${esc(d.user.url)}</span>${badge(d)}</div>
          <p class="bio a-up d2">${esc(d.user.bio)}</p>
        </div>
        <div class="stats a-up d3">
          ${d.user.followers ? stat('Followers', n(d.user.followers), 1) : ''}
          ${d.user.game ? stat('Last played', esc(d.user.game)) : ''}
          ${d.user.created ? stat('Joined Twitch', esc(d.user.created)) : ''}
        </div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 2. DECK ---------- */
  add({
    id: 'deck', label: 'Data Deck', group: 'Split', needsClip: false,
    blurb: 'Clip left, full labelled profile readout right. Maximum information.',
    html: (d) => `
    <div class="lo lo-deck">
      <div class="deckhead a-fade">${motif()}<span class="kicker">${esc(d.copy.kicker)}</span></div>
      <div class="rule a-wide"></div>
      <div class="deckclip a-inl">${clip(d)}<div class="clipbar">
        <div class="ct">${esc(d.clip ? d.clip.title : d.user.title)}</div>
        <div class="cm">${clipMeta(d)}</div></div>
        <div class="tags">${liveTag(d)}${d.user.lang ? `<span class="tag">${esc(d.user.lang.toUpperCase())}</span>` : ''}</div>
      </div>
      <div class="deckside">
        <div class="idrow a-up">${av(d, 140)}<div><div class="nm"><h1>${esc(d.user.name)}</h1>${badge(d)}</div>
          <div class="handle">@${esc(d.user.login)} · ${esc(d.user.url)}</div></div></div>
        ${d.user.bio ? `<p class="bio quote a-up d1">${esc(d.user.bio)}</p>` : ''}
        <div class="rows">
          ${d.user.game ? `<div class="r a-up d2"><span class="rl">Last category</span><span class="rv">${esc(d.user.game)}</span></div>` : ''}
          ${d.user.followers ? `<div class="r a-up d3"><span class="rl">Followers</span><span class="rv acc">${n(d.user.followers)}</span></div>` : ''}
          ${d.user.created ? `<div class="r a-up d4"><span class="rl">Joined Twitch</span><span class="rv">${esc(d.user.created)}</span></div>` : ''}
          ${d.user.title ? `<div class="r col a-up d5"><span class="rl">Last title</span><span class="rv sm">${esc(d.user.title)}</span></div>` : ''}
        </div>
        <div class="cta a-up d6">${esc(d.copy.cta)}</div>
      </div>
    </div>`,
  });

  /* ---------- 3. DOSSIER ---------- */
  add({
    id: 'dossier', label: 'Rider Dossier', group: 'Card', needsClip: false,
    blurb: 'Profile card over a blurred clip backdrop, clip playing sharp as an inset. Degrades gracefully.',
    html: (d) => `
    <div class="lo lo-dossier">
      <div class="bgblur">${clip(d, 'fill')}</div>
      <div class="card a-card">
        <div class="chead"><div class="chead-g"></div><span class="sonum">${motif()} ${esc(d.copy.kicker)}</span>
          <div class="chead-t a-up"><div class="nm"><h1>${esc(d.user.name)}</h1>${badge(d)}</div>
          <div class="handle">${esc(d.user.url)}${d.user.created ? ' · joined ' + esc(d.user.created) : ''}</div></div>
        </div>
        <div class="cav a-pop">${av(d, 200)}</div>
        <div class="cbody">
          <div class="cleft">
            ${d.user.bio ? `<p class="bio a-up d1">${esc(d.user.bio)}</p>` : ''}
            <div class="grid a-up d2">
              ${d.user.followers ? `<div class="gcell">${stat('Followers', n(d.user.followers), 1)}</div>` : ''}
              ${d.user.created ? `<div class="gcell">${stat('Joined Twitch', esc(d.user.created))}</div>` : ''}
              ${d.user.game ? `<div class="gcell wide"><div class="boxart"></div><div>${stat('Last streamed', esc(d.user.game))}</div></div>` : ''}
            </div>
            <div class="cta a-up d4">${esc(d.copy.cta)}</div>
          </div>
          <div class="cright">
            <div class="inset a-up d2">${clip(d)}<span class="tag">${d.clip ? 'CLIP · ' + d.clip.duration + 's' : 'PROFILE'}</span></div>
            <div class="a-up d3">
              <div class="ct">${esc(d.clip ? d.clip.title : d.user.title)}</div>
              <div class="cm">${clipMeta(d)}</div>
              ${d.user.title ? `<div class="lasttitle">Last title: <span>${esc(d.user.title)}</span></div>` : ''}
            </div>
          </div>
        </div>
        <div class="cfoot"></div>
      </div>
    </div>`,
  });

  /* ---------- 4. TICKER ---------- */
  add({
    id: 'ticker', label: 'Ticker', group: 'Lower third', needsClip: false,
    blurb: 'Small footprint, cycles through every data field in turn. Scales to any amount of data.',
    html: (d) => {
      const slides = [];
      if (d.user.game || d.user.title) slides.push(`<div class="sl"><div class="boxart"></div><div><div class="rl">Last streamed</div><div class="rv">${esc(d.user.game)}${d.user.title ? ' · ' + esc(d.user.title) : ''}</div></div></div>`);
      const s2 = [];
      if (d.user.followers) s2.push(`<div><div class="rl">Followers</div><div class="rv acc">${n(d.user.followers)}</div></div>`);
      if (d.user.created) s2.push(`<div><div class="rl">Joined Twitch</div><div class="rv">${esc(d.user.created)}</div></div>`);
      if (d.user.live) s2.push(`<div><div class="rl">Status</div><div class="rv live">● LIVE NOW</div></div>`);
      if (s2.length) slides.push(`<div class="sl gap">${s2.join('')}</div>`);
      if (d.clip) slides.push(`<div class="sl"><div><div class="rl">Playing clip</div><div class="rv">${esc(d.clip.title)}</div></div></div>`);
      if (d.clip) slides.push(`<div class="sl"><div><div class="rl">Clipped by</div><div class="rv">${esc(d.clip.creator)} · ${esc(d.clip.created)} · ${n(d.clip.views)} views</div></div></div>`);
      slides.push(`<div class="sl"><div class="rv big">${esc(d.user.url)} <span class="acc">— ${esc(d.copy.cta)}</span></div></div>`);
      return `
    <div class="lo lo-ticker">
      ${clip(d, 'fill')}
      <div class="scrim-b"></div>
      <div class="tick a-inl" style="--slides:${slides.length}">
        <div class="tav">${av(d, 104)}</div>
        <div class="tnm"><div class="kicker">${esc(d.copy.kicker)}</div><h1>${esc(d.user.name)}</h1></div>
        <div class="trot"><div class="tslide">${slides.join('')}</div></div>
        <div class="tcap">${motif()}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`;
    },
  });

  /* ---------- 5. CINEMATIC ---------- */
  add({
    id: 'cinematic', label: 'Cinematic', group: 'Full frame', needsClip: false,
    blurb: 'Letterbox bars, hairline rule, understated type. Least intrusive over your own layout.',
    html: (d) => `
    <div class="lo lo-cine">
      ${clip(d, 'fill')}
      <div class="scrim-b"></div>
      <div class="bar top a-bt"></div><div class="bar bot a-bb"></div>
      <div class="mark a-fade d3">${av(d, 96)}<div><div class="kicker">${esc(d.copy.kicker)}</div>
        <div class="sub">${clipMeta(d) || esc(d.user.title)}</div></div></div>
      <div class="line a-wide d1"></div>
      <div class="cname"><h1 class="a-rise d2">${esc(d.user.name)}</h1></div>
      <div class="cmeta a-rise d3">${[d.user.game, d.user.followers ? n(d.user.followers) + ' followers' : '', d.user.url].filter(Boolean).map(esc).join(' &nbsp;·&nbsp; ')}</div>
      ${d.clip ? `<div class="ccredit a-fade d4"><b>${esc(d.clip.title)}</b> · clipped by ${esc(d.clip.creator)} · ${esc(d.clip.created)}</div>` : ''}
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 6. KINETIC ---------- */
  add({
    id: 'kinetic', label: 'Kinetic Slam', group: 'Split', needsClip: false,
    blurb: 'Oversized type slams in from the left, clip floats in a window on the right. Broadcast package feel.',
    html: (d) => `
    <div class="lo lo-kinetic">
      <div class="kpanel"></div><div class="kbar a-bar"></div>
      <div class="kwin a-inr">${clip(d)}</div>
      <div class="ktext">
        <div class="kicker a-slam">${esc(d.copy.kicker)}</div>
        <h1 class="a-slam d1">${esc(d.user.name)}</h1>
        ${d.user.game ? `<div class="ksub a-slam d2">Last seen playing<br><b>${esc(d.user.game)}</b></div>` : ''}
        <div class="krail a-up d3">
          ${d.user.followers ? stat('Followers', n(d.user.followers), 1) : ''}
          ${d.clip ? stat('Clip views', n(d.clip.views)) : ''}
          ${d.user.created ? stat('Joined Twitch', esc(d.user.created)) : ''}
        </div>
        <div class="kurl a-up d4">${esc(d.user.url)}</div>
        ${credit(d,'stack') ? `<div class="a-up d5">${credit(d,'stack')}</div>` : ''}
      </div>
      <div class="kav a-pop d4">${av(d, 190)}</div>
      <div class="kwipe a-wipe"></div>
    </div>`,
  });

  /* ---------- 7. GLASS ---------- */
  add({
    id: 'glass', label: 'Hex Glass', group: 'Lower third', needsClip: false,
    blurb: 'Frosted angled slab slides in over the clip, hex avatar, pill chips.',
    html: (d) => `
    <div class="lo lo-glass">
      ${clip(d, 'fill')}
      <div class="vig"></div>
      <div class="slab a-inl"></div><div class="seam a-inl"></div>
      <div class="hexav a-pop d1">${av(d, 226)}</div>
      <div class="gtext">
        <div class="kicker a-up d1">${esc(d.copy.kicker)}</div>
        <h1 class="a-up d2">${esc(d.user.name)}</h1>
        <div class="chips a-up d3">
          ${d.user.game ? `<span class="chip">${esc(d.user.game)}</span>` : ''}
          ${d.user.followers ? `<span class="chip acc">${n(d.user.followers)} followers</span>` : ''}
          <span class="chip ghost">${esc(d.user.url)}</span>
        </div>
      </div>
      <div class="gcredit a-up d4">${credit(d,'line')}</div>
      <div class="corner a-inr">${motif()}<span>${esc(d.copy.tag)}</span></div>
    </div>`,
  });

  /* ---------- 8. POLAROID ---------- */
  add({
    id: 'polaroid', label: 'Polaroid', group: 'Card', needsClip: false,
    blurb: 'Clip in a tilted photo frame with a handwritten-feel caption. Warm and personal.',
    html: (d) => `
    <div class="lo lo-polaroid">
      <div class="pbg"></div>
      <div class="pframe a-tilt">
        <div class="pphoto">${clip(d)}</div>
        <div class="pcap">
          <div class="pnm"><h1>${esc(d.user.name)}</h1>${badge(d)}</div>
          <div class="pmeta">${[d.user.game, d.user.followers ? n(d.user.followers) + ' followers' : ''].filter(Boolean).map(esc).join(' · ')}</div>
          ${credit(d,'micro')}
        </div>
        <div class="ptape"></div>
      </div>
      <div class="pside">
        <div class="a-up">${av(d, 150)}</div>
        <div class="kicker a-up d1">${esc(d.copy.kicker)}</div>
        ${d.user.bio ? `<p class="bio a-up d2">${esc(d.user.bio)}</p>` : ''}
        <div class="cta a-up d3">${esc(d.copy.cta)}</div>
        <div class="purl a-up d4">${esc(d.user.url)}</div>
      </div>
    </div>`,
  });

  /* ---------- 9. TERMINAL ---------- */
  add({
    id: 'terminal', label: 'Terminal', group: 'Full frame', needsClip: false,
    blurb: 'Data prints out like a shell session, clip in an ASCII-framed pane.',
    html: (d) => `
    <div class="lo lo-terminal">
      <div class="twin">
        <div class="tbarw"><span class="dot"></span><span class="dot"></span><span class="dot"></span>
          <span class="tpath">~/shoutout/${esc(d.user.login)}</span></div>
        <div class="tbody">
          <div class="tl a-type">$ twitch lookup --user ${esc(d.user.login)}</div>
          <div class="tl a-type d1"><span class="k">display_name</span> <span class="v">${esc(d.user.name)}</span></div>
          ${d.user.followers ? `<div class="tl a-type d2"><span class="k">followers</span>    <span class="v acc">${n(d.user.followers)}</span></div>` : ''}
          ${d.user.game ? `<div class="tl a-type d3"><span class="k">last_game</span>    <span class="v">${esc(d.user.game)}</span></div>` : ''}
          ${d.user.created ? `<div class="tl a-type d4"><span class="k">created_at</span>   <span class="v">${esc(d.user.created)}</span></div>` : ''}
          ${d.user.live ? `<div class="tl a-type d5"><span class="k">status</span>       <span class="v live">● LIVE</span></div>` : ''}
          <div class="tl a-type d6">$ play_clip --title "${esc(d.clip ? d.clip.title : 'profile')}"</div>
          ${d.clip ? `<div class="tl a-type d6"><span class="k">clipped_by</span>   <span class="v">${esc(d.clip.creator)}</span></div>` : ''}
          ${d.clip ? `<div class="tl a-type d6"><span class="k">clip_date</span>    <span class="v">${esc(d.clip.created)}</span></div>` : ''}
          <div class="tpane a-up d6">${clip(d)}</div>
          <div class="tl a-type d7">${esc(d.copy.cta)} → <span class="acc">${esc(d.user.url)}</span><span class="caret"></span></div>
        </div>
      </div>
      <div class="tav a-pop d2">${av(d, 160)}</div>
    </div>`,
  });

  /* ---------- 10. SPOTLIGHT ---------- */
  add({
    id: 'spotlight', label: 'Spotlight', group: 'Full frame', needsClip: false,
    blurb: 'Circular clip mask with radiating rings and orbiting stats. Big centred moment.',
    html: (d) => `
    <div class="lo lo-spotlight">
      <div class="rings a-ring"><i></i><i></i><i></i></div>
      <div class="orb a-pop">${clip(d, 'circle')}</div>
      <h1 class="a-rise d2">${esc(d.user.name)}</h1>
      <div class="kicker a-fade d1">${esc(d.copy.kicker)}</div>
      <div class="orbit">
        ${d.user.followers ? `<span class="op o1 a-pop d3">${n(d.user.followers)} followers</span>` : ''}
        ${d.user.game ? `<span class="op o2 a-pop d4">${esc(d.user.game)}</span>` : ''}
        ${d.user.created ? `<span class="op o3 a-pop d5">Joined ${esc(d.user.created)}</span>` : ''}
        ${d.clip ? `<span class="op o4 a-pop d6">${n(d.clip.views)} clip views</span>` : ''}
      </div>
      <div class="scredit a-up d5">${credit(d,'line')}</div>
      <div class="surl a-up d5">${esc(d.user.url)}</div>
    </div>`,
  });

  /* ---------- 11. SIDEBAR ---------- */
  add({
    id: 'sidebar', label: 'Sidebar', group: 'Split', needsClip: false,
    blurb: 'Vertical rail down one edge — designed to sit beside your gameplay, not over it.',
    html: (d) => `
    <div class="lo lo-sidebar">
      <div class="rail a-inl">
        <div class="rtop">${motif()}<span class="kicker">${esc(d.copy.kicker)}</span></div>
        <div class="a-pop d1">${av(d, 220)}</div>
        <h1 class="a-up d2">${esc(d.user.name)}</h1>
        <div class="handle a-up d2">@${esc(d.user.login)}</div>
        ${d.user.bio ? `<p class="bio a-up d3">${esc(d.user.bio)}</p>` : ''}
        <div class="rstats a-up d4">
          ${d.user.followers ? stat('Followers', n(d.user.followers), 1) : ''}
          ${d.user.game ? stat('Last played', esc(d.user.game)) : ''}
          ${d.user.created ? stat('Joined Twitch', esc(d.user.created)) : ''}
        </div>
        <div class="cta a-up d5">${esc(d.copy.cta)}</div>
        <div class="rurl a-up d6">${esc(d.user.url)}</div>
      </div>
      <div class="sclip a-inr">${clip(d)}<div class="clipbar"><div class="ct">${esc(d.clip ? d.clip.title : d.user.title)}</div><div class="cm">${clipMeta(d)}</div></div></div>
    </div>`,
  });

  /* ---------- 12. TRADING CARD ---------- */
  add({
    id: 'card', label: 'Trading Card', group: 'Card', needsClip: false,
    blurb: 'Portrait collectible card that flips in. Clip plays in the art window. Very shareable.',
    html: (d) => `
    <div class="lo lo-tcard">
      <div class="circle a-ring"></div>
      <div class="tcwrap"><div class="tcinner a-flip">
        <div class="tc">
          <div class="tchead"><div class="kicker">${esc(d.copy.kicker)}</div><h1>${esc(d.user.name)}</h1></div>
          <div class="tcart">${clip(d)}</div>
          <div class="tctype">${esc(d.user.game || 'Streamer')}${badge(d)}</div>
          <div class="tcrules">
            ${d.user.bio ? `<p>${esc(d.user.bio)}</p>` : ''}
            ${credit(d,'micro')}
            <p class="flavour">“${esc(d.copy.cta)} — ${esc(d.user.url)}”</p>
          </div>
          <div class="tcfoot">
            <span>${d.user.created ? 'JOINED ' + esc(d.user.created).toUpperCase() : ''}</span>
            <span class="pt">${d.user.followers ? n(d.user.followers) : '—'}</span>
          </div>
        </div>
      </div></div>
      <div class="tcside l a-fade d3">${esc(d.copy.kicker)}</div>
      <div class="tcside r a-fade d4">${esc(d.copy.cta)}</div>
    </div>`,
  });

  /* ---------- 13. SCOREBOARD ---------- */
  add({
    id: 'scoreboard', label: 'Scoreboard', group: 'Lower third', needsClip: false,
    blurb: 'Sports broadcast bug: hard geometry, big numerals, sliding score strip.',
    html: (d) => `
    <div class="lo lo-score">
      ${clip(d, 'fill')}
      <div class="scrim-b"></div>
      <div class="sb a-inl">
        <div class="sbav">${av(d, 128)}</div>
        <div class="sbnm"><div class="kicker">${esc(d.copy.kicker)}</div><h1>${esc(d.user.name)}</h1></div>
        <div class="sbnums">
          ${d.user.followers ? `<div class="sbn"><b>${n(d.user.followers)}</b><span>FOLLOWERS</span></div>` : ''}
          ${d.clip ? `<div class="sbn"><b>${n(d.clip.views)}</b><span>CLIP VIEWS</span></div>` : ''}
          ${d.user.created ? `<div class="sbn"><b>${esc(d.user.created)}</b><span>JOINED TWITCH</span></div>` : ''}
        </div>
        <div class="sbcap">${motif()}</div>
      </div>
      <div class="sbstrip a-inr">${d.clip ? `<span><b>${esc(d.clip.title)}</b> · clipped by ${esc(d.clip.creator)} · ${esc(d.clip.created)}</span>` : ''}<span>${esc(d.user.game || '')}</span><span>${esc(d.user.url)}</span></div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 14. MAGAZINE ---------- */
  add({
    id: 'magazine', label: 'Magazine', group: 'Full frame', needsClip: false,
    blurb: 'Editorial cover treatment — masthead, pull quote, cover lines down the side.',
    html: (d) => `
    <div class="lo lo-mag">
      ${clip(d, 'fill')}
      <div class="scrim-l"></div>
      <div class="masthead a-rise">${esc(d.copy.tag)}</div>
      <div class="magbody">
        <div class="issue a-fade d1">№ ${d.index || '01'} · ${esc(d.user.created || '')}</div>
        <h1 class="a-rise d1">${esc(d.user.name)}</h1>
        ${d.user.bio ? `<p class="pull a-rise d2">“${esc(d.user.bio)}”</p>` : ''}
        <div class="lines">
          ${d.user.game ? `<div class="cl a-up d3"><b>NOW PLAYING</b> ${esc(d.user.game)}</div>` : ''}
          ${d.user.followers ? `<div class="cl a-up d4"><b>AUDIENCE</b> ${n(d.user.followers)} followers</div>` : ''}
          ${d.clip ? `<div class="cl a-up d5"><b>THIS CLIP</b> ${esc(d.clip.title)}</div>` : ''}
          ${d.clip ? `<div class="cl a-up d5"><b>CLIPPED BY</b> ${esc(d.clip.creator)} · ${esc(d.clip.created)}</div>` : ''}
        </div>
        <div class="magurl a-up d6">${esc(d.user.url)}</div>
      </div>
    </div>`,
  });

  /* ---------- 15. NEON SIGN ---------- */
  add({
    id: 'neon', label: 'Neon Sign', group: 'Full frame', needsClip: false,
    blurb: 'Glowing tube-lettering name with a flicker-on, clip behind smoked glass.',
    html: (d) => `
    <div class="lo lo-neon">
      <div class="nbg">${clip(d, 'fill')}</div>
      <div class="nglass"></div>
      <div class="nwrap">
        <div class="ntube a-flicker"><h1>${esc(d.user.name)}</h1></div>
        <div class="nsub a-fade d3">${esc(d.copy.kicker)}</div>
        <div class="nchips a-up d4">
          ${d.user.game ? `<span class="chip">${esc(d.user.game)}</span>` : ''}
          ${d.user.followers ? `<span class="chip">${n(d.user.followers)} followers</span>` : ''}
          ${d.user.created ? `<span class="chip">Joined ${esc(d.user.created)}</span>` : ''}
        </div>
        <div class="ncredit a-fade d5">${credit(d,'line')}</div>
        <div class="nurl a-fade d5">${esc(d.user.url)}</div>
      </div>
      <div class="nav a-pop d2">${av(d, 170)}</div>
    </div>`,
  });

  /* ---------- 16. RECEIPT ---------- */
  add({
    id: 'receipt', label: 'Receipt', group: 'Card', needsClip: false,
    blurb: 'Itemised till-roll printing out, monospace, torn edges. Novel and very readable.',
    html: (d) => `
    <div class="lo lo-receipt">
      <div class="rbg">${clip(d, 'fill')}</div>
      <div class="rpaper a-print">
        <div class="rhead">${esc(d.copy.tag)}<br><span>SHOUTOUT RECEIPT</span></div>
        <div class="rdiv"></div>
        <div class="ritem big"><span>${esc(d.user.name)}</span></div>
        <div class="ritem"><span>@${esc(d.user.login)}</span><span></span></div>
        <div class="rdiv"></div>
        ${d.user.game ? `<div class="ritem"><span>LAST GAME</span><span>${esc(d.user.game)}</span></div>` : ''}
        ${d.user.followers ? `<div class="ritem"><span>FOLLOWERS</span><span>${n(d.user.followers)}</span></div>` : ''}
        ${d.user.created ? `<div class="ritem"><span>JOINED TWITCH</span><span>${esc(d.user.created)}</span></div>` : ''}
        ${d.clip ? `<div class="ritem"><span>CLIP VIEWS</span><span>${n(d.clip.views)}</span></div>` : ''}
        ${d.clip ? `<div class="ritem"><span>DURATION</span><span>${d.clip.duration}s</span></div>` : ''}
        ${d.clip ? `<div class="ritem"><span>CLIPPED BY</span><span>${esc(d.clip.creator)}</span></div>` : ''}
        ${d.clip ? `<div class="ritem"><span>CLIP DATE</span><span>${esc(d.clip.created)}</span></div>` : ''}
        ${d.clip ? `<div class="ritem wrap"><span>CLIP</span><span>${esc(d.clip.title)}</span></div>` : ''}
        <div class="rdiv"></div>
        <div class="ritem total"><span>TOTAL VIBES</span><span>MAX</span></div>
        <div class="rdiv"></div>
        <div class="rfoot">${esc(d.copy.cta)}<br>${esc(d.user.url)}<div class="barcode"></div></div>
      </div>
      <div class="rclip a-inr">${clip(d)}</div>
    </div>`,
  });

  /* ---------- 17. HUD ---------- */
  add({
    id: 'hud', label: 'Game HUD', group: 'Lower third', needsClip: false,
    blurb: 'Diegetic game-UI overlay: corner brackets, bars, target reticle framing.',
    html: (d) => `
    <div class="lo lo-hud">
      ${clip(d, 'fill')}
      <div class="brk tl a-fade"></div><div class="brk tr a-fade"></div>
      <div class="brk bl a-fade"></div><div class="brk br a-fade"></div>
      <div class="hudtop a-dn">${motif()}<span>${esc(d.copy.kicker)}</span>${liveTag(d)}</div>
      <div class="hudmain a-inl">
        <div class="hav">${av(d, 150)}</div>
        <div class="hinfo">
          <h1>${esc(d.user.name)}</h1>
          <div class="hbars">
            ${d.user.followers ? `<div class="hb"><span>FOLLOWERS</span><i style="--p:.82"></i><b>${n(d.user.followers)}</b></div>` : ''}
            ${d.user.created ? `<div class="hb"><span>JOINED</span><i style="--p:.6"></i><b>${esc(d.user.created)}</b></div>` : ''}
            ${d.clip ? `<div class="hb"><span>CLIP VIEWS</span><i style="--p:.7"></i><b>${n(d.clip.views)}</b></div>` : ''}
          </div>
        </div>
      </div>
      <div class="hudbot a-up">${[d.clip ? d.clip.title : '', d.clip ? 'CLIPPED BY ' + d.clip.creator : '', d.clip ? d.clip.created : '', d.user.game, d.user.url].filter(Boolean).map(esc).join('  //  ')}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 18. SCROLL ---------- */
  add({
    id: 'scroll', label: 'Quest Scroll', group: 'Lower third', needsClip: false,
    blurb: 'Rollers fly in, parchment unfurls between them. Themed but compact.',
    html: (d) => `
    <div class="lo lo-scroll">
      ${clip(d, 'fill')}
      <div class="scrim-b"></div>
      <div class="crest a-fade">${av(d, 110)}<div><div class="kicker">${esc(d.copy.tag)}</div><div class="sub">${esc(d.copy.kicker)}</div></div></div>
      <div class="scrollwrap">
        <div class="roll l a-rl"></div><div class="roll r a-rr"></div>
        <div class="parch a-widen">
          <div class="pinner">
            <div class="kicker a-up d2">${motif()} ${esc(d.copy.kicker)}</div>
            <h1 class="a-up d3">${esc(d.user.name)}</h1>
            <div class="smeta a-up d4">${[d.user.game, d.user.followers ? n(d.user.followers) + ' followers' : '', d.user.url].filter(Boolean).map(esc).join(' · ')}</div>
            ${credit(d,'micro') ? `<div class="a-up d5">${credit(d,'micro')}</div>` : ''}
          </div>
        </div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 19. MINIMAL BUG ---------- */
  add({
    id: 'bug', label: 'Corner Bug', group: 'Corner', needsClip: false,
    blurb: 'Tiny corner chip — no clip, no takeover. For when you just want a nod on screen.',
    html: (d) => `
    <div class="lo lo-bug">
      <div class="bugbox a-inr">
        ${av(d, 96)}
        <div class="bugtx">
          <div class="kicker">${esc(d.copy.kicker)}</div>
          <h1>${esc(d.user.name)}</h1>
          <div class="bugmeta">${[d.user.game, d.user.followers ? n(d.user.followers) + ' followers' : ''].filter(Boolean).map(esc).join(' · ')}</div>
          ${credit(d,'micro')}
        </div>
        ${motif()}
      </div>
      <div class="bugbar"><i></i></div>
    </div>`,
  });

  /* ---------- 20. FILMSTRIP ---------- */
  add({
    id: 'filmstrip', label: 'Filmstrip', group: 'Full frame', needsClip: false,
    blurb: 'Clip in a sprocket-holed film frame that slides up, with credits-style typography.',
    html: (d) => `
    <div class="lo lo-film">
      <div class="fbg">${clip(d, 'fill')}</div>
      <div class="fstrip a-inup">
        <div class="sprock t"></div>
        <div class="fframe">${clip(d)}</div>
        <div class="sprock b"></div>
      </div>
      <div class="fcred">
        <div class="kicker a-fade d2">${esc(d.copy.kicker)}</div>
        <h1 class="a-rise d3">${esc(d.user.name)}</h1>
        <div class="frow a-up d4">
          ${d.user.game ? `<span><b>GAME</b> ${esc(d.user.game)}</span>` : ''}
          ${d.user.followers ? `<span><b>FOLLOWERS</b> ${n(d.user.followers)}</span>` : ''}
          ${d.clip ? `<span><b>VIEWS</b> ${n(d.clip.views)}</span>` : ''}
        </div>
        <div class="fcredit a-up d5">${credit(d,'line')}</div>
        <div class="furl a-up d5">${esc(d.user.url)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  root.Layouts = {
    /* exposed so layoutgen.js can compose new layouts from the same pieces */
    helpers: { esc, n, clip, credit, av, badge, liveTag, motif, stat, clipMeta, joined, joinedShort },
    all: L,
    byId: (id) => L.find((x) => x.id === id) || L[0],
    ids: L.map((x) => x.id),
  };
})(typeof window !== 'undefined' ? window : globalThis);
