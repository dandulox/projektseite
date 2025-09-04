import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const TeamManagement = () => {
  const { teamApi, adminApi, user, isAdmin } = useAuth();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [newMember, setNewMember] = useState({ user_id: '', role: 'member' });

  useEffect(() => {
    loadTeams();
    if (isAdmin) {
      loadUsers();
    }
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await teamApi.getTeams();
      setTeams(response.teams || []);
    } catch (error) {
      toast.error('Fehler beim Laden der Teams');
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminApi.getUsers(1, 100);
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadTeamDetails = async (teamId) => {
    try {
      const response = await teamApi.getTeam(teamId);
      setSelectedTeam(response);
    } catch (error) {
      toast.error('Fehler beim Laden der Team-Details');
      console.error('Error loading team details:', error);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await teamApi.createTeam(newTeam);
      toast.success('Team erfolgreich erstellt');
      setNewTeam({ name: '', description: '' });
      setShowCreateForm(false);
      loadTeams();
    } catch (error) {
      toast.error(error.message || 'Fehler beim Erstellen des Teams');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await teamApi.addTeamMember(selectedTeam.team.id, newMember.user_id, newMember.role);
      toast.success('Mitglied erfolgreich hinzugefügt');
      setNewMember({ user_id: '', role: 'member' });
      setShowAddMemberForm(false);
      loadTeamDetails(selectedTeam.team.id);
    } catch (error) {
      toast.error(error.message || 'Fehler beim Hinzufügen des Mitglieds');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Mitglied wirklich entfernen?')) return;
    
    try {
      await teamApi.removeTeamMember(selectedTeam.team.id, userId);
      toast.success('Mitglied erfolgreich entfernt');
      loadTeamDetails(selectedTeam.team.id);
    } catch (error) {
      toast.error(error.message || 'Fehler beim Entfernen des Mitglieds');
    }
  };

  const handleLeaveTeam = async (teamId) => {
    if (!window.confirm('Team wirklich verlassen?')) return;
    
    try {
      await teamApi.leaveTeam(teamId);
      toast.success('Team erfolgreich verlassen');
      setSelectedTeam(null);
      loadTeams();
    } catch (error) {
      toast.error(error.message || 'Fehler beim Verlassen des Teams');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Team wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
    
    try {
      await teamApi.deleteTeam(teamId);
      toast.success('Team erfolgreich gelöscht');
      setSelectedTeam(null);
      loadTeams();
    } catch (error) {
      toast.error(error.message || 'Fehler beim Löschen des Teams');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'leader': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'member': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'on_hold': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team-Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Verwalte Teams und deren Mitglieder
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Neues Team erstellen
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teams Liste */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Teams</h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    onClick={() => loadTeamDetails(team.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedTeam?.team?.id === team.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{team.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {team.member_count} Mitglieder
                        </p>
                        {team.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
                            {team.description}
                          </p>
                        )}
                      </div>
                      {team.leader_username && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {team.leader_username}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {teams.length === 0 && (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    Keine Teams gefunden
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Team Details */}
          <div className="lg:col-span-2">
            {selectedTeam ? (
              <div className="space-y-6">
                {/* Team Info */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {selectedTeam.team.name}
                        </h2>
                        {selectedTeam.team.description && (
                          <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {selectedTeam.team.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Leader: {selectedTeam.team.leader_username || 'Nicht zugewiesen'}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedTeam.members.length} Mitglieder
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {selectedTeam.team.team_leader_id === user.id || isAdmin ? (
                          <button
                            onClick={() => handleDeleteTeam(selectedTeam.team.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Löschen
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLeaveTeam(selectedTeam.team.id)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Verlassen
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mitglieder */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mitglieder</h3>
                      {(selectedTeam.team.team_leader_id === user.id || isAdmin) && (
                        <button
                          onClick={() => setShowAddMemberForm(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Mitglied hinzufügen
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedTeam.members.map((member) => (
                      <div key={member.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {member.username}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.team_role)}`}>
                                {member.team_role}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {member.email}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Beigetreten: {new Date(member.joined_at).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                          {(selectedTeam.team.team_leader_id === user.id || isAdmin) && 
                           member.id !== user.id && 
                           member.team_role !== 'leader' && (
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600 hover:text-red-700 text-sm transition-colors"
                            >
                              Entfernen
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projekte */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team-Projekte</h3>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedTeam.projects.map((project) => (
                      <div key={project.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{project.name}</h4>
                            {project.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {project.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(project.status)}`}>
                                {project.status}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {project.completion_percentage}% abgeschlossen
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {project.owner_username}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {new Date(project.created_at).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedTeam.projects.length === 0 && (
                      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        Keine Projekte in diesem Team
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Wähle ein Team aus
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Klicke auf ein Team in der Liste, um Details anzuzeigen
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Create Team Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Neues Team erstellen
              </h3>
              <form onSubmit={handleCreateTeam}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team-Name
                  </label>
                  <input
                    type="text"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Beschreibung
                  </label>
                  <textarea
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Erstellen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Member Modal */}
        {showAddMemberForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Mitglied hinzufügen
              </h3>
              <form onSubmit={handleAddMember}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Benutzer
                  </label>
                  <select
                    value={newMember.user_id}
                    onChange={(e) => setNewMember({ ...newMember, user_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Benutzer auswählen</option>
                    {users
                      .filter(u => !selectedTeam.members.some(m => m.id === u.id))
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username} ({user.email})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rolle
                  </label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="member">Mitglied</option>
                    <option value="viewer">Betrachter</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Hinzufügen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;
