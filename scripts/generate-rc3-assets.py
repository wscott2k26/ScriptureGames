#!/usr/bin/env python3
"""Generate deterministic original RC3 material textures and cinematic artwork.

The script intentionally uses only Pillow and the Python standard library so GitHub
Actions can recreate the exact binary assets from source. No remote assets, model
APIs, or proprietary fonts are required.
"""
from __future__ import annotations

from pathlib import Path
from random import Random
from math import sin, pi
import colorsys

from PIL import Image, ImageDraw, ImageFilter, ImageChops

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"
IMAGES = FRONTEND / "assets" / "images"
TEXTURES = FRONTEND / "assets" / "textures"

GOLD = (233, 188, 98)
GOLD_LIGHT = (255, 231, 166)
CYAN = (121, 210, 228)
MIDNIGHT = (5, 9, 20)
INK = (3, 6, 14)


def lerp(a: int, b: int, t: float) -> int:
    return round(a + (b - a) * t)


def gradient(size: tuple[int, int], stops: list[tuple[float, tuple[int, int, int]]], vertical: bool = True) -> Image.Image:
    w, h = size
    out = Image.new("RGB", size)
    px = out.load()
    length = h if vertical else w
    stops = sorted(stops)
    for i in range(length):
        p = i / max(1, length - 1)
        left, right = stops[0], stops[-1]
        for j in range(len(stops) - 1):
            if stops[j][0] <= p <= stops[j + 1][0]:
                left, right = stops[j], stops[j + 1]
                break
        span = max(1e-9, right[0] - left[0])
        t = (p - left[0]) / span
        c = tuple(lerp(left[1][k], right[1][k], t) for k in range(3))
        if vertical:
            for x in range(w):
                px[x, i] = c
        else:
            for y in range(h):
                px[i, y] = c
    return out


def add_noise(im: Image.Image, seed: int, opacity: int = 20, scale: int = 2) -> Image.Image:
    rng = Random(seed)
    w, h = im.size
    nw, nh = max(1, w // scale), max(1, h // scale)
    noise = Image.new("L", (nw, nh))
    noise.putdata([rng.randrange(256) for _ in range(nw * nh)])
    noise = noise.resize((w, h), Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(scale * 0.8))
    layer = Image.new("RGBA", (w, h), (255, 255, 255, 0))
    layer.putalpha(noise.point(lambda p: p * opacity // 255))
    return Image.alpha_composite(im.convert("RGBA"), layer)


def radial_glow(size: tuple[int, int], center: tuple[float, float], color: tuple[int, int, int], radius: float, alpha: int) -> Image.Image:
    w, h = size
    small = Image.new("L", (max(2, w // 5), max(2, h // 5)), 0)
    d = ImageDraw.Draw(small)
    cx, cy = int(center[0] * small.width), int(center[1] * small.height)
    rr = int(radius * max(small.size))
    d.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=alpha)
    mask = small.filter(ImageFilter.GaussianBlur(max(2, rr // 2))).resize(size, Image.Resampling.BICUBIC)
    layer = Image.new("RGBA", size, color + (0,))
    layer.putalpha(mask)
    return layer


def draw_stars(base: Image.Image, seed: int, count: int = 180) -> None:
    rng = Random(seed)
    d = ImageDraw.Draw(base, "RGBA")
    w, h = base.size
    for _ in range(count):
        x = rng.randint(0, w - 1)
        y = rng.randint(0, int(h * 0.78))
        r = rng.choice([1, 1, 1, 2, 2, 3])
        a = rng.randint(70, 220)
        c = GOLD_LIGHT if rng.random() < 0.18 else (220, 235, 255)
        d.ellipse((x-r, y-r, x+r, y+r), fill=c + (a,))
        if r >= 3:
            d.line((x-r*2, y, x+r*2, y), fill=c + (a//2,), width=1)
            d.line((x, y-r*2, x, y+r*2), fill=c + (a//2,), width=1)


def draw_mountains(base: Image.Image, seed: int, horizon: float = 0.66, layers: int = 4) -> None:
    rng = Random(seed)
    w, h = base.size
    d = ImageDraw.Draw(base, "RGBA")
    for layer in range(layers):
        y0 = int(h * (horizon + layer * 0.045))
        points = [(0, h)]
        x = -w * 0.08
        while x < w * 1.08:
            peak_x = x + rng.uniform(w * 0.08, w * 0.18)
            peak_y = y0 - rng.uniform(h * 0.10, h * 0.28) * (1 - layer * 0.12)
            valley_x = peak_x + rng.uniform(w * 0.06, w * 0.14)
            points.extend([(int(peak_x), int(peak_y)), (int(valley_x), y0 + rng.randint(-20, 30))])
            x = valley_x
        points.extend([(w, h), (0, h)])
        shade = (7 + layer*7, 12 + layer*8, 24 + layer*10, 255)
        d.polygon(points, fill=shade)
        if layer == 0:
            for px, py in points[1:-2:2]:
                d.polygon([(px, py), (px-40, py+100), (px+8, py+75)], fill=(255, 225, 160, 50))


def draw_arches(base: Image.Image, seed: int, y: float = 0.78) -> None:
    rng = Random(seed)
    w, h = base.size
    d = ImageDraw.Draw(base, "RGBA")
    for side in (-1, 1):
        x = int(w * (0.16 if side < 0 else 0.84))
        col = (21, 25, 36, 255)
        d.rectangle((x-30, int(h*y)-220, x+30, h), fill=col)
        d.rectangle((x-52, int(h*y)-238, x+52, int(h*y)-215), fill=(47, 37, 28, 255))
        d.rectangle((x-42, int(h*y)-260, x+42, int(h*y)-238), fill=(76, 54, 32, 255))
        for k in range(4):
            yy = int(h*y)-200+k*50
            d.line((x-25, yy, x+25, yy), fill=(233,188,98,50), width=2)
    d.arc((int(w*.16), int(h*.08), int(w*.84), int(h*.78)), 200, 340, fill=GOLD+(120,), width=4)
    d.arc((int(w*.21), int(h*.14), int(w*.79), int(h*.72)), 200, 340, fill=CYAN+(70,), width=2)


def draw_ark(base: Image.Image) -> None:
    w, h = base.size
    d = ImageDraw.Draw(base, "RGBA")
    y = int(h*.73)
    d.polygon([(int(w*.27), y), (int(w*.72), y), (int(w*.65), y+95), (int(w*.35), y+95)], fill=(12,15,20,255))
    d.rectangle((int(w*.42), y-120, int(w*.58), y), fill=(14,17,22,255))
    d.polygon([(int(w*.39), y-120), (int(w*.61), y-120), (int(w*.56), y-165), (int(w*.44), y-165)], fill=(21,23,26,255))
    d.line((int(w*.34), y+30, int(w*.66), y+30), fill=GOLD+(80,), width=3)


def draw_trees(base: Image.Image, seed: int) -> None:
    rng = Random(seed)
    w,h=base.size
    d=ImageDraw.Draw(base,"RGBA")
    for i in range(8):
        x=int((i+0.5)*w/8+rng.randint(-35,35))
        y=int(h*.75+rng.randint(-20,45))
        trunk=(28,22,17,255)
        d.rectangle((x-8,y-20,x+8,h),fill=trunk)
        for j in range(3):
            rr=45-j*7
            yy=y-45-j*32
            d.ellipse((x-rr,yy-rr,x+rr,yy+rr),fill=(5,30+8*j,25+5*j,255))


def cinematic_scene(size: tuple[int,int], seed: int, palette: str, motif: str) -> Image.Image:
    palettes = {
        "creation": [(0,(3,6,16)),(.42,(16,29,60)),(.72,(116,77,47)),(1,(7,12,24))],
        "garden": [(0,(3,14,24)),(.42,(10,66,58)),(.73,(114,91,54)),(1,(4,12,20))],
        "flood": [(0,(4,11,25)),(.46,(18,61,75)),(.78,(25,47,56)),(1,(3,8,15))],
        "covenant": [(0,(5,7,20)),(.42,(36,37,77)),(.73,(112,71,43)),(1,(5,9,18))],
        "desert": [(0,(7,9,24)),(.42,(63,46,59)),(.74,(166,102,48)),(1,(9,12,22))],
        "royal": [(0,(5,8,21)),(.42,(35,34,74)),(.72,(103,59,49)),(1,(7,10,19))],
    }
    base = gradient(size, palettes[palette]).convert("RGBA")
    base = Image.alpha_composite(base, radial_glow(size,(.5,.36),GOLD,.28,115))
    base = Image.alpha_composite(base, radial_glow(size,(.18,.27),CYAN,.24,65))
    draw_stars(base, seed, 220)
    if motif == "ark":
        draw_ark(base)
    elif motif == "garden":
        draw_trees(base, seed+7)
        draw_mountains(base, seed+13, .72, 2)
    elif motif == "pillars":
        draw_mountains(base,seed+1,.76,2)
        draw_arches(base,seed+2,.79)
    elif motif == "river":
        draw_mountains(base,seed+3,.67,3)
        d=ImageDraw.Draw(base,"RGBA")
        d.polygon([(int(size[0]*.43),size[1]),(int(size[0]*.49),int(size[1]*.58)),(int(size[0]*.55),int(size[1]*.58)),(int(size[0]*.68),size[1])],fill=(80,181,204,90))
    else:
        draw_mountains(base, seed+5, .68, 4)
    draw_arches(base, seed+100, .82)
    base = add_noise(base, seed+999, opacity=18, scale=3)
    # vignette
    mask=Image.new("L",size,0); md=ImageDraw.Draw(mask); md.ellipse((-size[0]*.2,-size[1]*.18,size[0]*1.2,size[1]*1.25),fill=235)
    mask=mask.filter(ImageFilter.GaussianBlur(int(min(size)*.16)))
    dark=Image.new("RGBA",size,(0,0,0,210)); dark.putalpha(ImageChops.invert(mask))
    base=Image.alpha_composite(base.convert("RGBA"),dark)
    return base.convert("RGB")


def make_texture(name: str, seed: int, palette: list[tuple[int,int,int]], caustic: bool=False) -> None:
    rng=Random(seed); size=(512,512)
    im=gradient(size,[(0,palette[0]),(.52,palette[1]),(1,palette[-1])],vertical=False).convert("RGBA")
    d=ImageDraw.Draw(im,"RGBA")
    for _ in range(900 if not caustic else 180):
        x,y=rng.randrange(512),rng.randrange(512)
        if caustic:
            r=rng.randrange(12,70)
            d.arc((x-r,y-r,x+r,y+r),rng.randrange(360),rng.randrange(360,720),fill=(210,245,255,rng.randrange(8,34)),width=rng.randrange(1,4))
        else:
            r=rng.choice([1,1,2,3,5,8])
            light=rng.choice([(255,255,255,rng.randrange(4,28)),(0,0,0,rng.randrange(4,32))])
            d.ellipse((x-r,y-r,x+r,y+r),fill=light)
    im=im.filter(ImageFilter.GaussianBlur(.55 if not caustic else 3.2))
    im=add_noise(im,seed+1,opacity=35 if not caustic else 12,scale=1)
    TEXTURES.mkdir(parents=True,exist_ok=True)
    im.save(TEXTURES/name,optimize=True)


def make_icon() -> None:
    size=(1024,1024)
    bg=gradient(size,[(0,(3,7,18)),(.6,(17,30,55)),(1,(4,9,20))]).convert("RGBA")
    bg=Image.alpha_composite(bg,radial_glow(size,(.5,.42),GOLD,.34,130))
    d=ImageDraw.Draw(bg,"RGBA")
    for radius,a in [(340,70),(285,100),(235,130)]:
        d.ellipse((512-radius,512-radius,512+radius,512+radius),outline=GOLD+(a,),width=8)
    # shield + open book flame mark
    d.polygon([(512,220),(730,310),(690,655),(512,825),(334,655),(294,310)],fill=(8,14,28,235),outline=GOLD_LIGHT+(230,))
    d.polygon([(512,420),(390,360),(375,625),(512,690)],fill=(245,225,178,235))
    d.polygon([(512,420),(634,360),(649,625),(512,690)],fill=(255,237,193,235))
    d.line((512,420,512,690),fill=(133,84,27,220),width=8)
    d.polygon([(512,316),(468,408),(506,391),(486,470),(560,370),(526,385)],fill=(255,185,72,245))
    d.arc((250,165,774,765),205,335,fill=CYAN+(120,),width=7)
    bg=add_noise(bg,44,14,3)
    IMAGES.mkdir(parents=True,exist_ok=True)
    bg.convert("RGB").save(IMAGES/"icon.png",optimize=True)
    adaptive=Image.new("RGBA",size,(0,0,0,0)); adaptive.alpha_composite(bg.resize((820,820)),(102,102)); adaptive.save(IMAGES/"adaptive-icon.png",optimize=True)
    bg.resize((256,256),Image.Resampling.LANCZOS).save(IMAGES/"favicon.png",optimize=True)
    splash=Image.new("RGBA",(1200,900),(3,7,18,255)); icon=bg.resize((500,500),Image.Resampling.LANCZOS); splash.alpha_composite(icon,(350,160)); splash.save(IMAGES/"splash-image.png",optimize=True)


def main() -> None:
    make_texture("polished-gold.png",101,[(74,42,10),(225,171,68),(255,230,154)])
    make_texture("aged-bronze.png",102,[(48,25,12),(151,88,36),(211,151,80)])
    make_texture("obsidian-stone.png",103,[(5,8,15),(41,49,65),(91,101,120)])
    make_texture("carved-sandstone.png",104,[(64,37,22),(151,96,52),(218,180,120)])
    make_texture("glass-caustics.png",105,[(0,8,18),(13,46,72),(99,192,219)],caustic=True)
    make_icon()

    genesis_specs=[
        ("opening.jpg",201,"creation","pillars"),
        ("trial-01.jpg",202,"creation","mountains"),
        ("trial-02.jpg",203,"garden","garden"),
        ("trial-03.jpg",204,"desert","garden"),
        ("trial-04.jpg",205,"flood","ark"),
        ("trial-05.jpg",206,"covenant","pillars"),
        ("trial-06.jpg",207,"desert","mountains"),
        ("trial-07.jpg",208,"desert","river"),
        ("trial-08.jpg",209,"garden","garden"),
        ("trial-09.jpg",210,"royal","pillars"),
        ("trial-10.jpg",211,"covenant","mountains"),
    ]
    (IMAGES/"genesis").mkdir(parents=True,exist_ok=True)
    for name,seed,palette,motif in genesis_specs:
        cinematic_scene((1600,1000),seed,palette,motif).save(IMAGES/"genesis"/name,quality=91,optimize=True,progressive=True)

    story_palettes=["creation","garden","desert","flood","covenant","royal"]
    motifs=["mountains","garden","river","ark","pillars"]
    (IMAGES/"stories").mkdir(parents=True,exist_ok=True)
    for i in range(1,16):
        scene=cinematic_scene((1200,800),400+i,story_palettes[(i-1)%len(story_palettes)],motifs[(i-1)%len(motifs)])
        scene.save(IMAGES/"stories"/f"s{i}.jpg",quality=90,optimize=True,progressive=True)

    cinematic_scene((1200,800),710,"covenant","pillars").save(IMAGES/"app-image.png",quality=91,optimize=True)
    cinematic_scene((1200,800),711,"garden","river").save(IMAGES/"devotional.jpg",quality=91,optimize=True)
    cinematic_scene((1200,800),712,"creation","mountains").save(IMAGES/"story-placeholder.png",quality=91,optimize=True)
    print("Generated deterministic RC3 artwork and material textures.")


if __name__ == "__main__":
    main()
