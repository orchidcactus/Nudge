import React from 'react';

const severityColors = {
  LOW: 'bg-success/20 text-success border border-success/30',
  MEDIUM: 'bg-warning/20 text-warning border border-warning/30',
  HIGH: 'bg-danger/20 text-danger border border-danger/30',
};

export default function Badge({ severity }) {
  const colorClass = severityColors[severity] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${colorClass}`}>
      {severity}
    </span>
  );
}
