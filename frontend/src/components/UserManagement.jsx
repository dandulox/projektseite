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
import UserCard from './UserCard';

// Benutzer-Formular Komponente
const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'user',
    is_active: user?.is_active ?? true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="modal-small">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {user ? 'Benutzer bearbeiten' : 'Neuer Benutzer'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Benutzername
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              E-Mail
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          
          {!user && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Passwort
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input w-full"
                required={!user}
                placeholder="Passwort für neuen Benutzer"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Rolle
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="select w-full"
            >
              <option value="user">Benutzer</option>
              <option value="admin">Administrator</option>
              <option value="viewer">Betrachter</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded"
            />
            <label className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
              Benutzer ist aktiv
            </label>
          </div>
          
          <div className="flex pt-4" style={{gap: '0.75rem'}}>
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary flex-1"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {user ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Passwort-Reset Formular Komponente
const PasswordResetForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwörter stimmen nicht überein');
      return;
    }
    onSubmit(user.id, formData.newPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="modal-small">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Passwort zurücksetzen
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Neues Passwort
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Passwort bestätigen
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          
          <div className="flex pt-4" style={{gap: '0.75rem'}}>
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary flex-1"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              Passwort zurücksetzen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
      setPagination(prev => ({
        ...prev,
        total: data.total,
        pages: data.pages
      }));
    } catch (error) {
      toast.error('Fehler beim Laden der Benutzer');
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
    if (!window.confirm('Benutzer wirklich löschen?')) return;
    
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
      admin: 'badge-danger',
      user: 'badge-info',
      viewer: 'badge-success'
    };
    return (
      <span className={styles[role]}>
        {role === 'admin' ? 'Administrator' : role === 'user' ? 'Benutzer' : 'Betrachter'}
      </span>
    );
  };

  // Status-Badge
  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="badge-success flex items-center" style={{gap: '0.25rem'}}>
        <UserCheck className="w-3 h-3" />
        <span>Aktiv</span>
      </span>
    ) : (
      <span className="badge-danger flex items-center" style={{gap: '0.25rem'}}>
        <UserX className="w-3 h-3" />
        <span>Inaktiv</span>
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Benutzerverwaltung
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Verwalten Sie Benutzer, Rollen und Berechtigungen.
              </p>
            </div>
        
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Neuer Benutzer
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="card">
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex items-center" style={{gap: '1rem'}}>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Suche:</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input pl-10 w-64"
                placeholder="Benutzername oder E-Mail..."
              />
            </div>
          </div>
          
          <div className="flex items-center" style={{gap: '1rem'}}>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rolle:</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="select"
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
                    <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-4 px-6">
                        <UserCard 
                          user={user}
                          size="medium"
                          showRole={false}
                          showStatus={false}
                          className="p-0"
                        />
                      </td>
                      <td className="py-4 px-6">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(user.is_active)}
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">
                        {new Date(user.created_at).toLocaleDateString('de-DE')}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end" style={{gap: '0.5rem'}}>
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Bearbeiten"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowPasswordForm(user)}
                            className="p-2 text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                            title="Passwort zurücksetzen"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Löschen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Zeige {((pagination.page - 1) * pagination.limit) + 1} bis {Math.min(pagination.page * pagination.limit, pagination.total)} von {pagination.total} Benutzern
                </div>
                <div className="flex" style={{gap: '0.5rem'}}>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="btn-secondary text-sm px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Zurück
                  </button>
                  <span className="px-3 py-1 text-sm text-slate-700 dark:text-slate-300">
                    Seite {pagination.page} von {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="btn-secondary text-sm px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Weiter
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        </div>

        {/* Modals */}
        {showCreateForm && (
          <div className="modal-overlay">
            <UserForm
              onSubmit={handleCreateUser}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {editingUser && (
          <div className="modal-overlay">
            <UserForm
              user={editingUser}
              onSubmit={(data) => handleUpdateUser(editingUser.id, data)}
              onCancel={() => setEditingUser(null)}
            />
          </div>
        )}

        {showPasswordForm && (
          <div className="modal-overlay">
            <PasswordResetForm
              user={showPasswordForm}
              onSubmit={handleResetPassword}
              onCancel={() => setShowPasswordForm(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;