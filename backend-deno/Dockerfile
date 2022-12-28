FROM denoland/deno:1.10.3
EXPOSE 3000
WORKDIR /app
USER deno

ADD . .
RUN deno cache main.ts

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "main.ts"]
