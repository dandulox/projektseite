import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Erstelle QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Einfache Komponenten für den Start
const Dashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
    <p>Willkommen bei der Projektseite!</p>
  </div>
);

const Projects = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Projekte</h1>
    <p>Hier werden alle Projekte angezeigt.</p>
  </div>
);

const Modules = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Module</h1>
    <p>Hier werden alle Module angezeigt.</p>
  </div>
);

const Design = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Design</h1>
    <p>Hier können Sie das Design anpassen.</p>
  </div>
);

const Admin = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Admin</h1>
    <p>Administrationsbereich.</p>
  </div>
);

const Login = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Login</h1>
    <p>Bitte melden Sie sich an.</p>
  </div>
);

// Hauptkomponente
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <div className="flex">
            {/* Einfache Sidebar */}
            <div className="w-64 bg-white shadow-lg min-h-screen">
              <div className="p-4">
                <h2 className="text-xl font-bold text-gray-800">Projektseite</h2>
              </div>
              <nav className="mt-4">
                <a href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Dashboard</a>
                <a href="/projects" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Projekte</a>
                <a href="/modules" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Module</a>
                <a href="/design" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Design</a>
                <a href="/admin" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Admin</a>
              </nav>
            </div>
            
            {/* Hauptinhalt */}
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/modules" element={<Modules />} />
                <Route path="/design" element={<Design />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </div>
          </div>
        </div>
        <Toaster position="top-right" />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
