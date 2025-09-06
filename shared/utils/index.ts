// Shared Utilities für Frontend und Backend

// Date Utilities
export const dateUtils = {
  formatDate: (date: Date | string, locale: string = 'de-DE'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(locale);
  },

  formatDateTime: (date: Date | string, locale: string = 'de-DE'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString(locale);
  },

  formatTime: (date: Date | string, locale: string = 'de-DE'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString(locale);
  },

  isToday: (date: Date | string): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return d.toDateString() === today.toDateString();
  },

  isTomorrow: (date: Date | string): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return d.toDateString() === tomorrow.toDateString();
  },

  isOverdue: (date: Date | string): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  },

  isDueSoon: (date: Date | string, days: number = 3): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const future = new Date();
    future.setDate(future.getDate() + days);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today && d <= future;
  },

  getDaysUntil: (date: Date | string): number => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = d.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  toISOString: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString();
  },

  fromISOString: (isoString: string): Date => {
    return new Date(isoString);
  },
};

// String Utilities
export const stringUtils = {
  truncate: (str: string, length: number, suffix: string = '...'): string => {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  },

  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  },

  generateId: (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  generateRequestId: (): string => {
    return `req_${Date.now()}_${stringUtils.generateId(9)}`;
  },
};

// Array Utilities
export const arrayUtils = {
  unique: <T>(array: T[]): T[] => {
    return [...new Set(array)];
  },

  groupBy: <T, K extends string | number>(array: T[], key: (item: T) => K): Record<K, T[]> => {
    return array.reduce((groups, item) => {
      const groupKey = key(item);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<K, T[]>);
  },

  sortBy: <T>(array: T[], key: (item: T) => any, direction: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
      const aVal = key(a);
      const bVal = key(b);
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },

  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },
};

// Object Utilities
export const objectUtils = {
  pick: <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },

  omit: <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  },

  deepMerge: <T extends Record<string, any>>(target: T, source: Partial<T>): T => {
    const result = { ...target };
    for (const key in source) {
      if (source[key] !== undefined) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = objectUtils.deepMerge(result[key] || {}, source[key] as any);
        } else {
          result[key] = source[key] as any;
        }
      }
    }
    return result;
  },

  isEmpty: (obj: any): boolean => {
    if (obj == null) return true;
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
  },
};

// Number Utilities
export const numberUtils = {
  formatCurrency: (amount: number, currency: string = 'EUR', locale: string = 'de-DE'): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  },

  formatNumber: (num: number, locale: string = 'de-DE'): string => {
    return new Intl.NumberFormat(locale).format(num);
  },

  formatPercent: (value: number, decimals: number = 1, locale: string = 'de-DE'): string => {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  },

  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  },

  round: (value: number, decimals: number = 2): number => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },
};

// Color Utilities
export const colorUtils = {
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  rgbToHex: (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  getContrastColor: (hex: string): string => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return '#000000';
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  },

  generateRandomColor: (): string => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },
};

// Validation Utilities
export const validationUtils = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  isValidDate: (date: string): boolean => {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  },

  isStrongPassword: (password: string): boolean => {
    // Mindestens 8 Zeichen, 1 Großbuchstabe, 1 Kleinbuchstabe, 1 Zahl
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  },
};

// Environment Utilities
export const envUtils = {
  isDevelopment: (): boolean => {
    return process.env.NODE_ENV === 'development';
  },

  isProduction: (): boolean => {
    return process.env.NODE_ENV === 'production';
  },

  isTest: (): boolean => {
    return process.env.NODE_ENV === 'test';
  },

  getApiUrl: (): string => {
    if (typeof window !== 'undefined') {
      // Frontend
      return process.env.REACT_APP_API_URL || '/api';
    } else {
      // Backend
      return process.env.API_URL || 'http://localhost:3001/api';
    }
  },
};

// Export all utilities
export const utils = {
  date: dateUtils,
  string: stringUtils,
  array: arrayUtils,
  object: objectUtils,
  number: numberUtils,
  color: colorUtils,
  validation: validationUtils,
  env: envUtils,
};
