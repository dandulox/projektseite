# Backend Dockerfile
FROM node:18-alpine

# Setze Arbeitsverzeichnis
WORKDIR /app

# Kopiere package.json und package-lock.json (falls vorhanden)
COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm install --only=production --no-audit --no-fund

# Kopiere Anwendungscode
COPY . .

# Erstelle shared Verzeichnis
RUN mkdir -p /app/shared

# Exponiere Port
EXPOSE 3001

# Starte Anwendung
CMD ["npm", "start"]
