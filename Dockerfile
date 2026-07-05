# ── Stage 1: build frontend ──────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

ENV NODE_OPTIONS=--max-old-space-size=512

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY src ./src
COPY public ./public

RUN npm run build

# ── Stage 2: production runtime ──────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

RUN apk add --no-cache wget

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY server ./server
COPY --from=builder /app/dist ./dist

RUN mkdir -p server/uploads && chown -R node:node /app

USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/api/health || exit 1

CMD ["node", "server/index.js"]
