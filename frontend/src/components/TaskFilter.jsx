import React from 'react';
import { Plus } from 'lucide-react';

export default function TaskFilter({ activeFilter, onFilterChange, onOpenCreateModal }) {
  const filters = [
    { key: 'ALL', label: 'All Tasks' },
    { key: 'TODO', label: 'To Do' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'DONE', label: 'Done' }
  ];

  return (
    <div className="controls-bar">
      <div className="filter-group">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`btn-filter ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => onFilterChange(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <button className="btn-primary" onClick={onOpenCreateModal}>
        <Plus size={18} />
        <span>Create Task</span>
      </button>
    </div>
  );
}
