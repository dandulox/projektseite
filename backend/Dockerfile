# Backend Dockerfile
FROM node:18-alpine

# Arbeitsverzeichnis
WORKDIR /app

# Kopiere package.json und package-lock.json
COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm ci --only=production

# Kopiere Anwendungscode
COPY . .

# Erstelle shared-Verzeichnis
RUN mkdir -p /app/shared

# Exponiere Port
EXPOSE 3001

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Starte Anwendung
CMD ["npm", "start"]
