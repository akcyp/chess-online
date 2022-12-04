FROM node:19-alpine
WORKDIR /srv/app

RUN corepack enable

COPY ./package.json ./pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY ./ ./
RUN pnpm run build

CMD ["pnpm", "run", "preview", "--port", "3000", "--host"]
