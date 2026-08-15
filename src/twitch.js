/* Clawmark — Twitch Shoutout Overlay for OBS
 * Created by Hardclaws · twitch.tv/hardclaws · thehardclaws@gmail.com
 * MIT licence. Free to use, modify and fork.
 */
/* =============================================================
   TWITCH — Helix REST + anonymous IRC chat listener.
   No build step, no dependencies.
   ============================================================= */
(function (root) {
  'use strict';

  const HELIX = 'https://api.twitch.tv/helix';

  /* ---------------- Helix client ---------------- */
  function Api(clientId, token) {
    const headers = { 'Client-Id': clientId, Authorization: 'Bearer ' + String(token || '').replace(/^oauth:/, '') };

    async function get(path, params) {
      const qs = new URLSearchParams(params || {}).toString();
      const res = await fetch(`${HELIX}${path}${qs ? '?' + qs : ''}`, { headers });
      if (res.status === 401) throw new Error('401 — access token invalid or expired');
      if (res.status === 429) throw new Error('429 — rate limited by Twitch');
      if (!res.ok) throw new Error(`${res.status} on ${path}`);
      return res.json();
    }

    return {
      get,

      async user(login) {
        const j = await get('/users', { login: String(login).toLowerCase() });
        return j.data && j.data[0] ? j.data[0] : null;
      },

      async channel(userId) {
        const j = await get('/channels', { broadcaster_id: userId });
        return j.data && j.data[0] ? j.data[0] : null;
      },

      async stream(userId) {
        const j = await get('/streams', { user_id: userId });
        return j.data && j.data[0] ? j.data[0] : null;
      },

      /* Followers: requires moderator:read:followers for the target channel.
         Almost always 401s for arbitrary channels — we swallow and return null
         so the layout can simply omit the stat. */
      async followers(userId) {
        try {
          const j = await get('/channels/followers', { broadcaster_id: userId, first: 1 });
          return typeof j.total === 'number' ? j.total : null;
        } catch (e) {
          return null;
        }
      },

      async game(gameId) {
        if (!gameId) return null;
        const j = await get('/games', { id: gameId });
        return j.data && j.data[0] ? j.data[0] : null;
      },

      /* clips, newest-first within an optional day window */
      async clips(userId, opts) {
        opts = opts || {};
        const p = { broadcaster_id: userId, first: 100 };
        if (opts.days && +opts.days > 0) {
          p.started_at = new Date(Date.now() - +opts.days * 864e5).toISOString();
          p.ended_at = new Date().toISOString();
        }
        const j = await get('/clips', p);
        return j.data || [];
      },

      /* post a chat message as the broadcaster (needs user:write:chat) */
      async say(broadcasterId, senderId, message) {
        const res = await fetch(`${HELIX}/chat/messages`, {
          method: 'POST',
          headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
          body: JSON.stringify({ broadcaster_id: broadcasterId, sender_id: senderId, message }),
        });
        return res.ok;
      },

      async validate() {
        const res = await fetch('https://id.twitch.tv/oauth2/validate', {
          headers: { Authorization: 'OAuth ' + String(token || '').replace(/^oauth:/, '') },
        });
        if (!res.ok) return null;
        return res.json(); // { login, user_id, scopes, client_id, expires_in }
      },
    };
  }

  /* ---------------- clip selection ---------------- */
  function pickClip(clips, opts) {
    opts = opts || {};
    let pool = clips.slice();
    if (!pool.length) return null;
    if (opts.preferFeatured) {
      const feat = pool.filter((c) => c.is_featured);
      if (feat.length) pool = feat;
    }
    if (opts.maxDuration) {
      const fits = pool.filter((c) => c.duration <= opts.maxDuration);
      if (fits.length) pool = fits;
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /* LEGACY: derive mp4 from an old-style clip thumbnail.
     Twitch migrated clip thumbnails to a new CDN path in 2024-25 that has no
     '-preview-' segment, so this now returns null for most clips. Kept only as a
     last-resort fallback for old clips still on the legacy CDN. Prefer Gql.clip(). */
  function clipMp4(clip) {
    if (!clip || !clip.thumbnail_url) return null;
    const i = clip.thumbnail_url.indexOf('-preview-');
    if (i === -1) return null;
    return clip.thumbnail_url.slice(0, i) + '.mp4';
  }

  /* ---------------- anonymous IRC chat ---------------- */
  function Chat(channel, handlers) {
    handlers = handlers || {};
    let ws = null, dead = false, retry = 0, keepalive = null;

    function connect() {
      if (dead) return;
      ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

      ws.onopen = () => {
        retry = 0;
        ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
        ws.send('PASS SCHMOOPIIE');
        ws.send('NICK justinfan' + Math.floor(Math.random() * 90000 + 10000));
        ws.send('JOIN #' + String(channel).toLowerCase());
        handlers.onOpen && handlers.onOpen();
        clearInterval(keepalive);
        keepalive = setInterval(() => { try { ws.send('PING'); } catch (e) {} }, 4 * 60000);
      };

      ws.onmessage = (ev) => {
        String(ev.data).split('\r\n').forEach((line) => {
          if (!line) return;
          if (line.startsWith('PING')) { ws.send('PONG :tmi.twitch.tv'); return; }
          const msg = parse(line);
          if (!msg) return;
          if (msg.command === 'PRIVMSG') { handlers.onMessage && handlers.onMessage(msg); return; }
          if (msg.command === 'USERNOTICE' && msg.tags['msg-id'] === 'raid') {
            handlers.onRaid && handlers.onRaid({
              login: (msg.tags['msg-param-login'] || msg.tags.login || '').toLowerCase(),
              displayName: msg.tags['msg-param-displayName'] || msg.tags['display-name'] || '',
              viewers: +(msg.tags['msg-param-viewerCount'] || 0),
            });
          }
        });
      };

      ws.onclose = () => {
        clearInterval(keepalive);
        handlers.onClose && handlers.onClose();
        if (dead) return;
        retry = Math.min(retry + 1, 6);
        setTimeout(connect, 1000 * Math.pow(2, retry)); // exponential backoff
      };

      ws.onerror = () => { try { ws.close(); } catch (e) {} };
    }

    /* IRCv3 tag-aware parser */
    function parse(line) {
      let tags = {}, rest = line;
      if (rest[0] === '@') {
        const sp = rest.indexOf(' ');
        rest.slice(1, sp).split(';').forEach((kv) => {
          const eq = kv.indexOf('=');
          tags[kv.slice(0, eq)] = kv.slice(eq + 1).replace(/\\s/g, ' ').replace(/\\:/g, ';').replace(/\\\\/g, '\\');
        });
        rest = rest.slice(sp + 1);
      }
      let prefix = '';
      if (rest[0] === ':') { const sp = rest.indexOf(' '); prefix = rest.slice(1, sp); rest = rest.slice(sp + 1); }
      const sp = rest.indexOf(' ');
      const command = sp === -1 ? rest : rest.slice(0, sp);
      let params = sp === -1 ? '' : rest.slice(sp + 1);
      const c = params.indexOf(':');
      const text = c === -1 ? '' : params.slice(c + 1);
      const badges = String(tags.badges || '');
      return {
        tags, command, text,
        user: (prefix.split('!')[0] || '').toLowerCase(),
        displayName: tags['display-name'] || prefix.split('!')[0] || '',
        isMod: tags.mod === '1' || badges.includes('moderator') || badges.includes('broadcaster'),
        isBroadcaster: badges.includes('broadcaster'),
        isVip: badges.includes('vip') || !!tags.vip,
        isSub: tags.subscriber === '1',
      };
    }

    connect();
    return { close() { dead = true; clearInterval(keepalive); try { ws.close(); } catch (e) {} } };
  }

  /* =============================================================
     PUBLIC GQL — no token, no Client ID from the user.
     Uses Twitch's own public web client id, exactly as the website does.
     This is what powers "no credentials required" mode, and it returns
     data Helix will not give you (follower counts for any channel).
     ============================================================= */
  const WEB_CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';

  function Gql() {
    async function call(query, variables) {
      const res = await fetch('https://gql.twitch.tv/gql', {
        method: 'POST',
        headers: { 'Client-Id': WEB_CLIENT_ID, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: variables || {} }),
      });
      if (!res.ok) throw new Error('GQL ' + res.status);
      const j = await res.json();
      if (j.errors && !j.data) throw new Error(j.errors[0] && j.errors[0].message || 'GQL error');
      return j.data;
    }

    const USER_Q = `query($login:String!,$limit:Int!,$period:ClipsPeriod!){
      user(login:$login){
        id login displayName description
        profileImageURL(width:300)
        createdAt
        roles{isPartner isAffiliate}
        followers{totalCount}
        stream{id title game{name}}
        lastBroadcast{title game{name}}
        clips(first:$limit criteria:{sort:VIEWS_DESC period:$period}){
          edges{node{
            slug title viewCount durationSeconds createdAt
            curator{displayName}
            game{name}
          }}
        }
      }
    }`;

    const CLIP_Q = `query($slug:ID!){
      clip(slug:$slug){
        playbackAccessToken(params:{platform:"web",playerBackend:"mediaplayer",playerType:"site"}){
          signature value
        }
        videoQualities{quality frameRate sourceURL}
      }
    }`;

    return {
      /* full profile + clip list in ONE request */
      async user(login, opts) {
        opts = opts || {};
        const days = +opts.days || 0;
        // GQL periods are coarse; map the day slider onto the nearest bucket
        const period = !days ? 'ALL_TIME'
          : days <= 1 ? 'LAST_DAY'
          : days <= 7 ? 'LAST_WEEK'
          : days <= 30 ? 'LAST_MONTH' : 'ALL_TIME';
        const d = await call(USER_Q, {
          login: String(login).toLowerCase(),
          limit: opts.limit || 30,
          period,
        });
        return d && d.user ? d.user : null;
      },

      /* look up a single clip by slug — used by !watchclip <url> */
      async clipInfo(slug) {
        const d = await call(`query($slug:ID!){clip(slug:$slug){
          slug title viewCount durationSeconds createdAt
          curator{displayName}
          broadcaster{login displayName description profileImageURL(width:300) createdAt
            roles{isPartner isAffiliate} followers{totalCount}
            stream{title game{name}} lastBroadcast{title game{name}}}
        }}`, { slug });
        return d && d.clip ? d.clip : null;
      },

      /* signed, directly-playable mp4 for a clip slug */
      async clipSource(slug, maxHeight) {
        const d = await call(CLIP_Q, { slug });
        const c = d && d.clip;
        if (!c || !c.videoQualities || !c.videoQualities.length) return null;
        const q = c.videoQualities
          .slice()
          .sort((a, b) => (+b.quality || 0) - (+a.quality || 0))
          .find((x) => !maxHeight || +x.quality <= maxHeight) || c.videoQualities[0];
        const t = c.playbackAccessToken;
        if (!q.sourceURL) return null;
        // unsigned URLs 401 on the CDN — the signature is mandatory
        if (!t || !t.signature) return q.sourceURL;
        return q.sourceURL + '?sig=' + encodeURIComponent(t.signature) +
               '&token=' + encodeURIComponent(t.value);
      },
    };
  }

  root.Twitch = { Api, Chat, Gql, pickClip, clipMp4, WEB_CLIENT_ID };
})(typeof window !== 'undefined' ? window : globalThis);
