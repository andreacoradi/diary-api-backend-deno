FROM hayd/deno:alpine-1.0.0

WORKDIR /app

ADD . /app

CMD ["run", "--unstable", "-A", "server.ts"]