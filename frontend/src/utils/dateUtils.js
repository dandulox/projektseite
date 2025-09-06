// Datums-Hilfsfunktionen für Frontend
// Konvertiert zwischen verschiedenen Datumsformaten

/**
 * Konvertiert ISO-Datumsstring zu yyyy-MM-dd Format für HTML Date-Inputs
 * @param {string} isoDateString - ISO-Datumsstring (z.B. "2025-09-13T00:00:00.000Z")
 * @returns {string} - Datum im Format yyyy-MM-dd (z.B. "2025-09-13")
 */
export const formatDateForInput = (isoDateString) => {
  if (!isoDateString) return '';
  
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return '';
    
    // Format: yyyy-MM-dd
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Fehler beim Formatieren des Datums:', error);
    return '';
  }
};

/**
 * Konvertiert yyyy-MM-dd Format zu ISO-Datumsstring für API
 * @param {string} dateString - Datum im Format yyyy-MM-dd (z.B. "2025-09-13")
 * @returns {string} - ISO-Datumsstring (z.B. "2025-09-13T00:00:00.000Z")
 */
export const formatDateForApi = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString + 'T00:00:00.000Z');
    if (isNaN(date.getTime())) return null;
    
    return date.toISOString();
  } catch (error) {
    console.error('Fehler beim Formatieren des Datums für API:', error);
    return null;
  }
};

/**
 * Formatiert Datum für Anzeige (deutsches Format)
 * @param {string} isoDateString - ISO-Datumsstring
 * @returns {string} - Formatiertes Datum (z.B. "13.09.2025")
 */
export const formatDateForDisplay = (isoDateString) => {
  if (!isoDateString) return '';
  
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString('de-DE');
  } catch (error) {
    console.error('Fehler beim Formatieren des Datums für Anzeige:', error);
    return '';
  }
};

/**
 * Berechnet Tage bis zum Fälligkeitsdatum
 * @param {string} dueDate - ISO-Datumsstring
 * @returns {number} - Anzahl Tage (negativ = überfällig)
 */
export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  
  try {
    const due = new Date(dueDate);
    const now = new Date();
    
    // Zeit auf Mitternacht setzen für genaue Tagesberechnung
    due.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error('Fehler beim Berechnen der Tage bis Fälligkeit:', error);
    return null;
  }
};

/**
 * Prüft ob Datum in der Zukunft liegt
 * @param {string} dateString - Datum im Format yyyy-MM-dd
 * @returns {boolean} - true wenn Datum in der Zukunft liegt
 */
export const isDateInFuture = (dateString) => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString + 'T00:00:00.000Z');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    return date.getTime() >= now.getTime();
  } catch (error) {
    console.error('Fehler beim Prüfen des Datums:', error);
    return false;
  }
};

/**
 * Validiert Datumsformat
 * @param {string} dateString - Datum im Format yyyy-MM-dd
 * @returns {boolean} - true wenn Format gültig ist
 */
export const isValidDateFormat = (dateString) => {
  if (!dateString) return true; // Leere Werte sind erlaubt
  
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString + 'T00:00:00.000Z');
  return !isNaN(date.getTime());
};

export default {
  formatDateForInput,
  formatDateForApi,
  formatDateForDisplay,
  getDaysUntilDue,
  isDateInFuture,
  isValidDateFormat
};
