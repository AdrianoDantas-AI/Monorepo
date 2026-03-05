FROM node:22-alpine

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps ./apps
COPY services ./services
COPY packages ./packages

RUN pnpm install --frozen-lockfile

CMD ["sh", "-lc", "pnpm --filter @consoledegastos/api dev"]
