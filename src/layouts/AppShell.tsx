import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Briefcase, 
  FileText, 
  Bookmark, 
  Menu, 
  X,
  Sun,
  Moon,
  Laptop,
  Search
} from 'lucide-react';

import styles from './AppShell.module.css';

export type NavView = 'Overview' | 'Tasks' | 'Projects' | 'Notes' | 'Bookmarks';
export type ThemeMode = 'system' | 'light' | 'dark';

interface NavBadgeCounts {
  tasks?: number;
  projects?: number;
  notes?: number;
  bookmarks?: number;
}

interface AppShellProps {
  children: React.ReactNode;
  activeNav: NavView;
  onNavChange: (view: NavView) => void;
  badgeCounts?: NavBadgeCounts;
  onOpenCommandPalette: () => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export function AppShell({ 
  children, 
  activeNav, 
  onNavChange, 
  badgeCounts,
  onOpenCommandPalette,
  theme,
  onThemeChange
}: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global Keyboard Shortcuts (1-5 to switch views, Cmd+K / Ctrl+K for palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenCommandPalette();
        return;
      }

      // Don't trigger 1-5 shortcuts if typing in an input, textarea or contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === '1') onNavChange('Overview');
      else if (e.key === '2') onNavChange('Tasks');
      else if (e.key === '3') onNavChange('Projects');
      else if (e.key === '4') onNavChange('Notes');
      else if (e.key === '5') onNavChange('Bookmarks');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavChange, onOpenCommandPalette]);

  const navItems: { view: NavView; label: string; icon: React.ReactNode; shortcut: string; count?: number }[] = [
    { view: 'Overview', label: 'Overview', icon: <LayoutDashboard size={16} />, shortcut: '1' },
    { view: 'Tasks', label: 'Tasks', icon: <CheckSquare size={16} />, shortcut: '2', count: badgeCounts?.tasks },
    { view: 'Projects', label: 'Projects', icon: <Briefcase size={16} />, shortcut: '3', count: badgeCounts?.projects },
    { view: 'Notes', label: 'Notes', icon: <FileText size={16} />, shortcut: '4', count: badgeCounts?.notes },
    { view: 'Bookmarks', label: 'Bookmarks', icon: <Bookmark size={16} />, shortcut: '5', count: badgeCounts?.bookmarks },
  ];

  const handleNavClick = (view: NavView) => {
    onNavChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={styles.appShell}>
      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <div className={styles.mobileTitleGroup}>
          <div className={styles.logoIcon}>C</div>
          <span className="text-sm font-semibold">{activeNav}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className={styles.mobileMenuButton} 
            onClick={onOpenCommandPalette}
            aria-label="Open command palette"
          >
            <Search size={18} />
          </button>
          <button 
            className={styles.mobileMenuButton} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoGroup}>
            <div className={styles.logoIcon}>C</div>
            <h1 className={styles.logoText}>Command Center</h1>
          </div>
        </div>
        
        <nav className={styles.sidebarNav}>
          {/* Quick Search trigger button */}
          <button 
            type="button" 
            className={styles.searchTrigger}
            onClick={onOpenCommandPalette}
          >
            <div className={styles.searchTriggerLeft}>
              <Search size={13} />
              <span>Search...</span>
            </div>
            <span className={styles.searchKbd}>⌘K</span>
          </button>

          {navItems.map(item => {
            const isActive = activeNav === item.view;
            return (
              <button
                key={item.view}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => handleNavClick(item.view)}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={styles.navItemLeft}>
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </div>
                <div className={styles.navItemRight}>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={styles.navBadge}>{item.count}</span>
                  )}
                  <span className={styles.shortcutKey} aria-label={`Shortcut ${item.shortcut}`}>{item.shortcut}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userProfile}>
            <div className={styles.userInfoGroup}>
              <div className={styles.userAvatar}>A</div>
              <div className={styles.userInfo}>
                <div className="text-xs font-semibold">Alexie</div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)', fontSize: '0.6875rem' }}>Personal</div>
              </div>
            </div>

            {/* Theme Selector */}
            <div className={styles.themeSelector} title={`Theme: ${theme}`} role="group" aria-label="Theme selector">
              <button 
                className={`${styles.themeBtn} ${theme === 'light' ? styles.themeBtnActive : ''}`}
                onClick={() => onThemeChange('light')}
                aria-label="Light mode"
                aria-pressed={theme === 'light'}
              >
                <Sun size={12} />
              </button>
              <button 
                className={`${styles.themeBtn} ${theme === 'dark' ? styles.themeBtnActive : ''}`}
                onClick={() => onThemeChange('dark')}
                aria-label="Dark mode"
                aria-pressed={theme === 'dark'}
              >
                <Moon size={12} />
              </button>
              <button 
                className={`${styles.themeBtn} ${theme === 'system' ? styles.themeBtnActive : ''}`}
                onClick={() => onThemeChange('system')}
                aria-label="System theme"
                aria-pressed={theme === 'system'}
              >
                <Laptop size={12} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className={styles.mobileOverlay} 
          onClick={() => setIsMobileMenuOpen(false)} 
          aria-hidden="true" 
        />
      )}

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <div className={styles.contentContainer}>
          {children}
        </div>
      </main>
    </div>
  );
}
