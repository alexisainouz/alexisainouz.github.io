#!/usr/bin/env python3
"""Fabrique la vidéo de l'accueil à partir de la vidéo d'origine (source/).

    python3 source/make-hero.py idle  16.0 5.0     # boucle : début (s), durée (s)
    python3 source/make-hero.py clip   0.0 0.8 rev # plan simple, sans boucle (rev : à l'envers)

Ce que le script fait, dans l'ordre :
  1. HDR → SDR. L'iPhone filme en HDR (HLG, BT.2020). Lue telle quelle, l'image
     paraît délavée : c'est la moitié du « terne ». On la convertit proprement.
  2. Cadrage carré 760×760 autour de toi, réduit à 720×720.
  3. Le mur est recalé sur le bleu du site (--blue de assets/style.css), pour que
     la vidéo se fonde dans la page sans cassure. Seul le mur est touché : une
     peau ou une veste ne passent pas dans le masque.
  4. Pour une boucle : un fondu de 0,5 s efface le saut entre la dernière image
     et la première.
  5. Encodage mp4 (H.264) et webm (VP9), sans son, dans assets/.

Nécessite ffmpeg (avec zscale), Python 3 et numpy.
"""
import os, subprocess, sys
import numpy as np

SRC = "source/v2-alex-eats-a-croissant.mov"
CROP = (560, 320, 760)            # x, y, côté du carré pris dans le 1920×1080
OUT = 720                          # côté de la vidéo finale
FPS = 30000 / 1001
XFADE = 15                         # images de fondu pour la boucle (0,5 s)
SITE_BLUE = np.array([0x2b, 0x3b, 0xf0], np.float32) / 255   # --blue
SAT = 0.92                         # léger retrait de saturation (peau, veste)

TONEMAP = ("zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,"
           "tonemap=tonemap=hable:desat=0,"
           "zscale=t=bt709:m=bt709:r=pc,format=rgb24,"
           f"crop={CROP[2]}:{CROP[2]}:{CROP[0]}:{CROP[1]},scale={OUT}:{OUT}:flags=lanczos")


def decode(start, nframes):
    cmd = ["ffmpeg", "-v", "error", "-ss", str(start), "-i", SRC, "-an",
           "-vf", TONEMAP, "-frames:v", str(nframes), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, OUT, OUT, 3).astype(np.float32) / 255


def hsv(rgb):
    mx, mn = rgb.max(-1), rgb.min(-1)
    d = mx - mn
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    h = np.zeros_like(mx)
    dd = np.maximum(d, 1e-6)
    h = np.where(mx == r, ((g - b) / dd) % 6, h)
    h = np.where(mx == g, (b - r) / dd + 2, h)
    h = np.where(mx == b, (r - g) / dd + 4, h)
    return np.where(d > 0, h * 60, 0), s, mx


def smooth(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def wall_mask(rgb):
    h, s, v = hsv(rgb)
    return (smooth(h, 200, 215) * (1 - smooth(h, 275, 290))
            * smooth(s, 0.40, 0.60) * smooth(v, 0.25, 0.45))


def make_grader(ref):
    """Repeint le mur avec le bleu du site, en gardant ses nuances de lumière.

    Le bleu du mur est plus saturé que ce que le SDR sait afficher : à la conversion,
    son canal rouge est tronqué à zéro et ne contient plus que du bruit. On ne le
    corrige donc pas, on le remplace : bleu du site × (lumière du mur / lumière
    mesurée sur le bord droit). Le canal bleu, lui, est propre et sert de « lumière ».
    """
    m = wall_mask(ref)[:, -80:]
    bref = ref[:, -80:, 2][m > 0.9].mean()
    print("lumière du mur au bord droit", round(float(bref) * 255), file=sys.stderr)

    def grade(frames):
        out = np.empty_like(frames)
        for i, f in enumerate(frames):
            m = wall_mask(f)[..., None]
            grey = f.mean(-1, keepdims=True)
            f = grey + (f - grey) * SAT
            wall = np.clip(SITE_BLUE * (f[..., 2:3] / bref), 0, 1)
            out[i] = f * (1 - m) + wall * m
        return out
    return grade


def encode(frames, name):
    raw = (frames * 255 + 0.5).astype(np.uint8).tobytes()
    base = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
            "-s", f"{OUT}x{OUT}", "-r", str(FPS), "-i", "-", "-an",
            "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
            "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"]
    subprocess.run(base + ["-c:v", "libx264", "-preset", "veryslow", "-crf", "25",
                           "-profile:v", "high", "-movflags", "+faststart",
                           f"assets/{name}.mp4"], input=raw, check=True)
    subprocess.run(base + ["-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "36",
                           "-row-mt", "1", "-cpu-used", "0", f"assets/{name}.webm"],
                   input=raw, check=True)


def main():
    mode, start, dur = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
    n = round(dur * FPS)
    # Mesure du mur sur une image fixe, pour que tous les plans aient les mêmes couleurs.
    grade = make_grader(decode(18.0, 1)[0])
    if mode == "idle":
        frames = grade(decode(start, n + XFADE))
        out = frames[:n].copy()
        for i in range(XFADE):                      # fondu : fin de la source → début
            w = (i + 1) / (XFADE + 1)
            out[i] = (1 - w) * frames[n + i] + w * frames[i]
        name = "alex-idle"
    else:
        out = grade(decode(start, n))
        if "rev" in sys.argv[4:]:                   # lu à l'envers : finit sur la 1re image
            out = out[::-1].copy()
        name = "alex-smile"
    encode(out, name)
    png = os.environ.get("HERO_PNG")               # image fixe de la 1re image (facultatif)
    if png:
        from PIL import Image
        Image.fromarray((out[0] * 255 + 0.5).astype(np.uint8)).save(png)


if __name__ == "__main__":
    main()
