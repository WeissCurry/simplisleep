#!/usr/bin/env python3
"""
SimpliSleep Card Silhouette Generator
====================================
Script untuk membuat siluet pixel art hewan kartu SimpliSleep:
- Latar transparan (RGBA)
- Bentuk hewan (+ properti yang menempel di tubuh) diisi warna solid #141414 (RGB 20, 20, 20)
- Ukuran output: 512x512 WebP (lossless)
- Tepi tajam/pixelated via NEAREST resampling
- Background (langit, pohon, gua, air, dll) dihilangkan
- Zzz / speech bubble melayang dihilangkan

Cara Menyiapkan Environment & Menjalankan:
-----------------------------------------
1. Buat virtualenv terisolasi (JANGAN pasang ke repo git):
   python3 -m venv /private/tmp/claude-501/-Users-curry-Documents-Ngoding-skripsi-paper-repo/22c9cdff-6a00-47a5-b3f0-430b4cc70226/scratchpad/silvenv

2. Install dependencies ke dalam virtualenv:
   /private/tmp/claude-501/-Users-curry-Documents-Ngoding-skripsi-paper-repo/22c9cdff-6a00-47a5-b3f0-430b4cc70226/scratchpad/silvenv/bin/pip install 'rembg[cpu]' pillow numpy scipy opencv-python

3. Atur lokasi cache model U2Net (opsional jika sudah dicache di scratchpad):
   export U2NET_HOME="/private/tmp/claude-501/-Users-curry-Documents-Ngoding-skripsi-paper-repo/22c9cdff-6a00-47a5-b3f0-430b4cc70226/scratchpad/models"

4. Jalankan script ini:
   /private/tmp/claude-501/-Users-curry-Documents-Ngoding-skripsi-paper-repo/22c9cdff-6a00-47a5-b3f0-430b4cc70226/scratchpad/silvenv/bin/python3 make_silhouettes.py
   atau untuk kartu tertentu:
   /private/tmp/claude-501/-Users-curry-Documents-Ngoding-skripsi-paper-repo/22c9cdff-6a00-47a5-b3f0-430b4cc70226/scratchpad/silvenv/bin/python3 make_silhouettes.py koala
"""

import os
import sys
import glob
from collections import deque
from PIL import Image, ImageDraw
import numpy as np
import scipy.ndimage as ndi
import cv2

# Set default model home if scratchpad models exist
SCRATCH_MODEL_DIR = "/private/tmp/claude-501/-Users-curry-Documents-Ngoding-skripsi-paper-repo/22c9cdff-6a00-47a5-b3f0-430b4cc70226/scratchpad/models"
if os.path.exists(SCRATCH_MODEL_DIR) and "U2NET_HOME" not in os.environ:
    os.environ["U2NET_HOME"] = SCRATCH_MODEL_DIR

import rembg

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CARDS_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
OUT_SILHOUETTE_DIR = os.path.join(CARDS_DIR, "web", "silhouette")
CONTACT_SHEET_PATH = "/private/tmp/claude-501/-Users-curry-Documents-Ngoding-skripsi-paper-repo/22c9cdff-6a00-47a5-b3f0-430b4cc70226/scratchpad/silhouette_sheet.png"

# Daftar kartu Common & latar polos (metode flood-fill dari sudut)
COMMON_CARDS = {
    "capybara", "chick", "corgi", "hamster", "hedgehog", "mini-pig",
    "orange-cat", "otter", "red-panda", "sloth", "white-rabbit",
    "yellow-duck", "red-fox"
}

_rembg_session = None

def get_rembg_session():
    global _rembg_session
    if _rembg_session is None:
        _rembg_session = rembg.new_session("u2net")
    return _rembg_session


def extract_floodfill(img: Image.Image, tol: float = 30.0) -> np.ndarray:
    """
    Ekstraksi mask subjek pada latar polos/pastel melalui flood-fill dari 4 sudut.
    Presisi 100% pada pixel art asli tanpa interpolasi neural network.
    """
    arr = np.array(img.convert("RGB"))
    h, w, _ = arr.shape

    corners = [(0, 0), (0, w - 1), (h - 1, 0), (h - 1, w - 1)]
    bg_colors = [arr[y, x].astype(float) for y, x in corners]
    avg_bg = np.median(bg_colors, axis=0)

    dist = np.sqrt(np.sum((arr.astype(float) - avg_bg) ** 2, axis=2))
    bg_seed = dist < tol

    visited = np.zeros((h, w), dtype=bool)
    q = deque()
    for y in [0, h - 1]:
        for x in range(w):
            if bg_seed[y, x] and not visited[y, x]:
                visited[y, x] = True
                q.append((y, x))
    for x in [0, w - 1]:
        for y in range(h):
            if bg_seed[y, x] and not visited[y, x]:
                visited[y, x] = True
                q.append((y, x))

    while q:
        cy, cx = q.popleft()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w:
                if not visited[ny, nx] and dist[ny, nx] < tol:
                    visited[ny, nx] = True
                    q.append((ny, nx))

    fg_mask = ~visited

    # Hapus komponen mengambang (seperti floating Zzz / speech bubble)
    labeled, num_features = ndi.label(fg_mask)
    if num_features > 0:
        sizes = ndi.sum(fg_mask, labeled, range(1, num_features + 1))
        largest = np.argmax(sizes) + 1
        fg_mask = (labeled == largest)

    return fg_mask


def extract_rembg(img: Image.Image) -> np.ndarray:
    """
    Ekstraksi mask subjek pada latar pemandangan kompleks (Rare/Epic/Legendary)
    menggunakan U2Net (rembg).
    """
    session = get_rembg_session()
    out = rembg.remove(img, session=session)
    arr = np.array(out)
    alpha = arr[:, :, 3]
    fg_mask = alpha > 120

    # Hapus speckles dan komponen kecil melayang
    labeled, num_features = ndi.label(fg_mask)
    if num_features > 0:
        sizes = ndi.sum(fg_mask, labeled, range(1, num_features + 1))
        max_size = np.max(sizes)
        keep_labels = [i + 1 for i, s in enumerate(sizes) if s >= max_size * 0.05]
        fg_mask = np.isin(labeled, keep_labels)

    return fg_mask


def extract_koala(img_path: str) -> np.ndarray:
    """
    Ekstraksi khusus untuk koala.png:
    Memisahkan tubuh koala (kedua telinga berbulu, cakar, masker tidur, badan)
    dari batang pohon diagonal yang membentang menembus kanvas.
    """
    img_cv = cv2.imread(img_path)
    h, w, _ = img_cv.shape
    y, x = np.mgrid[:h, :w]

    gc_mask = np.full((h, w), cv2.GC_PR_BGD, dtype=np.uint8)

    # Area pasti latar belakang:
    gc_mask[(x < 150) | (x > 820) | (y < 140) | (y > 880)] = cv2.GC_BGD
    # Batang pohon di luar koala:
    gc_mask[(x > 650) & (y < 300)] = cv2.GC_BGD
    gc_mask[x > 770] = cv2.GC_BGD
    gc_mask[y > 870] = cv2.GC_BGD
    gc_mask[(x > 700) & (y > 450) & (y < 670)] = cv2.GC_BGD

    # Area pasti subjek koala:
    gc_mask[((x - 470) ** 2 + (y - 380) ** 2) < 65 ** 2] = cv2.GC_FGD   # Kepala/Wajah
    gc_mask[((x - 300) ** 2 + (y - 330) ** 2) < 55 ** 2] = cv2.GC_FGD   # Telinga kiri
    gc_mask[((x - 580) ** 2 + (y - 215) ** 2) < 40 ** 2] = cv2.GC_FGD   # Telinga kanan
    gc_mask[((x - 400) ** 2 + (y - 650) ** 2) < 70 ** 2] = cv2.GC_FGD   # Tubuh/Punggung
    gc_mask[((x - 410) ** 2 + (y - 580) ** 2) < 35 ** 2] = cv2.GC_FGD   # Masker tidur
    gc_mask[((x - 630) ** 2 + (y - 530) ** 2) < 30 ** 2] = cv2.GC_FGD   # Cakar atas
    gc_mask[((x - 650) ** 2 + (y - 565) ** 2) < 25 ** 2] = cv2.GC_FGD   # Cakar tengah
    gc_mask[((x - 530) ** 2 + (y - 770) ** 2) < 40 ** 2] = cv2.GC_FGD   # Kaki bawah

    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)
    cv2.grabCut(img_cv, gc_mask, None, bgd_model, fgd_model, 6, cv2.GC_INIT_WITH_MASK)

    mask = np.where((gc_mask == cv2.GC_FGD) | (gc_mask == cv2.GC_PR_FGD), True, False)
    mask = ndi.binary_fill_holes(mask)

    # Ambil komponen utama
    labeled, num = ndi.label(mask)
    if num > 0:
        sizes = ndi.sum(mask, labeled, range(1, num + 1))
        largest = np.argmax(sizes) + 1
        mask = (labeled == largest)

    return ndi.binary_fill_holes(mask)


def extract_squirrel(img_path: str) -> np.ndarray:
    """
    Ekstraksi khusus untuk squirrel.png:
    Memisahkan tupai (kedua telinga lancip, pipi gembul, ekor mengembang,
    dan biji ek di pelukan) dari timbunan biji ek di dalam rongga pohon.
    """
    img_cv = cv2.imread(img_path)
    h, w, _ = img_cv.shape
    y, x = np.mgrid[:h, :w]

    gc_mask = np.full((h, w), cv2.GC_PR_BGD, dtype=np.uint8)

    # Lingkaran luar rongga pohon
    outside_hollow = ((x - 512) ** 2 + (y - 520) ** 2) > 350 ** 2
    gc_mask[outside_hollow] = cv2.GC_BGD

    # Batas luar biji-biji ek latar belakang
    gc_mask[(y < 270) & ~outside_hollow] = cv2.GC_BGD
    gc_mask[(x < 350) & ~outside_hollow] = cv2.GC_BGD
    gc_mask[(x > 800) & ~outside_hollow] = cv2.GC_BGD
    gc_mask[(y > 720) & ~outside_hollow] = cv2.GC_BGD
    gc_mask[(x < 420) & (y > 600)] = cv2.GC_BGD
    gc_mask[(x < 430) & (y < 400)] = cv2.GC_BGD

    # Subjek tupai pasti (FGD):
    gc_mask[((x - 500) ** 2 + (y - 450) ** 2) < 55 ** 2] = cv2.GC_FGD   # Kepala/Wajah
    gc_mask[((x - 490) ** 2 + (y - 580) ** 2) < 50 ** 2] = cv2.GC_FGD   # Perut
    gc_mask[((x - 670) ** 2 + (y - 450) ** 2) < 55 ** 2] = cv2.GC_FGD   # Tengah ekor
    gc_mask[((x - 720) ** 2 + (y - 380) ** 2) < 30 ** 2] = cv2.GC_FGD   # Atas ekor
    gc_mask[((x - 435) ** 2 + (y - 525) ** 2) < 35 ** 2] = cv2.GC_FGD   # Biji ek di pelukan
    gc_mask[((x - 510) ** 2 + (y - 665) ** 2) < 25 ** 2] = cv2.GC_FGD   # Kaki

    # Kotak kandidat tupai
    sq_box = (x >= 370) & (x <= 780) & (y >= 280) & (y <= 710)
    gc_mask[sq_box & (gc_mask == cv2.GC_PR_BGD)] = cv2.GC_PR_FGD

    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)
    cv2.grabCut(img_cv, gc_mask, None, bgd_model, fgd_model, 6, cv2.GC_INIT_WITH_MASK)

    mask = np.where((gc_mask == cv2.GC_FGD) | (gc_mask == cv2.GC_PR_FGD), True, False)
    mask = ndi.binary_fill_holes(mask)

    labeled, num = ndi.label(mask)
    if num > 0:
        sizes = ndi.sum(mask, labeled, range(1, num + 1))
        largest = np.argmax(sizes) + 1
        mask = (labeled == largest)

    return ndi.binary_fill_holes(mask)


def mask_to_silhouette(fg_mask: np.ndarray, target_size: int = 512) -> Image.Image:
    """
    Konversi boolean mask menjadi gambar RGBA siluet #141414 dengan latar transparan,
    diresize menggunakan NEAREST resampling agar tepi tetap tajam/pixelated.
    """
    h, w = fg_mask.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[fg_mask, 0] = 20  # #141414 -> R=20
    rgba[fg_mask, 1] = 20  # G=20
    rgba[fg_mask, 2] = 20  # B=20
    rgba[fg_mask, 3] = 255 # Alpha=255

    img = Image.fromarray(rgba)
    return img.resize((target_size, target_size), Image.Resampling.NEAREST)


def process_card(png_path: str) -> tuple[str, Image.Image, Image.Image]:
    cid = os.path.splitext(os.path.basename(png_path))[0]
    orig = Image.open(png_path)

    # Otomatis deteksi latar solid/pastel dari variasi warna di 4 sudut kanvas
    arr = np.array(orig.convert("RGB"))
    h, w, _ = arr.shape
    corners = [arr[0, 0], arr[0, w - 1], arr[h - 1, 0], arr[h - 1, w - 1]]
    corner_std = np.std(corners, axis=0).max()

    if corner_std < 25 or cid in COMMON_CARDS:
        # Latar solid pastel (Common, Rare baru, Epic baru, Legendary baru)
        mask = extract_floodfill(orig)
    elif cid == "koala":
        mask = extract_koala(png_path)
    elif cid == "squirrel":
        mask = extract_squirrel(png_path)
    else:
        mask = extract_rembg(orig)

    sil_img = mask_to_silhouette(mask, target_size=512)
    return cid, orig, sil_img


def build_contact_sheet(items: list[tuple[str, Image.Image, Image.Image]], out_path: str):
    """
    Buat lembar kontak visual untuk memeriksa setiap siluet di atas checkerboard.
    Kolom: [ID Kartu, Gambar Asli 256px, Siluet 256px di atas checkerboard]
    """
    cols = 2
    rows = len(items)
    cell_w, cell_h = 256, 256
    padding = 10
    label_w = 140

    sheet_w = label_w + cols * cell_w + (cols + 1) * padding
    sheet_h = rows * (cell_h + padding) + padding

    sheet = Image.new("RGBA", (sheet_w, sheet_h), (245, 245, 245, 255))
    draw = ImageDraw.Draw(sheet)

    for idx, (cid, orig, sil) in enumerate(items):
        y = padding + idx * (cell_h + padding)

        # Label kartu
        draw.text((padding, y + cell_h // 2 - 8), cid, fill=(20, 20, 20, 255))

        # Gambar asli (256x256)
        orig_small = orig.resize((cell_w, cell_h), Image.Resampling.NEAREST)
        sheet.paste(orig_small, (label_w + padding, y))

        # Siluet di atas pola checkerboard (256x256)
        sil_small = sil.resize((cell_w, cell_h), Image.Resampling.NEAREST)
        bg_check = Image.new("RGBA", (cell_w, cell_h), (220, 220, 220, 255))
        check_size = 16
        for cy in range(0, cell_h, check_size):
            for cx in range(0, cell_w, check_size):
                if (cy // check_size + cx // check_size) % 2 == 0:
                    for py in range(cy, min(cy + check_size, cell_h)):
                        for px in range(cx, min(cx + check_size, cell_w)):
                            bg_check.putpixel((px, py), (255, 255, 255, 255))

        bg_check.alpha_composite(sil_small)
        sheet.paste(bg_check, (label_w + padding + cell_w + padding, y))

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    sheet.save(out_path)
    print(f"Contact sheet disimpan ke: {out_path}")


def main():
    os.makedirs(OUT_SILHOUETTE_DIR, exist_ok=True)

    filter_cid = sys.argv[1] if len(sys.argv) > 1 else None

    pngs = sorted(glob.glob(os.path.join(CARDS_DIR, "*.png")))
    if not pngs:
        print(f"Tidak ada file PNG di {CARDS_DIR}")
        return

    processed = []
    print(f"Memulai pembuatan siluet kartu ({len(pngs)} kartu ditemukan)...")

    for p in pngs:
        cid = os.path.splitext(os.path.basename(p))[0]
        if filter_cid and cid != filter_cid:
            continue

        print(f"  -> Memproses: {cid}...", end=" ", flush=True)
        cid, orig, sil_img = process_card(p)

        out_webp = os.path.join(OUT_SILHOUETTE_DIR, f"{cid}.webp")
        sil_img.save(out_webp, "WEBP", lossless=True)
        print(f"Selesai! Disimpan ke: {out_webp}")

        processed.append((cid, orig, sil_img))

    # Bangun contact sheet jika memproses seluruh kartu
    if len(processed) > 1:
        build_contact_sheet(processed, CONTACT_SHEET_PATH)

    print("\nSemua siluet berhasil dibuat!")


if __name__ == "__main__":
    main()
