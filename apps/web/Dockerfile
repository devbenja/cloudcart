# Dockerfile CloudCart Web (Next.js) — multi-stage
# Build context: raíz del monorepo (./) para resolver el workspace pnpm.

# ---------- Builder ----------
FROM node:24-alpine AS builder
WORKDIR /app

# pnpm 11 (fijado, compatible con pnpm-workspace.yaml)
RUN corepack enable && corepack prepare pnpm@11.5.2 --activate

# NEXT_PUBLIC_* se inyecta en el bundle en build time
ARG NEXT_PUBLIC_API_URL=http://api.cloudcart.local/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Manifests del workspace
COPY pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/web/package.json apps/web/package.json
COPY services/main/package.json services/main/package.json

# Dependencias de @cloudcart/web (dev + prod, para compilar)
RUN pnpm install --frozen-lockfile --filter @cloudcart/web

# Código + config
COPY apps/web/ ./apps/web/

# Build (next build)
RUN cd apps/web && pnpm build

# Empaquetado prod autocontenido (package.json + node_modules plano)
RUN pnpm --filter @cloudcart/web deploy --prod --legacy /out

# ---------- Runner ----------
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /out/ ./
COPY --from=builder /app/apps/web/.next ./.next
# next start requiere la config en runtime
COPY apps/web/next.config.mjs ./next.config.mjs

EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0"]
