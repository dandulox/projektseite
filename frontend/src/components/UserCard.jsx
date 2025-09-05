import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Calendar,
  Shield,
  Clock,
  Activity,
  Award,
  MessageSquare,
  ExternalLink
} from 'lucide-react';

const UserCard = ({ 
  user, 
  showHover = true, 
  showClick = true, 
  size = 'medium',
  showRole = true,
  showStatus = true,
  className = ''
}) => {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  // Größen-Varianten
  const sizeClasses = {
    small: {
      avatar: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-sm',
      name: 'text-sm font-medium',
      email: 'text-xs'
    },
    medium: {
      avatar: 'w-10 h-10',
      icon: 'w-5 h-5',
      text: 'text-sm',
      name: 'text-sm font-medium',
      email: 'text-xs'
    },
    large: {
      avatar: 'w-12 h-12',
      icon: 'w-6 h-6',
      text: 'text-base',
      name: 'text-base font-medium',
      email: 'text-sm'
    }
  };

  const currentSize = sizeClasses[size];

  // Benutzerstatistiken laden
  const loadUserStats = async () => {
    if (userStats || loading) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/auth/user/${user.id}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerstatistiken:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hover-Handler
  const handleMouseEnter = () => {
    if (!showHover) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
      loadUserStats();
    }, 500); // 500ms Verzögerung
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowTooltip(false);
  };

  // Click-Handler
  const handleClick = () => {
    if (showClick) {
      navigate(`/profile/${user.id}`);
    }
  };

  // Rolle-Badge
  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      user: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      viewer: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    };
    const labels = {
      admin: 'Admin',
      user: 'User',
      viewer: 'Viewer'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
        {labels[role]}
      </span>
    );
  };

  // Status-Badge
  const getStatusBadge = (isActive) => {
    return isActive ? (
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-xs text-green-600 dark:text-green-400">Aktiv</span>
      </div>
    ) : (
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-xs text-red-600 dark:text-red-400">Inaktiv</span>
      </div>
    );
  };

  // Click outside handler für Tooltip
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTooltip]);

  return (
    <div className="relative">
      {/* Benutzer-Card */}
      <div
        className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 ${
          showClick ? 'cursor-pointer' : ''
        } ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* Avatar */}
        <div className={`${currentSize.avatar} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0`}>
          <User className={`${currentSize.icon} text-white`} />
        </div>

        {/* Benutzer-Info */}
        <div className="flex-1 min-w-0">
          <div className={`${currentSize.name} text-slate-900 dark:text-white truncate`}>
            {user.username}
          </div>
          <div className={`${currentSize.email} text-slate-600 dark:text-slate-400 truncate`}>
            {user.email}
          </div>
          {showRole && (
            <div className="mt-1">
              {getRoleBadge(user.role)}
            </div>
          )}
          {showStatus && (
            <div className="mt-1">
              {getStatusBadge(user.is_active)}
            </div>
          )}
        </div>

        {/* External Link Icon */}
        {showClick && (
          <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        )}
      </div>

      {/* Hover-Tooltip */}
      {showTooltip && showHover && (
        <div
          ref={tooltipRef}
          className="absolute z-50 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 top-full left-0 mt-2"
        >
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {user.username}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {user.email}
              </p>
              <div className="mt-1">
                {getRoleBadge(user.role)}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-4">
            {getStatusBadge(user.is_active)}
          </div>

          {/* Statistiken */}
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : userStats ? (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {userStats.projects?.total_projects || 0}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Projekte</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {userStats.teams?.total_teams || 0}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Teams</p>
              </div>
            </div>
          ) : null}

          {/* Mitgliedschaftsdauer */}
          <div className="flex items-center space-x-2 mb-4 text-sm text-slate-600 dark:text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>Mitglied seit {new Date(user.created_at).toLocaleDateString('de-DE')}</span>
          </div>

          {/* Aktionen */}
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${user.id}`);
              }}
              className="btn-primary flex-1 text-xs py-2"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Profil anzeigen</span>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/messages?user=${user.id}`);
              }}
              className="btn-secondary flex-1 text-xs py-2"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Nachricht</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCard;
