FROM alpine:3.20.3

RUN apk add --no-cache nodejs npm && \
   npm install -g pnpm@9 && \
   apk del npm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN chmod +x run.sh

RUN rm -rf /var/cache/apk/*

CMD ["./run.sh"]