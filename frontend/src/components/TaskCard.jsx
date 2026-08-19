import React from 'react';
import { Edit2, Trash2, Calendar } from 'lucide-react';

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleNextStatus = () => {
    const statusOrder = ['TODO', 'IN_PROGRESS', 'DONE'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    onStatusChange(task.id, nextStatus);
  };

  return (
    <div className="task-card">
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <button
          className={`status-badge ${task.status}`}
          onClick={handleNextStatus}
          title="Click to cycle status (TODO -> IN_PROGRESS -> DONE)"
          style={{ cursor: 'pointer' }}
        >
          {task.status.replace('_', ' ')}
        </button>
      </div>

      <p className="task-description">
        {task.description || 'No description provided.'}
      </p>

      <div className="task-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={14} />
          <span>{formatDate(task.created_at)}</span>
        </div>

        <div className="task-actions">
          <button
            className="btn-icon"
            onClick={() => onEdit(task)}
            title="Edit Task"
          >
            <Edit2 size={16} />
          </button>
          <button
            className="btn-icon delete"
            onClick={() => onDelete(task.id)}
            title="Delete Task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
