FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY services/ingest/package.json services/ingest/tsconfig.json ./services/ingest/

RUN corepack enable && corepack pnpm install --frozen-lockfile

COPY services/ingest/src ./services/ingest/src
RUN corepack pnpm --filter @tns/ingest build

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV INGEST_PORT=3001

COPY --from=builder /app/services/ingest/dist ./dist

EXPOSE 3001
CMD ["node", "dist/main.js"]
