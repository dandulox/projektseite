import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

const JsonPreview = ({ 
  data, 
  maxLength = 1000, 
  maxDepth = 2, 
  className = '',
  showCopyButton = true 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const truncateString = (str, maxLength) => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  };

  const formatValue = (value, depth = 0) => {
    if (depth > maxDepth) {
      return <span className="text-slate-500 italic">[Maximale Tiefe erreicht]</span>;
    }

    if (value === null) {
      return <span className="text-slate-500">null</span>;
    }

    if (value === undefined) {
      return <span className="text-slate-500">undefined</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="text-blue-600 dark:text-blue-400">{value.toString()}</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-green-600 dark:text-green-400">{value}</span>;
    }

    if (typeof value === 'string') {
      const truncated = truncateString(value, 100);
      return (
        <span className="text-orange-600 dark:text-orange-400">
          "{truncated}"
        </span>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-slate-500">[]</span>;
      }

      return (
        <div className="ml-4">
          <span className="text-slate-600 dark:text-slate-400">[</span>
          {value.slice(0, 3).map((item, index) => (
            <div key={index} className="ml-2">
              {formatValue(item, depth + 1)}
              {index < Math.min(value.length, 3) - 1 && (
                <span className="text-slate-600 dark:text-slate-400">,</span>
              )}
            </div>
          ))}
          {value.length > 3 && (
            <div className="ml-2 text-slate-500 italic">
              ... und {value.length - 3} weitere
            </div>
          )}
          <span className="text-slate-600 dark:text-slate-400">]</span>
        </div>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return <span className="text-slate-500">{'{}'}</span>;
      }

      return (
        <div className="ml-4">
          <span className="text-slate-600 dark:text-slate-400">{'{'}</span>
          {keys.slice(0, 3).map((key, index) => (
            <div key={key} className="ml-2">
              <span className="text-purple-600 dark:text-purple-400">"{key}"</span>
              <span className="text-slate-600 dark:text-slate-400">: </span>
              {formatValue(value[key], depth + 1)}
              {index < Math.min(keys.length, 3) - 1 && (
                <span className="text-slate-600 dark:text-slate-400">,</span>
              )}
            </div>
          ))}
          {keys.length > 3 && (
            <div className="ml-2 text-slate-500 italic">
              ... und {keys.length - 3} weitere Eigenschaften
            </div>
          )}
          <span className="text-slate-600 dark:text-slate-400">{'}'}</span>
        </div>
      );
    }

    return <span className="text-slate-600 dark:text-slate-400">{String(value)}</span>;
  };

  const handleCopy = async () => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Fehler beim Kopieren:', error);
    }
  };

  const jsonString = JSON.stringify(data, null, 2);
  const isTruncated = jsonString.length > maxLength;

  return (
    <div className={`bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 ${className}`}>
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            JSON Response
          </span>
          {isTruncated && (
            <span className="text-xs text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
              Gekürzt
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {isTruncated && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            >
              {expanded ? (
                <>
                  <ChevronDown className="w-3 h-3" />
                  <span>Weniger</span>
                </>
              ) : (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <span>Erweitern</span>
                </>
              )}
            </button>
          )}
          
          {showCopyButton && (
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              title="JSON kopieren"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Kopiert!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Kopieren</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      <div className="p-3">
        <pre className="text-sm font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap overflow-x-auto">
          {expanded || !isTruncated ? (
            formatValue(data)
          ) : (
            formatValue(JSON.parse(truncateString(jsonString, maxLength)))
          )}
        </pre>
      </div>
    </div>
  );
};

export default JsonPreview;
