#!/usr/bin/env python3
"""
bake-asset.py - turn an AI-generated image into an overlay-ready asset.

AI image models return opaque rectangles. Overlays need transparent PNGs that
are small enough to load instantly in OBS. This does the conversion:

  1. Knock the black (or white) background out to alpha
  2. Auto-crop to the artwork's bounding box
  3. Resize to a sane maximum
  4. Quantise + optimise so the file is tens of KB, not megabytes

Usage:
    python tools/bake-asset.py input.png                     # black bg -> alpha
    python tools/bake-asset.py input.png --bg white
    python tools/bake-asset.py input.png --max 900 --out assets/emblem.png
    python tools/bake-asset.py assets/raw/*.png              # batch

Requires Pillow:  pip install pillow
"""
import argparse
import glob
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("This needs Pillow.  pip install pillow")


def knockout(im, bg="black", tol=42, feather=True):
    """Make the flat background transparent while preserving dark artwork.

    A naive luminance key deletes every dark pixel - which eats dark reds,
    navy, shadowed detail, anything that happens to be near-black. Instead we
    flood-fill inward from the image border, so only background that is
    actually CONNECTED to the edge is removed. Dark colours enclosed by the
    artwork survive at full opacity.
    """
    from PIL import ImageChops, ImageFilter
    from collections import deque

    im = im.convert("RGBA")
    w, h = im.size
    r, g, b, _ = im.split()

    if bg == "white":
        r, g, b = (ImageChops.invert(c) for c in (r, g, b))
    dist = ImageChops.lighter(ImageChops.lighter(r, g), b)
    dpx = dist.load()

    # --- flood fill from every border pixel that looks like background ---
    visited = bytearray(w * h)
    q = deque()

    def seed(x, y):
        i = y * w + x
        if not visited[i] and dpx[x, y] <= tol:
            visited[i] = 1
            q.append((x, y))

    for x in range(w):
        seed(x, 0); seed(x, h - 1)
    for y in range(h):
        seed(0, y); seed(w - 1, y)

    while q:
        x, y = q.popleft()
        for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
            if 0 <= nx < w and 0 <= ny < h:
                i = ny * w + nx
                if not visited[i] and dpx[nx, ny] <= tol:
                    visited[i] = 1
                    q.append((nx, ny))

    # binary mask: 0 = background, 255 = keep
    mask = Image.frombytes("L", (w, h), bytes(255 if not v else 0 for v in visited))

    if feather:
        # a 1px blur softens the cut edge without making the whole image translucent
        mask = mask.filter(ImageFilter.GaussianBlur(0.8))
        mask = mask.point(lambda v: 0 if v < 24 else (255 if v > 232 else v))

    out = Image.merge("RGBA", (*im.split()[:3], mask))
    return out


def autocrop(im, pad=8):
    bbox = im.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad); t = max(0, t - pad)
    r = min(im.width, r + pad); b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def bake(path, out=None, bg="black", maxdim=1000, tol=42, quant=True, colors=96):
    im = Image.open(path)
    before = os.path.getsize(path)

    im = knockout(im, bg=bg, tol=tol)
    im = autocrop(im)

    if max(im.size) > maxdim:
        im.thumbnail((maxdim, maxdim), Image.LANCZOS)

    if quant:
        # Palette mode with a real alpha index compresses far better than
        # RGBA. Zero out colour under transparent pixels first so the
        # quantiser doesn't waste palette entries on invisible data.
        alpha = im.getchannel("A")
        flat = Image.new("RGBA", im.size, (0, 0, 0, 0))
        flat.paste(im, (0, 0), alpha)
        im = flat.quantize(colors=colors, method=Image.FASTOCTREE)

    if out is None:
        base, _ = os.path.splitext(path)
        out = base + "-baked.png"
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    im.save(out, "PNG", optimize=True)

    after = os.path.getsize(out)
    print(f"  {os.path.basename(path)}")
    print(f"    -> {out}")
    print(f"    {im.size[0]}x{im.size[1]}  {before//1024}KB -> {after//1024}KB "
          f"({100 - after * 100 // max(1, before)}% smaller)")
    return out


def main():
    ap = argparse.ArgumentParser(description="Bake AI images into overlay assets.")
    ap.add_argument("inputs", nargs="+")
    ap.add_argument("--out", default=None, help="output path (single input only)")
    ap.add_argument("--bg", default="black", choices=["black", "white"])
    ap.add_argument("--max", type=int, default=1000, dest="maxdim")
    ap.add_argument("--tol", type=int, default=42, help="background match tolerance")
    ap.add_argument("--no-quant", action="store_true")
    ap.add_argument("--colors", type=int, default=96, help="palette size (16-256)")
    a = ap.parse_args()

    files = []
    for pattern in a.inputs:
        files.extend(glob.glob(pattern))
    if not files:
        sys.exit("No matching files.")
    if a.out and len(files) > 1:
        sys.exit("--out only works with a single input.")

    print(f"Baking {len(files)} asset(s)...")
    for f in files:
        bake(f, out=a.out, bg=a.bg, maxdim=a.maxdim, tol=a.tol, quant=not a.no_quant, colors=a.colors)
    print("Done.")


if __name__ == "__main__":
    main()
