/* ============================================================
   $DICKHEAD — Landing page logic
   - Copy contract address to clipboard
   - Live market cap / price via DexScreener public API
   - Toast notifications, chart links, footer year
   ============================================================ */

/* ------------------------------------------------------------
   1. CONFIG — edit these once the coin is live.
   ------------------------------------------------------------ */
const CONFIG = {
  // Paste your real Solana token mint address here after launch.
  // The example below is wrapped SOL — replace it with $DICK's CA.
  contractAddress: "So11111111111111111111111111111111111111112",

  // The blockchain DexScreener should query (Solana memecoins => "solana").
  chain: "solana",

  // How often to refresh live stats (milliseconds).
  refreshMs: 30000,
};

/* ------------------------------------------------------------
   2. Small helpers
   ------------------------------------------------------------ */
const $ = (sel) => document.querySelector(sel);

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

/** Format a USD number into a compact, degen-friendly string. */
function formatUsd(value, { compact = true } = {}) {
  if (value == null || isNaN(value)) return "$ —";
  if (compact && value >= 1000) {
    const units = [
      { v: 1e9, s: "B" },
      { v: 1e6, s: "M" },
      { v: 1e3, s: "K" },
    ];
    for (const { v, s } of units) {
      if (value >= v) return "$" + (value / v).toFixed(2).replace(/\.00$/, "") + s;
    }
  }
  // Sub-dollar prices: show enough significant digits for tiny memecoin prices.
  if (value < 1) {
    return "$" + value.toPrecision(3);
  }
  return "$" + value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/* ------------------------------------------------------------
   3. Copy contract address
   ------------------------------------------------------------ */
function initCopy() {
  const codeEl = $("#ca-code");
  const copyBtn = $("#ca-copy");
  if (!codeEl || !copyBtn) return;

  // Keep the visible CA in sync with the config value.
  codeEl.textContent = CONFIG.contractAddress;

  copyBtn.addEventListener("click", async () => {
    const text = codeEl.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older / insecure contexts.
      const tmp = document.createElement("textarea");
      tmp.value = text;
      tmp.style.position = "fixed";
      tmp.style.opacity = "0";
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      tmp.remove();
    }

    const label = copyBtn.querySelector(".ca__copy-text");
    if (label) label.textContent = "COPIED ✓";
    copyBtn.classList.add("copied");
    showToast("📋 Contract address copied!");

    setTimeout(() => {
      if (label) label.textContent = "COPY";
      copyBtn.classList.remove("copied");
    }, 1800);
  });
}

/* ------------------------------------------------------------
   4. Live market cap / price (DexScreener)
   ------------------------------------------------------------ */
async function fetchStats() {
  const mcEl = $("#marketcap");
  const priceEl = $("#price");
  const changeEl = $("#change");
  const noteEl = $("#stats-note");

  const url = `https://api.dexscreener.com/latest/dex/tokens/${CONFIG.contractAddress}`;

  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const pairs = (data && data.pairs) || [];
    // Pick the Solana pair with the deepest liquidity (most reliable price).
    const pair = pairs
      .filter((p) => !CONFIG.chain || p.chainId === CONFIG.chain)
      .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];

    if (!pair) throw new Error("no-pairs");

    const marketCap = pair.marketCap ?? pair.fdv ?? null;
    const price = pair.priceUsd ? parseFloat(pair.priceUsd) : null;
    const change = pair.priceChange?.h24;

    setStat(mcEl, formatUsd(marketCap));
    setStat(priceEl, formatUsd(price, { compact: false }));

    if (change != null) {
      const sign = change >= 0 ? "+" : "";
      setStat(changeEl, `${sign}${Number(change).toFixed(1)}%`);
      changeEl.classList.toggle("up", change >= 0);
      changeEl.classList.toggle("down", change < 0);
    } else {
      setStat(changeEl, "—");
    }

    // Wire up the live chart links to the discovered pair.
    if (pair.url) {
      const chartLink = $("#chart-link");
      const dexLink = $("#dex-link");
      if (chartLink) chartLink.href = pair.url;
      if (dexLink) dexLink.href = pair.url;
    }

    if (noteEl) noteEl.textContent = "Live data from DexScreener · updates every 30s";
  } catch (err) {
    // Pre-launch or no liquidity yet — show a friendly placeholder.
    setStat(mcEl, "SOON™");
    setStat(priceEl, "SOON™");
    setStat(changeEl, "🚀");
    if (noteEl) {
      noteEl.textContent =
        "Not live yet? Drop the real CA in assets/js/main.js to wake up the live stats.";
    }
  }
}

function setStat(el, text) {
  if (!el) return;
  el.textContent = text;
  el.dataset.loading = "false";
}

/* ------------------------------------------------------------
   5. Count-up animation for the supply number
   ------------------------------------------------------------ */
function initCountUp() {
  const el = document.querySelector("[data-count]");
  if (!el) return;
  const target = Number(el.dataset.count);
  if (!target) return;

  const run = () => {
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.floor(target * eased).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString("en-US");
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          run();
          obs.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );
  observer.observe(el);
}

/* ------------------------------------------------------------
   6. Boot
   ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  initCopy();
  initCountUp();

  fetchStats();
  setInterval(fetchStats, CONFIG.refreshMs);
});
