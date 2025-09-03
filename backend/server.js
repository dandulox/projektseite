const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100 // max 100 Anfragen pro IP
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Statische Dateien für Live-Edit
app.use('/shared', express.static(path.join(__dirname, '../shared')));

// Modulare Routen
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const moduleRoutes = require('./routes/modules');
const designRoutes = require('./routes/design');
const adminRoutes = require('./routes/admin');

// API Routen
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/design', designRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Etwas ist schiefgelaufen!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Interner Serverfehler'
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route nicht gefunden' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔧 Admin API: http://localhost:${PORT}/api/admin`);
});

module.exports = app;
