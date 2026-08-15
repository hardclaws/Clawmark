#!/usr/bin/env python3
"""Prove every layout is actually transparent on the default URL.

Screenshots with omit_background so the alpha channel is real, then reports
what fraction of the 1920x1080 frame is fully opaque. A layout that paints a
full-canvas background shows up as ~100% opaque and would appear in OBS as a
solid slab over the scene.

Usage:  python3 serve.py 8080  &&  python3 tools/check-transparency.py
"""
import sys, io
from playwright.sync_api import sync_playwright
from PIL import Image

BASE = "http://localhost:8080"
LIMIT = 82.0     # % opaque coverage above which a layout is a slab

def opaque_pct(png):
    im = Image.open(io.BytesIO(png)).convert("RGBA").resize((240, 135))
    a = im.split()[3]
    px = list(a.getdata())
    return sum(1 for v in px if v > 250) / len(px) * 100

def main():
    bad = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1920, "height": 1080})
        pg.goto(f"{BASE}/overlay.html?demo=1&test=demo&mute=1&layout=banner")
        pg.wait_for_timeout(500)
        ids = pg.evaluate("() => Layouts.all.map(l=>l.id)")
        print(f"checking {len(ids)} layouts on the DEFAULT url (no bg= param)\n")
        for i in ids:
            # deliberately no bg= : this is exactly what a user pastes into OBS
            # `demo=1` alone makes lo-bug paint a labelled preview backdrop so
            # the builder thumbnail is not an empty rectangle. That backdrop is
            # demo-only and never reaches OBS, so exclude it from this check.
            pg.goto(f"{BASE}/overlay.html?demo=1&test=demo&mute=1&nodemobg=1&layout={i}")
            pg.wait_for_timeout(1500)
            pct = opaque_pct(pg.screenshot(omit_background=True))
            flag = "  <-- SLAB" if pct > LIMIT else ""
            if pct > LIMIT: bad.append(i)
            print(f"  {i:15} {pct:5.1f}% opaque{flag}")
        b.close()
    print(f"\n{len(bad)} opaque: {', '.join(bad) if bad else 'none - all transparent'}")
    return 1 if bad else 0

sys.exit(main())
