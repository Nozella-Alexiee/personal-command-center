import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { saveToStorage, loadFromStorage } from '../../lib/storage';
import styles from './NotesModule.module.css';

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

const DEFAULT_NOTES: Note[] = [
  {
    id: 'n-1',
    title: 'Ekosistem SIG Architecture Notes',
    content: 'oneSIG handles academics, attendance, wallets, and roles. sigchat handles real-time messages with E2EE and class groups. Both share the same database and identity system via unified auth.',
    updatedAt: Date.now() - 1000 * 60 * 45,
  },
  {
    id: 'n-2',
    title: 'VPS Deployment Checklist',
    content: '1. Verify nginx reverse proxy config.\n2. Run ./scripts/tunnel-ecosystem.sh for staging.\n3. Check systemd service for sigchat Node process.\n4. Run database migrations with rollback test.',
    updatedAt: Date.now() - 1000 * 60 * 60 * 18,
  },
  {
    id: 'n-3',
    title: 'Personal Command Center Principles',
    content: 'Keep it quiet, precise, and fast. No generic AI templates, no unnecessary glow, zero friction daily driver.',
    updatedAt: Date.now() - 1000 * 60 * 60 * 72,
  }
];

function formatTimestamp(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;

  const d = new Date(timestamp);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function NotesModule() {
  const [notes, setNotes] = useState<Note[]>(() => loadFromStorage('pcc_notes_v2', DEFAULT_NOTES));
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    saveToStorage('pcc_notes_v2', notes);
  }, [notes]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const createNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      updatedAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const updateActiveNote = (updates: Partial<Note>) => {
    if (!activeNoteId) return;
    setNotes(prev => prev.map(n => 
      n.id === activeNoteId 
        ? { ...n, ...updates, updatedAt: Date.now() } 
        : n
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const filteredNotes = notes.filter(n => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query);
  });

  const wordCount = activeNote?.content.trim() 
    ? activeNote.content.trim().split(/\s+/).length 
    : 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>Notes</h2>
          {!activeNoteId && (
            <span className={styles.countBadge}>{notes.length}</span>
          )}
        </div>
        
        <div className={styles.headerActions}>
          {!activeNoteId && (
            <button 
              className={styles.addBtn} 
              onClick={createNote} 
              aria-label="Create note"
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>New Note</span>
            </button>
          )}
        </div>
      </header>

      {activeNoteId && activeNote ? (
        /* Editor Mode */
        <div className={styles.editorContainer}>
          <div className={styles.editorTopBar}>
            <button 
              className={styles.doneBtn} 
              onClick={() => setActiveNoteId(null)}
              aria-label="Back to notes list"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </button>

            <div className={styles.editorMeta}>
              <span>{formatTimestamp(activeNote.updatedAt)}</span>
              <span>•</span>
              <span>{wordCount} words</span>
            </div>

            <div className={styles.editorActions}>
              <button 
                className={`${styles.iconBtn} ${styles.destructive}`} 
                onClick={() => deleteNote(activeNote.id)}
                aria-label="Delete note"
                title="Delete note"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <input
            type="text"
            className={styles.editorTitleInput}
            value={activeNote.title}
            onChange={e => updateActiveNote({ title: e.target.value })}
            placeholder="Note title..."
          />

          <textarea
            className={styles.editorContentTextarea}
            value={activeNote.content}
            onChange={e => updateActiveNote({ content: e.target.value })}
            placeholder="Start typing..."
            autoFocus
          />
        </div>
      ) : (
        /* Notes List Mode */
        <>
          {notes.length > 2 && (
            <input
              type="text"
              placeholder="Search notes..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          )}

          <div className={styles.list}>
            {filteredNotes.length === 0 && (
              <div className={styles.emptyState}>
                {searchQuery ? 'No matching notes.' : 'No notes yet. Click "+ New Note" to write one.'}
              </div>
            )}

            {filteredNotes.map(note => (
              <div 
                key={note.id} 
                className={styles.noteCard}
                onClick={() => setActiveNoteId(note.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter') setActiveNoteId(note.id);
                }}
              >
                <div className={styles.noteCardHeader}>
                  <h3 className={styles.noteTitle}>{note.title || 'Untitled'}</h3>
                  <span className={styles.noteTime}>{formatTimestamp(note.updatedAt)}</span>
                </div>
                <p className={styles.notePreview}>
                  {note.content.trim() || 'Empty note'}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
