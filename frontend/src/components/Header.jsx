import React from 'react';
import { Layers, Activity } from 'lucide-react';

export default function Header({ isHealthy }) {
  return (
    <header className="header">
      <div className="brand">
        <div className="brand-icon">
          <Layers size={24} />
        </div>
        <div>
          <h1 className="brand-title">TaskFlow Pro</h1>
        </div>
        <span className="brand-badge">Docker Edition</span>
      </div>

      <div className="system-status" title="System Connectivity Status">
        <Activity size={16} />
        <span>Backend API:</span>
        <div className={`status-dot ${isHealthy ? 'up' : ''}`}></div>
        <strong style={{ color: isHealthy ? '#4ade80' : '#f87171' }}>
          {isHealthy ? 'HEALTHY (UP)' : 'DISCONNECTED'}
        </strong>
      </div>
    </header>
  );
}
