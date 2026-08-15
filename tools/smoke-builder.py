#!/usr/bin/env python3
"""Clawmark — builder smoke test.

Clicks every interactive control in index.html and asserts it actually changed
something observable. Written after "Shuffle skin" appeared broken: the theme
WAS changing, but the label under the preview was frozen on the old preset
name, so it looked dead. Eyeballing missed it; asserting on state caught it.

Usage:  python3 serve.py 8080  &&  python3 tools/smoke-builder.py
"""
import sys, re
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8080"
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
        pg = b.new_page(viewport={"width": 1600, "height": 1060})
        errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)[:200]))
        bad_http = []
        pg.on("response", lambda r: bad_http.append(f"{r.status} {r.url.split('/')[-1]}")
              if r.status >= 400 else None)

        pg.goto(f"{BASE}/index.html")
        pg.wait_for_timeout(3000)

        url = lambda: pg.evaluate("()=>document.querySelector('#outurl,#out,textarea')?.value||''")
        st = lambda expr: pg.evaluate(f"()=>{expr}")
        click = lambda i: (pg.evaluate(f"()=>document.getElementById('{i}').click()"),
                           pg.wait_for_timeout(600))

        print("\n== load ==")
        check("138 layout tiles", pg.eval_on_selector_all("#lgrid .lopt", "e=>e.length") == 138)
        check("29 themes", st("Skins.PRESETS.length") == 29)
        check("no JS errors on load", not errors, str(errors[:2]))
        check("no 404s on load", not bad_http, str(bad_http[:3]))
        check("logo renders", st("(()=>{const i=document.querySelector('header img');"
                                 "return !!i&&i.naturalWidth>0})()"))

        print("\n== preview bar ==")
        base_lay, labels = st("S.layout"), []
        for _ in range(4):
            click("shuffle")
            labels.append(st("document.getElementById('pvinfo').textContent"))
        check("Random theme changes the label", len(set(labels)) > 1,
              f"{len(set(labels))} distinct")
        check("Random theme keeps the layout", st("S.layout") == base_lay)

        acc = st("S.custom.accent")
        lays = []
        for _ in range(4):
            click("randlayout")
            lays.append(st("S.layout"))
        check("Random layout changes the layout", len(set(lays)) > 1)
        check("Random layout keeps the theme", st("S.custom.accent") == acc)

        click("replay")
        check("Replay reloads the preview", "overlay.html" in st("document.querySelector('iframe').src"))

        print("\n== layout picking ==")
        pg.evaluate("()=>document.querySelector(\"#lgrid .lopt[data-id='dragonfire']\").click()")
        pg.wait_for_timeout(700)
        check("clicking a tile selects it", "layout=dragonfire" in url())
        check("selected tile is highlighted",
              st("document.querySelector(\"#lgrid .lopt[data-id='dragonfire']\").classList.contains('on')"))

        print("\n== theme picking ==")
        pg.evaluate("()=>{const p=document.querySelector(\"[data-id='hardclaws'].pal\");if(p)p.click()}")
        pg.wait_for_timeout(700)
        check("Hardclaws palette applies",
              st("S.theme.pal==='hardclaws'||S.skinId==='hardclaws'"),
              st("S.custom.accent"))

        print("\n== group quick-picks (random mix) ==")
        for bid, label in [("rScifi", "Sci-fi"), ("rHorror", "Horror"), ("rAnime", "Anime"),
                           ("rIRL", "Nature/sport/food"), ("rMedia", "Print/broadcast"),
                           ("rAllFantasy", "All fantasy"), ("rRetro", "Retro"),
                           ("rThemed", "Themed"), ("rAll", "Select all")]:
            click(bid)
            n = st("S.pool.length")
            check(f"{label} fills the pool", n > 0, f"{n} layouts")
        click("rNone")
        check("Clear empties the pool", st("S.pool.length") == 0)

        print("\n== behaviour controls ==")
        pg.select_option("#obg", "none"); pg.wait_for_timeout(500)
        check("Overlay background → Solid", "bg=none" in url())
        pg.select_option("#obg", "panels"); pg.wait_for_timeout(500)
        check("Overlay background → Transparent", "bg=panels" in url())

        pg.select_option("#ovfit", "cover"); pg.wait_for_timeout(500)
        check("Clip size → full screen", "videofit=cover" in url())
        pg.select_option("#ovfit", "smart"); pg.wait_for_timeout(500)
        check("Clip size → fit", "videofit=smart" in url())

        pg.select_option("#osize", "1280x720"); pg.wait_for_timeout(500)
        check("Browser source size", "size=1280x720" in url())
        pg.select_option("#osize", ""); pg.wait_for_timeout(400)

        pg.fill("#channel", "hardclaws"); pg.wait_for_timeout(600)
        check("Channel field reaches the URL", "channel=hardclaws" in url())
        pg.fill("#cmd", "shoutout"); pg.wait_for_timeout(600)
        check("Command field reaches the URL", "cmd=shoutout" in url())
        pg.fill("#cmd", "so"); pg.wait_for_timeout(400)

        for cid, param in [("progress", "progress"), ("raid", "raid")]:
            before = url()
            pg.evaluate(f"()=>document.getElementById('{cid}').click()")
            pg.wait_for_timeout(600)
            check(f"checkbox '{cid}' changes the URL", url() != before)

        print("\n== output ==")
        u = url()
        check("URL points at overlay.html", "overlay.html" in u)
        check("URL carries a layout", "layout=" in u)
        check("URL always states bg=", "bg=" in u)
        check("URL always states videofit=", "videofit=" in u)
        check("credit is NOT on by default", "credit=" not in u, u[-70:])

        print("\n== runtime ==")
        check("no JS errors after clicking everything", not errors, str(errors[:3]))
        real404 = [x for x in bad_http if "favicon" not in x]
        check("no broken requests", not real404, str(real404[:3]))

        b.close()

    print(f"\n{checks - len(fails)}/{checks} passed")
    if fails:
        print("FAILED: " + ", ".join(fails))
    return 1 if fails else 0


sys.exit(main())
