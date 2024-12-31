FROM node:22.12.0-alpine AS base

FROM base AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml esbuild.mjs eslint.config.mjs ./

RUN corepack enable && pnpm install

COPY src /app/src

COPY tsconfig.json .

RUN pnpm lint && pnpm build:min

FROM base AS runner

USER node

WORKDIR /app

COPY --from=builder /app/dist ./dist

CMD [ "node", "dist/index.js" ]