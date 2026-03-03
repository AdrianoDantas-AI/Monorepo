FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY services/api/package.json services/api/tsconfig.json ./services/api/

RUN corepack enable && corepack pnpm install --frozen-lockfile

COPY services/api/src ./services/api/src
RUN corepack pnpm --filter @tns/api build

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV API_PORT=3000

COPY --from=builder /app/services/api/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
