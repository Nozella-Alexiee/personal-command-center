import { useState, useEffect } from 'react';
import { Plus, ExternalLink, Trash2, Edit2, X } from 'lucide-react';
import { saveToStorage, loadFromStorage } from '../../lib/storage';
import styles from './ProjectsModule.module.css';

export type ProjectStatus = 'Active' | 'Paused' | 'Completed';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  tech: string[];
  link?: string;
  updatedAt: number;
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'oneSIG',
    description: 'School ecosystem platform for academics, attendance, digital wallet, and internship management.',
    status: 'Active',
    tech: ['PHP', 'Laravel', 'MySQL'],
    link: 'https://github.com/alexie/oneSIG',
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: '2',
    name: 'SIGChat',
    description: 'Real-time school communication app with end-to-end encryption, classroom groups, and moderation.',
    status: 'Active',
    tech: ['Node.js', 'WebSocket', 'Express'],
    link: 'https://github.com/alexie/sigchat',
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: '3',
    name: 'Portfolio',
    description: 'Personal developer showcase and playground for UI experiments and architecture demos.',
    status: 'Active',
    tech: ['React', 'TypeScript', 'Vite'],
    link: 'https://alexie.dev',
    updatedAt: Date.now() - 1000 * 60 * 60 * 48,
  },
  {
    id: '4',
    name: 'E-Pilketos',
    description: 'Digital voting system for student council elections with live tallying and audit trail.',
    status: 'Completed',
    tech: ['PHP', 'MySQL', 'Bootstrap'],
    link: 'https://github.com/alexie/e-pilketos',
    updatedAt: Date.now() - 1000 * 60 * 60 * 120,
  },
  {
    id: '5',
    name: 'Absensi App',
    description: 'QR-based student and teacher attendance logging with automated parent notification.',
    status: 'Paused',
    tech: ['PHP', 'MySQL', 'JS'],
    updatedAt: Date.now() - 1000 * 60 * 60 * 240,
  }
];

type FilterStatus = 'All' | ProjectStatus;

export function ProjectsModule() {
  const [projects, setProjects] = useState<Project[]>(() => 
    loadFromStorage('pcc_projects_v2', DEFAULT_PROJECTS)
  );
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state for create / edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  
  // Form fields
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<ProjectStatus>('Active');
  const [formTech, setFormTech] = useState('');
  const [formLink, setFormLink] = useState('');

  useEffect(() => {
    saveToStorage('pcc_projects_v2', projects);
  }, [projects]);

  const openCreateModal = () => {
    setEditingProjectId(null);
    setFormName('');
    setFormDescription('');
    setFormStatus('Active');
    setFormTech('');
    setFormLink('');
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProjectId(project.id);
    setFormName(project.name);
    setFormDescription(project.description);
    setFormStatus(project.status);
    setFormTech(project.tech.join(', '));
    setFormLink(project.link || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProjectId(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const techArray = formTech
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (editingProjectId) {
      // Edit existing
      setProjects(prev => prev.map(p => {
        if (p.id === editingProjectId) {
          return {
            ...p,
            name: formName.trim(),
            description: formDescription.trim(),
            status: formStatus,
            tech: techArray,
            link: formLink.trim() || undefined,
            updatedAt: Date.now(),
          };
        }
        return p;
      }));
    } else {
      // Create new
      const newProject: Project = {
        id: crypto.randomUUID(),
        name: formName.trim(),
        description: formDescription.trim(),
        status: formStatus,
        tech: techArray,
        link: formLink.trim() || undefined,
        updatedAt: Date.now(),
      };
      setProjects([newProject, ...projects]);
    }

    closeModal();
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const filteredProjects = projects.filter(project => {
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tech.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>Projects</h2>
          <span className={styles.countBadge}>
            {filteredProjects.length} / {projects.length}
          </span>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.addBtn}
            onClick={openCreateModal}
            aria-label="New project"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>New Project</span>
          </button>
        </div>
      </header>

      <div className={styles.controlsRow}>
        <div className={styles.filterGroup}>
          {(['All', 'Active', 'Paused', 'Completed'] as FilterStatus[]).map(status => (
            <button
              key={status}
              className={`${styles.filterBtn} ${statusFilter === status ? styles.filterBtnActive : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Filter projects..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Project Card List */}
      <div className={styles.list}>
        {filteredProjects.length === 0 && (
          <div className={styles.emptyState}>
            No projects found matching the criteria.
          </div>
        )}

        {filteredProjects.map(project => {
          const statusClass = 
            project.status === 'Active' ? styles.statusActive :
            project.status === 'Paused' ? styles.statusPaused :
            styles.statusCompleted;

          return (
            <div key={project.id} className={styles.projectCard}>
              <div className={styles.cardHeader}>
                <div className={styles.projectNameGroup}>
                  <h3 className={styles.projectName}>{project.name}</h3>
                  <span className={`${styles.statusPill} ${statusClass}`}>
                    <span className={styles.statusDot} />
                    {project.status}
                  </span>
                </div>

                <div className={styles.cardActions}>
                  {project.link && (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.linkBtn}
                      title="Open project link"
                    >
                      <ExternalLink size={12} />
                      <span>Link</span>
                    </a>
                  )}
                  <button 
                    className={styles.actionBtn} 
                    onClick={() => openEditModal(project)}
                    aria-label={`Edit ${project.name}`}
                    title="Edit project"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button 
                    className={`${styles.actionBtn} ${styles.destructive}`} 
                    onClick={() => deleteProject(project.id)}
                    aria-label={`Delete ${project.name}`}
                    title="Delete project"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {project.description && (
                <p className={styles.description}>{project.description}</p>
              )}

              {project.tech.length > 0 && (
                <div className={styles.cardFooter}>
                  <div className={styles.techStack}>
                    {project.tech.map(t => (
                      <span key={t} className={styles.techTag}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Project Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingProjectId ? 'Edit Project' : 'New Project'}
              </h3>
              <button className={styles.closeBtn} onClick={closeModal} aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              <div className={styles.formField}>
                <label className={styles.label}>Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. oneSIG"
                  className={styles.input}
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>Description</label>
                <textarea
                  placeholder="What is this project about?"
                  className={styles.textarea}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>Status</label>
                <select
                  className={styles.select}
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as ProjectStatus)}
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>Tech Stack (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, TypeScript, Vite"
                  className={styles.input}
                  value={formTech}
                  onChange={e => setFormTech(e.target.value)}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>Repository / Demo URL</label>
                <input
                  type="text"
                  placeholder="https://github.com/..."
                  className={styles.input}
                  value={formLink}
                  onChange={e => setFormLink(e.target.value)}
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={!formName.trim()}>
                  {editingProjectId ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
