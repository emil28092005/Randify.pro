FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist ./dist
EXPOSE 4321
ENV HOST=0.0.0.0
ENV PORT=4321
CMD ["node", "./dist/server/entry.mjs"]
