import React, { useState } from 'react';
import { Bug, Heart, Database } from 'lucide-react';
import ApiDebugPanel from './ApiDebugPanel';
import HealthPanel from './HealthPanel';
import DbStatusPanel from './DbStatusPanel';

const DiagnosticsTabs = () => {
  const [activeTab, setActiveTab] = useState('api-debug');

  const tabs = [
    {
      id: 'api-debug',
      name: 'API-Debug',
      icon: <Bug className="w-4 h-4" />,
      component: <ApiDebugPanel />
    },
    {
      id: 'health',
      name: 'System-Health',
      icon: <Heart className="w-4 h-4" />,
      component: <HealthPanel />
    },
    {
      id: 'db-status',
      name: 'DB-Schema',
      icon: <Database className="w-4 h-4" />,
      component: <DbStatusPanel />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default DiagnosticsTabs;
