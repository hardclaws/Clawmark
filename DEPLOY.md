# Putting this on GitHub Pages

The whole thing is static files, so GitHub Pages hosts it for free with no build step.
Once it's up you get a permanent URL you can paste straight into OBS on any machine.

---

## The short version

1. Create a **public** repo on GitHub
2. Upload these files
3. **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**
4. Wait ~1 minute, then open `https://YOURNAME.github.io/YOURREPO/`
5. Build your URL there and paste it into OBS

---

## Step by step (no command line)

### 1. Create the repo

- Go to <https://github.com/new>
- **Repository name:** `clawmark` (or anything)
- **Public** - Pages requires public on free accounts
- Don't tick "Add a README" (you already have one)
- **Create repository**

### 2. Upload the files

On the new empty repo page, click **uploading an existing file**.

Drag in the *contents* of the unzipped folder - `index.html`, `overlay.html`, the `src`
folder, and the rest. **Not** the outer folder itself, or everything ends up one level too
deep.

Your repo root should look like:

```
index.html
overlay.html
test.html
token.html
src/
docs/
README.md
```

Click **Commit changes**.

### 3. Turn on Pages

- **Settings** (top of the repo) → **Pages** (left sidebar)
- **Source:** Deploy from a branch
- **Branch:** `main`, folder `/ (root)`
- **Save**

Give it about a minute. The page will show your URL:

```
https://YOURNAME.github.io/clawmark/
```

### 4. Build your overlay URL

Open that address. It's the same builder you've been using locally. Pick a layout and
theme, then **Copy URL** - it will already point at your GitHub Pages address, e.g.

```
https://YOURNAME.github.io/clawmark/overlay.html?layout=racebib&skin=peloton&channel=yourname
```

Paste that into an OBS **Browser Source**.

---

## With the command line instead

```bash
cd clawmark          # the unzipped folder
git init
git add .
git commit -m "Shoutout overlay"
git branch -M main
git remote add origin https://github.com/YOURNAME/clawmark.git
git push -u origin main
```

Then do step 3 above.

To update later:

```bash
git add . && git commit -m "Tweak theme" && git push
```

Pages redeploys in under a minute.

---

## Things worth knowing

**Subpaths are handled.** A project site lives at `/YOURREPO/`, not the domain root. Every
path in this project is relative, so it works either way - tested by serving the whole
thing from a subdirectory.

**HTTPS is automatic**, which matters: browsers block some requests from `http://` pages,
and OBS is happier with `https`.

**No token needed** for normal use, so there's nothing secret in the repo. The overlay uses
Twitch's public API for profile, clips, follower counts and clip playback.

> **If you do use the "post in chat" feature**, your token ends up in the overlay URL. Don't
> commit that URL, don't paste it in a screenshot, and don't put it in the README. Keep the
> URL in OBS only. Anyone with the URL can post as you.

**Custom domain** - optional. Add a `CNAME` file containing your domain, then point a DNS
CNAME record at `YOURNAME.github.io`.

---

## Common problems

| Symptom | Cause |
|---|---|
| 404 on the Pages URL | Pages not enabled yet, or still deploying. Check Settings → Pages for a green tick. |
| Page loads but no layouts | Files were uploaded one folder too deep. `index.html` must be at the repo root. |
| Works locally, blank on Pages | Hard refresh (Ctrl+F5) - Pages caches aggressively for a few minutes. |
| Clips don't play | Test with `test.html` on the Pages URL. Usually an adblocker blocking the Twitch CDN. |
| Changes don't show | Pages can take a minute, and your browser caches. Hard refresh. |

---

## Keeping it private

Free GitHub Pages requires a public repo. If you'd rather not publish:

- **Run it locally** - `serve.bat` / `./serve.sh`, then use the `http://localhost:8080/...`
  URL in OBS. Works fine, but only on that machine and only while the server is running.
- **Netlify / Cloudflare Pages** - both have free tiers, both accept a drag-and-dropped
  folder, and both allow private sources.

The overlay itself is identical in all three cases.
