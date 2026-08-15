/* Clawmark - Twitch Shoutout Overlay for OBS
 * Created by Hardclaws · twitch.tv/hardclaws · thehardclaws@gmail.com
 * MIT licence. Free to use, modify and fork.
 */
/* =============================================================
   LAYOUTS - SET 8
   Nature, sport, music and food. Rounds the themed count to 118.
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
     NATURE
     ========================================================= */

  /* ---------- NATURE DOC ---------- */
  add({
    id: 'naturedoc', label: 'Nature Documentary', group: 'Nature',
    blurb: 'Wildlife film lower third - species name in italic latin, habitat readout and a soft cream serif palette.',
    html: (d) => `
    <div class="lo lo-nature">
      <div class="nd-frame a-ndin">
        <div class="nd-view">${clip(d)}</div>
        <div class="nd-grade"></div>
      </div>

      <div class="nd-lower a-ndup">
        <div class="nd-rule"></div>
        <div class="nd-species">
          <h1>${esc(d.user.name)}</h1>
          <i>${esc(d.user.login ? d.user.login + ' streamensis' : 'streamer vulgaris')}</i>
        </div>
        <div class="nd-facts">
          ${d.user.game ? `<div><span>Habitat</span><b>${esc(d.user.game)}</b></div>` : ''}
          ${d.user.followers != null ? `<div><span>Population</span><b>${n(d.user.followers)}</b></div>` : ''}
          ${d.user.created ? `<div><span>First observed</span><b>${esc(d.user.created)}</b></div>` : ''}
        </div>
        ${d.user.bio ? `<p class="nd-narr">${esc(d.user.bio)}</p>` : ''}
        <div class="nd-foot">
          <span class="nd-credit">${credit(d, 'line')}</span>
          <span class="nd-url">${esc(d.user.url)}</span>
        </div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- FIELD JOURNAL ---------- */
  add({
    id: 'fieldjournal', label: 'Field Journal', group: 'Nature',
    blurb: 'A naturalist\'s notebook - pressed leaves, pencil sketches, tape-mounted photo and handwritten margin notes.',
    html: (d) => `
    <div class="lo lo-field">
      <div class="fj-desk"></div>
      <div class="fj-book a-fjin">
        <div class="fj-rings">${rep(11, () => '<i></i>')}</div>
        <div class="fj-page">
          <div class="fj-head">
            <b>FIELD JOURNAL</b>
            <span>${d.user.created ? 'entry since ' + esc(d.user.created) : 'entry'}</span>
          </div>

          <div class="fj-grid">
            <div class="fj-left">
              <h1>${esc(d.user.name)}</h1>
              <div class="fj-sub">${esc(d.user.url)}</div>
              <div class="fj-leaf">
                <svg viewBox="0 0 120 200">
                  <path d="M60 6 C18 60 14 140 60 194 C106 140 102 60 60 6 Z"/>
                  <path d="M60 12 L60 190 M60 60 L26 44 M60 60 L94 44 M60 104 L22 92 M60 104 L98 92
                           M60 146 L32 138 M60 146 L88 138"/>
                </svg>
              </div>
              <div class="fj-obs">
                ${d.user.followers != null ? `<div><span>observed by</span><b>${n(d.user.followers)}</b></div>` : ''}
                ${d.user.game ? `<div><span>found among</span><b>${esc(d.user.game)}</b></div>` : ''}
              </div>
              ${d.user.bio ? `<p class="fj-hand">${esc(d.user.bio)}</p>` : ''}
            </div>
            <div class="fj-right">
              <div class="fj-tape tl"></div><div class="fj-tape br"></div>
              <div class="fj-photo">${clip(d)}</div>
              <div class="fj-cap">${esc(d.clip ? d.clip.title : d.user.title)}</div>
              <div class="fj-credit">${credit(d, 'stack')}</div>
            </div>
          </div>
          <div class="fj-margin">${esc(d.copy.cta)}</div>
        </div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- AQUARIUM ---------- */
  add({
    id: 'aquarium', label: 'Aquarium', group: 'Nature',
    blurb: 'Looking into a tank - caustic light ripples, drifting bubbles, kelp silhouettes and a brass exhibit plaque.',
    html: (d) => `
    <div class="lo lo-aqua">
      <div class="aq-water"></div>
      <div class="aq-caustic a-aqcaustic"></div>
      <div class="aq-kelp l"></div><div class="aq-kelp r"></div>
      <div class="aq-bubbles">${rep(30, (i) => `<i style="left:${(i * 73) % 96}%;--dl:${(i % 11) * 0.5}s;--dur:${5 + (i % 6)}s;--sz:${5 + (i % 5) * 4}px"></i>`)}</div>

      <div class="aq-tank a-aqin">
        <div class="aq-glass">${clip(d)}</div>
        <div class="aq-shine"></div>
        <div class="aq-seal"></div>
      </div>

      <div class="aq-plaque a-aqplaq">
        <div class="aq-ph">EXHIBIT ${String((d.user.followers || 8) % 40 + 1).padStart(2, '0')}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="aq-latin">${esc(d.user.url)}</div>
        <div class="aq-rows">
          ${d.user.followers != null ? `<div><span>Visitors</span><b data-count="${d.user.followers}">0</b></div>` : ''}
          ${d.user.game ? `<div><span>Waters</span><b class="sm">${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>On display</span><b class="sm">${esc(d.user.created)}</b></div>` : ''}
        </div>
        ${d.user.bio ? `<p class="aq-bio">${esc(d.user.bio)}</p>` : ''}
        <div class="aq-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* =========================================================
     SPORT
     ========================================================= */

  /* ---------- STADIUM BIG SCREEN ---------- */
  add({
    id: 'stadium', label: 'Stadium Screen', group: 'Sport',
    blurb: 'The jumbotron at a packed ground - LED dot matrix, crowd bokeh and a sponsor ribbon crawling underneath.',
    html: (d) => `
    <div class="lo lo-stad">
      <div class="sd-night"></div>
      <div class="sd-crowd">${rep(90, (i) => `<i style="left:${(i * 61) % 100}%;top:${72 + (i * 29) % 26}%;--dl:${(i % 13) * 0.3}s"></i>`)}</div>
      <div class="sd-floods">${rep(4, (i) => `<b style="left:${9 + i * 27}%"></b>`)}</div>

      <div class="sd-jumbo a-sdin">
        <div class="sd-rig"></div>
        <div class="sd-screen">
          <div class="sd-view">${clip(d)}</div>
          <div class="sd-led"></div>
        </div>
        <div class="sd-bezel"></div>
      </div>

      <div class="sd-name a-sdup">
        <div class="sd-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
      </div>

      <div class="sd-stats a-sdup d1">
        ${d.user.followers != null ? `<div><b data-count="${d.user.followers}">0</b><span>SUPPORTERS</span></div>` : ''}
        ${d.clip ? `<div><b data-count="${d.clip.views}">0</b><span>REPLAYS</span></div>` : ''}
        ${d.user.game ? `<div><b class="sm">${esc(d.user.game)}</b><span>FIXTURE</span></div>` : ''}
        ${d.user.created ? `<div><b class="sm">${esc(d.user.created)}</b><span>DEBUT</span></div>` : ''}
      </div>

      <div class="sd-ribbon">
        <div class="sd-run">${rep(2, () => `<span>${esc(d.user.url).toUpperCase()} &nbsp;•&nbsp; ${esc(d.copy.cta).toUpperCase()} &nbsp;•&nbsp; ${esc(d.clip ? d.clip.title : d.user.title).toUpperCase()} &nbsp;•&nbsp; </span>`)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- TRADING STICKER ---------- */
  add({
    id: 'stickerbook', label: 'Sticker Album', group: 'Sport',
    blurb: 'A football sticker album page - foil-shine special, empty slots waiting, and a "GOT IT!" slap.',
    html: (d) => `
    <div class="lo lo-sticker">
      <div class="sk-page">
        <div class="sk-head">
          <b>OFFICIAL COLLECTION</b>
          <span>PAGE ${(d.user.followers || 24) % 60 + 1} - STREAMERS</span>
        </div>

        <div class="sk-row">
          <div class="sk-slot a-skpop">
            <div class="sk-foil"></div>
            <div class="sk-photo">${clip(d)}</div>
            <div class="sk-band">
              <b>${esc(d.user.name)}</b>
              <span>${esc(d.user.game || 'STREAMER')}</span>
            </div>
            <div class="sk-shine"></div>
          </div>

          <div class="sk-info a-skin">
            <div class="sk-num">${String((d.user.followers || 137) % 500).padStart(3, '0')}</div>
            <h1>${esc(d.user.name)}</h1>
            <div class="sk-url">${esc(d.user.url)}</div>
            <div class="sk-rows">
              ${d.user.followers != null ? `<div><span>COLLECTORS</span><b>${n(d.user.followers)}</b></div>` : ''}
              ${d.clip ? `<div><span>SWAPS</span><b>${n(d.clip.views)}</b></div>` : ''}
              ${d.user.created ? `<div><span>ROOKIE YEAR</span><b>${esc(d.user.created)}</b></div>` : ''}
            </div>
            <div class="sk-credit">${credit(d, 'micro')}</div>
          </div>
        </div>

        <div class="sk-empties">
          ${rep(4, (i) => `<div class="sk-empty" style="animation-delay:${i * 0.08}s"><span>${String((d.user.followers || 137) % 500 + i + 1).padStart(3, '0')}</span></div>`)}
        </div>
        <div class="sk-got a-skgot">GOT IT!</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- PODIUM ---------- */
  add({
    id: 'podium', label: 'Podium', group: 'Sport',
    blurb: 'Medal ceremony - three-step podium rising from the floor, confetti burst and a laurel-wreath name plate.',
    html: (d) => `
    <div class="lo lo-podium">
      <div class="pd-hall"></div>
      <div class="pd-confetti">${rep(40, (i) => `<i style="left:${(i * 67) % 100}%;--dl:${(i % 13) * 0.18}s;--dur:${2.6 + (i % 5) * 0.5}s;--c:${['#ffd23f', '#ff5a8a', '#4ad8ff', '#7cf08a'][i % 4]};--rot:${(i * 47) % 360}deg"></i>`)}</div>

      <div class="pd-screen a-pdin">
        <div class="pd-view">${clip(d)}</div>
        <div class="pd-glow"></div>
      </div>

      <div class="pd-blocks">
        <div class="pd-block two a-pdrise d1"><span>2</span></div>
        <div class="pd-block one a-pdrise"><span>1</span>
          <div class="pd-figure">${av(d, 120)}</div>
        </div>
        <div class="pd-block three a-pdrise d2"><span>3</span></div>
      </div>

      <div class="pd-plate a-pdplate">
        <div class="pd-laurel l">❦</div><div class="pd-laurel r">❦</div>
        <div class="pd-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="pd-url">${esc(d.user.url)}</div>
        <div class="pd-stats">
          ${d.user.followers != null ? `<div><b data-count="${d.user.followers}">0</b><span>FANS</span></div>` : ''}
          ${d.user.game ? `<div><b class="sm">${esc(d.user.game)}</b><span>EVENT</span></div>` : ''}
          ${d.user.created ? `<div><b class="sm">${esc(d.user.created)}</b><span>SINCE</span></div>` : ''}
        </div>
        <div class="pd-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* =========================================================
     MUSIC
     ========================================================= */

  /* ---------- GIG POSTER ---------- */
  add({
    id: 'gigposter', label: 'Gig Poster', group: 'Music',
    blurb: 'Screen-printed show flyer - riso-style offset colour, huge condensed type and a torn paper edge.',
    html: (d) => `
    <div class="lo lo-gig">
      <div class="gp-wall"></div>
      <div class="gp-poster a-gpin">
        <div class="gp-tear"></div>
        <div class="gp-noise"></div>

        <div class="gp-top">
          <span>ONE NIGHT ONLY</span>
          <span class="gp-r">${d.user.created ? 'EST ' + esc(d.user.created).toUpperCase() : 'LIVE'}</span>
        </div>

        <h1 class="gp-name" data-txt="${esc(d.user.name)}">${esc(d.user.name)}</h1>
        <div class="gp-sub">${esc(d.copy.kicker).toUpperCase()}</div>

        <div class="gp-art">
          <div class="gp-frame">${clip(d)}</div>
        </div>

        <div class="gp-support">
          ${d.user.game ? `<span>${esc(d.user.game).toUpperCase()}</span>` : ''}
          ${d.user.followers != null ? `<span>${n(d.user.followers)} IN ATTENDANCE</span>` : ''}
          ${d.clip ? `<span>${esc(d.clip.creator).toUpperCase()} ON THE DECKS</span>` : ''}
        </div>

        <div class="gp-foot">
          <div class="gp-url">${esc(d.user.url).toUpperCase()}</div>
          <div class="gp-credit">${credit(d, 'micro')}</div>
        </div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- MIXING DESK ---------- */
  add({
    id: 'mixingdesk', label: 'Mixing Desk', group: 'Music',
    blurb: 'Studio console - channel strips with moving faders, bouncing VU needles and a routing display.',
    html: (d) => `
    <div class="lo lo-mix">
      <div class="mx-room"></div>

      <div class="mx-display a-mxin">
        <div class="mx-view">${clip(d)}</div>
        <div class="mx-dcap">MONITOR A - ${esc(d.clip ? d.clip.title : d.user.title)}</div>
      </div>

      <div class="mx-vu a-mxvu">
        ${rep(2, (i) => `<div class="mx-meter">
          <svg viewBox="0 0 200 120">
            <path class="mx-arc" d="M20 105 A85 85 0 0 1 180 105"/>
            <line class="mx-needle" x1="100" y1="105" x2="100" y2="30" style="animation-delay:${i * 0.4}s"/>
          </svg>
          <span>VU ${i + 1}</span></div>`)}
      </div>

      <div class="mx-strips a-mxstrips">
        ${[
          { l: 'MAIN', v: 82 },
          d.user.followers != null ? { l: 'FLWRS', v: 74 } : null,
          d.clip ? { l: 'VIEWS', v: 61 } : null,
          { l: 'HYPE', v: 91 },
          { l: 'CHAT', v: 55 },
          { l: 'FX', v: 38 },
        ].filter(Boolean).map((s, i) => `
          <div class="mx-strip">
            <div class="mx-knob"></div><div class="mx-knob sm"></div>
            <div class="mx-track"><i style="bottom:${s.v}%;animation-delay:${i * 0.09}s"></i></div>
            <span>${s.l}</span>
          </div>`).join('')}
      </div>

      <div class="mx-plate a-mxplate">
        <div class="mx-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="mx-url">${esc(d.user.url)}</div>
        <div class="mx-rows">
          ${d.user.followers != null ? `<div><span>LISTENERS</span><b data-count="${d.user.followers}">0</b></div>` : ''}
          ${d.user.game ? `<div><span>SESSION</span><b class="sm">${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>SIGNED</span><b class="sm">${esc(d.user.created)}</b></div>` : ''}
        </div>
        <div class="mx-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- CASSETTE MIXTAPE ---------- */
  add({
    id: 'mixtape', label: 'Mixtape', group: 'Music',
    blurb: 'A hand-labelled cassette with spinning reels, biro track listing and a J-card sleeve behind it.',
    html: (d) => `
    <div class="lo lo-tape2">
      <div class="mt-desk"></div>

      <div class="mt-card a-mtcard">
        <div class="mt-side">SIDE A</div>
        <div class="mt-tracks">
          <div><span>01</span><b>${esc(d.user.name)}</b></div>
          ${d.user.game ? `<div><span>02</span><b>${esc(d.user.game)}</b></div>` : ''}
          ${d.user.followers != null ? `<div><span>03</span><b>${n(d.user.followers)} followers</b></div>` : ''}
          ${d.user.created ? `<div><span>04</span><b>Joined ${esc(d.user.created)}</b></div>` : ''}
          ${d.clip ? `<div><span>05</span><b>${esc(d.clip.title)}</b></div>` : ''}
        </div>
        <div class="mt-url">${esc(d.user.url)}</div>
      </div>

      <div class="mt-cassette a-mtin">
        <div class="mt-shell">
          <div class="mt-label">
            <div class="mt-lname">${esc(d.user.name)}</div>
            <div class="mt-lsub">${esc(d.copy.kicker)}</div>
          </div>
          <div class="mt-window">
            <div class="mt-reel l a-mtspin"><i></i><i></i><i></i></div>
            <div class="mt-reel r a-mtspin"><i></i><i></i><i></i></div>
            <div class="mt-ribbon"></div>
          </div>
          <div class="mt-holes"><i></i><i></i></div>
        </div>
      </div>

      <div class="mt-screen a-mtscreen">
        <div class="mt-view">${clip(d)}</div>
        <div class="mt-scap">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* =========================================================
     FOOD & MISC
     ========================================================= */

  /* ---------- DINER MENU ---------- */
  add({
    id: 'diner', label: 'Diner Menu', group: 'Food',
    blurb: 'American diner specials board - chrome trim, checkerboard tile, neon OPEN sign and a daily-special card.',
    html: (d) => `
    <div class="lo lo-diner">
      <div class="dn-tile"></div>
      <div class="dn-neon a-dnflick">OPEN</div>

      <div class="dn-board a-dnin">
        <div class="dn-chrome t"></div>
        <div class="dn-inner">
          <div class="dn-head">
            <span class="dn-star">★</span>
            <b>TODAY&rsquo;S SPECIAL</b>
            <span class="dn-star">★</span>
          </div>

          <div class="dn-item">
            <div class="dn-iname">${esc(d.user.name)}</div>
            <div class="dn-dots"></div>
            <div class="dn-price">FREE</div>
          </div>
          <div class="dn-desc">${esc(d.user.bio || d.copy.cta)}</div>

          <div class="dn-sides">
            ${d.user.game ? `<div><span>SERVED WITH</span><b>${esc(d.user.game)}</b></div>` : ''}
            ${d.user.followers != null ? `<div><span>REGULARS</span><b>${n(d.user.followers)}</b></div>` : ''}
            ${d.user.created ? `<div><span>ON THE MENU SINCE</span><b>${esc(d.user.created)}</b></div>` : ''}
          </div>
          <div class="dn-url">${esc(d.user.url)}</div>
        </div>
        <div class="dn-chrome b"></div>
      </div>

      <div class="dn-photo a-dnphoto">
        <div class="dn-pframe">${clip(d)}</div>
        <div class="dn-pcap">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- COOKING SHOW ---------- */
  add({
    id: 'cookingshow', label: 'Cooking Show', group: 'Food',
    blurb: 'Daytime food TV - warm kitchen light, a recipe card with ingredients, and a bouncing timer badge.',
    html: (d) => `
    <div class="lo lo-cook">
      <div class="ck2-kitchen"></div>
      <div class="ck2-steam">${rep(10, (i) => `<i style="left:${18 + (i * 53) % 62}%;--dl:${(i % 6) * 0.8}s"></i>`)}</div>

      <div class="ck2-screen a-ck2in">
        <div class="ck2-view">${clip(d)}</div>
        <div class="ck2-badge">LIVE FROM THE KITCHEN</div>
      </div>

      <div class="ck2-timer a-ck2pop">
        <b>${d.clip ? d.clip.duration : 30}</b><span>MINS</span>
      </div>

      <div class="ck2-recipe a-ck2card">
        <div class="ck2-rh">RECIPE CARD</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="ck2-url">${esc(d.user.url)}</div>
        <div class="ck2-ing">
          <div class="ck2-ih">INGREDIENTS</div>
          <ul>
            ${d.user.followers != null ? `<li><i></i>${n(d.user.followers)} followers, well rested</li>` : ''}
            ${d.user.game ? `<li><i></i>A generous helping of ${esc(d.user.game)}</li>` : ''}
            ${d.user.created ? `<li><i></i>Aged since ${esc(d.user.created)}</li>` : ''}
            ${d.clip ? `<li><i></i>One clip by ${esc(d.clip.creator)}</li>` : ''}
          </ul>
        </div>
        ${d.user.bio ? `<p class="ck2-method">${esc(d.user.bio)}</p>` : ''}
        <div class="ck2-credit">${credit(d, 'micro')}</div>
        <div class="ck2-cta">${esc(d.copy.cta)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- COFFEE ORDER ---------- */
  add({
    id: 'coffee', label: 'Coffee Order', group: 'Food',
    blurb: 'A takeaway cup with the name scrawled on it, a paper receipt and latte-art foam swirl.',
    html: (d) => `
    <div class="lo lo-coffee">
      <div class="cf-counter"></div>
      <div class="cf-steam">${rep(7, (i) => `<i style="left:${42 + i * 2.5}%;--dl:${i * 0.5}s"></i>`)}</div>

      <div class="cf-cup a-cfin">
        <div class="cf-lid"></div>
        <div class="cf-body">
          <div class="cf-sleeve">
            <div class="cf-scrawl">${esc(d.user.name)}</div>
            <div class="cf-ticks">
              ${['OAT', 'X-SHOT', 'HOT'].map((t) => `<span>${t}<i></i></span>`).join('')}
            </div>
          </div>
        </div>
        <div class="cf-shadow"></div>
      </div>

      <div class="cf-receipt a-cfrec">
        <div class="cf-zig t"></div>
        <div class="cf-rh">
          <b>THE DAILY GRIND</b>
          <span>ORDER #${String((d.user.followers || 42) % 999).padStart(3, '0')}</span>
        </div>
        <div class="cf-lines">
          <div><span>${esc(d.user.name)}</span><b>-</b></div>
          ${d.user.game ? `<div><span>${esc(d.user.game)}</span><b>1</b></div>` : ''}
          ${d.user.followers != null ? `<div><span>Followers</span><b>${n(d.user.followers)}</b></div>` : ''}
          ${d.user.created ? `<div><span>Regular since</span><b>${esc(d.user.created)}</b></div>` : ''}
        </div>
        <div class="cf-total"><span>TOTAL</span><b>ON THE HOUSE</b></div>
        <div class="cf-thanks">${esc(d.copy.cta)}</div>
        <div class="cf-url">${esc(d.user.url)}</div>
        <div class="cf-zig b"></div>
      </div>

      <div class="cf-screen a-cfscreen">
        <div class="cf-view">${clip(d)}</div>
        <div class="cf-scap">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

})(typeof window !== 'undefined' ? window : globalThis);
