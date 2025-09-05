import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, User, Mail, Lock, Eye, EyeOff, Shield, AlertCircle, CheckCircle } from 'lucide-react';

const RegisterFormStartPage = ({ onSwitchToLogin, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Benutzername ist erforderlich';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Benutzername muss mindestens 3 Zeichen lang sein';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail-Adresse ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
    }
    
    if (!formData.password) {
      newErrors.password = 'Passwort ist erforderlich';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Passwort muss mindestens 6 Zeichen lang sein';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwort-Bestätigung ist erforderlich';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
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
      const result = await register(
        formData.username,
        formData.email,
        formData.password,
        formData.role
      );
      if (result.success) {
        setSuccess(true);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setErrors({ general: result.error || result.message || 'Registrierung fehlgeschlagen' });
      }
    } catch (error) {
      setErrors({ general: error.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' });
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
        {/* Erfolgsmeldung */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-400/30 rounded-lg flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-300" />
            <span className="text-green-200 text-sm font-medium">
              Registrierung erfolgreich! Sie werden weitergeleitet...
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
          {/* Benutzername */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Benutzername
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-white/70" />
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
                placeholder="Benutzername eingeben..."
              />
            </div>
            {errors.username && (
              <p className="mt-2 text-sm text-red-300 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.username}</span>
              </p>
            )}
          </div>

          {/* E-Mail */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              E-Mail-Adresse
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-white/70" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                  errors.email 
                    ? 'border-red-400 focus:ring-red-400' 
                    : 'border-white/30'
                }`}
                placeholder="E-Mail-Adresse eingeben..."
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-300 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.email}</span>
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

          {/* Passwort bestätigen */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Passwort bestätigen
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-white/70" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full pl-10 pr-12 py-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                  errors.confirmPassword 
                    ? 'border-red-400 focus:ring-red-400' 
                    : 'border-white/30'
                }`}
                placeholder="Passwort bestätigen..."
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-white/70 hover:text-white" />
                ) : (
                  <Eye className="h-5 w-5 text-white/70 hover:text-white" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-300 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.confirmPassword}</span>
              </p>
            )}
          </div>

          {/* Rolle */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Rolle
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield className="h-5 w-5 text-white/70" />
              </div>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              >
                <option value="user" className="bg-slate-800 text-white">Benutzer</option>
                <option value="viewer" className="bg-slate-800 text-white">Betrachter</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Wird registriert...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Registrieren</span>
              </>
            )}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="mt-6 text-center">
          <p className="text-white/80">
            Bereits ein Account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-300 hover:text-blue-200 font-medium transition-colors duration-200"
            >
              Jetzt anmelden
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterFormStartPage;
