FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runtime

RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
# Copy pre-built Prisma engines from builder so runtime never needs to generate/write them
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/engines ./node_modules/@prisma/engines
COPY prisma ./prisma
# Fix ownership so nodeuser can read all app files
RUN chown -R nodeuser:nodejs /app

USER nodeuser
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s \
  CMD wget --quiet --tries=1 --spider http://localhost:4000/api/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
