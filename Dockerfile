# ═══════════════════════════════════════════════════════════════
# Sözhane — Production Dockerfile (Railway / Fly.io / any VPS)
# ═══════════════════════════════════════════════════════════════

FROM node:20-slim AS base

# Puppeteer/Chromium system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-noto \
    fonts-noto-cjk \
    fonts-freefont-ttf \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to skip bundled Chromium download — use system binary
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# ── Dependencies ──────────────────────────────────────────────
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

# ── Application ───────────────────────────────────────────────
COPY . .

# Verify system Chromium is present
RUN chromium --version && echo "✓ Chromium OK"

# Build Next.js
RUN npm run build

# ── Data directory (for SQLite + generated PDFs) ──────────────
RUN mkdir -p /data /data/pdfs
ENV DATABASE_PATH=/data/sozhane.db

# Seed database on first run (handled by start script)
COPY scripts/start.sh /app/scripts/start.sh
RUN chmod +x /app/scripts/start.sh

# ── Runtime ───────────────────────────────────────────────────
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["/app/scripts/start.sh"]
