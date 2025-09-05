import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ModuleForm = ({ projectId, onClose, onSuccess, editModule = null, moduleType = 'project' }) => {
  const { moduleApi, teamApi, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'not_started',
    priority: 'medium',
    estimated_hours: '',
    assigned_to: [],
    due_date: '',
    visibility: 'private',
    team_id: '',
    tags: '',
    dependencies: ''
  });

  // Teams laden beim Komponenten-Mount
  useEffect(() => {
    loadTeams();
  }, []);

  // Formular mit bestehenden Modul-Daten füllen, wenn bearbeitet wird
  useEffect(() => {
    if (editModule) {
      setFormData({
        name: editModule.name || '',
        description: editModule.description || '',
        status: editModule.status || 'not_started',
        priority: editModule.priority || 'medium',
        estimated_hours: editModule.estimated_hours || '',
        assigned_to: editModule.assigned_to ? (Array.isArray(editModule.assigned_to) ? editModule.assigned_to : [editModule.assigned_to]) : [],
        due_date: editModule.due_date || '',
        visibility: editModule.visibility || 'private',
        team_id: editModule.team_id || '',
        tags: editModule.tags ? editModule.tags.join(', ') : '',
        dependencies: editModule.dependencies ? editModule.dependencies.join(', ') : ''
      });
      
      // Team-Mitglieder laden wenn Team bereits zugewiesen
      if (editModule.team_id) {
        loadTeamMembers(editModule.team_id);
      }
    }
  }, [editModule]);

  // Team-Mitglieder laden wenn Team geändert wird
  useEffect(() => {
    if (formData.team_id) {
      loadTeamMembers(formData.team_id);
    } else {
      setTeamMembers([]);
    }
  }, [formData.team_id]);

  const loadTeams = async () => {
    try {
      const response = await teamApi.getTeams();
      setTeams(response.teams || []);
    } catch (error) {
      console.warn('Teams konnten nicht geladen werden:', error);
    }
  };

  const loadTeamMembers = async (teamId) => {
    try {
      const response = await teamApi.getTeam(teamId);
      setTeamMembers(response.team?.members || []);
    } catch (error) {
      console.warn('Team-Mitglieder konnten nicht geladen werden:', error);
      setTeamMembers([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const moduleData = {
        ...formData,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        assigned_to: formData.assigned_to.length > 0 ? formData.assigned_to : null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        dependencies: formData.dependencies ? formData.dependencies.split(',').map(dep => dep.trim()) : []
      };

      if (editModule) {
        // Modul bearbeiten
        if (projectId) {
          moduleData.project_id = projectId;
        }
        await moduleApi.updateModule(editModule.id, moduleData, moduleType);
        toast.success('Modul erfolgreich aktualisiert');
      } else {
        // Neues Modul erstellen
        moduleData.project_id = projectId;
        await moduleApi.createProjectModule(moduleData);
        toast.success('Modul erfolgreich erstellt');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || `Fehler beim ${editModule ? 'Aktualisieren' : 'Erstellen'} des Moduls`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMemberToggle = (userId) => {
    setFormData({
      ...formData,
      assigned_to: formData.assigned_to.includes(userId)
        ? formData.assigned_to.filter(id => id !== userId)
        : [...formData.assigned_to, userId]
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {editModule ? 'Modul bearbeiten' : 'Neues Modul erstellen'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Modul-Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="select w-full"
              >
                <option value="not_started">Nicht begonnen</option>
                <option value="in_progress">In Bearbeitung</option>
                <option value="testing">Testen</option>
                <option value="completed">Abgeschlossen</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Priorität
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="select w-full"
              >
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
                <option value="critical">Kritisch</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Geschätzte Stunden
              </label>
              <input
                type="number"
                step="0.5"
                name="estimated_hours"
                value={formData.estimated_hours}
                onChange={handleChange}
                className="input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Fälligkeitsdatum
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Sichtbarkeit
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="select w-full"
              >
                <option value="private">Privat</option>
                <option value="team">Team</option>
                <option value="public">Öffentlich</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Team
              </label>
              <select
                name="team_id"
                value={formData.team_id}
                onChange={handleChange}
                className="select w-full"
              >
                <option value="">Kein Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            
            {formData.team_id && teamMembers.length > 0 && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Zugewiesen an (Team-Mitglieder)
                </label>
                <div className="border border-slate-300 dark:border-slate-600 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {teamMembers.map((member) => (
                    <label key={member.user_id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={formData.assigned_to.includes(member.user_id)}
                        onChange={() => handleMemberToggle(member.user_id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {member.username} ({member.role === 'leader' ? 'Team-Leader' : 'Mitglied'})
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Mehrere Team-Mitglieder können ausgewählt werden
                </p>
              </div>
            )}
            
            {!formData.team_id && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Zugewiesen an (Benutzer-IDs)
                </label>
                <input
                  type="text"
                  name="assigned_to"
                  value={formData.assigned_to.join(', ')}
                  onChange={(e) => {
                    const value = e.target.value;
                    const userIds = value ? value.split(',').map(id => id.trim()).filter(id => id) : [];
                    setFormData({ ...formData, assigned_to: userIds });
                  }}
                  placeholder="Benutzer-IDs kommagetrennt (z.B. 1, 2, 3)"
                  className="input w-full"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Ohne Team-Zuweisung: Manuelle Benutzer-IDs eingeben (kommagetrennt)
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Beschreibung
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea w-full"
              rows={3}
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tags (kommagetrennt)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="frontend, backend, api"
              className="input w-full"
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Abhängigkeiten (kommagetrennt)
            </label>
            <input
              type="text"
              name="dependencies"
              value={formData.dependencies}
              onChange={handleChange}
              placeholder="Design-Phase, Datenbank-Setup"
              className="input w-full"
            />
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? (editModule ? 'Aktualisiere...' : 'Erstelle...') : (editModule ? 'Aktualisieren' : 'Erstellen')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModuleForm;
