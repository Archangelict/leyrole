FROM node:22.12.0-alpine AS base

FROM base AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml esbuild.mjs eslint.config.mjs ./

FROM builder AS build-app

WORKDIR /app

RUN corepack enable && corepack prepare --activate && pnpm install

COPY src /app/src

COPY tsconfig.json .

RUN pnpm lint && pnpm build:min

FROM builder AS install-prod-deps

WORKDIR /app

RUN corepack enable && corepack prepare --activate && pnpm install --prod

RUN cp -rL node_modules prod_node_modules && rm -rf node_modules

FROM base AS runner

USER node

WORKDIR /app

COPY --from=build-app /app/dist ./dist

COPY --from=install-prod-deps /app/prod_node_modules ./node_modules

CMD [ "node", "dist/index.js" ]