import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  DashboardData, 
  DashboardStatsData, 
  UseDashboardReturn, 
  UseDashboardStatsReturn 
} from '../types/dashboard';

// API Base URL Helper
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  const currentHost = window.location.hostname;
  const currentPort = window.location.port;
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return `http://${currentHost}:3001/api`;
  }
  
  if (currentPort === '3000') {
    return `http://${currentHost}:3001/api`;
  }
  
  if (!currentPort || currentPort === '80' || currentPort === '443') {
    return `http://${currentHost}:3001/api`;
  }
  
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

// API Helper Function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Ein Fehler ist aufgetreten');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Hook für Dashboard-Daten
export const useDashboard = (): UseDashboardReturn => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('/dashboard/me');
      setData(response);
      setLastUpdated(response.lastUpdated);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Dashboard-Daten';
      setError(errorMessage);
      console.error('Dashboard-Fehler:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData,
    lastUpdated
  };
};

// Hook für Dashboard-Statistiken
export const useDashboardStats = (): UseDashboardStatsReturn => {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('/dashboard/me/stats');
      setStats(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Dashboard-Statistiken';
      setError(errorMessage);
      console.error('Dashboard-Stats-Fehler:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchDashboardStats
  };
};

// Hook für Dashboard mit Auto-Refresh
export const useDashboardWithRefresh = (refreshInterval: number = 300000): UseDashboardReturn => {
  const dashboard = useDashboard();

  useEffect(() => {
    if (!dashboard.data) return;

    const interval = setInterval(() => {
      dashboard.refetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [dashboard.data, dashboard.refetch, refreshInterval]);

  return dashboard;
};

// Hook für Dashboard-Filter
export const useDashboardFilters = () => {
  const [filters, setFilters] = useState({
    timeRange: 'week' as const,
    priority: 'all' as const,
    status: 'all' as const,
    team: undefined as number | undefined
  });

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      timeRange: 'week',
      priority: 'all',
      status: 'all',
      team: undefined
    });
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters
  };
};
