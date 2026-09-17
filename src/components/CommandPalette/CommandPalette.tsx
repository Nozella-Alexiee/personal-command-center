import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  CheckSquare, 
  Briefcase, 
  FileText, 
  Bookmark, 
  Moon, 
  Sun, 
  Download, 
  Upload,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { loadFromStorage, saveToStorage } from '../../lib/storage';
import type { NavView } from '../../layouts/AppShell';
import styles from './CommandPalette.module.css';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: NavView) => void;
  onToggleTheme: () => void;
  currentTheme: string;
}

interface PaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Navigation' | 'Actions' | 'Items';
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette({ 
  isOpen, 
  onClose, 
  onNavigate, 
  onToggleTheme,
  currentTheme 
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  // Export JSON handler
  const handleExportData = () => {
    const data = {
      tasks: loadFromStorage('pcc_tasks_v2', []),
      projects: loadFromStorage('pcc_projects_v2', []),
      notes: loadFromStorage('pcc_notes_v2', []),
      bookmarks: loadFromStorage('pcc_bookmarks_v2', []),
      theme: loadFromStorage('pcc_theme', 'system'),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `command-center-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  // Import JSON handler
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.tasks && Array.isArray(parsed.tasks)) saveToStorage('pcc_tasks_v2', parsed.tasks);
        if (parsed.projects && Array.isArray(parsed.projects)) saveToStorage('pcc_projects_v2', parsed.projects);
        if (parsed.notes && Array.isArray(parsed.notes)) saveToStorage('pcc_notes_v2', parsed.notes);
        if (parsed.bookmarks && Array.isArray(parsed.bookmarks)) saveToStorage('pcc_bookmarks_v2', parsed.bookmarks);
        if (parsed.theme && typeof parsed.theme === 'string') saveToStorage('pcc_theme', parsed.theme);
        window.location.reload();
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  // Fetch items from storage for search indexing
  const tasks = loadFromStorage<{ id: string; text: string; completed: boolean }[]>('pcc_tasks_v2', []);
  const projects = loadFromStorage<{ id: string; name: string; description: string; link?: string }[]>('pcc_projects_v2', []);
  const notes = loadFromStorage<{ id: string; title: string; content: string }[]>('pcc_notes_v2', []);
  const bookmarks = loadFromStorage<{ id: string; title: string; url: string }[]>('pcc_bookmarks_v2', []);

  // Build commands
  const baseItems: PaletteItem[] = [
    {
      id: 'nav-overview',
      title: 'Go to Overview',
      category: 'Navigation',
      icon: <LayoutDashboard size={15} />,
      shortcut: '1',
      action: () => { onNavigate('Overview'); onClose(); }
    },
    {
      id: 'nav-tasks',
      title: 'Go to Tasks',
      category: 'Navigation',
      icon: <CheckSquare size={15} />,
      shortcut: '2',
      action: () => { onNavigate('Tasks'); onClose(); }
    },
    {
      id: 'nav-projects',
      title: 'Go to Projects',
      category: 'Navigation',
      icon: <Briefcase size={15} />,
      shortcut: '3',
      action: () => { onNavigate('Projects'); onClose(); }
    },
    {
      id: 'nav-notes',
      title: 'Go to Notes',
      category: 'Navigation',
      icon: <FileText size={15} />,
      shortcut: '4',
      action: () => { onNavigate('Notes'); onClose(); }
    },
    {
      id: 'nav-bookmarks',
      title: 'Go to Bookmarks',
      category: 'Navigation',
      icon: <Bookmark size={15} />,
      shortcut: '5',
      action: () => { onNavigate('Bookmarks'); onClose(); }
    },
    {
      id: 'act-theme',
      title: currentTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      category: 'Actions',
      icon: currentTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />,
      action: () => { onToggleTheme(); onClose(); }
    },
    {
      id: 'act-export',
      title: 'Backup & Export Data (JSON)',
      category: 'Actions',
      icon: <Download size={15} />,
      action: handleExportData
    },
    {
      id: 'act-import',
      title: 'Restore / Import Data (JSON)',
      category: 'Actions',
      icon: <Upload size={15} />,
      action: () => fileInputRef.current?.click()
    },
  ];

  // Dynamic search items from user data
  const dataItems: PaletteItem[] = [
    ...projects.map(p => ({
      id: `proj-${p.id}`,
      title: p.name,
      subtitle: p.description,
      category: 'Items' as const,
      icon: <Briefcase size={14} />,
      action: () => {
        if (p.link) window.open(p.link, '_blank');
        else onNavigate('Projects');
        onClose();
      }
    })),
    ...notes.map(n => ({
      id: `note-${n.id}`,
      title: n.title,
      subtitle: n.content.slice(0, 40),
      category: 'Items' as const,
      icon: <FileText size={14} />,
      action: () => {
        onNavigate('Notes');
        onClose();
      }
    })),
    ...bookmarks.map(b => ({
      id: `bm-${b.id}`,
      title: b.title,
      subtitle: b.url,
      category: 'Items' as const,
      icon: <ExternalLink size={14} />,
      action: () => {
        window.open(b.url, '_blank');
        onClose();
      }
    })),
    ...tasks.map(t => ({
      id: `task-${t.id}`,
      title: t.text,
      subtitle: t.completed ? 'Completed' : 'Active Task',
      category: 'Items' as const,
      icon: <CheckSquare size={14} />,
      action: () => {
        onNavigate('Tasks');
        onClose();
      }
    }))
  ];

  const allItems = [...baseItems, ...dataItems];

  const filteredItems = query.trim() === ''
    ? baseItems
    : allItems.filter(item => {
        const q = query.toLowerCase();
        return item.title.toLowerCase().includes(q) || 
               (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
               item.category.toLowerCase().includes(q);
      });

  // Clamp selected index
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.palette} onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className={styles.inputWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Search commands, projects, notes, or tasks..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <span className={styles.escBadge}>ESC</span>
        </div>

        <div className={styles.resultsList} ref={listRef}>
          {filteredItems.length === 0 && (
            <div className={styles.emptyState}>
              No matching commands or items found.
            </div>
          )}

          {filteredItems.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={item.id}
                className={`${styles.item} ${isSelected ? styles.itemActive : ''}`}
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className={styles.itemLeft}>
                  <div className={styles.itemIcon}>{item.icon}</div>
                  <span className={styles.itemTitle}>{item.title}</span>
                  {item.subtitle && (
                    <span className={styles.itemSubtitle}>— {item.subtitle}</span>
                  )}
                </div>
                <div className={styles.itemRight}>
                  {item.shortcut && (
                    <span className={styles.itemBadge}>{item.shortcut}</span>
                  )}
                  <ArrowRight size={12} style={{ opacity: isSelected ? 0.8 : 0.2 }} />
                </div>
              </button>
            );
          })}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerHints}>
            <span className={styles.footerHint}>
              <span className={styles.kbd}>↑</span>
              <span className={styles.kbd}>↓</span> Navigate
            </span>
            <span className={styles.footerHint}>
              <span className={styles.kbd}>↵</span> Select
            </span>
            <span className={styles.footerHint}>
              <span className={styles.kbd}>ESC</span> Close
            </span>
          </div>
          <div>Personal Command Center</div>
        </div>

        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImportFile}
        />
      </div>
    </div>
  );
}
