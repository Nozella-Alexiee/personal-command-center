import { useState, useEffect } from 'react';
import { AppShell, type NavView, type ThemeMode } from './layouts/AppShell';
import { TasksModule } from './features/tasks/TasksModule';
import { ProjectsModule } from './features/projects/ProjectsModule';
import { NotesModule } from './features/notes/NotesModule';
import { BookmarksModule } from './features/bookmarks/BookmarksModule';
import { CommandPalette } from './components/CommandPalette/CommandPalette';
import { loadFromStorage, saveToStorage } from './lib/storage';
import styles from './App.module.css';

function getFormattedDate() {
  const now = new Date();
  return now.toLocaleDateString(undefined, { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });
}

function App() {
  const [activeNav, setActiveNav] = useState<NavView>('Overview');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(() => loadFromStorage('pcc_theme', 'system'));
  const [badgeCounts, setBadgeCounts] = useState<{
    tasks?: number;
    projects?: number;
    notes?: number;
    bookmarks?: number;
  }>({});

  // Theme application
  useEffect(() => {
    saveToStorage('pcc_theme', theme);
    const root = document.documentElement;
    if (theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Sync badges from localStorage
  const syncBadges = () => {
    try {
      const tasks = loadFromStorage<{ completed: boolean }[]>('pcc_tasks_v2', []);
      const activeTasks = tasks.filter(t => !t.completed).length;

      const projects = loadFromStorage<{ status: string }[]>('pcc_projects_v2', []);
      const activeProjects = projects.filter(p => p.status === 'Active').length;

      const notes = loadFromStorage<unknown[]>('pcc_notes_v2', []);
      const bookmarks = loadFromStorage<unknown[]>('pcc_bookmarks_v2', []);

      setBadgeCounts({
        tasks: activeTasks,
        projects: activeProjects,
        notes: notes.length,
        bookmarks: bookmarks.length,
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    syncBadges();
    const interval = setInterval(syncBadges, 2000);
    return () => clearInterval(interval);
  }, []);

  const navTabs: NavView[] = ['Overview', 'Tasks', 'Projects', 'Notes', 'Bookmarks'];

  return (
    <AppShell 
      activeNav={activeNav} 
      onNavChange={setActiveNav}
      badgeCounts={badgeCounts}
      onOpenCommandPalette={() => setIsPaletteOpen(true)}
      theme={theme}
      onThemeChange={setTheme}
    >
      <div>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.welcomeTitle}>Command Center</h1>
            <p className={styles.welcomeSubtitle}>
              {getFormattedDate()} • Welcome back, Alexie
            </p>
          </div>

          <div className={styles.quickStats}>
            <div className={styles.statItem}>
              <span>Tasks</span>
              <span className={styles.statValue}>{badgeCounts.tasks ?? 0}</span>
            </div>
            <div className={styles.statItem}>
              <span>Active Projects</span>
              <span className={styles.statValue}>{badgeCounts.projects ?? 0}</span>
            </div>
            <div className={styles.statItem}>
              <span>Notes</span>
              <span className={styles.statValue}>{badgeCounts.notes ?? 0}</span>
            </div>
          </div>
        </header>

        {/* Mobile View Switcher Tabs */}
        <div className={styles.mobileTabs} role="tablist" aria-label="Module Navigation">
          {navTabs.map(tab => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeNav === tab}
              aria-controls={`${tab.toLowerCase()}-panel`}
              className={`${styles.tabBtn} ${activeNav === tab ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveNav(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dynamic Views */}
        {activeNav === 'Overview' && (
          <div className={styles.overviewGrid}>
            <div className={styles.column}>
              <div className={styles.moduleCard}>
                <TasksModule />
              </div>
              <div className={styles.moduleCard}>
                <BookmarksModule />
              </div>
            </div>

            <div className={styles.column}>
              <div className={styles.moduleCard}>
                <ProjectsModule />
              </div>
              <div className={`${styles.moduleCard} ${styles.notesCard}`}>
                <NotesModule />
              </div>
            </div>
          </div>
        )}

        {activeNav === 'Tasks' && (
          <div className={styles.focusedView}>
            <div className={styles.focusedCard}>
              <TasksModule />
            </div>
          </div>
        )}

        {activeNav === 'Projects' && (
          <div className={styles.focusedView}>
            <div className={styles.focusedCard}>
              <ProjectsModule />
            </div>
          </div>
        )}

        {activeNav === 'Notes' && (
          <div className={styles.focusedView}>
            <div className={`${styles.focusedCard} ${styles.notesCard}`} style={{ minHeight: '600px' }}>
              <NotesModule />
            </div>
          </div>
        )}

        {activeNav === 'Bookmarks' && (
          <div className={styles.focusedView}>
            <div className={styles.focusedCard}>
              <BookmarksModule />
            </div>
          </div>
        )}

        {/* Global Command Palette */}
        <CommandPalette
          isOpen={isPaletteOpen}
          onClose={() => setIsPaletteOpen(false)}
          onNavigate={setActiveNav}
          onToggleTheme={toggleTheme}
          currentTheme={theme}
        />
      </div>
    </AppShell>
  );
}

export default App;
