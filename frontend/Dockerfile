FROM node:19-alpine
WORKDIR /srv/app
ARG API_URL=localhost

RUN corepack enable

COPY ./frontend/package.json ./frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY ./frontend ./

ENV API_URL ${API_URL}
ENV MODE "PRODUCTION"

ADD ./certificates /certs
RUN pnpm run build
EXPOSE 4000

CMD ["pnpm", "run", "preview"]
