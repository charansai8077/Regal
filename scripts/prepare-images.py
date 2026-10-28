"""
Prepares the office's renders and drawings for the website:
crops watermark banners, splits brochure / plan sheets into separate
images, and writes responsive WebP sizes to public/work/.

Usage: python3 scripts/prepare-images.py <folder with the original JPGs>
"""
import sys
from pathlib import Path
from PIL import Image

SRC = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / 'public' / 'work'
OUT.mkdir(parents=True, exist_ok=True)

def load(name):
    return Image.open(SRC / f'{name}-image.jpg').convert('RGB')

def patch_logo(im, box, shift):
    """Cover a corner logo with the same rows of sky further left."""
    x0, y0, x1, y1 = box
    im.paste(im.crop((x0 - shift, y0, x1 - shift, y1)), (x0, y0))
    return im

jobs = {
    # name: (source, crop box or None, optional fix)
    'twin-residences': ('7067c85c', None, None),
    'contemporary-residence': ('0b2de0ce', None, None),
    'brochure-acs-heights': ('bdcc371a', (640, 0, 1280, 568), None),
    'brochure-key-plan': ('bdcc371a', (0, 0, 268, 400), None),
    'brochure-specs': ('bdcc371a', (268, 10, 640, 460), None),
    'g1-residence-ganesha': ('6b065c3c', (0, 0, 1600, 1308), None),
    'white-villa-pergola': ('0db750a0', None, None),
    'geerish-villas': ('a7408428', None, None),
    'g3-apartments-ganesha': ('372aa338', None, None),
    'g2-residence-sunset': ('20750036', (0, 0, 1062, 848), None),
    'g5-apartments-night': ('1b67dd34', None, None),
    'plan-4-flats-iso': ('9e4a6f81', (612, 20, 1280, 500), None),
    'plan-4-flats': ('9e4a6f81', (210, 0, 640, 500), None),
    'acs-heights-option': ('c1b2e118', None, ('patch', (1372, 0, 1600, 108), 260)),
    'apartment-complex': ('b360f2f3', (16, 28, 648, 570), None),
    'apartment-interior-living': ('b360f2f3', (28, 584, 648, 800), None),
    'acs-heights-floor-plan': ('495f10ba', (14, 22, 640, 615), None),
    'acs-heights-isometric': ('495f10ba', (600, 74, 1232, 600), None),
    'acs-heights': ('69d22172', (8, 62, 1522, 1494), None),  # trims the white side margins
}

for name, (src, box, fix) in jobs.items():
    im = load(src)
    if fix and fix[0] == 'patch':
        im = patch_logo(im, fix[1], fix[2])
    if box:
        im = im.crop(box)
    for w in (1600, 800):
        if im.width < w and w != 800:
            continue  # do not upscale
        out = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        suffix = '' if w == 1600 else '-sm'
        out.save(OUT / f'{name}{suffix}.webp', 'WEBP', quality=82, method=6)
    if im.width < 1600:
        im.save(OUT / f'{name}.webp', 'WEBP', quality=82, method=6)
    print(name, im.size)

# ---- build sequence: the ACS Heights render plus a matching line drawing ----
from PIL import ImageFilter, ImageOps
import numpy as np

im = load('69d22172').crop((0, 62, 1530, 1494))  # measurements in Construction.tsx depend on this crop
im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
im.save(OUT / 'build-render.webp', 'WEBP', quality=84, method=6)
g = ImageOps.grayscale(im).filter(ImageFilter.GaussianBlur(1.1))
edges = np.asarray(g.filter(ImageFilter.FIND_EDGES)).astype(float)
edges = np.clip((edges - 7) * 9, 0, 255)  # keep architectural edges, drop texture noise
alpha = Image.fromarray(edges.astype('uint8')).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.5))
lines = Image.new('RGBA', im.size, (226, 236, 248, 0))
lines.putalpha(alpha)
lines.save(OUT / 'build-lines.webp', 'WEBP', quality=90, method=6)
print('build', im.size)
