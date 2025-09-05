const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { authenticateToken } = require('./auth');

// Middleware für Admin-Berechtigung
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin-Berechtigung erforderlich' });
  }
  next();
};

// Datenbankverbindung
const pool = require('../config/database');

// Aktuelle Version abrufen
router.get('/current', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM system_versions WHERE is_current = true ORDER BY created_at DESC LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Keine aktuelle Version gefunden' 
      });
    }
    
    const version = result.rows[0];
    res.json({
      success: true,
      version: {
        id: version.id,
        major: version.major_version,
        minor: version.minor_version,
        patch: version.patch_version,
        versionType: version.version_type,
        codename: version.codename,
        releaseDate: version.release_date,
        changes: version.changes,
        isCurrent: version.is_current,
        createdAt: version.created_at,
        updatedAt: version.updated_at
      }
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der aktuellen Version:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Abrufen der Version' 
    });
  }
});

// Alle Versionen abrufen
router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM system_versions ORDER BY major_version DESC, minor_version DESC, patch_version DESC'
    );
    
    const versions = result.rows.map(version => ({
      id: version.id,
      major: version.major_version,
      minor: version.minor_version,
      patch: version.patch_version,
      versionType: version.version_type,
      codename: version.codename,
      releaseDate: version.release_date,
      changes: version.changes,
      isCurrent: version.is_current,
      createdAt: version.created_at,
      updatedAt: version.updated_at
    }));
    
    res.json({
      success: true,
      versions
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Versionshistorie:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Abrufen der Versionshistorie' 
    });
  }
});

// Neue Version erstellen (nur Admin)
router.post('/create', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { major, minor, patch, versionType, codename, releaseDate, changes } = req.body;
    
    // Validierung
    if (!major || !releaseDate) {
      return res.status(400).json({
        success: false,
        message: 'Major Version und Release-Datum sind erforderlich'
      });
    }
    
    // Prüfe ob Version bereits existiert
    const existingVersion = await pool.query(
      'SELECT id FROM system_versions WHERE major_version = $1 AND (minor_version = $2 OR (minor_version IS NULL AND $2 IS NULL)) AND (patch_version = $3 OR (patch_version IS NULL AND $3 IS NULL))',
      [major, minor, patch]
    );
    
    if (existingVersion.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Diese Version existiert bereits'
      });
    }
    
    // Beginne Transaktion
    await pool.query('BEGIN');
    
    try {
      // Setze alle anderen Versionen auf is_current = false
      await pool.query('UPDATE system_versions SET is_current = false');
      
      // Erstelle neue Version
      const result = await pool.query(
        `INSERT INTO system_versions (major_version, minor_version, patch_version, version_type, codename, release_date, changes, is_current)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         RETURNING *`,
        [major, minor, patch, versionType || 'major', codename, releaseDate, changes]
      );
      
      // Committe Transaktion
      await pool.query('COMMIT');
      
      const newVersion = result.rows[0];
      res.json({
        success: true,
        message: `Version ${major}.${minor}.${patch} "${codename}" erfolgreich erstellt`,
        version: {
          id: newVersion.id,
          major: newVersion.major_version,
          minor: newVersion.minor_version,
          patch: newVersion.patch_version,
          codename: newVersion.codename,
          releaseDate: newVersion.release_date,
          changes: newVersion.changes,
          isCurrent: newVersion.is_current,
          createdAt: newVersion.created_at,
          updatedAt: newVersion.updated_at
        }
      });
    } catch (error) {
      // Rollback bei Fehler
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Fehler beim Erstellen der neuen Version:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Erstellen der neuen Version' 
    });
  }
});

// Version aktualisieren (nur Admin)
router.put('/update/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { major, minor, patch, versionType, codename, releaseDate, changes } = req.body;
    
    // Validierung
    if (!major || !releaseDate) {
      return res.status(400).json({
        success: false,
        message: 'Major Version und Release-Datum sind erforderlich'
      });
    }
    
    // Prüfe ob Version existiert
    const existingVersion = await pool.query(
      'SELECT * FROM system_versions WHERE id = $1',
      [id]
    );
    
    if (existingVersion.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Version nicht gefunden'
      });
    }
    
    // Prüfe ob Version bereits existiert (außer der aktuellen)
    const duplicateVersion = await pool.query(
      'SELECT id FROM system_versions WHERE major_version = $1 AND (minor_version = $2 OR (minor_version IS NULL AND $2 IS NULL)) AND (patch_version = $3 OR (patch_version IS NULL AND $3 IS NULL)) AND id != $4',
      [major, minor, patch, id]
    );
    
    if (duplicateVersion.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Diese Version existiert bereits'
      });
    }
    
    // Aktualisiere Version
    const result = await pool.query(
      `UPDATE system_versions 
       SET major_version = $1, minor_version = $2, patch_version = $3, 
           version_type = $4, codename = $5, release_date = $6, changes = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [major, minor, patch, versionType || 'major', codename, releaseDate, changes, id]
    );
    
    const updatedVersion = result.rows[0];
    res.json({
      success: true,
      message: `Version ${major}.${minor}.${patch} "${codename}" erfolgreich aktualisiert`,
      version: {
        id: updatedVersion.id,
        major: updatedVersion.major_version,
        minor: updatedVersion.minor_version,
        patch: updatedVersion.patch_version,
        versionType: updatedVersion.version_type,
        codename: updatedVersion.codename,
        releaseDate: updatedVersion.release_date,
        changes: updatedVersion.changes,
        isCurrent: updatedVersion.is_current,
        createdAt: updatedVersion.created_at,
        updatedAt: updatedVersion.updated_at
      }
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Version:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Aktualisieren der Version' 
    });
  }
});

// Version als aktuell setzen (nur Admin)
router.put('/set-current/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Beginne Transaktion
    await pool.query('BEGIN');
    
    try {
      // Setze alle Versionen auf is_current = false
      await pool.query('UPDATE system_versions SET is_current = false');
      
      // Setze gewählte Version auf is_current = true
      const result = await pool.query(
        'UPDATE system_versions SET is_current = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Version nicht gefunden'
        });
      }
      
      // Committe Transaktion
      await pool.query('COMMIT');
      
      const version = result.rows[0];
      res.json({
        success: true,
        message: `Version ${version.major_version}.${version.minor_version}.${version.patch_version} "${version.codename}" ist jetzt die aktuelle Version`,
        version: {
          id: version.id,
          major: version.major_version,
          minor: version.minor_version,
          patch: version.patch_version,
          codename: version.codename,
          releaseDate: version.release_date,
          changes: version.changes,
          isCurrent: version.is_current,
          createdAt: version.created_at,
          updatedAt: version.updated_at
        }
      });
    } catch (error) {
      // Rollback bei Fehler
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Fehler beim Setzen der aktuellen Version:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Setzen der aktuellen Version' 
    });
  }
});

module.exports = router;
