/* Clawmark - Twitch Shoutout Overlay for OBS
 * Created by Hardclaws · twitch.tv/hardclaws · thehardclaws@gmail.com
 * MIT licence. Free to use, modify and fork.
 */
/* =============================================================
   LAYOUTS - SET 10
   Final batch: heist, western, noir, pirate, museum, casino,
   courtroom, bakery, garden, ski, aquascape and awards night.
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

  /* ---------- HEIST PLAN ---------- */
  add({
    id: 'heist', label: 'Heist Plan', group: 'Crime',
    blurb: 'A job laid out on the table - floor plan, red string between pinned photos, and a countdown to the score.',
    html: (d) => `
    <div class="lo lo-heist">
      <div class="hs2-table"></div>
      <div class="hs2-plan">
        <svg viewBox="0 0 900 700" preserveAspectRatio="none">
          <rect x="60" y="60" width="780" height="580"/>
          <rect x="60" y="60" width="330" height="250"/>
          <rect x="390" y="310" width="450" height="330"/>
          <path d="M390 60 V310 M60 310 H840"/>
          <circle class="hs2-vault" cx="640" cy="470" r="60"/>
        </svg>
      </div>
      <svg class="hs2-string" viewBox="0 0 1920 1080" preserveAspectRatio="none">
        <path d="M330 300 L1180 250 M1180 250 L1500 620 M330 300 L620 780"/>
      </svg>

      <div class="hs2-shot a-hs2pin">
        <div class="hs2-pin"></div>
        <div class="hs2-frame">${clip(d)}</div>
        <div class="hs2-cap">THE MARK</div>
      </div>

      <div class="hs2-card a-hs2card">
        <div class="hs2-pin"></div>
        <div class="hs2-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="hs2-url">${esc(d.user.url)}</div>
        <div class="hs2-rows">
          ${d.user.followers != null ? `<div><span>CREW</span><b>${n(d.user.followers)}</b></div>` : ''}
          ${d.user.game ? `<div><span>TARGET</span><b>${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>CASING SINCE</span><b>${esc(d.user.created)}</b></div>` : ''}
        </div>
        <div class="hs2-credit">${credit(d, 'micro')}</div>
      </div>

      <div class="hs2-timer a-hs2timer">
        <span>TIME TO CRACK</span>
        <b>00:${String(d.clip ? Math.min(59, d.clip.duration) : 30).padStart(2, '0')}</b>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- WESTERN ---------- */
  add({
    id: 'western', label: 'Wanted Out West', group: 'Western',
    blurb: 'Sun-bleached saloon board - hand-cut woodtype, a swinging shingle and dust drifting through low light.',
    html: (d) => `
    <div class="lo lo-west">
      <div class="wt-sun"></div>
      <div class="wt-dust">${rep(28, (i) => `<i style="left:${(i * 71) % 100}%;top:${(i * 37) % 90}%;--dl:${(i % 9) * 0.7}s"></i>`)}</div>
      <div class="wt-boards"></div>

      <div class="wt-shingle a-wtswing">
        <div class="wt-chain l"></div><div class="wt-chain r"></div>
        <div class="wt-sign">${esc((d.copy.tag || 'SALOON').slice(0, 14)).toUpperCase()}</div>
      </div>

      <div class="wt-poster a-wtin">
        <div class="wt-top">WANTED</div>
        <div class="wt-sub">- DEAD OR STREAMING -</div>
        <div class="wt-photo">${clip(d)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="wt-reward">
          <span>REWARD</span>
          <b>${d.user.followers != null ? n(d.user.followers) : '5,000'}</b>
          <span>FOLLOWERS</span>
        </div>
        <div class="wt-rows">
          ${d.user.game ? `<div>LAST SEEN: ${esc(d.user.game).toUpperCase()}</div>` : ''}
          ${d.user.created ? `<div>RIDING SINCE ${esc(d.user.created).toUpperCase()}</div>` : ''}
        </div>
        <div class="wt-url">${esc(d.user.url).toUpperCase()}</div>
        <div class="wt-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- FILM NOIR ---------- */
  add({
    id: 'noir', label: 'Film Noir', group: 'Crime',
    blurb: 'Venetian-blind shadows across a detective\'s office, cigarette smoke curling and stark black-and-white grading.',
    html: (d) => `
    <div class="lo lo-noir">
      <div class="nr2-dark"></div>
      <div class="nr2-blinds"></div>
      <div class="nr2-smoke">${rep(9, (i) => `<i style="left:${20 + (i * 47) % 60}%;--dl:${(i % 6) * 1.1}s"></i>`)}</div>

      <div class="nr2-screen a-nr2in">
        <div class="nr2-view">${clip(d)}</div>
        <div class="nr2-vig"></div>
      </div>

      <div class="nr2-card a-nr2card">
        <div class="nr2-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="nr2-url">${esc(d.user.url)}</div>
        <div class="nr2-rule"></div>
        ${d.user.bio ? `<p class="nr2-mono">"${esc(d.user.bio)}"</p>` : ''}
        <div class="nr2-rows">
          ${d.user.followers != null ? `<div><span>Contacts</span><b>${n(d.user.followers)}</b></div>` : ''}
          ${d.user.game ? `<div><span>Last case</span><b>${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>On the beat since</span><b>${esc(d.user.created)}</b></div>` : ''}
        </div>
        <div class="nr2-credit">${credit(d, 'stack')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- PIRATE CHART ---------- */
  add({
    id: 'pirate', label: 'Pirate Charter', group: 'Adventure',
    blurb: 'Ship\'s articles on burnt parchment - wax seal, crossed sabres and a rope border tied at the corners.',
    html: (d) => `
    <div class="lo lo-pirate">
      <div class="pr-sea"></div>
      <div class="pr-scroll a-prin">
        <div class="pr-burn"></div>
        <div class="pr-rope"></div>

        <div class="pr-crest">
          <svg viewBox="0 0 200 120">
            <path d="M40 20 L160 100 M160 20 L40 100" class="pr-sabre"/>
            <circle cx="100" cy="60" r="26" class="pr-skull"/>
            <circle cx="90" cy="55" r="5" class="pr-eye"/><circle cx="110" cy="55" r="5" class="pr-eye"/>
          </svg>
        </div>

        <div class="pr-title">SHIP&rsquo;S ARTICLES</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="pr-url">${esc(d.user.url)}</div>

        <div class="pr-body">
          <div class="pr-left">
            <div class="pr-window">${clip(d)}</div>
            <div class="pr-cap">${esc(d.clip ? d.clip.title : d.user.title)}</div>
          </div>
          <div class="pr-right">
            <ol class="pr-articles">
              ${d.user.followers != null ? `<li>Every soul aboard - <b>${n(d.user.followers)}</b> - shall have an equal share.</li>` : ''}
              ${d.user.game ? `<li>The ship sails for <b>${esc(d.user.game)}</b>.</li>` : ''}
              ${d.user.created ? `<li>Signed and sworn, <b>${esc(d.user.created)}</b>.</li>` : ''}
            </ol>
            <div class="pr-credit">${credit(d, 'micro')}</div>
          </div>
        </div>
        <div class="pr-seal a-prseal">✶</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- MUSEUM ---------- */
  add({
    id: 'museum', label: 'Museum Piece', group: 'Culture',
    blurb: 'A gallery wall with a spotlit frame, a brass wall label and a velvet rope keeping you back.',
    html: (d) => `
    <div class="lo lo-museum">
      <div class="mu-wall"></div>
      <div class="mu-spot"></div>

      <div class="mu-frame a-muin">
        <div class="mu-outer">
          <div class="mu-mat">
            <div class="mu-art">${clip(d)}</div>
          </div>
        </div>
      </div>

      <div class="mu-label a-mulabel">
        <div class="mu-artist">${esc(d.user.name)}</div>
        <div class="mu-work"><i>${esc(d.clip ? d.clip.title : d.user.title)}</i>${d.user.created ? ', ' + esc(d.user.created) : ''}</div>
        <div class="mu-medium">${d.user.game ? esc(d.user.game) + ' on live broadcast' : 'Live broadcast'}</div>
        <div class="mu-acq">${d.user.followers != null ? 'Collection of ' + n(d.user.followers) + ' patrons' : 'Private collection'}</div>
        <div class="mu-rule"></div>
        ${d.user.bio ? `<p class="mu-blurb">${esc(d.user.bio)}</p>` : ''}
        <div class="mu-credit">${credit(d, 'micro')}</div>
        <div class="mu-url">${esc(d.user.url)}</div>
      </div>

      <div class="mu-rope a-murope">
        <i class="post l"></i><i class="post r"></i>
        <svg viewBox="0 0 600 90" preserveAspectRatio="none"><path d="M20 12 Q300 88 580 12"/></svg>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- CASINO ---------- */
  add({
    id: 'casino', label: 'Casino Table', group: 'Culture',
    blurb: 'Green baize with stacked chips, a fanned hand of cards and a slot-reel that lands on the channel name.',
    html: (d) => `
    <div class="lo lo-casino">
      <div class="cn-baize"></div>
      <div class="cn-arc"></div>

      <div class="cn-screen a-cnin">
        <div class="cn-view">${clip(d)}</div>
        <div class="cn-gold"></div>
      </div>

      <div class="cn-chips a-cnchips">
        ${[['#c8442a', 'x5'], ['#2f6fd8', 'x10'], ['#3aa860', 'x25'], ['#1a1a1a', 'x100']].map((c, i) => `
          <div class="cn-stack" style="animation-delay:${i * 0.1}s">
            ${rep(4, () => `<i style="background:${c[0]}"></i>`)}
            <span>${c[1]}</span>
          </div>`).join('')}
      </div>

      <div class="cn-hand a-cnhand">
        ${[['A', '♠'], ['K', '♥'], ['Q', '♦']].map((c, i) => `
          <div class="cn-card c${i}" style="animation-delay:${i * 0.12}s">
            <span class="${c[1] === '♥' || c[1] === '♦' ? 'red' : ''}">${c[0]}<br>${c[1]}</span>
          </div>`).join('')}
      </div>

      <div class="cn-plate a-cnplate">
        <div class="cn-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="cn-url">${esc(d.user.url)}</div>
        <div class="cn-rows">
          ${d.user.followers != null ? `<div><b data-count="${d.user.followers}">0</b><span>CHIPS</span></div>` : ''}
          ${d.clip ? `<div><b data-count="${d.clip.views}">0</b><span>POT</span></div>` : ''}
          ${d.user.created ? `<div><b class="sm">${esc(d.user.created)}</b><span>MEMBER</span></div>` : ''}
        </div>
        <div class="cn-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- COURTROOM ---------- */
  add({
    id: 'courtroom', label: 'Courtroom', group: 'Crime',
    blurb: 'Objection! A courtroom exhibit board with a gavel slam, evidence tag and the verdict stamped across it.',
    html: (d) => `
    <div class="lo lo-court">
      <div class="ct2-room"></div>
      <div class="ct2-panel"></div>

      <div class="ct2-exhibit a-ct2in">
        <div class="ct2-tag">EXHIBIT A</div>
        <div class="ct2-frame">${clip(d)}</div>
        <div class="ct2-cap">${esc(d.clip ? d.clip.title : d.user.title)}</div>
      </div>

      <div class="ct2-bench a-ct2bench">
        <div class="ct2-kick">${esc(d.copy.kicker)}</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="ct2-url">${esc(d.user.url)}</div>
        <div class="ct2-rows">
          ${d.user.followers != null ? `<div><span>JURY OF</span><b>${n(d.user.followers)}</b></div>` : ''}
          ${d.user.game ? `<div><span>CHARGE</span><b>${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>ON RECORD</span><b>${esc(d.user.created)}</b></div>` : ''}
        </div>
        <div class="ct2-credit">${credit(d, 'micro')}</div>
      </div>

      <div class="ct2-gavel a-ct2slam">
        <i class="head"></i><i class="handle"></i>
      </div>
      <div class="ct2-verdict a-ct2verdict">${esc(d.copy.cta).toUpperCase()}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- BAKERY ---------- */
  add({
    id: 'bakery', label: 'Bakery Window', group: 'Food',
    blurb: 'A pastel patisserie display - cake stands, a chalk price board and a paper doily under everything.',
    html: (d) => `
    <div class="lo lo-bake">
      <div class="bq-shop"></div>
      <div class="bq-awning">${rep(9, (i) => `<i style="--i:${i}"></i>`)}</div>

      <div class="bq-case a-bqin">
        <div class="bq-glass">${clip(d)}</div>
        <div class="bq-shelf"></div>
        <div class="bq-doily"></div>
      </div>

      <div class="bq-board a-bqboard">
        <div class="bq-bh">TODAY&rsquo;S BAKE</div>
        <h1>${esc(d.user.name)}</h1>
        <div class="bq-url">${esc(d.user.url)}</div>
        <div class="bq-menu">
          ${d.user.game ? `<div><span>${esc(d.user.game)}</span><i></i><b>fresh</b></div>` : ''}
          ${d.user.followers != null ? `<div><span>Regulars</span><i></i><b>${n(d.user.followers)}</b></div>` : ''}
          ${d.user.created ? `<div><span>Baking since</span><i></i><b>${esc(d.user.created)}</b></div>` : ''}
        </div>
        ${d.user.bio ? `<p class="bq-note">${esc(d.user.bio)}</p>` : ''}
        <div class="bq-credit">${credit(d, 'micro')}</div>
      </div>

      <div class="bq-cakes">
        ${rep(3, (i) => `<div class="bq-cake c${i}" style="animation-delay:${i * 0.12}s">
          <i class="top"></i><i class="mid"></i><i class="base"></i></div>`)}
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- GREENHOUSE ---------- */
  add({
    id: 'greenhouse', label: 'Greenhouse', group: 'Nature',
    blurb: 'Sunlit glasshouse - steel glazing bars, hanging foliage, condensation on the panes and a plant label on a stake.',
    html: (d) => `
    <div class="lo lo-green">
      <div class="gh-light"></div>
      <div class="gh-panes"></div>
      <div class="gh-leaves">
        ${rep(7, (i) => `<svg class="gh-leaf l${i}" viewBox="0 0 100 200" style="animation-delay:${i * 0.6}s">
          <path d="M50 0 C10 60 8 150 50 200 C92 150 90 60 50 0 Z"/></svg>`)}
      </div>

      <div class="gh-window a-ghin">
        <div class="gh-glass">${clip(d)}</div>
        <div class="gh-cond"></div>
        <div class="gh-bars"><i></i><i></i></div>
      </div>

      <div class="gh-stake a-ghstake">
        <div class="gh-label">
          <div class="gh-common">${esc(d.user.name)}</div>
          <div class="gh-latin">${esc(d.user.url)}</div>
          <div class="gh-care">
            ${d.user.followers != null ? `<div><span>☼</span><b>${n(d.user.followers)} admirers</b></div>` : ''}
            ${d.user.game ? `<div><span>✿</span><b>${esc(d.user.game)}</b></div>` : ''}
            ${d.user.created ? `<div><span>⌛</span><b>Potted ${esc(d.user.created)}</b></div>` : ''}
          </div>
          ${d.user.bio ? `<p class="gh-note">${esc(d.user.bio)}</p>` : ''}
          <div class="gh-credit">${credit(d, 'micro')}</div>
        </div>
        <div class="gh-spike"></div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- SKI RESORT ---------- */
  add({
    id: 'skiresort', label: 'Ski Report', group: 'Sport',
    blurb: 'Mountain conditions board - piste difficulty diamonds, a snowfall figure and falling snow over a lodge window.',
    html: (d) => `
    <div class="lo lo-ski">
      <div class="sr2-sky"></div>
      <div class="sr2-peaks"></div>
      <div class="sr2-snow">${rep(50, (i) => `<i style="left:${(i * 67) % 100}%;--dl:${(i % 15) * 0.4}s;--dur:${5 + (i % 6)}s;--dx:${((i % 5) - 2) * 40}px"></i>`)}</div>

      <div class="sr2-window a-sr2in">
        <div class="sr2-glass">${clip(d)}</div>
        <div class="sr2-frost"></div>
        <div class="sr2-sill"></div>
      </div>

      <div class="sr2-board a-sr2board">
        <div class="sr2-bh">
          <span class="sr2-flake">❄</span>
          MOUNTAIN REPORT
          <span class="sr2-flake">❄</span>
        </div>
        <h1>${esc(d.user.name)}</h1>
        <div class="sr2-url">${esc(d.user.url)}</div>

        <div class="sr2-pistes">
          ${[['GREEN', '●', 'OPEN'], ['BLUE', '■', 'OPEN'], ['BLACK', '◆', 'OPEN']].map((p, i) => `
            <div class="sr2-piste p${i}" style="animation-delay:${i * 0.1}s">
              <span class="sr2-sym">${p[1]}</span><b>${p[0]}</b><i>${p[2]}</i></div>`).join('')}
        </div>

        <div class="sr2-rows">
          ${d.user.followers != null ? `<div><span>SKIERS ON PISTE</span><b>${n(d.user.followers)}</b></div>` : ''}
          ${d.user.game ? `<div><span>CONDITIONS</span><b>${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div><span>SEASON PASS</span><b>${esc(d.user.created)}</b></div>` : ''}
        </div>
        <div class="sr2-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- VINYL SHOP ---------- */
  add({
    id: 'recordshop', label: 'Record Shop', group: 'Music',
    blurb: 'Flipping through the crates - a sleeve pulled forward, genre divider card and a hand-written price sticker.',
    html: (d) => `
    <div class="lo lo-crate">
      <div class="rs-shop"></div>
      <div class="rs-crate">
        <div class="rs-behind">${rep(9, (i) => `<i style="--i:${i}"></i>`)}</div>
      </div>

      <div class="rs-divider a-rsdiv">${esc((d.user.game || 'STREAM').slice(0, 12)).toUpperCase()}</div>

      <div class="rs-sleeve a-rsin">
        <div class="rs-sleeve-outer"><div class="rs-cover">${clip(d)}</div></div>
        <div class="rs-band">
          <b>${esc(d.user.name)}</b>
          <span>${esc(d.clip ? d.clip.title : d.user.title)}</span>
        </div>
        <div class="rs-price">
          <span>£</span><b>${((d.user.followers || 1200) % 30) + 4}</b><i>.99</i>
        </div>
        <div class="rs-disc a-rsspin"></div>
      </div>

      <div class="rs-info a-rsinfo">
        <div class="rs-kick">${esc(d.copy.kicker)}</div>
        <div class="rs-url">${esc(d.user.url)}</div>
        <div class="rs-rows">
          ${d.user.followers != null ? `<div><span>PRESSINGS</span><b>${n(d.user.followers)}</b></div>` : ''}
          ${d.user.created ? `<div><span>FIRST PRESS</span><b>${esc(d.user.created)}</b></div>` : ''}
          ${d.clip ? `<div><span>SLEEVE BY</span><b>${esc(d.clip.creator)}</b></div>` : ''}
        </div>
        ${d.user.bio ? `<p class="rs-note">${esc(d.user.bio)}</p>` : ''}
        <div class="rs-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- AWARDS NIGHT ---------- */
  add({
    id: 'awards', label: 'Awards Night', group: 'Broadcast',
    blurb: 'And the winner is - an envelope tears open, a gold statuette rises and the nominee list crosses itself off.',
    html: (d) => `
    <div class="lo lo-awards">
      <div class="aw-hall"></div>
      <div class="aw-sparkle">${rep(24, (i) => `<i style="left:${(i * 83) % 96}%;top:${(i * 41) % 90}%;--dl:${(i % 8) * 0.5}s"></i>`)}</div>

      <div class="aw-statue a-awrise">
        <svg viewBox="0 0 120 300">
          <ellipse cx="60" cy="286" rx="46" ry="12"/>
          <rect x="34" y="248" width="52" height="40" rx="4"/>
          <path d="M60 40 C44 62 40 96 46 128 C50 152 44 200 52 248 H68 C76 200 70 152 74 128
                   C80 96 76 62 60 40 Z"/>
          <circle cx="60" cy="26" r="18"/>
        </svg>
      </div>

      <div class="aw-screen a-awin">
        <div class="aw-view">${clip(d)}</div>
        <div class="aw-vig"></div>
      </div>

      <div class="aw-env a-awenv">
        <div class="aw-flap"></div>
        <div class="aw-card">
          <div class="aw-cat">${esc(d.copy.kicker).toUpperCase()}</div>
          <div class="aw-and">AND THE WINNER IS</div>
          <h1>${esc(d.user.name)}</h1>
          <div class="aw-url">${esc(d.user.url)}</div>
        </div>
      </div>

      <div class="aw-noms a-awnoms">
        <div class="aw-nh">NOMINEES</div>
        <div class="aw-list">
          <div class="win"><span>✓</span>${esc(d.user.name)}</div>
          ${d.user.game ? `<div><span>·</span>${esc(d.user.game)}</div>` : ''}
          ${d.user.followers != null ? `<div><span>·</span>${n(d.user.followers)} supporters</div>` : ''}
          ${d.user.created ? `<div><span>·</span>Class of ${esc(d.user.created)}</div>` : ''}
        </div>
        <div class="aw-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

})(typeof window !== 'undefined' ? window : globalThis);
