#!/usr/bin/env python3
"""Clawmark - clip playback resilience test.

Written after a report of clips showing a frozen first frame at random, then
working on the next shoutout. Cause: play() was called at readyState 0 and the
single retry fired immediately, so a cold CDN fetch failed twice; the second
shoutout worked because the file was then cached.

These cases assert the overlay recovers instead of stranding on a dead frame.

Usage:  python3 serve.py 8080  &&  python3 tools/test-clip-playback.py
"""
import sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8080"
fails, checks = [], 0


def check(name, ok, detail=""):
    global checks
    checks += 1
    print(f"  {'PASS' if ok else 'FAIL'}  {name}{('  - ' + detail) if detail else ''}")
    if not ok:
        fails.append(name)


def main():
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        ctx = b.new_context(viewport={"width": 1280, "height": 720})
        pg = ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:200]))

        print("\n== the retry logic itself ==")
        pg.goto(f"{BASE}/index.html")
        pg.wait_for_timeout(1200)

        # Build a real decodable clip in-browser.
        pg.evaluate("""async () => {
          const c=document.createElement('canvas'); c.width=320;c.height=180;
          const x=c.getContext('2d'); let i=0;
          const iv=setInterval(()=>{i++;x.fillStyle='#0c2336';x.fillRect(0,0,320,180);
            x.fillStyle='#1ffdff';x.fillRect((i*4)%280,70,40,40);},33);
          const rec=new MediaRecorder(c.captureStream(30),{mimeType:'video/webm'});
          const ch=[]; rec.ondataavailable=e=>ch.push(e.data); rec.start();
          await new Promise(r=>setTimeout(r,1200)); rec.stop();
          await new Promise(r=>rec.onstop=r); clearInterval(iv);
          window.__u = URL.createObjectURL(new Blob(ch,{type:'video/webm'}));
        }""")
        url = pg.evaluate("() => window.__u")

        # The shipped strategy, hammered with an interruption each time.
        NEW = """
        (url) => new Promise(resolve => {
          const v=document.createElement('video');
          v.src=url; v.autoplay=true; v.muted=true; v.playsInline=true;
          document.body.appendChild(v);
          let done=false, tries=0;
          const fin=r=>{if(!done){done=true;v.remove();resolve(r);}};
          v.addEventListener('playing',()=>fin('playing'));
          const attempt=()=>{ if(done||tries>6) return; tries++;
            const p=v.play(); if(p&&p.catch) p.catch(()=>setTimeout(attempt,120*tries)); };
          v.addEventListener('canplay',attempt);
          v.addEventListener('loadeddata',attempt);
          attempt();
          setTimeout(()=>v.load(),5);          // interrupt mid-flight
          setTimeout(()=>fin(v.paused?'FROZEN':'playing'),3000);
        })"""
        res = {}
        for _ in range(12):
            r = pg.evaluate(NEW, url)
            res[r] = res.get(r, 0) + 1
        check("recovers from interrupted play()", res.get("FROZEN", 0) == 0,
              f"playing={res.get('playing',0)} frozen={res.get('FROZEN',0)}")

        print("\n== overlay end-to-end ==")
        demo = "demo=1&test=demo&mute=1"

        pg.goto(f"{BASE}/overlay.html?{demo}&layout=banner")
        pg.wait_for_timeout(1600)
        check("demo clip renders", pg.evaluate(
            "()=>document.querySelectorAll('.democlip,.clipvid').length") > 0)

        # A clip whose duration is missing used to make the safety timeout
        # setTimeout(fn, NaN), which fires instantly and kills the shoutout.
        pg.goto(f"{BASE}/overlay.html?{demo}&layout=banner&max=0")
        pg.wait_for_timeout(1800)
        check("survives max=0 (no duration cap)",
              pg.evaluate("()=>document.querySelectorAll('#stage .lo').length") == 1)

        pg.goto(f"{BASE}/overlay.html?{demo}&layout=banner&noclip=1")
        pg.wait_for_timeout(1600)
        check("no-clip channel still shows the card",
              pg.evaluate("()=>document.querySelectorAll('#stage .lo').length") == 1)

        print("\n== the overlay still holds the card up ==")
        pg.goto(f"{BASE}/overlay.html?{demo}&layout=banner")
        pg.wait_for_timeout(1200)
        still_there = pg.evaluate("()=>document.querySelectorAll('#stage .lo').length")
        check("card is on screen 1.2s in (not dismissed early)", still_there == 1)

        check("no JS errors", not errs, str(errs[:3]))
        b.close()

    print(f"\n{checks - len(fails)}/{checks} passed")
    if fails:
        print("FAILED: " + ", ".join(fails))
    return 1 if fails else 0


sys.exit(main())
