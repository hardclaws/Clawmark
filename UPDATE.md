# What to re-upload

You don't need the full 2.8 MB zip. **40 of the 78 files changed.**

Grab **`clawmark-update.zip`** (293 KB) instead - it contains only those 40, with the
folder structure preserved. Unzip it over your repo and every file lands in the right
place.

---

## The fastest route (GitHub web, no command line)

1. Unzip `clawmark-update.zip` somewhere
2. Go to your repo on GitHub
3. **Add file -> Upload files**
4. Drag in the unzipped **contents** (`index.html`, the `src` folder, etc.)
5. Commit

Files with the same name are overwritten automatically. Pages redeploys in about a minute.

> Drag the *contents*, not the outer folder - same trap as the first upload.

## With Git

```bash
# copy the update over your local clone, then:
git add .
git commit -m "Replace em-dashes with hyphens; add credit badge control"
git push
```

---

## If you'd rather do it by hand

**The 8 files that change what visitors see:**

| File | Why |
|---|---|
| `index.html` | Builder page + the new credit-badge control |
| `overlay.html` | The OBS browser source |
| `test.html` | Diagnostics page |
| `token.html` | Token helper |
| `README.md` | Your GitHub landing page |
| `GITHUB.md` | Deploy guide |
| `QUICKSTART.txt` | Quick start notes |
| `DEPLOY.md` | Older deploy notes |

**The 27 engine files** (`src/*.js`, `src/*.css`) - these hold the layouts, so text inside
a shoutout card comes from here. Upload the whole `src` folder and you're covered.

**The 5 you can skip** - `tools/*.py`, `docs/AI-ASSETS.md`, `serve.py`, `serve.sh`. These
are developer utilities and never reach your website.

---

## What actually changed

**1. Em-dashes -> hyphens.** All 480 of them, across 40 files. `Clawmark - Twitch Shoutout
Overlay` instead of `Clawmark — Twitch Shoutout Overlay`. Nothing else about the wording
moved.

**2. The credit-badge control** (this was only in `index.html`). It lives under
**Behaviour -> Credit badge**. Tick *"Show a small credit in the corner"* and a text box
appears if you want custom wording. Off by default.

---

## Verified

The update pack was tested by unzipping it over a copy of the previous release:

- Result is **byte-identical** to the current version
- That patched copy was then served and loaded: **138 layouts, 0 em-dashes, 0 JS errors**
- Builder smoke test **45/45**, overlay smoke test **30/30**
