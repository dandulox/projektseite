import React, { useState } from 'react';
import { 
  Tag, 
  Calendar, 
  GitBranch, 
  Info, 
  Plus, 
  Edit, 
  Save, 
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const VersionManagement = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [newVersion, setNewVersion] = useState({
    major: 2,
    minor: 0,
    patch: 0,
    codename: 'Phoenix',
    releaseDate: new Date().toISOString().split('T')[0],
    changes: ''
  });

  // Aktuelle Version
  const currentVersion = {
    major: 2,
    minor: 0,
    patch: 0,
    codename: 'Phoenix',
    releaseDate: '2024-12-19'
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setNewVersion({
      major: currentVersion.major,
      minor: currentVersion.minor,
      patch: currentVersion.patch,
      codename: currentVersion.codename,
      releaseDate: currentVersion.releaseDate,
      changes: ''
    });
    setIsEditing(false);
  };

  const handleSave = () => {
    // Hier würde die Version in der Datenbank gespeichert werden
    toast.success(`Version ${newVersion.major}.${newVersion.minor}.${newVersion.patch} "${newVersion.codename}" gespeichert!`);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setNewVersion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getVersionType = (major, minor, patch) => {
    if (major > currentVersion.major) return 'major';
    if (minor > currentVersion.minor) return 'minor';
    if (patch > currentVersion.patch) return 'patch';
    return 'current';
  };

  const getVersionTypeColor = (type) => {
    const colors = {
      major: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      minor: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      patch: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      current: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    };
    return colors[type] || colors.current;
  };

  const getVersionTypeLabel = (type) => {
    const labels = {
      major: 'Major Release',
      minor: 'Minor Update',
      patch: 'Patch',
      current: 'Aktuelle Version'
    };
    return labels[type] || labels.current;
  };

  const versionType = getVersionType(newVersion.major, newVersion.minor, newVersion.patch);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Versionsverwaltung
          </h2>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="btn-primary"
            >
              <Edit className="w-4 h-4" />
              <span>Version bearbeiten</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Major Version
                </label>
                <input
                  type="number"
                  min="0"
                  value={newVersion.major}
                  onChange={(e) => handleInputChange('major', parseInt(e.target.value) || 0)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Minor Version
                </label>
                <input
                  type="number"
                  min="0"
                  value={newVersion.minor}
                  onChange={(e) => handleInputChange('minor', parseInt(e.target.value) || 0)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Patch Version
                </label>
                <input
                  type="number"
                  min="0"
                  value={newVersion.patch}
                  onChange={(e) => handleInputChange('patch', parseInt(e.target.value) || 0)}
                  className="input w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Codename
                </label>
                <input
                  type="text"
                  value={newVersion.codename}
                  onChange={(e) => handleInputChange('codename', e.target.value)}
                  className="input w-full"
                  placeholder="z.B. Phoenix, Genesis..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Release-Datum
                </label>
                <input
                  type="date"
                  value={newVersion.releaseDate}
                  onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Änderungen (für Versionsverlauf)
              </label>
              <textarea
                value={newVersion.changes}
                onChange={(e) => handleInputChange('changes', e.target.value)}
                className="input w-full h-32"
                placeholder="Kurze Stichpunkte der Änderungen..."
              />
            </div>

            {/* Version Type Indicator */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center space-x-3">
                {versionType === 'major' && <AlertCircle className="w-5 h-5 text-red-500" />}
                {versionType === 'minor' && <Info className="w-5 h-5 text-yellow-500" />}
                {versionType === 'patch' && <CheckCircle className="w-5 h-5 text-green-500" />}
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {getVersionTypeLabel(versionType)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVersionTypeColor(versionType)}`}>
                  {newVersion.major}.{newVersion.minor}.{newVersion.patch}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="btn-secondary flex-1"
              >
                <X className="w-4 h-4" />
                <span>Abbrechen</span>
              </button>
              <button
                onClick={handleSave}
                className="btn-primary flex-1"
              >
                <Save className="w-4 h-4" />
                <span>Version speichern</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Aktuelle Version */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    Aktuelle Version
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300">
                    {currentVersion.major}.{currentVersion.minor}.{currentVersion.patch} "{currentVersion.codename}"
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-600 dark:text-blue-400">Major Release</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {new Date(currentVersion.releaseDate).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Versionsnummerierung Info */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                Versionsnummerierung
              </h4>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span><strong>Major (X.0.0):</strong> Große Änderungen, neue Features, Breaking Changes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span><strong>Minor (X.Y.0):</strong> Große Bugfixes, wenn Server ohne Fix nicht startet</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span><strong>Patch (X.Y.Z):</strong> Kleine Fixes, UI-Anpassungen, Button-Funktionalität</span>
                </div>
              </div>
            </div>

            {/* Versionsverlauf Link */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Versionsverlauf
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Detaillierte Changelog-Informationen
                  </p>
                </div>
                <button
                  onClick={() => window.open('/dokumentation/versionsverlauf.md', '_blank')}
                  className="btn-secondary"
                >
                  <GitBranch className="w-4 h-4" />
                  <span>Anzeigen</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionManagement;
