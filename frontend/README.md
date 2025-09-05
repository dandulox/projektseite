# Projektseite Frontend

React-basiertes Frontend für die Projektseite-Anwendung mit modernem Design und responsivem Layout.

## 🚀 Features

- **React 18** mit modernen Hooks
- **Tailwind CSS** für Styling mit CSS-Variablen
- **Vite** als Build-Tool und Development Server
- **Responsive Design** mit Mobile-First-Ansatz
- **Theme-Management** (Light/Dark Mode)
- **CSS-Variablen** für konsistentes Design

## 🛠️ Entwicklung

### Abhängigkeiten installieren
```bash
cd frontend
npm install
```

### Entwicklungsserver starten
```bash
npm run dev
```

### Produktions-Build erstellen
```bash
npm run build
```

## 📁 Struktur

```
frontend/
├── src/
│   ├── components/          # React-Komponenten
│   │   ├── LoginForm.jsx
│   │   ├── UserManagement.jsx
│   │   ├── ProjectManagement.jsx
│   │   ├── ModuleManagement.jsx
│   │   ├── TeamManagement.jsx
│   │   └── ...
│   ├── pages/              # Seiten-Komponenten
│   │   └── AuthPage.jsx
│   ├── contexts/           # React Contexts
│   │   └── AuthContext.jsx
│   ├── App.jsx             # Haupt-App-Komponente
│   ├── main.jsx            # React Entry Point
│   └── index.css           # Globale Styles mit CSS-Variablen
├── index.html              # HTML-Template
├── nginx.conf              # Nginx-Konfiguration
├── vite.config.js          # Vite-Konfiguration
├── tailwind.config.cjs     # Tailwind CSS-Konfiguration
└── postcss.config.cjs      # PostCSS-Konfiguration
```

## 🎨 Design-System

Das Frontend verwendet ein zentrales Design-System mit CSS-Variablen:

- **Light/Dark Mode** Support
- **Responsive Design** für alle Bildschirmgrößen
- **Konsistente Farbpalette** mit CSS-Variablen
- **Moderne UI-Komponenten** mit Tailwind CSS

## 🔧 Konfiguration

### Tailwind CSS
- Konfiguriert in `tailwind.config.cjs`
- Erweiterte Farbpalette und Komponenten
- Responsive Breakpoints

### Vite
- Konfiguriert in `vite.config.js`
- Optimierte Builds für Produktion
- Hot Module Replacement für Entwicklung

### PostCSS
- Konfiguriert in `postcss.config.cjs`
- Tailwind CSS Integration
- Autoprefixer für Browser-Kompatibilität

## 📱 Responsive Design

- **Mobile-First** Ansatz
- **Breakpoints**: sm, md, lg, xl, 2xl
- **Flexible Layouts** für alle Bildschirmgrößen
- **Touch-optimierte** Benutzeroberfläche

## 🌐 Browser-Kompatibilität

- **Moderne Browser**: Chrome, Firefox, Safari, Edge
- **ES6+ Features** mit Vite-Transpilation
- **CSS Grid und Flexbox** Support
- **Progressive Enhancement**

## 📚 Weitere Dokumentation

Für detaillierte Informationen siehe:
- **[Setup-Anweisungen](../dokumentation/setup-anweisungen.md)**
- **[Technologie-Stack](../dokumentation/technologie-stack.md)**
- **[Features](../dokumentation/features.md)**