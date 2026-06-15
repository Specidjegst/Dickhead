# 💎 $DICKHEAD — Degen Memecoin Landing Page

A fast, single-page, **no-build** landing page for a Solana memecoin, built in pure
HTML / CSS / JS. Degen styling, live market cap, one-click contract-address copy,
and social links. Drop it on any static host and you're live.

![Solana](https://img.shields.io/badge/chain-Solana-9945FF) ![No build step](https://img.shields.io/badge/build-none-14F195)

---

## ✨ Features

- ⚡ **Degen-styled** hero with Solana gradient, glitch text & animated background
- 📋 **Contract Address (CA)** box with copy-to-clipboard + toast feedback
- 📈 **Live Market Cap, Price & 24h change** — auto-fetched from the free
  [DexScreener API](https://docs.dexscreener.com/api/reference) once the coin launches
- 🔗 **Social links** (X/Twitter, Telegram, Discord, DexScreener)
- 🧮 Tokenomics, "How to Ape" steps, animated supply counter
- 📱 Fully responsive + respects `prefers-reduced-motion`

---

## 🛠 Customize it (the only file edits you need)

Everything you'll want to change is marked clearly. The essentials:

### 1. Contract address + live stats — `assets/js/main.js`
```js
const CONFIG = {
  contractAddress: "PASTE_YOUR_REAL_SOLANA_MINT_HERE",
  chain: "solana",
  refreshMs: 30000,
};
```
Until you paste the real CA, the stats show `SOON™`. After launch they go live
automatically (market cap, price, 24h %, and the chart links all wire up to the
deepest-liquidity DexScreener pair).

### 2. Coin name / copy / ticker — `index.html`
Search & replace `DICKHEAD` / `$DICK` if you want a different name, and edit the
hero tagline, about cards and tokenomics text.

### 3. Social links — `index.html`
Replace the placeholder `href="https://x.com/"`, `https://t.me/`,
`https://discord.com/` with your real community links (they appear in the nav and
the **Join the Degens** section).

### 4. Colors — `assets/css/styles.css`
Tweak the `:root` variables (`--sol-purple`, `--sol-green`, `--bg`, …).

---

## 🚀 Run locally

It's a static site — just open `index.html`, or serve it for clean paths:

```bash
# Python
python3 -m http.server 8000
# then open http://localhost:8000

# …or Node
npx serve .
```

## ☁️ Deploy (pick one)

- **GitHub Pages** — Settings → Pages → deploy from branch (root).
- **Netlify / Vercel** — drag-and-drop the folder, or connect the repo. No build
  command, publish directory = `.`.
- **Cloudflare Pages** — same, no build step.

---

## 📁 Structure

```
.
├── index.html            # markup + content
├── assets/
│   ├── css/styles.css    # all styling (Solana theme)
│   └── js/main.js        # copy CA, live stats, animations  ← edit CONFIG here
└── README.md
```

---

## ⚠️ Disclaimer

This is a meme coin landing page for **entertainment purposes only**. Nothing here
is financial advice. Crypto is risky — DYOR and never invest more than you can
afford to lose.
