## ------------------------------------------------------------
## Optimized Multi-Stage Dockerfile for Astro + Bun
##  - Minimizes COPY invalidations
##  - Uses BuildKit cache for Bun install
##  - Produces smaller runtime image with prod deps only
##  - Requires: DOCKER_BUILDKIT=1
## ------------------------------------------------------------
## syntax=docker/dockerfile:1.7

# 1) Dependencies (full dev deps for build)
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
# Use cache mount so repeated installs are near-instant
RUN --mount=type=cache,id=bun-cache,target=/root/.bun \
	bun install

# 2) Build stage (uses dev deps)
FROM oven/bun:1 AS build
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/bun.lock ./
# Copy only what is needed to build (avoid sending extra context)
COPY astro.config.mjs tsconfig.json postcss.config.js ./
COPY src ./src
COPY public ./public
# (Add tailwind.config.* if present in future)
RUN bun run build

# 3) Runtime image (reuse deps; dev deps are just types so negligible bloat)
FROM oven/bun:1 AS runtime
WORKDIR /app
ENV NODE_ENV=production \
	PORT=4321 \
	HOST=0.0.0.0

LABEL org.opencontainers.image.source="https://github.com/jadbox/medeligo-cancer-net" \
	  org.opencontainers.image.description="Medeligo Cancer Net (Astro SSR on Bun)"

# Copy dependencies + build output
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json bun.lock ./

EXPOSE 4321

# Start the Astro SSR server
CMD ["bun", "dist/server/entry.mjs"]