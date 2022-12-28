FROM denoland/deno:1.29.1
EXPOSE 3000

WORKDIR /app

ADD ./backend-deno/ .
RUN deno cache main.ts

ENV MODE "PRODUCTION"
ADD ./certificates /certs

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "main.ts"]
