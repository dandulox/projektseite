import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Shield, 
  Mail, 
  Calendar,
  Eye,
  EyeOff,
  Key,
  UserCheck,
  UserX,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const { adminApi, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    role: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(null);

  // Benutzer laden
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers(
        pagination.page,
        pagination.limit,
        filters.search,
        filters.role
      );
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Fehler beim Laden der Benutzer');
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [pagination.page, filters]);

  // Benutzer erstellen
  const handleCreateUser = async (userData) => {
    try {
      await adminApi.createUser(userData);
      toast.success('Benutzer erfolgreich erstellt');
      setShowCreateForm(false);
      loadUsers();
    } catch (error) {
      toast.error(error.message || 'Fehler beim Erstellen des Benutzers');
    }
  };

  // Benutzer aktualisieren
  const handleUpdateUser = async (userId, userData) => {
    try {
      await adminApi.updateUser(userId, userData);
      toast.success('Benutzer erfolgreich aktualisiert');
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      toast.error(error.message || 'Fehler beim Aktualisieren des Benutzers');
    }
  };

  // Benutzer löschen
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?')) {
      return;
    }

    try {
      await adminApi.deleteUser(userId);
      toast.success('Benutzer erfolgreich gelöscht');
      loadUsers();
    } catch (error) {
      toast.error(error.message || 'Fehler beim Löschen des Benutzers');
    }
  };

  // Passwort zurücksetzen
  const handleResetPassword = async (userId, newPassword) => {
    try {
      await adminApi.resetUserPassword(userId, newPassword);
      toast.success('Passwort erfolgreich zurückgesetzt');
      setShowPasswordForm(null);
    } catch (error) {
      toast.error(error.message || 'Fehler beim Zurücksetzen des Passworts');
    }
  };

  // Filter ändern
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Rolle-Badge
  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      user: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      viewer: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
        {role === 'admin' ? 'Administrator' : role === 'user' ? 'Benutzer' : 'Betrachter'}
      </span>
    );
  };

  // Status-Badge
  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center space-x-1">
        <UserCheck className="w-3 h-3" />
        <span>Aktiv</span>
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 flex items-center space-x-1">
        <UserX className="w-3 h-3" />
        <span>Inaktiv</span>
      </span>
    );
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Benutzerverwaltung
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Verwalten Sie Benutzer, Rollen und Berechtigungen.
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Neuer Benutzer</span>
        </button>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Suche:</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                placeholder="Benutzername oder E-Mail..."
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rolle:</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Alle Rollen</option>
              <option value="admin">Administrator</option>
              <option value="user">Benutzer</option>
              <option value="viewer">Betrachter</option>
            </select>
          </div>
        </div>
      </div>

      {/* Benutzer-Tabelle */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Benutzer</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Rolle</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Erstellt</th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {user.username}
                              {user.id === currentUser?.id && (
                                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">(Sie)</span>
                              )}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                              <Mail className="w-3 h-3" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(user.is_active)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(user.created_at).toLocaleDateString('de-DE')}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                            title="Bearbeiten"
                          >
                            <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </button>
                          
                          <button
                            onClick={() => setShowPasswordForm(user)}
                            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                            title="Passwort zurücksetzen"
                          >
                            <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                          
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                              title="Löschen"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginierung */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Zeige {((pagination.page - 1) * pagination.limit) + 1} bis {Math.min(pagination.page * pagination.limit, pagination.total)} von {pagination.total} Benutzern
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Zurück
                  </button>
                  <span className="px-3 py-2 text-slate-700 dark:text-slate-300">
                    Seite {pagination.page} von {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Weiter
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Benutzer erstellen/bearbeiten Modal */}
      {(showCreateForm || editingUser) && (
        <UserForm
          user={editingUser}
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingUser(null);
          }}
        />
      )}

      {/* Passwort zurücksetzen Modal */}
      {showPasswordForm && (
        <PasswordResetForm
          user={showPasswordForm}
          onSubmit={handleResetPassword}
          onCancel={() => setShowPasswordForm(null)}
        />
      )}
    </div>
  );
};

// Benutzer-Formular Komponente
const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    role: user?.role || 'user',
    is_active: user?.is_active ?? true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user) {
      onSubmit(user.id, formData);
    } else {
      // Für neue Benutzer ist ein Passwort erforderlich
      const password = prompt('Passwort für den neuen Benutzer:');
      if (!password) return;
      onSubmit({ ...formData, password });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {user ? 'Benutzer bearbeiten' : 'Neuen Benutzer erstellen'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Benutzername
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              E-Mail
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Rolle
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="user">Benutzer</option>
              <option value="viewer">Betrachter</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {user && (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Benutzer ist aktiv
              </label>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors duration-200"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              {user ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Passwort zurücksetzen Formular
const PasswordResetForm = ({ user, onSubmit, onCancel }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwörter stimmen nicht überein');
      return;
    }
    if (newPassword.length < 6) {
      alert('Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }
    onSubmit(user.id, newPassword);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Passwort zurücksetzen
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Neues Passwort für {user.username}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Neues Passwort
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-slate-400" />
                ) : (
                  <Eye className="w-5 h-5 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Passwort bestätigen
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors duration-200"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              Passwort zurücksetzen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;
