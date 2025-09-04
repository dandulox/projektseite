import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, User, Lock, Eye, EyeOff, Mail, AlertCircle, CheckCircle } from 'lucide-react';

const LoginForm = ({ onSwitchToRegister, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Benutzername oder E-Mail ist erforderlich';
    }
    
    if (!formData.password) {
      newErrors.password = 'Passwort ist erforderlich';
    } else if (formData.password.length < 3) {
      newErrors.password = 'Passwort muss mindestens 3 Zeichen lang sein';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        setSuccess(true);
        // Login erfolgreich - der AuthContext wird automatisch aktualisiert
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setErrors({ general: result.message || 'Anmeldung fehlgeschlagen' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Fehler für das Feld zurücksetzen, wenn der Benutzer tippt
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  return (
    <div className="w-full">
      <div className="bg-transparent">
        {/* Header - wird von der WelcomePage bereitgestellt */}

        {/* Erfolgsmeldung */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-400/30 rounded-lg flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-300" />
            <span className="text-green-200 text-sm font-medium">
              Anmeldung erfolgreich! Sie werden weitergeleitet...
            </span>
          </div>
        )}

        {/* Allgemeine Fehlermeldung */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-300" />
            <span className="text-red-200 text-sm font-medium">
              {errors.general}
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Benutzername/E-Mail */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Benutzername oder E-Mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className={`w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                  errors.username 
                    ? 'border-red-400 focus:ring-red-400' 
                    : 'border-white/30'
                }`}
                placeholder="Benutzername oder E-Mail eingeben..."
              />
            </div>
            {errors.username && (
              <p className="mt-2 text-sm text-red-300 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.username}</span>
              </p>
            )}
          </div>

          {/* Passwort */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Passwort
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-white/70" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full pl-10 pr-12 py-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                  errors.password 
                    ? 'border-red-400 focus:ring-red-400' 
                    : 'border-white/30'
                }`}
                placeholder="Passwort eingeben..."
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-white/70 hover:text-white" />
                ) : (
                  <Eye className="h-5 w-5 text-white/70 hover:text-white" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-300 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Wird angemeldet...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Anmelden</span>
              </>
            )}
          </button>
        </form>

        {/* Switch to Register */}
        <div className="mt-6 text-center">
          <p className="text-white/80">
            Noch kein Account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-blue-300 hover:text-blue-200 font-medium transition-colors duration-200"
            >
              Jetzt registrieren
            </button>
          </p>
        </div>

        {/* Standard-Zugangsdaten */}
        <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
          <h3 className="text-sm font-medium text-white mb-3">
            Standard-Zugangsdaten:
          </h3>
          <div className="space-y-2 text-xs text-white/80">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              <span><strong>Admin:</strong> admin / admin</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              <span><strong>Benutzer:</strong> user / user123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
