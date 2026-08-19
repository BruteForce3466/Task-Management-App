import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TaskFilter from './components/TaskFilter';
import TaskCard from './components/TaskCard';
import TaskFormModal from './components/TaskFormModal';
import { CheckSquare } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [isHealthy, setIsHealthy] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check health and fetch tasks on mount
  useEffect(() => {
    checkHealth();
    fetchTasks();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch('/health');
      if (res.ok) {
        const data = await res.json();
        setIsHealthy(data.status === 'UP');
      } else {
        setIsHealthy(false);
      }
    } catch {
      setIsHealthy(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks from backend');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateTask = async (taskData) => {
    try {
      if (editingTask) {
        // PUT update
        const res = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
        if (!res.ok) throw new Error('Failed to update task');
      } else {
        // POST create
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
        if (!res.ok) throw new Error('Failed to create task');
      }
      setIsModalOpen(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchTasks();
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete task');
      fetchTasks();
    } catch (err) {
      alert(`Error deleting task: ${err.message}`);
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  return (
    <div className="app-container">
      <Header isHealthy={isHealthy} />

      <TaskFilter
        activeFilter={filter}
        onFilterChange={setFilter}
        onOpenCreateModal={openCreateModal}
      />

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          padding: '1rem',
          borderRadius: '12px',
          marginBottom: '1.5rem'
        }}>
          ⚠️ Could not connect to API backend. Ensure Docker containers are running.
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <p>Loading tasks from PostgreSQL database...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <CheckSquare className="empty-icon" />
          <h3>No tasks found</h3>
          <p style={{ marginTop: '0.5rem' }}>
            {filter === 'ALL'
              ? 'Get started by creating your first task.'
              : `No tasks currently in status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="tasks-grid">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={openEditModal}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdateTask}
        initialTask={editingTask}
      />
    </div>
  );
}
