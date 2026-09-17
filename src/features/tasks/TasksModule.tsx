import React, { useState, useEffect, useRef } from 'react';
import { Check, Trash2, Edit2, X } from 'lucide-react';
import { saveToStorage, loadFromStorage } from '../../lib/storage';
import styles from './TasksModule.module.css';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

const DEFAULT_TASKS: Task[] = [
  {
    id: 't-1',
    text: 'Review oneSIG database migrations & foreign keys',
    completed: false,
    createdAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 't-2',
    text: 'Test sigchat WebSocket heartbeat reconnection logic',
    completed: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 't-3',
    text: 'Audit Personal Command Center design tokens & contrast',
    completed: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: 't-4',
    text: 'Backup e-pilketos election ballot schema',
    completed: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  }
];

type FilterType = 'All' | 'Active' | 'Completed';

export function TasksModule() {
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage('pcc_tasks_v2', DEFAULT_TASKS));
  const [filter, setFilter] = useState<FilterType>('All');
  const [newTaskText, setNewTaskText] = useState('');
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);
  
  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveToStorage('pcc_tasks_v2', tasks);
  }, [tasks]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        if (!task.completed) {
          // Trigger subtle feedback flash
          setJustCompletedId(id);
          setTimeout(() => setJustCompletedId(null), 500);
        }
        return { ...task, completed: !task.completed };
      }
      return task;
    }));
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditingText(task.text);
  };

  const saveEditing = () => {
    if (!editingId) return;
    if (editingText.trim()) {
      setTasks(prev => prev.map(t => 
        t.id === editingId ? { ...t, text: editingText.trim() } : t
      ));
    }
    setEditingId(null);
    setEditingText('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    if (editingId === id) cancelEditing();
  };

  const clearCompleted = () => {
    setTasks(prev => prev.filter(t => !t.completed));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'Active') return !task.completed;
    if (filter === 'Completed') return task.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>Tasks</h2>
        </div>
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
          <span className={styles.progressText}>
            {completedCount}/{tasks.length} ({progressPercent}%)
          </span>
        </div>
      </header>

      {/* Filter and Clear Controls */}
      <div className={styles.controlsRow}>
        <div className={styles.filterGroup}>
          {(['All', 'Active', 'Completed'] as FilterType[]).map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {completedCount > 0 && (
          <button 
            className={styles.clearCompletedBtn} 
            onClick={clearCompleted}
            title="Remove completed tasks"
          >
            Clear completed
          </button>
        )}
      </div>

      {/* Quick Add Form */}
      <form onSubmit={addTask} className={styles.inputForm}>
        <input
          type="text"
          className={styles.input}
          placeholder="Add a new task..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
        />
        <button type="submit" className={styles.addBtn} disabled={!newTaskText.trim()}>
          Add
        </button>
      </form>

      {/* Task List */}
      <div className={styles.taskList}>
        {filteredTasks.length === 0 && (
          <div className={styles.emptyState}>
            No {filter !== 'All' ? filter.toLowerCase() : ''} tasks.
          </div>
        )}
        
        {filteredTasks.map(task => {
          const isEditing = editingId === task.id;

          return (
            <div 
              key={task.id} 
              className={`${styles.taskItem} ${task.completed ? styles.completed : ''} ${justCompletedId === task.id ? styles.justCompleted : ''}`}
            >
              <div className={styles.completionFlash} />
              
              <button 
                type="button"
                className={`${styles.checkbox} ${task.completed ? styles.checked : ''}`}
                onClick={() => toggleTask(task.id)}
                aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
              >
                {task.completed && <Check size={11} strokeWidth={3} />}
              </button>
              
              {isEditing ? (
                <input
                  ref={editInputRef}
                  type="text"
                  className={styles.editInput}
                  value={editingText}
                  onChange={e => setEditingText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEditing();
                    if (e.key === 'Escape') cancelEditing();
                  }}
                  onBlur={saveEditing}
                />
              ) : (
                <span 
                  className={`${styles.taskContent} ${task.completed ? styles.completed : ''}`}
                  onDoubleClick={() => !task.completed && startEditing(task)}
                  title={!task.completed ? "Double click to edit" : undefined}
                >
                  {task.text}
                </span>
              )}
              
              <div className={styles.taskActions}>
                {!task.completed && !isEditing && (
                  <button 
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => startEditing(task)}
                    aria-label="Edit task"
                    title="Edit task"
                  >
                    <Edit2 size={12} />
                  </button>
                )}
                {isEditing && (
                  <button 
                    type="button"
                    className={styles.iconBtn}
                    onClick={cancelEditing}
                    aria-label="Cancel editing"
                  >
                    <X size={12} />
                  </button>
                )}
                <button 
                  type="button"
                  className={`${styles.iconBtn} ${styles.destructive}`}
                  onClick={() => deleteTask(task.id)}
                  aria-label="Delete task"
                  title="Delete task"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
