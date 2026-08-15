#!/usr/bin/env python3
"""Clawmark — overlay parameter smoke test.

Every URL parameter the builder can emit, asserted against the rendered DOM.
A parameter that silently does nothing is the worst class of bug here: the
overlay still renders, so it looks fine, and you only notice on stream.

Usage:  python3 serve.py 8080  &&  python3 tools/smoke-overlay.py
"""
import sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8080/overlay.html"
DEMO = "demo=1&test=demo&mute=1"
fails, checks = [], 0


def check(name, ok, detail=""):
    global checks
    checks += 1
    print(f"  {'PASS' if ok else 'FAIL'}  {name}{('  — ' + detail) if detail else ''}")
    if not ok:
        fails.append(name)


def main():
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1920, "height": 1080})
        errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)[:200]))

        def go(q, wait=1500):
            pg.goto(f"{BASE}?{DEMO}&{q}")
            pg.wait_for_timeout(wait)

        print("\n== core ==")
        go("layout=banner")
        check("renders", pg.evaluate("()=>document.querySelectorAll('#stage .lo').length") == 1)
        check("138 layouts registered", pg.evaluate("()=>Layouts.all.length") == 138)

        print("\n== layout= ==")
        for lay, cls in [("banner", "lo-banner"), ("dragonfire", "lo-dfire"),
                         ("netrunner", "lo-net"), ("museum", "lo-museum")]:
            go(f"layout={lay}")
            check(f"layout={lay}", cls in pg.evaluate("()=>document.querySelector('#stage .lo').className"))

        print("\n== skin= ==")
        for skin, acc in [("hardclaws", "#1ffdff"), ("twitch-purple", None)]:
            go(f"layout=banner&skin={skin}")
            got = pg.evaluate("()=>getComputedStyle(document.documentElement)"
                              ".getPropertyValue('--accent').trim()")
            check(f"skin={skin}", got == acc if acc else bool(got), got)

        print("\n== bg= ==")
        for mode in ["none", "panels", "full"]:
            go(f"layout=banner&bg={mode}")
            check(f"bg={mode}", pg.evaluate("()=>document.documentElement.getAttribute('data-transparency')") == mode)
        go("layout=banner")
        check("bg defaults to panels",
              pg.evaluate("()=>document.documentElement.getAttribute('data-transparency')") == "panels")

        print("\n== videofit= ==")
        go("layout=banner&videofit=smart")
        box = pg.evaluate("""()=>{const c=document.querySelector('.lo > .clipwrap.fill,.lo > .clipvid.fill');
             const r=c.getBoundingClientRect();return [Math.round(r.x),Math.round(r.width)];}""")
        check("videofit=smart insets the clip", box[0] > 0 and box[1] < 1920, str(box))
        go("layout=banner&videofit=cover")
        box = pg.evaluate("""()=>{const c=document.querySelector('.lo > .clipwrap.fill,.lo > .clipvid.fill');
             const r=c.getBoundingClientRect();return [Math.round(r.x),Math.round(r.width)];}""")
        check("videofit=cover fills the frame", box[0] == 0 and box[1] == 1920, str(box))

        print("\n== credit= ==")
        go("layout=banner")
        check("credit off by default", not pg.evaluate("()=>!!document.querySelector('.creditbadge')"))
        go("layout=banner&credit=1")
        check("credit=1 shows the badge",
              pg.evaluate("()=>document.querySelector('.creditbadge')?.textContent") == "Clawmark by Hardclaws")
        go("layout=banner&credit=Custom%20Text")
        check("credit=<text> is honoured",
              pg.evaluate("()=>document.querySelector('.creditbadge')?.textContent") == "Custom Text")
        clash = pg.evaluate("""()=>{const bd=document.querySelector('.creditbadge').getBoundingClientRect();
             const c=document.querySelector('.lo > .clipwrap.fill,.lo > .clipvid.fill');
             if(!c) return 0; const r=c.getBoundingClientRect();
             return Math.round(Math.max(0,Math.min(bd.right,r.right)-Math.max(bd.x,r.x))*
                               Math.max(0,Math.min(bd.bottom,r.bottom)-Math.max(bd.y,r.y)));}""")
        check("badge never covers the clip", clash == 0, f"{clash}px overlap")

        print("\n== size= / textscale= ==")
        for sz, w in [("1280x720", 1280), ("960x540", 960), ("640x360", 640)]:
            go(f"layout=banner&size={sz}")
            check(f"size={sz}", pg.evaluate("()=>document.body.offsetWidth") == w)

        print("\n== copy overrides ==")
        # NB: not every layout has a kicker slot — Stat Band and Holo Card lead
        # with the clip title by design. Test one that does show it.
        go("layout=deck&kicker=CHECK%20THIS%20OUT")
        check("kicker=", "CHECK THIS OUT" in pg.evaluate("()=>document.body.innerText"))
        go("layout=deck&cta=Follow%20them%20now")
        check("cta=", "Follow them now" in pg.evaluate("()=>document.body.innerText"))

        print("\n== detail / backdrop / hold ==")
        go("layout=banner&detail=minimal")
        check("detail=minimal", "detail-minimal" in pg.evaluate("()=>document.querySelector('.lo').className"))
        go("layout=banner&backdrop=dim")
        check("backdrop=dim", "backdrop-dim" in pg.evaluate("()=>document.querySelector('.lo').className"))
        go("layout=banner&hold_info=short")
        check("hold_info=short", "hold-short" in pg.evaluate("()=>document.querySelector('.lo').className"))

        print("\n== pool= (random mix) ==")
        go("pool=banner,dragonfire,netrunner")
        cls = pg.evaluate("()=>document.querySelector('#stage .lo').className")
        check("pool= picks from the set", any(c in cls for c in ["lo-banner", "lo-dfire", "lo-net"]), cls)

        print("\n== sparse data ==")
        go("layout=banner&nodata=1")
        check("survives a channel with no bio/clip/followers",
              pg.evaluate("()=>document.querySelectorAll('#stage .lo').length") == 1)
        go("layout=dragonfire&noclip=1")
        check("survives a channel with no clips",
              pg.evaluate("()=>document.querySelectorAll('#stage .lo').length") == 1)

        print("\n== runtime ==")
        check("no JS errors across all of the above", not errors, str(errors[:3]))
        b.close()

    print(f"\n{checks - len(fails)}/{checks} passed")
    if fails:
        print("FAILED: " + ", ".join(fails))
    return 1 if fails else 0


sys.exit(main())
