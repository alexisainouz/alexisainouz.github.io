#!/usr/bin/env python3
"""Fabrique les vidéos de l'accueil à partir de l'export étalonné rangé dans source/.

    python3 source/make-hero.py

Pas de retouche de couleur : l'étalonnage se fait dans ton logiciel de montage, on
prend l'image telle quelle. Le script ne fait que :
  1. cadrer : on retire la partie gauche de l'image (néon, étagère) et on garde la
     droite, mur et frigo compris, sur toute la hauteur ;
  2. boucle  (alex-idle)  : un extrait, dont la fin est fondue dans le début sur
     0,5 s pour effacer le saut ;
  3. sourire (alex-smile) : les premières secondes de la prise, lues à l'envers pour
     finir sur le sourire ;
  4. image fixe (alex.jpg) : la première image de la boucle ;
  5. encodage mp4 (H.264) et webm (VP9), sans son, dans assets/.

Les réglages sont ci-dessous. Si tu changes de prise, retrouve l'extrait de boucle :
cherche deux moments où la posture est presque la même (la tête, le croissant).
Nécessite ffmpeg et ffprobe.
"""
import subprocess

SRC = "source/v3-alex-eats-a-croissant.m4v"
CUT_LEFT = 0.24        # part de la largeur retirée à gauche (le néon et sa lueur finissent vers 23 %)
LOOP_START = 14.0      # début de la boucle, en secondes
LOOP_LEN = 5.9         # durée de la boucle
FADE = 0.5             # fondu de raccord
SMILE_LEN = 0.8        # durée du plan sourire (lu à l'envers)
FPS = "30000/1001"


def probe():
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height", "-of", "csv=p=0", SRC],
        check=True, capture_output=True, text=True).stdout.strip()
    return map(int, out.split(","))


def crop_filter():
    w, h = probe()
    cw = round(w * (1 - CUT_LEFT) / 2) * 2      # dimensions paires, exigées par H.264
    cx = w - cw
    print(f"source {w}x{h} → cadrage {cw}x{h} (x={cx})")
    return f"crop={cw}:{h}:{cx}:0,fps={FPS},format=yuv420p,setpts=PTS-STARTPTS"


def run(args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def encode_args(name):
    return {
        "mp4": ["-c:v", "libx264", "-preset", "veryslow", "-crf", "26", "-profile:v", "high",
                "-movflags", "+faststart", f"assets/{name}.mp4"],
        "webm": ["-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "36", "-row-mt", "1",
                 "-cpu-used", "0", f"assets/{name}.webm"],
    }


def main():
    crop = crop_filter()
    tags = ["-an", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"]
    L, d = LOOP_LEN, FADE

    # Boucle : [fin fondue dans le début] suivi du corps. Longueur finale = L.
    loop = (f"[0:v]{crop},split=3[a][b][c];"
            f"[a]trim=start=0:end={d},setpts=PTS-STARTPTS[head];"
            f"[b]trim=start={L}:end={L + d},setpts=PTS-STARTPTS[tail];"
            f"[c]trim=start={d}:end={L},setpts=PTS-STARTPTS[body];"
            f"[tail][head]xfade=transition=fade:duration={d}:offset=0[x];"
            f"[x][body]concat=n=2:v=1:a=0,format=yuv420p[out]")
    for enc in encode_args("alex-idle").values():
        run(["-ss", str(LOOP_START), "-t", str(L + d + 0.2), "-i", SRC,
             "-filter_complex", loop, "-map", "[out]", *tags, *enc])

    # Sourire : le début de la prise, à l'envers.
    for enc in encode_args("alex-smile").values():
        run(["-t", str(SMILE_LEN), "-i", SRC, "-vf", f"{crop},reverse", *tags, *enc])

    # Image fixe : première image de la boucle.
    run(["-i", "assets/alex-idle.mp4", "-frames:v", "1", "-q:v", "3", "assets/alex.jpg"])


if __name__ == "__main__":
    main()
