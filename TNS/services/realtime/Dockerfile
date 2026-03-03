FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY services/realtime/package.json services/realtime/tsconfig.json ./services/realtime/

RUN corepack enable && corepack pnpm install --frozen-lockfile

COPY services/realtime/src ./services/realtime/src
RUN corepack pnpm --filter @tns/realtime build

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV REALTIME_PORT=3002

COPY --from=builder /app/services/realtime/dist ./dist

EXPOSE 3002
CMD ["node", "dist/main.js"]
