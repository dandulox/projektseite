# Frontend Dockerfile
FROM node:18-alpine

# Arbeitsverzeichnis
WORKDIR /app

# Kopiere package.json und package-lock.json
COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm ci

# Kopiere Anwendungscode
COPY . .

# Erstelle shared-Verzeichnis
RUN mkdir -p /app/shared

# Build der Anwendung
RUN npm run build

# Installiere serve für Production
RUN npm install -g serve

# Exponiere Port
EXPOSE 3000

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Starte Anwendung
CMD ["serve", "-s", "dist", "-l", "3000"]
