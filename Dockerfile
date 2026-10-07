# ---- Build do front ----
FROM node:24-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Imagem final (API + front estático) ----
FROM node:24-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY server ./server
COPY src/data ./src/data
EXPOSE 3333
# roda como usuário sem privilégios
USER node
CMD ["node", "server/index.js"]
