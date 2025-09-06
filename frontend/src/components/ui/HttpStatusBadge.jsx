import React from 'react';
import Tooltip from './Tooltip';
import { statusCodeMap } from '../../utils/statusCodeMap';

const HttpStatusBadge = ({ status, className = '' }) => {
  const statusInfo = statusCodeMap[status] || {
    description: 'Unbekannter Status',
    causes: ['Unbekannter HTTP-Status'],
    checks: ['Statuscode überprüfen']
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (status >= 300 && status < 400) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    if (status >= 400 && status < 500) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    if (status >= 500) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const tooltipContent = (
    <div className="space-y-2">
      <div className="font-semibold">{status} - {statusInfo.description}</div>
      <div>
        <div className="font-medium text-xs mb-1">Typische Ursachen:</div>
        <ul className="text-xs space-y-1">
          {statusInfo.causes.map((cause, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-1">•</span>
              <span>{cause}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="font-medium text-xs mb-1">Prüfen Sie:</div>
        <ul className="text-xs space-y-1">
          {statusInfo.checks.map((check, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-1">•</span>
              <span>{check}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent} position="top" delay={100}>
      <span 
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)} ${className}`}
        tabIndex={0}
        role="button"
        aria-label={`HTTP Status ${status}: ${statusInfo.description}`}
      >
        {status}
        <svg 
          className="ml-1 w-3 h-3" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </span>
    </Tooltip>
  );
};

export default HttpStatusBadge;
