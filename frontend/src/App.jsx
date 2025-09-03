import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Modules from './pages/Modules';
import Design from './pages/Design';
import Admin from './pages/Admin';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DesignProvider } from './contexts/DesignContext';
import './App.css';

// React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Geschützte Route-Komponente
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-spinner">Lade...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Haupt-App-Komponente
const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lade zentrale CSS-Datei
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/shared/styles/main.css';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/modules" element={<Modules />} />
            <Route path="/design" element={<Design />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// Haupt-App
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DesignProvider>
          <Router>
            <AppContent />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--white)',
                  color: 'var(--gray-900)',
                  border: '1px solid var(--gray-200)',
                },
              }}
            />
          </Router>
        </DesignProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
