# Using AI-generated images in the overlay

Short answer: **yes, and it works well - but not at shoutout time.**

Generate your artwork **once**, bake it into a transparent PNG, and ship it with the
overlay. Do *not* call an image API when a shoutout fires.

---

## Why not generate live?

| Problem | Detail |
|---|---|
| **Latency** | Image models take 3-20s. A shoutout must appear instantly - nobody waits 15s after `!so`. |
| **Cost** | Every `!so` becomes a paid API call. A busy raid night is hundreds of images. |
| **API keys in the URL** | An OBS browser-source URL is plain text. Putting an image-gen key in it means anyone who sees your scene collection has your key. |
| **Non-determinism** | The same prompt gives different art each time. Your overlay would look different every shoutout. |
| **Failure mode** | API down or rate-limited = broken overlay mid-stream. |
| **URL length** | A 200KB image is ~266KB of base64 - far past what an OBS URL field handles. Measured: even 50KB becomes 66KB of URL. |

The overlay stays **zero-dependency and offline-capable**, which is the whole reason it
needs no token. Live generation would throw that away.

---

## The workflow that does work

### 1. Generate

Use any image model - ChatGPT/DALL·E, Midjourney, Stable Diffusion, Firefly.
Three asset types are useful:

**Emblem / badge** - a crest, logo or motif
```
A heraldic emblem combining a bicycle chainring cog with a medieval shield
crest, aged gold and deep burgundy, centred on a pure black background,
symmetrical, clean engraved detail, circular composition.
No text, no lettering, no words.
```

**Backplate** - the surface your info sits on
```
An ornate aged parchment banner with rolled edges and gold filigree corners,
on a pure black background. The centre is clean and empty for text.
Wide 16:9 composition, banner in the lower third.
No text, no lettering, no words.
```

**Frame / flourish** - corner or border decoration
```
An ornate decorative corner flourish for a video frame border, illuminated
medieval manuscript style blended with bicycle chain links, gold and bronze
on a pure black background, top-left corner with scrollwork along the edges.
No text, no lettering, no words.
```

**Rules that matter:**
- Always say **"on a pure black background"** - it's what makes the knockout clean.
- Always say **"no text, no lettering, no words"** - models hallucinate garbled text.
- Ask for **"centre is clean and empty"** on backplates, or your text lands on busy detail.
- Say **"symmetrical"** for emblems; asymmetric ones look wrong when spun.

### 2. Bake

```bash
python tools/bake-asset.py my-emblem.png --out assets/emblem.png --max 900
```

This:
- **Flood-fills from the border** to remove the background. It does *not* key by
  brightness - that deletes dark artwork. (Found this the hard way: a maroon shield
  went see-through and the background bled straight through it.)
- Auto-crops to the artwork
- Resizes and palette-quantises

Measured results:

| Asset | Before | After |
|---|---|---|
| Emblem 1024² | 1828 KB | **258 KB** (86% smaller) |
| Backplate | 1501 KB | **94 KB** (94% smaller) |
| Corner flourish | 1243 KB | **76 KB** (94% smaller) |

Options:
```
--bg white      artwork was generated on white
--max 900       longest edge in px
--tol 42        background match tolerance (raise if edges are left behind)
--colors 96     palette size, 16-256
--no-quant      skip quantisation if you see banding
```

### 3. Use it

Drop the baked PNG in `assets/` and add it to your overlay URL:

```
overlay.html?layout=deck&skin=derailleur
  &asset=assets/emblem.png
  &backplate=assets/parchment.png
```

| Param | Effect |
|---|---|
| `asset` | Replaces the procedural ornament with your image |
| `backplate` | Draws an image behind the info block |

Both accept a relative path or a full URL. When `asset` is set, the procedural
generator steps aside.

> Paths are relative to wherever you serve the overlay from. If you host on GitHub
> Pages, commit the assets and they just work.

---

## Where AI images beat the procedural generator

The built-in generator (`src/ornaments.js`) draws **abstract emblems** from your words -
cogs, clusters, ridges, gauges. It's instant, offline, deterministic and weightless.

It cannot draw a lion holding a cog. AI can.

| | Procedural | AI image |
|---|---|---|
| Speed | instant | 3-20s, once |
| Size | ~2 KB of SVG | 76-260 KB |
| Offline | yes | after baking, yes |
| Recolours with theme | yes | no, colours are baked in |
| Scales to any size | yes, vector | raster, fixed |
| Illustrative detail | no | yes |

**Use procedural** for the ornament that spins behind every shoutout - it recolours with
your theme automatically.
**Use AI** for a signature crest, a parchment backplate, or a border treatment where you
want real illustration.

They compose: keep the procedural cog spinning *and* add an AI backplate.

---

## A caution on theme colours

AI assets have their colours baked in, so they won't follow your theme. If you switch from
the parchment skin to Neon City, a gold crest will look out of place. Either:

- generate a variant per theme you actually use, or
- keep AI assets neutral (gold/bronze/monochrome read fine against most skins), or
- use them only with the one skin they were designed for.

---

## Licensing

Check the terms of whichever model you use before publishing to a public repo. Most
allow commercial use of outputs, but some restrict redistribution. The examples in
`assets/ai-examples/` are illustrative - regenerate your own for anything you ship.
