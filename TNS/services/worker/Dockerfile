FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY services/worker/package.json services/worker/tsconfig.json ./services/worker/

RUN corepack enable && corepack pnpm install --frozen-lockfile

COPY services/worker/src ./services/worker/src
RUN corepack pnpm --filter @tns/worker build

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV WORKER_PORT=3003

COPY --from=builder /app/services/worker/dist ./dist

EXPOSE 3003
CMD ["node", "dist/main.js"]
