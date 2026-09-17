import { useState, useEffect } from 'react';
import { Plus, Trash2, Globe, X } from 'lucide-react';
import { saveToStorage, loadFromStorage } from '../../lib/storage';
import styles from './BookmarksModule.module.css';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
}

const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: 'b-1', title: 'Local oneSIG Dev', url: 'http://localhost:8000', category: 'Local' },
  { id: 'b-2', title: 'SIGChat WebSocket Server', url: 'http://localhost:3000', category: 'Local' },
  { id: 'b-3', title: 'GitHub Dashboard', url: 'https://github.com', category: 'Dev' },
  { id: 'b-4', title: 'React Documentation', url: 'https://react.dev', category: 'Docs' },
  { id: 'b-5', title: 'Laravel 11 Docs', url: 'https://laravel.com/docs', category: 'Docs' },
  { id: 'b-6', title: 'Vercel Dashboard', url: 'https://vercel.com', category: 'Tools' },
];

const CATEGORIES = ['All', 'Local', 'Dev', 'Docs', 'Tools'];

export function BookmarksModule() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => 
    loadFromStorage('pcc_bookmarks_v2', DEFAULT_BOOKMARKS)
  );
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('Dev');

  useEffect(() => {
    saveToStorage('pcc_bookmarks_v2', bookmarks);
  }, [bookmarks]);

  const addBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;
    
    let finalUrl = newUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    const newBookmark: Bookmark = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      url: finalUrl,
      category: newCategory.trim() || 'General',
    };
    
    setBookmarks([newBookmark, ...bookmarks]);
    setNewTitle('');
    setNewUrl('');
    setIsAdding(false);
  };

  const deleteBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const getHostname = (url: string) => {
    try {
      const u = new URL(url);
      return u.hostname;
    } catch {
      return url.replace(/^https?:\/\//, '').split('/')[0];
    }
  };

  const getFaviconUrl = (url: string) => {
    try {
      const host = new URL(url).hostname;
      if (host === 'localhost' || host === '127.0.0.1') return null;
      return `https://www.google.com/s2/favicons?domain=${host}&sz=32`;
    } catch {
      return null;
    }
  };

  const filteredBookmarks = bookmarks.filter(b => {
    if (selectedCategory === 'All') return true;
    return b.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>Bookmarks</h2>
          <span className={styles.countBadge}>{filteredBookmarks.length}</span>
        </div>
        
        <button 
          className={styles.addBtn} 
          onClick={() => setIsAdding(!isAdding)}
          aria-label={isAdding ? "Close bookmark form" : "Add bookmark"}
        >
          {isAdding ? <X size={13} /> : <Plus size={13} strokeWidth={2.5} />}
          <span>{isAdding ? 'Cancel' : 'New'}</span>
        </button>
      </header>

      {/* Categories Filter */}
      <div className={styles.controlsRow}>
        <div className={styles.categoryGroup}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`${styles.catBtn} ${selectedCategory === cat ? styles.catBtnActive : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inline Add Card */}
      {isAdding && (
        <form onSubmit={addBookmark} className={styles.addCard}>
          <div className={styles.formRow}>
            <input
              type="text"
              placeholder="Title (e.g. GitHub)"
              className={styles.input}
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              autoFocus
            />
            <input
              type="text"
              placeholder="URL (e.g. github.com)"
              className={styles.input}
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
            />
          </div>
          <div className={styles.formRow} style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <select
              className={styles.input}
              style={{ maxWidth: '140px' }}
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
            >
              <option value="Local">Local</option>
              <option value="Dev">Dev</option>
              <option value="Docs">Docs</option>
              <option value="Tools">Tools</option>
              <option value="General">General</option>
            </select>
            <div className={styles.formActions}>
              <button 
                type="button" 
                className={styles.cancelBtn} 
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={styles.saveBtn} 
                disabled={!newTitle.trim() || !newUrl.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Bookmarks List */}
      <div className={styles.list}>
        {filteredBookmarks.length === 0 && (
          <div className={styles.emptyState}>
            No bookmarks in {selectedCategory !== 'All' ? selectedCategory : 'list'}.
          </div>
        )}

        {filteredBookmarks.map(bookmark => {
          const favicon = getFaviconUrl(bookmark.url);
          const hostname = getHostname(bookmark.url);

          return (
            <div key={bookmark.id} className={styles.bookmarkItem}>
              <a 
                href={bookmark.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.bookmarkLink}
              >
                <div className={styles.faviconWrap}>
                  {favicon ? (
                    <img 
                      src={favicon} 
                      alt="" 
                      className={styles.favicon} 
                      onError={(e) => {
                        // Fallback on image load error
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Globe size={14} className={styles.fallbackIcon} />
                  )}
                </div>

                <div className={styles.bookmarkInfo}>
                  <span className={styles.bookmarkTitle}>{bookmark.title}</span>
                  <span className={styles.bookmarkHost}>{hostname}</span>
                </div>
              </a>

              <div className={styles.tagAndActions}>
                {bookmark.category && (
                  <span className={styles.categoryTag}>{bookmark.category}</span>
                )}
                <button 
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => deleteBookmark(bookmark.id)}
                  aria-label={`Delete ${bookmark.title}`}
                  title="Delete bookmark"
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
