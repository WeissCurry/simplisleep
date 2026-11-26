import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT_DIR = '/Users/curry/Documents/Ngoding/simplisleep';
const OUTPUT_PATH = path.join(ROOT_DIR, 'apps/web/public/og-image.png');
const CHROME_PORT = 9228;

// Read local image assets to embed as base64
const iconPath = path.join(ROOT_DIR, 'apps/web/public/brand/simplidots-icon@2x.png');
const trexPath = path.join(ROOT_DIR, 'assets/cards/web/t-rex.webp');
const dragonPath = path.join(ROOT_DIR, 'assets/cards/web/dragon.webp');
const catPath = path.join(ROOT_DIR, 'assets/cards/web/orange-cat.webp');

const iconBase64 = `data:image/png;base64,${fs.readFileSync(iconPath).toString('base64')}`;
const trexBase64 = `data:image/webp;base64,${fs.readFileSync(trexPath).toString('base64')}`;
const dragonBase64 = `data:image/webp;base64,${fs.readFileSync(dragonPath).toString('base64')}`;
const catBase64 = `data:image/webp;base64,${fs.readFileSync(catPath).toString('base64')}`;

const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>SimpliSleeps OG Image Preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Silkscreen:wght@700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1200px;
      height: 630px;
      overflow: hidden;
      background-color: #FFFBF8;
      background-image: radial-gradient(#E6DDD6 1.8px, transparent 1.8px);
      background-size: 20px 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #141414;
      padding: 24px;
    }

    .main-canvas {
      width: 1152px;
      height: 582px;
      background-color: #FFFFFF;
      border: 4px solid #141414;
      border-radius: 20px;
      box-shadow: 10px 10px 0px #141414;
      padding: 34px 44px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }

    /* Ambient corner pixel decorations */
    .corner-dec-tl {
      position: absolute;
      top: 14px;
      left: 14px;
      width: 12px;
      height: 12px;
      border-top: 3px solid #EC385B;
      border-left: 3px solid #EC385B;
    }
    .corner-dec-br {
      position: absolute;
      bottom: 14px;
      right: 14px;
      width: 12px;
      height: 12px;
      border-bottom: 3px solid #EC385B;
      border-right: 3px solid #EC385B;
    }

    /* Top Bar */
    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px solid #141414;
      padding-bottom: 18px;
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      border: 2px solid #141414;
      box-shadow: 3px 3px 0px #141414;
      object-fit: contain;
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-family: 'Pixelify Sans', cursive, monospace;
      font-size: 38px;
      font-weight: 900;
      line-height: 1;
      letter-spacing: -0.01em;
      text-transform: uppercase;
    }
    .brand-simpli {
      color: #141414;
    }
    .brand-sleep {
      color: #EC385B;
      margin-left: 2px;
    }
    .brand-dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      background-color: #EC385B;
      border: 2px solid #141414;
      border-radius: 50%;
      margin-left: 4px;
      vertical-align: middle;
    }
    .brand-sub {
      font-family: 'Pixelify Sans', monospace;
      font-size: 11px;
      font-weight: 700;
      color: #C21F42;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      margin-top: 4px;
    }

    .top-badges {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge-pill {
      font-family: 'Pixelify Sans', monospace;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 6px 14px;
      border: 2px solid #141414;
      border-radius: 8px;
      box-shadow: 3px 3px 0px #141414;
      letter-spacing: 0.04em;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .badge-gold {
      background-color: #FFC93C;
      color: #141414;
    }
    .badge-pink {
      background-color: #FFF1F4;
      color: #C21F42;
    }

    /* Main Content */
    .content-area {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
      margin: auto 0;
      padding: 8px 0;
    }

    /* Left Copy */
    .left-copy {
      flex: 1;
      max-width: 580px;
    }
    .main-heading {
      font-family: 'Pixelify Sans', cursive, monospace;
      font-size: 46px;
      font-weight: 900;
      line-height: 1.12;
      color: #141414;
      text-transform: uppercase;
      margin-bottom: 14px;
      letter-spacing: -0.01em;
    }
    .main-heading span.highlight {
      color: #EC385B;
      text-decoration: underline;
      text-decoration-color: #FFC93C;
      text-underline-offset: 6px;
    }
    .main-tagline {
      font-size: 20px;
      font-weight: 600;
      color: #4A4A4A;
      line-height: 1.45;
      margin-bottom: 24px;
    }
    .feature-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .feature-tag {
      font-family: 'Pixelify Sans', monospace;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 6px 12px;
      border: 2px solid #141414;
      border-radius: 6px;
      box-shadow: 2.5px 2.5px 0px #141414;
      letter-spacing: 0.03em;
      background-color: #FFFDF8;
      color: #141414;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    /* Right Cards Cluster */
    .cards-cluster {
      width: 440px;
      height: 290px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      shrink: 0;
    }

    .pixel-card {
      position: absolute;
      width: 172px;
      background-color: #FFFFFF;
      border: 3px solid #141414;
      border-radius: 12px;
      box-shadow: 6px 6px 0px #141414;
      padding: 9px;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: none;
    }

    .card-art-box {
      width: 100%;
      aspect-ratio: 1 / 1;
      border: 2px solid #141414;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #FFFDF8;
      margin-bottom: 7px;
    }
    .card-art-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      image-rendering: pixelated;
    }

    .card-badge {
      font-family: 'Pixelify Sans', monospace;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 7px;
      border: 1.5px solid #141414;
      border-radius: 4px;
      margin-bottom: 6px;
      align-self: flex-start;
      letter-spacing: 0.04em;
    }
    .card-name {
      font-family: 'Pixelify Sans', monospace;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      color: #141414;
      letter-spacing: 0.02em;
      text-align: center;
    }

    /* Positioning Cards in Fan */
    .card-left {
      left: 10px;
      bottom: 12px;
      transform: rotate(-10deg);
      z-index: 1;
    }
    .card-left .card-badge {
      background-color: #FEF3C7;
      color: #B45309;
    }

    .card-right {
      right: 10px;
      bottom: 12px;
      transform: rotate(10deg);
      z-index: 2;
    }
    .card-right .card-badge {
      background-color: #F3E8FF;
      color: #7E22CE;
    }

    .card-center {
      left: 132px;
      bottom: 24px;
      transform: rotate(-1deg);
      z-index: 3;
      border-color: #141414;
      box-shadow: 8px 8px 0px #141414;
      width: 182px;
    }
    .card-center .card-badge {
      background-color: #FFC93C;
      color: #141414;
    }

    /* Bottom Footer Bar */
    .bottom-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 3px solid #141414;
      padding-top: 14px;
      font-family: 'Pixelify Sans', monospace;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #5C5C5C;
    }
    .footer-highlight {
      color: #C21F42;
      font-weight: 800;
    }
    .footer-pill {
      background-color: #141414;
      color: #FFFFFF;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      letter-spacing: 0.08em;
    }
  </style>
</head>
<body>
  <div class="main-canvas">
    <div class="corner-dec-tl"></div>
    <div class="corner-dec-br"></div>

    <!-- Top Bar -->
    <div class="top-bar">
      <div class="brand-wrap">
        <img class="brand-icon" src="${iconBase64}" alt="SimpliDOTS">
        <div class="brand-text">
          <div class="brand-title">
            <span class="brand-simpli">Simpli</span><span class="brand-sleep">Sleeps</span><span class="brand-dot"></span>
          </div>
          <span class="brand-sub">Anti Begadang Club • SimpliDOTS</span>
        </div>
      </div>

      <div class="top-badges">
        <div class="badge-pill badge-gold">
          <span>★</span> 28 Kartu Koleksi
        </div>
        <div class="badge-pill badge-pink">
          <span>●</span> Catatan Publik Terbuka
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="content-area">
      <div class="left-copy">
        <h1 class="main-heading">
          Tidur Sehat & <span class="highlight">Teratur</span> untuk Simplimates
        </h1>
        <p class="main-tagline">
          Pelacak kebiasaan tidur objektif dengan leaderboard mingguan tercatat permanen dan kartu koleksi Simply is Sleeping.
        </p>

        <div class="feature-row">
          <div class="feature-tag">
            <span>•</span> Skor Objektif 0-100
          </div>
          <div class="feature-tag">
            <span>•</span> Leaderboard Mingguan
          </div>
          <div class="feature-tag">
            <span>•</span> Koleksi Permanen
          </div>
        </div>
      </div>

      <!-- Right: 3 Cards Showcase -->
      <div class="cards-cluster">
        <!-- Card 1 (Left): T-Rex -->
        <div class="pixel-card card-left">
          <div class="card-badge">✦ Legendary</div>
          <div class="card-art-box">
            <img src="${trexBase64}" alt="T-Rex">
          </div>
          <div class="card-name">T-Rex</div>
        </div>

        <!-- Card 2 (Right): Dragon -->
        <div class="pixel-card card-right">
          <div class="card-badge">✦ Legendary</div>
          <div class="card-art-box">
            <img src="${dragonBase64}" alt="Dragon">
          </div>
          <div class="card-name">Dragon</div>
        </div>

        <!-- Card 3 (Center, Featured): Orange Cat -->
        <div class="pixel-card card-center">
          <div class="card-badge">✦ Signature</div>
          <div class="card-art-box">
            <img src="${catBase64}" alt="Kucing Oranye">
          </div>
          <div class="card-name">Kucing Oranye</div>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="bottom-bar">
      <div>
        <span class="footer-highlight">SimpliSleeps</span> — Bangun Pagi Lebih Segar & Produktif
      </div>
      <div class="footer-pill">
        Pelacak Kebiasaan Tidur Sehat
      </div>
    </div>
  </div>
</body>
</html>`;

const tempHtmlPath = '/tmp/og-preview.html';
fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');
console.log(`[OG Generator] Saved HTML template to ${tempHtmlPath}`);

// Spawn Headless Chrome and capture screenshot via CDP
const userDataDir = `/tmp/chrome-profile-og-${Date.now()}`;
fs.mkdirSync(userDataDir, { recursive: true });

const chromeProcess = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new',
  `--remote-debugging-port=${CHROME_PORT}`,
  `--user-data-dir=${userDataDir}`,
  '--window-size=1200,630',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  '--disable-extensions',
  'about:blank',
]);

async function getWebSocketDebuggerUrl() {
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CHROME_PORT}/json`);
      if (res.ok) {
        const list = await res.json();
        const page = list.find((item) => item.type === 'page') || list[0];
        if (page?.webSocketDebuggerUrl) {
          return page.webSocketDebuggerUrl;
        }
      }
    } catch {
      // Chrome booting
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Failed to connect to Chrome on port ${CHROME_PORT}`);
}

const wsUrl = await getWebSocketDebuggerUrl();
console.log(`[OG Generator] Chrome CDP connected: ${wsUrl}`);

class CDPClient {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

const cdp = new CDPClient(wsUrl);
await cdp.connect();

await cdp.send('Page.enable');
await cdp.send('Runtime.enable');

await cdp.send('Emulation.setDeviceMetricsOverride', {
  width: 1200,
  height: 630,
  deviceScaleFactor: 1,
  mobile: false,
});

await cdp.send('Page.navigate', { url: `file://${tempHtmlPath}` });

// Wait for fonts to be ready
console.log(`[OG Generator] Waiting for Google Fonts & images to render ...`);
await cdp.send('Runtime.evaluate', {
  expression: `document.fonts.ready`,
  awaitPromise: true
});
await new Promise((r) => setTimeout(r, 1200));

// Capture screenshot
const shot = await cdp.send('Page.captureScreenshot', {
  format: 'png',
  clip: {
    x: 0,
    y: 0,
    width: 1200,
    height: 630,
    scale: 1
  }
});

fs.writeFileSync(OUTPUT_PATH, Buffer.from(shot.data, 'base64'));
console.log(`[OG Generator] Successfully generated OG image at: ${OUTPUT_PATH}`);

cdp.close();
chromeProcess.kill();
process.exit(0);
