# Putting Clawmark on GitHub

**Clawmark** by Hardclaws · thehardclaws@gmail.com

Two things happen here:

1. Your code lives on GitHub (a **repository**)
2. GitHub serves it as a live website for free (**GitHub Pages**)

Once step 2 is done you get a permanent URL like
`https://hardclaws.github.io/clawmark/` that you paste straight into OBS -
on any PC, no local server, nothing to keep running.

Pick **Route A** (no command line) or **Route B** (Git). Route A is fine and
takes about five minutes.

---

# Route A - no command line

## 1. Make a GitHub account

Skip if you have one. Go to <https://github.com/signup>.
Your username becomes part of the URL, so `hardclaws` gives you
`hardclaws.github.io`.

## 2. Create the repository

- Go to <https://github.com/new>
- **Repository name:** `clawmark`
- **Description:** `A Twitch shoutout overlay for OBS - 138 hand-designed layouts`
- Select **Public** ← Pages needs this on a free account
- Do **not** tick "Add a README file" (there's already one in the zip)
- Click **Create repository**

## 3. Upload the files

You'll land on an empty repo page. Click the **uploading an existing file** link
(in the "…or upload files" line).

Now unzip `clawmark.zip` on your PC. Open the folder so you can see
`index.html`, `overlay.html`, `src`, and the rest.

> ### ⚠️ The one mistake everybody makes
> Drag in the **contents** of the folder, not the folder itself.
>
> ```
> ✅ CORRECT - repo root      ❌ WRONG - one level too deep
> index.html                  clawmark/
> overlay.html                    index.html
> src/                            overlay.html
> docs/                           src/
> README.md
> ```
>
> If the wrong version happens, your site will 404. Delete the files and
> re-upload - or just add `/clawmark` to the end of your URL.

Select everything inside the folder (`Ctrl+A`) and drag it onto the browser
window. Wait for all the files to finish listing - there are a few hundred, so
give it a moment.

Scroll down, type `Initial commit` in the message box, click **Commit changes**.

## 4. Turn on GitHub Pages

- Click **Settings** (top row of the repo)
- Click **Pages** in the left sidebar
- Under **Source**, choose **Deploy from a branch**
- **Branch:** `main`, folder `/ (root)`
- Click **Save**

Wait about a minute, then refresh. A green banner appears with your URL:

```
https://YOURNAME.github.io/clawmark/
```

## 5. Set the social preview image (optional, 30 seconds)

So links to your repo unfurl with the Clawmark card instead of a grey placeholder:

- **Settings → General → Social preview → Edit → Upload an image**
- Choose `assets/brand/social-preview.png` from the unzipped folder

## 6. Use it

Open that URL. It's the Clawmark builder, running live. Pick a layout, enter
your channel, copy the URL it generates, and paste that into an OBS
**Browser Source** at **1920 × 1080**.

Done. You never need the local `serve.py` again.

---

# Route B - with Git (command line)

If you'd rather use Git so future updates are one command:

```bash
# in the unzipped clawmark folder
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOURNAME/clawmark.git
git push -u origin main
```

Then do **step 4** above to switch Pages on.

To push changes later:

```bash
git add .
git commit -m "Tweaked the dragonfire layout"
git push
```

Pages redeploys automatically in under a minute.

> **On the password prompt:** GitHub stopped accepting account passwords over
> Git. When it asks, paste a **Personal Access Token** instead - make one at
> <https://github.com/settings/tokens> (classic, tick `repo`). Or install
> [GitHub Desktop](https://desktop.github.com/) and avoid the terminal entirely.

---

# After it's live

## Your OBS URL

The builder gives you the full thing, but it looks like this:

```
https://hardclaws.github.io/clawmark/overlay.html?channel=hardclaws&layout=dragonfire&bg=panels&videofit=smart
```

**OBS Browser Source settings:**

| Setting | Value |
|---|---|
| Width / Height | `1920` × `1080` |
| Shutdown source when not visible | ✅ ticked |
| Refresh browser when scene becomes active | ✅ ticked |
| Control audio via OBS | ✅ ticked (so clip audio hits your mixer) |

## Showing your credit on stream

In the builder: **Behaviour → Credit badge → "Show a small credit in the
corner"**. A text box appears if you want custom wording.

Or add `&credit=1` to the URL by hand. Off unless you ask for it.

## Updating later

**Route A:** repo → **Add file → Upload files** → drag the changed files in →
commit. Same-named files are overwritten.

**Route B:** `git add . && git commit -m "..." && git push`

Either way Pages rebuilds in about a minute. If you don't see the change,
hard-refresh with `Ctrl+Shift+R` - and in OBS, right-click the source and pick
**Refresh**.

---

# Troubleshooting

**404 when I open my Pages URL**
Files are probably one level too deep. Your repo root must show `index.html`
directly, not a folder containing it. Check by looking at the repo file list.

**Pages section is missing in Settings**
The repo is Private. Settings → General → scroll to the bottom → **Change
visibility → Public**.

**Site loads but the overlay is a grey box in OBS**
Your URL is missing `bg=panels`. Rebuild it from the builder - it always writes
that parameter now.

**Clips don't play**
Open `test.html` on your Pages URL - it runs diagnostics and tells you exactly
what's failing. No credentials needed.

**It worked locally but not on Pages**
Pages is HTTPS-only. If you hand-wrote a URL with `http://`, change it to
`https://`.

---

# Making it yours

Nothing here is locked. Some starting points:

- **Change the default layout** - `src/app.js`, the `layout:` line in `CFG`
- **Add a colour preset** - `src/skins.js`, copy an entry in the presets array
- **Write a new layout** - copy any block in `src/layouts10.js`; they're
  self-contained and only use theme tokens, so a new one works with every theme
- **Verify your changes** - `python3 tools/audit-layouts.py` checks the clip
  isn't covered and `python3 tools/check-transparency.py` proves it's still
  see-through in OBS

---

**Clawmark** - built by Hardclaws
[twitch.tv/hardclaws](https://twitch.tv/hardclaws) · thehardclaws@gmail.com
MIT licence: use it, change it, ship it.
