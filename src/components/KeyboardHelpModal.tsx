import React from 'react';
import { X, Keyboard } from 'lucide-react';
import styles from './KeyboardHelpModal.module.css';

interface KeyboardShortcut {
  key: string;
  description: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

interface KeyboardHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

const KeyboardHelpModal: React.FC<KeyboardHelpModalProps> = ({ 
  isOpen, 
  onClose, 
  shortcuts 
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const keys = [];
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.altKey) keys.push('Alt');
    if (shortcut.shiftKey) keys.push('Shift');
    keys.push(shortcut.key.toUpperCase());
    return keys;
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <Keyboard className={styles.icon} />
            <h2 className={styles.title}>Keyboard Shortcuts</h2>
          </div>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Close keyboard help"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.shortcutList}>
            {shortcuts.map((shortcut, index) => (
              <div key={index} className={styles.shortcutItem}>
                <div className={styles.shortcutKeys}>
                  {formatShortcut(shortcut).map((key, keyIndex) => (
                    <React.Fragment key={keyIndex}>
                      <kbd className={styles.key}>{key}</kbd>
                      {keyIndex < formatShortcut(shortcut).length - 1 && (
                        <span className={styles.plus}>+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <span className={styles.shortcutDescription}>
                  {shortcut.description}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.tip}>
            <p>
              <strong>Tip:</strong> Press <kbd className={styles.key}>?</kbd> anytime 
              to open this help dialog.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(KeyboardHelpModal);
