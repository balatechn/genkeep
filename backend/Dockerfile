FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runtime

RUN apk add --no-cache netcat-openbsd && \
    addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
# Copy pre-built Prisma engines + CLI from builder (prisma is a devDep, not installed by npm ci --omit=dev)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/engines ./node_modules/@prisma/engines
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY prisma ./prisma
# Fix ownership so nodeuser can read all app files
RUN chown -R nodeuser:nodejs /app

USER nodeuser
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD wget --quiet --tries=1 --spider http://localhost:4000/api/health || exit 1

# Wait for postgres then push schema + start server
CMD ["sh", "-c", "\
  echo 'Waiting for postgres...'; \
  until nc -z postgres 5432 2>/dev/null; do sleep 2; done; \
  echo 'Postgres ready. Pushing schema...'; \
  i=0; while ! ./node_modules/.bin/prisma db push --accept-data-loss --skip-generate; do \
    i=$((i+1)); if [ $i -ge 15 ]; then echo 'Schema push failed, giving up'; exit 1; fi; \
    echo \"Schema push failed (attempt $i), retrying in 3s...\"; sleep 3; \
  done; \
  echo 'Schema ready. Starting server...'; \
  node dist/index.js"]
