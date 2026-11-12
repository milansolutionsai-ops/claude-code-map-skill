"""Annotate a screenshot: red circles, arrows and labels. Pillow only.
Requires Pillow: pip install pillow

python annotate.py in.png out.png --circle x,y,r --arrow x1,y1,x2,y2 --label x,y "text"
"""
import argparse
import math

from PIL import Image, ImageDraw, ImageFont

p = argparse.ArgumentParser()
p.add_argument("src")
p.add_argument("out")
p.add_argument("--circle", action="append", default=[], help="x,y,r")
p.add_argument("--arrow", action="append", default=[], help="x1,y1,x2,y2")
p.add_argument("--label", action="append", nargs=2, default=[], metavar=("x,y", "text"))
p.add_argument("--color", default="#E24B4A")
p.add_argument("--width", type=int, default=4)
a = p.parse_args()

im = Image.open(a.src).convert("RGB")
d = ImageDraw.Draw(im)
try:
    font = ImageFont.truetype("arial.ttf", 22)
except OSError:
    font = ImageFont.load_default()

for c in a.circle:
    x, y, r = map(float, c.split(","))
    d.ellipse([x - r, y - r, x + r, y + r], outline=a.color, width=a.width)
for s in a.arrow:
    x1, y1, x2, y2 = map(float, s.split(","))
    d.line([x1, y1, x2, y2], fill=a.color, width=a.width)
    ang = math.atan2(y2 - y1, x2 - x1)
    L = 14
    for da in (math.pi / 7, -math.pi / 7):
        d.line([x2, y2, x2 - L * math.cos(ang - da), y2 - L * math.sin(ang - da)], fill=a.color, width=a.width)
for xy, text in a.label:
    x, y = map(float, xy.split(","))
    box = d.textbbox((x, y), text, font=font)
    d.rectangle([box[0] - 6, box[1] - 4, box[2] + 6, box[3] + 4], fill="white", outline=a.color, width=2)
    d.text((x, y), text, fill=a.color, font=font)
im.save(a.out)
print(a.out)
