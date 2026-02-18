# ─── Etapa de desarrollo ───────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copiar dependencias primero (cache de Docker)
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

EXPOSE 3000

# Usar nodemon en desarrollo para hot-reload
CMD ["node", "server.js"]
