# ★✡ $DICKHEAD — Weird-Web Landing Page

A single-file, intentionally "broken" 90s weird-web page for the $DICKHEAD coin.
Everything lives in `index.html` — all images are embedded as data URIs, there are
no external requests, no build step, no dependencies.

## What's on it

- **Splash screen** ("ARE YOU TIRED OF WINNING?") with spinning ammo ring —
  click *I GUESS* to enter
- **Marquee**: BUY THE COIN AND HOLD IT DONT JEEEEEEEEET ★
- **$DICKHEAD ticker banner** with glitch animation
- Floating cutout photos in the background (Web Animations API)
- News / Status / Guestbook / Links panels, fake visitor counter
- Wildly scattered **gallery** with barbed-wire frames (20 photo slots)
- Grime/grain/vignette overlays for the aged look

## Customize

- **Photos:** in `index.html`, find the `PHOTOS` array and replace `null`
  entries with image URLs/paths (e.g. `"photos/01.jpg"`).
- **Motif:** the `<html data-motif="mixed">` attribute switches the color/theme
  preset (`mixed`, `america`, `israel` — see the `MOTIFS` object).
- **Texts:** marquee, news, links, footer etc. live in the `MOTIFS` object and
  `applyMotif()`.

## Run locally

```bash
python3 -m http.server 8000   # or: npx serve .
# or just open index.html
```

## Deploy — Railway + custom domain (`dickhead.media`)

Railway runs a process that listens on `$PORT`, so this repo ships a tiny
zero-dependency static server (`server.js`) plus `package.json` and
`railway.json`. Nothing to install.

1. **Deploy:** Railway → *New Project* → *Deploy from GitHub repo* → pick this
   repo + branch. Railway auto-builds and gives you a `*.up.railway.app` URL.
   (Start command is already pinned to `node server.js` in `railway.json`.)
2. **Add the domain:** service → *Settings* → *Networking* → *Custom Domain* →
   add `dickhead.media` (add `www.dickhead.media` too if you want both). Railway
   shows you the exact DNS target to point at.
3. **Point DNS:** `www` → CNAME → the Railway target; apex via CNAME
   flattening/ALIAS (Cloudflare does this automatically).
4. **Wait** for DNS + auto-SSL, then you're live at `https://dickhead.media`.

Local sanity check (same as Railway): `PORT=8137 node server.js`

GitHub Pages / Netlify / Vercel / Cloudflare Pages also work — it's just a
static file, publish directory = `.`.

## Structure

```
.
├── index.html      # the entire site (markup, styles, scripts, embedded images)
├── server.js       # zero-dependency static server (Railway / $PORT)
├── package.json    # npm start → node server.js
├── railway.json    # Railway build + start config
└── README.md
```
