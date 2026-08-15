#!/usr/bin/env python3
"""Audit every layout by MEASURING PIXELS, not by guessing from the DOM.

Method: the clip is painted flat magenta and everything else is left alone.
We screenshot, then count how many of those magenta pixels actually survive
to the final image. Anything drawn over the video - a panel, a glow, a scan
line, a gradient wash - eats magenta, and the loss is the real coverage.
A DOM-walking version of this check reported false positives on masked
decorations and false negatives on blend modes; pixels do not lie.

Also reports:
  - content overflowing the 1920x1080 canvas
  - clip windows far from 16:9 (i.e. the picture is being cropped)
  - empty renders (a JS error inside a layout)

Usage:  python3 serve.py 8080
        python3 tools/audit-layouts.py [--bg none|panels|full] [--only id,id]
"""
import sys, io
from playwright.sync_api import sync_playwright

try:
    from PIL import Image
except ImportError:
    sys.exit("needs pillow:  pip install pillow")

BASE = "http://localhost:8080"
BG = "none"
ONLY = None
if "--bg" in sys.argv:   BG = sys.argv[sys.argv.index("--bg") + 1]
if "--only" in sys.argv: ONLY = sys.argv[sys.argv.index("--only") + 1].split(",")

MAGENTA = (255, 0, 255)

# paint the clip flat magenta and freeze animation so the shot is deterministic
PAINT = r"""
() => {
  const lo = document.querySelector('#stage .lo');
  if (!lo) return null;
  const BG_WRAP = '.fbg,.bgblur,.gbleed,.rbg,.nbg,.pbg,.ch-bg,.ho-bg,.pa-bg,.vs-bg,.rc-bgclip';
  const clips = [...lo.querySelectorAll('video, .democlip, .clipfallback')];
  const el = clips.find(c => !c.closest(BG_WRAP)) || clips[0];
  if (!el) return null;
  /* Record any deliberate colour treatment BEFORE we neutralise it. A
     newspaper photo is grayscale(1) on purpose; without this the probe
     colour turns grey and the layout is wrongly flagged as "clip hidden". */
  const styled = getComputedStyle(el).filter !== 'none' ? getComputedStyle(el).filter : null;
  el.innerHTML = '';
  el.style.setProperty('background', 'rgb(255,0,255)', 'important');
  el.style.setProperty('background-image', 'none', 'important');
  el.style.setProperty('filter', 'none', 'important');
  el.style.setProperty('opacity', '1', 'important');
  const r = el.getBoundingClientRect();
  /* getBoundingClientRect returns the AXIS-ALIGNED box, which is inflated for
     any rotated element (a taped-up photo, a tilted card). Using it directly
     reported a true 16:9 window as 1.67 and claimed 13% of the clip was
     hidden, when the "missing" pixels were just empty corners outside the
     rotated rectangle. Report the element's own untransformed size, and flag
     rotation so the pixel scorer can allow for the corners. */
  /* the rotation is usually on an ANCESTOR (the tilted card, not the photo),
     so walk up rather than only checking the element itself */
  let rot = false;
  for (let n = el; n && n.classList && !n.classList.contains('lo'); n = n.parentElement) {
    const t = getComputedStyle(n).transform;
    if (t && t !== 'none' && /matrix/.test(t)) {
      const m = t.match(/matrix\(([^)]+)\)/);
      if (m) { const p = m[1].split(',').map(Number);
               if (Math.abs(p[1]) > 0.004 || Math.abs(p[2]) > 0.004) rot = true; }
    }
  }
  return {x:r.x, y:r.y, w:r.width, h:r.height, styled, rot,
          ow:el.offsetWidth, oh:el.offsetHeight};
}
"""

# is the clip window a circle/ellipse? then its corners are meant to be empty
ROUNDJS = r"""
() => {
  const lo = document.querySelector('#stage .lo');
  const BG_WRAP = '.fbg,.bgblur,.gbleed,.rbg,.nbg,.pbg,.ch-bg,.ho-bg,.pa-bg,.vs-bg,.rc-bgclip';
  const clips = [...lo.querySelectorAll('video, .democlip, .clipfallback')];
  const el = clips.find(c => !c.closest(BG_WRAP)) || clips[0];
  for (let p = el; p && p.classList && !p.classList.contains('lo'); p = p.parentElement) {
    const r = getComputedStyle(p).borderRadius;
    if (/50%/.test(r)) return true;
  }
  return false;
}
"""

OVERFLOW = r"""
() => {
  const lo = document.querySelector('#stage .lo');
  if (!lo) return [];
  const out = [];
  for (const el of lo.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (cs.display==='none'||cs.visibility==='hidden'||parseFloat(cs.opacity)<0.1) continue;
    if (!el.textContent.trim() && !/^(IMG|VIDEO)$/.test(el.tagName)) continue;
    const r = el.getBoundingClientRect();
    if (r.width<2||r.height<2) continue;
    /* an element inside an overflow:hidden ancestor cannot actually spill */
    let clipped=false;
    for (let p=el.parentElement; p && p!==document.body; p=p.parentElement) {
      const pc=getComputedStyle(p);
      if (pc.overflow!=='visible'||pc.contain.includes('paint')) {clipped=true;break;}
    }
    if (clipped) continue;
    const over = Math.max(0,-r.x)+Math.max(0,r.right-1920)+Math.max(0,-r.y)+Math.max(0,r.bottom-1080);
    if (over > 14) {
      const cls=String(el.className.baseVal!==undefined?el.className.baseVal:el.className).slice(0,30);
      out.push({cls: cls||el.tagName, px: Math.round(over)});
    }
    if (el.children.length===0 && el.textContent.trim().length>2
        && el.scrollHeight > el.clientHeight+6 && cs.overflow!=='visible'
        && !/^\d+$/.test(cs.webkitLineClamp))
      out.push({cls:'text-clipped:'+String(el.className).slice(0,22), px:el.scrollHeight-el.clientHeight});
  }
  return out;
}
"""

def survive(png, box):
    """Two numbers for the clip rectangle:
         through - magenta hue still discernible (r and b both clearly above g).
                   A scan line, sepia wash or CRT tint dims magenta but does not
                   destroy the hue, so stylistic texture counts as still visible.
         pure    - untouched magenta. The gap between the two is how heavily the
                   layout is filtering its own video.
       Only `through` is used to flag occlusion; treating a deliberate VHS tint
       as "the clip is hidden" produced a page of false alarms."""
    im = Image.open(io.BytesIO(png)).convert("RGB")
    x, y = max(0, int(box["x"])), max(0, int(box["y"]))
    w, h = int(box["w"]), int(box["h"])
    crop = im.crop((x, y, min(1920, x + w), min(1080, y + h)))
    if crop.width < 4 or crop.height < 4: return 0.0, 0.0
    crop = crop.resize((min(240, crop.width), min(140, crop.height)))
    px = crop.load()
    through = pure = tot = 0
    cx, cy = crop.width / 2, crop.height / 2
    for j in range(crop.height):
        for i in range(crop.width):
            if box.get("round"):
                dx = (i - cx) / cx; dy = (j - cy) / cy
                if dx * dx + dy * dy > 0.93: continue   # outside the circle
            r, g, b = px[i, j]
            tot += 1
            if r > 232 and g < 26 and b > 232: pure += 1
            # magenta hue: both ends of the spectrum beat the middle by a margin
            if r > g + 28 and b > g + 28 and (r + b) > 90: through += 1
    if not tot: return 0.0, 0.0
    return through / tot * 100, pure / tot * 100

def main():
    bad = 0
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={"width": 1920, "height": 1080})
        pg.goto(f"{BASE}/overlay.html?demo=1&test=demo&mute=1&layout=banner")
        pg.wait_for_timeout(500)
        lays = pg.evaluate("() => Layouts.all.map(l=>({id:l.id,group:l.group}))")
        if ONLY: lays = [l for l in lays if l["id"] in ONLY]
        print(f"pixel audit of {len(lays)} layouts at bg={BG}")
        print("visible% = how much of the clip actually reaches the screen\n")
        print(f"{'id':15}{'group':13}{'visible%':>9}{'aspect':>8}{'area%':>7}  issues")
        for l in lays:
            pg.goto(f"{BASE}/overlay.html?demo=1&test=demo&mute=1&layout={l['id']}&bg={BG}")
            pg.wait_for_timeout(1700)
            box = pg.evaluate(PAINT)
            if box: box["round"] = pg.evaluate(ROUNDJS)
            if box is None:
                # the Corner Bug layout deliberately shows no clip
                intentional = l["id"] == "bug"
                tag = "no clip by design" if intentional else "** EMPTY RENDER **"
                print(f"{l['id']:15}{l['group'][:12]:13}  {tag}")
                if not intentional: bad += 1
                continue
            pg.wait_for_timeout(120)
            vis, pure = survive(pg.screenshot(), box)
            ov = sorted(pg.evaluate(OVERFLOW), key=lambda x: -x["px"])[:3]
            aw = box.get("ow") or box["w"]
            ah = box.get("oh") or box["h"]
            aspect = round(aw / ah, 2) if ah else 0
            area = round(box["w"] * box["h"] / (1920 * 1080) * 100, 1)
            issues = []
            note = ""
            styled = box.get("styled")
            if styled:
                note = f"styled: {styled.split('(')[0]}"
            # a rotated window legitimately leaves its bounding-box corners bare
            floor = 78 if box.get("rot") else 90
            if vis < floor and not styled:
                issues.append(f"CLIP OBSCURED, only {vis:.0f}% visible")
            elif pure < 55 and not styled:
                issues.append(f"heavy tint (pure {pure:.0f}%)")
            # A circular porthole is meant to be round - spotlight, brass
            # gauge, scrying orb, the Ring. `object-fit:cover` inside a circle
            # is the intended look, not a cropping bug.
            if abs(aspect - 1.778) > 0.30 and not box.get("round"):
                issues.append(f"aspect {aspect} (crops the picture)")
            elif box.get("round"):
                note = (note + ", " if note else "") + "round window"
            if area < 9: issues.append(f"clip only {area}% of frame")
            if ov: issues.append("overflow " + ", ".join(f"{o['cls']}+{o['px']}" for o in ov))
            if issues: bad += 1
            line = "; ".join(issues)
            if note: line = (line + "  " if line else "") + f"[{note}]"
            print(f"{l['id']:15}{l['group'][:12]:13}{vis:9.0f}{aspect:8}{area:7}  {line}")
        br.close()
    print(f"\n{bad} layouts with issues")
    return 1 if bad else 0

sys.exit(main())
