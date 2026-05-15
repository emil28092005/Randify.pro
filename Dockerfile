FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist ./dist
COPY drizzle ./drizzle
COPY src/db/migrate.mjs ./src/db/migrate.mjs
EXPOSE 4321
ENV HOST=0.0.0.0
ENV PORT=4321
# Run pending migrations on startup, then start the app.
# Fails the container if migrations fail (so we don't serve with a stale schema).
CMD ["sh", "-c", "node ./src/db/migrate.mjs && node ./dist/server/entry.mjs"]
