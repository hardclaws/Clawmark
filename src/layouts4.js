/* Clawmark - Twitch Shoutout Overlay for OBS
 * Created by Hardclaws · twitch.tv/hardclaws · thehardclaws@gmail.com
 * MIT licence. Free to use, modify and fork.
 */
/* =============================================================
   LAYOUTS - SET 4
   Gaming-culture themes: battle royale, block-world, achievements,
   console UI, speedrun, MMO, fighting game, kart racing, tabletop
   initiative, and a Zwift-style ride HUD.

   Heavier on motion than earlier sets - counters roll, bars fill,
   badges pop, banners sweep.
   ============================================================= */
(function (root) {
  'use strict';
  if (!root.Layouts) throw new Error('layouts.js must load first');

  const H = root.Layouts.helpers;
  const { esc, n, clip, credit, av, badge, liveTag } = H;
  const L = root.Layouts.all;
  const add = (o) => L.push(o);

  /* ---------- 54. VICTORY ROYALE ---------- */
  add({
    id: 'victory', label: 'Victory Royale', group: 'Gaming',
    blurb: 'Battle-royale win screen - placement banner sweeps in, elimination counters roll up.',
    html: (d) => `
    <div class="lo lo-vict">
      ${clip(d, 'fill')}
      <div class="vc-rays"></div>
      <div class="scrim-b"></div>

      <div class="vc-banner a-sweep">
        <div class="vc-place">#1</div>
        <div class="vc-btx">
          <span>${esc(d.copy.kicker)}</span>
          <h1>${esc(d.user.name)}</h1>
        </div>
        ${av(d, 96)}
      </div>

      <div class="vc-stats">
        ${d.user.followers != null ? `<div class="vc-st a-pop d1"><b data-count="${d.user.followers}">0</b><span>FOLLOWERS</span></div>` : ''}
        ${d.clip ? `<div class="vc-st a-pop d2"><b data-count="${d.clip.views}">0</b><span>CLIP VIEWS</span></div>` : ''}
        ${d.user.created ? `<div class="vc-st a-pop d3"><b class="sm">${esc(d.user.created)}</b><span>JOINED</span></div>` : ''}
      </div>

      <div class="vc-foot a-up d4">
        <div class="vc-credit">${credit(d, 'line')}</div>
        <div class="vc-url">${esc(d.user.url)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 55. BLOCK WORLD ---------- */
  add({
    id: 'blockworld', label: 'Block World', group: 'Gaming',
    blurb: 'Voxel sandbox UI - grass-block frame, hotbar slots, hearts and a pixel font.',
    html: (d) => `
    <div class="lo lo-block">
      <div class="bw-sky"></div>
      <div class="bw-clouds"></div>
      <div class="bw-frame a-pop">
        <div class="bw-screen">${clip(d)}</div>
      </div>

      <div class="bw-plate a-up d1">
        <div class="bw-head">
          <div class="bw-skin">${av(d, 84)}</div>
          <div>
            <div class="bw-kick">${esc(d.copy.kicker)}</div>
            <h1>${esc(d.user.name)}</h1>
          </div>
        </div>
        <div class="bw-hearts">
          ${Array.from({ length: 10 }, (_, i) =>
            `<i style="animation-delay:${i * 0.06}s"></i>`).join('')}
        </div>
        <div class="bw-hotbar">
          ${d.user.followers != null ? `<div class="bw-slot"><b>${n(d.user.followers)}</b><span>FOLLOWERS</span></div>` : ''}
          ${d.user.game ? `<div class="bw-slot"><b>${esc(d.user.game)}</b><span>PLAYING</span></div>` : ''}
          ${d.user.created ? `<div class="bw-slot"><b>${esc(d.user.created)}</b><span>JOINED</span></div>` : ''}
        </div>
        <div class="bw-credit">${credit(d, 'micro')}</div>
        <div class="bw-url">${esc(d.user.url)}</div>
      </div>
      <div class="bw-ground"></div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 56. ACHIEVEMENT UNLOCKED ---------- */
  add({
    id: 'achievement', label: 'Achievement', group: 'Gaming',
    blurb: 'Console achievement toast that slides in, chimes open and shows gamerscore.',
    html: (d) => `
    <div class="lo lo-ach">
      ${clip(d, 'fill')}
      <div class="scrim-b"></div>

      <div class="ac-toast a-toast">
        <div class="ac-burst"></div>
        <div class="ac-badge">${av(d, 96)}</div>
        <div class="ac-tx">
          <div class="ac-title">ACHIEVEMENT UNLOCKED</div>
          <h1>${esc(d.user.name)}</h1>
          <div class="ac-sub">${esc(d.copy.kicker)}</div>
        </div>
        <div class="ac-score">
          <b data-count="${d.user.followers != null ? d.user.followers : 0}">0</b>
          <span>G</span>
        </div>
      </div>

      <div class="ac-bar a-up d2">
        <div class="ac-prog"><i></i></div>
        <div class="ac-rows">
          ${d.user.game ? `<span><b>PLAYING</b> ${esc(d.user.game)}</span>` : ''}
          ${d.user.created ? `<span><b>JOINED</b> ${esc(d.user.created)}</span>` : ''}
          <span><b>CLIP</b> ${esc(d.clip ? d.clip.title : d.user.title)}</span>
        </div>
        <div class="ac-credit">${credit(d, 'micro')}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 57. CONSOLE DASH ---------- */
  add({
    id: 'consoledash', label: 'Console Dash', group: 'Gaming',
    blurb: 'Modern console dashboard - big tile, blade accents, trophy row, gamertag chip.',
    html: (d) => `
    <div class="lo lo-dash">
      <div class="cd-bg"></div>
      <div class="cd-glow"></div>

      <div class="cd-tag a-inl">
        ${av(d, 76)}
        <div>
          <b>${esc(d.user.name)}</b>
          <span>${esc(d.user.url)}</span>
        </div>
        ${d.user.live ? '<i class="cd-live">ONLINE</i>' : ''}
      </div>

      <div class="cd-tile a-tile">
        <div class="cd-shot">${clip(d)}</div>
        <div class="cd-meta">
          <div class="cd-kick">${esc(d.copy.kicker)}</div>
          <div class="cd-name">${esc(d.clip ? d.clip.title : d.user.title)}</div>
          <div class="cd-cred">${credit(d, 'micro')}</div>
        </div>
      </div>

      <div class="cd-side">
        ${d.user.followers != null ? `<div class="cd-card a-inr d1"><b data-count="${d.user.followers}">0</b><span>FOLLOWERS</span></div>` : ''}
        ${d.user.game ? `<div class="cd-card a-inr d2"><b class="sm">${esc(d.user.game)}</b><span>LAST PLAYED</span></div>` : ''}
        ${d.user.created ? `<div class="cd-card a-inr d3"><b class="sm">${esc(d.user.created)}</b><span>JOINED TWITCH</span></div>` : ''}
        <div class="cd-cta a-inr d4">${esc(d.copy.cta)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 58. SPEEDRUN TIMER ---------- */
  add({
    id: 'speedrun', label: 'Speedrun', group: 'Gaming',
    blurb: 'Splits panel with a running timer, gold splits and a personal-best delta.',
    html: (d) => {
      const rows = [];
      if (d.user.game) rows.push(['Category', esc(d.user.game), '-0:04', true]);
      if (d.user.followers != null) rows.push(['Followers', n(d.user.followers), '+0:02', false]);
      if (d.user.created) rows.push(['Joined Twitch', esc(d.user.created), '-0:11', true]);
      if (d.clip) rows.push(['Clip views', n(d.clip.views), '-0:07', true]);
      return `
    <div class="lo lo-speed">
      ${clip(d, 'fill')}
      <div class="sr-veil"></div>

      <div class="sr-panel a-inl">
        <div class="sr-head">
          ${av(d, 68)}
          <div>
            <div class="sr-kick">${esc(d.copy.kicker)}</div>
            <h1>${esc(d.user.name)}</h1>
          </div>
        </div>
        <div class="sr-splits">
          ${rows.map((r, i) => `<div class="sr-row a-slide" style="animation-delay:${0.2 + i * 0.09}s">
            <span class="sr-n">${r[0]}</span>
            <span class="sr-v">${r[1]}</span>
            <span class="sr-d ${r[3] ? 'gold' : 'lose'}">${r[2]}</span>
          </div>`).join('')}
        </div>
        <div class="sr-timer">
          <b class="sr-clock">0:00.0</b>
          <span>${esc(d.copy.cta)}</span>
        </div>
        <div class="sr-credit">${credit(d, 'micro')}</div>
        <div class="sr-url">${esc(d.user.url)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`;
    },
  });

  /* ---------- 59. MMO QUEST ---------- */
  add({
    id: 'mmoquest', label: 'MMO Quest', group: 'Gaming',
    blurb: 'Quest-accepted panel - objectives tick in, XP bar fills, reward icons shimmer.',
    html: (d) => `
    <div class="lo lo-mmo">
      ${clip(d, 'fill')}
      <div class="mm-veil"></div>

      <div class="mm-panel a-unfold2">
        <div class="mm-corner tl"></div><div class="mm-corner tr"></div>
        <div class="mm-corner bl"></div><div class="mm-corner br"></div>

        <div class="mm-head">
          <div class="mm-excl">!</div>
          <div>
            <div class="mm-kick">QUEST ACCEPTED</div>
            <h1>${esc(d.user.name)}</h1>
          </div>
        </div>

        <div class="mm-obj">
          <div class="mm-o a-tick d1"><i></i>Watch the clip: <b>${esc(d.clip ? d.clip.title : d.user.title)}</b></div>
          ${d.user.game ? `<div class="mm-o a-tick d2"><i></i>Zone: <b>${esc(d.user.game)}</b></div>` : ''}
          ${d.user.created ? `<div class="mm-o a-tick d3"><i></i>Adventuring since <b>${esc(d.user.created)}</b></div>` : ''}
          <div class="mm-o a-tick d4"><i></i>${esc(d.copy.cta)}</div>
        </div>

        <div class="mm-xp">
          <div class="mm-xpbar"><i></i></div>
          <span>${d.user.followers != null ? n(d.user.followers) + ' FOLLOWERS' : 'REWARD'}</span>
        </div>

        <div class="mm-credit">${credit(d, 'micro')}</div>
        <div class="mm-url">${esc(d.user.url)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 60. FIGHTING GAME VS ---------- */
  add({
    id: 'versus', label: 'VS Screen', group: 'Gaming',
    blurb: 'Fighting-game versus card - angled portraits, health bars, a slamming VS badge.',
    html: (d) => `
    <div class="lo lo-vs">
      <div class="vs-bg">${clip(d, 'fill')}</div>
      <div class="vs-veil"></div>

      <div class="vs-left a-slamL">
        <div class="vs-port">${av(d, 240)}</div>
        <div class="vs-nm">
          <h1>${esc(d.user.name)}</h1>
          <div class="vs-sub">${esc(d.user.game || 'CHALLENGER')}</div>
        </div>
        <div class="vs-hp"><i style="--w:92%"></i></div>
      </div>

      <div class="vs-badge a-slamIn">VS</div>

      <div class="vs-right a-slamR">
        <div class="vs-stats">
          ${d.user.followers != null ? `<div><span>FOLLOWERS</span><b data-count="${d.user.followers}">0</b></div>` : ''}
          ${d.clip ? `<div><span>CLIP VIEWS</span><b data-count="${d.clip.views}">0</b></div>` : ''}
          ${d.user.created ? `<div><span>JOINED</span><b class="sm">${esc(d.user.created)}</b></div>` : ''}
        </div>
        <div class="vs-hp r"><i style="--w:64%"></i></div>
      </div>

      <div class="vs-foot a-up d4">
        <div class="vs-credit">${credit(d, 'line')}</div>
        <div class="vs-url">${esc(d.user.url)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 61. KART RACE ---------- */
  add({
    id: 'kartrace', label: 'Kart Race', group: 'Gaming',
    blurb: 'Arcade racer HUD - lap counter, position medal, item box and a boost streak.',
    html: (d) => `
    <div class="lo lo-kart">
      ${clip(d, 'fill')}
      <div class="kr-speed"></div>
      <div class="scrim-b"></div>

      <div class="kr-pos a-pop">
        <b>1</b><span>ST</span>
      </div>

      <div class="kr-lap a-dn">
        <span>LAP</span><b>3/3</b>
      </div>

      <div class="kr-item a-pop d2">
        <div class="kr-box">${av(d, 88)}</div>
      </div>

      <div class="kr-bar a-up d1">
        <div class="kr-nm">
          <div class="kr-kick">${esc(d.copy.kicker)}</div>
          <h1>${esc(d.user.name)}</h1>
        </div>
        <div class="kr-stats">
          ${d.user.followers != null ? `<div><b data-count="${d.user.followers}">0</b><span>FOLLOWERS</span></div>` : ''}
          ${d.user.game ? `<div><b class="sm">${esc(d.user.game)}</b><span>TRACK</span></div>` : ''}
          ${d.user.created ? `<div><b class="sm">${esc(d.user.created)}</b><span>JOINED</span></div>` : ''}
        </div>
        <div class="kr-url">${esc(d.user.url)}</div>
      </div>
      <div class="kr-credit a-up d3">${credit(d, 'line')}</div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 62. INITIATIVE TRACKER ---------- */
  add({
    id: 'initiative', label: 'Roll Initiative', group: 'Fantasy',
    blurb: 'A d20 tumbles in and lands on 20, then the initiative order builds row by row.',
    html: (d) => `
    <div class="lo lo-init">
      ${clip(d, 'fill')}
      <div class="in-veil"></div>

      <div class="in-die a-tumble">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <polygon points="50,3 93,27 93,73 50,97 7,73 7,27" class="in-d-body"/>
          <polygon points="50,3 93,27 50,50 7,27" class="in-d-top"/>
          <polygon points="50,50 93,27 93,73" class="in-d-r"/>
          <polygon points="50,50 7,27 7,73" class="in-d-l"/>
          <text x="50" y="72" class="in-d-num">20</text>
        </svg>
        <div class="in-nat a-pop d2">NATURAL 20</div>
      </div>

      <div class="in-panel">
        <div class="in-kick a-up d2">${esc(d.copy.kicker)}</div>
        <h1 class="a-up d3">${esc(d.user.name)}</h1>
        <div class="in-order">
          <div class="in-row lead a-slide" style="animation-delay:.5s">
            <span class="in-init">20</span>
            ${av(d, 52)}
            <b>${esc(d.user.name)}</b>
            <span class="in-tag">${d.user.followers != null ? n(d.user.followers) + ' followers' : 'the party'}</span>
          </div>
          <div class="in-row a-slide" style="animation-delay:.62s">
            <span class="in-init">14</span><i class="in-blank"></i>
            <b>${esc(d.user.game || 'The Peloton')}</b><span class="in-tag">chasing</span>
          </div>
          <div class="in-row a-slide" style="animation-delay:.74s">
            <span class="in-init">7</span><i class="in-blank"></i>
            <b>Everyone else</b><span class="in-tag">${esc(d.user.created ? 'joined ' + d.user.created : '')}</span>
          </div>
        </div>
        <div class="in-credit a-up d5">${credit(d, 'line')}</div>
        <div class="in-url a-up d6">${esc(d.user.url)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  /* ---------- 63. RIDE HUD ---------- */
  add({
    id: 'ridehud', label: 'Ride HUD', group: 'Cycling',
    blurb: 'Virtual-cycling HUD - corner data pods, rider list, sprint banner and lap arc.',
    html: (d) => `
    <div class="lo lo-ride">
      ${clip(d, 'fill')}

      <div class="rd-pod tl a-inl">
        <b data-count="${d.user.followers != null ? d.user.followers : 0}">0</b>
        <span>FOLLOWERS</span>
      </div>

      <div class="rd-top a-dn">
        <span class="rd-chip">${esc(d.user.game || 'TWITCH')}</span>
        <span class="rd-chip alt">${esc(d.user.created ? 'JOINED ' + d.user.created.toUpperCase() : '')}</span>
        ${liveTag(d)}
      </div>

      <div class="rd-list a-inr d1">
        <div class="rd-lh">RIDERS NEARBY</div>
        <div class="rd-r lead">${av(d, 34)}<b>${esc(d.user.name)}</b><span>+0:00</span></div>
        <div class="rd-r"><i></i><b>The Peloton</b><span>-0:14</span></div>
        <div class="rd-r"><i></i><b>Everyone else</b><span>-1:52</span></div>
      </div>

      <div class="rd-sprint a-sweep d2">
        <span>SPRINT</span>
        <b>${esc(d.copy.kicker)}</b>
      </div>

      <div class="rd-bar a-up d2">
        <div class="rd-av">${av(d, 78)}</div>
        <div class="rd-nm">
          <h1>${esc(d.user.name)}</h1>
          <div class="rd-credit">${credit(d, 'micro')}</div>
        </div>
        <div class="rd-url">${esc(d.user.url)}</div>
      </div>
      <div class="progress"><i></i></div>
    </div>`,
  });

  root.Layouts.ids = L.map((x) => x.id);
})(typeof window !== 'undefined' ? window : globalThis);
