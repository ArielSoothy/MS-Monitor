import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  disabled?: boolean;
}

export const useKeyboardShortcuts = ({ 
  shortcuts, 
  disabled = false 
}: UseKeyboardShortcutsOptions) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    // Ignore shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.contentEditable === 'true'
    ) {
      return;
    }

    const matchedShortcut = shortcuts.find(shortcut => {
      const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
      const altMatches = !!shortcut.altKey === event.altKey;
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
      
      return keyMatches && ctrlMatches && altMatches && shiftMatches;
    });

    if (matchedShortcut) {
      event.preventDefault();
      matchedShortcut.action();
    }
  }, [shortcuts, disabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts: shortcuts.map(({ action, ...shortcut }) => shortcut)
  };
};

// Common keyboard shortcuts for navigation
export const createNavigationShortcuts = (navigate: (path: string) => void) => [
  {
    key: '1',
    description: 'Go to Overview',
    action: () => navigate('/overview'),
    altKey: true
  },
  {
    key: '2',
    description: 'Go to Pipelines',
    action: () => navigate('/pipelines'),
    altKey: true
  },
  {
    key: '3',
    description: 'Go to Data Lineage',
    action: () => navigate('/data-lineage'),
    altKey: true
  },
  {
    key: '4',
    description: 'Go to Threat Prediction',
    action: () => navigate('/predictive-insights'),
    altKey: true
  },
  {
    key: '5',
    description: 'Go to AI Agent',
    action: () => navigate('/ai-agent'),
    altKey: true
  },
  {
    key: '6',
    description: 'Go to Performance',
    action: () => navigate('/performance'),
    altKey: true
  },
  {
    key: '7',
    description: 'Go to Infrastructure',
    action: () => navigate('/infrastructure'),
    altKey: true
  },
  {
    key: '8',
    description: 'Go to Data Engineering',
    action: () => navigate('/data-engineering'),
    altKey: true
  },
  {
    key: 'i',
    description: 'Go to Implementation Guide',
    action: () => navigate('/implementation-guide'),
    altKey: true
  },
  {
    key: 't',
    description: 'Go to Technical Challenges',
    action: () => navigate('/technical-challenges'),
    altKey: true
  },
  {
    key: '0',
    description: 'Go to Alerts',
    action: () => navigate('/alerts'),
    altKey: true
  },
  {
    key: 'r',
    description: 'Refresh page',
    action: () => window.location.reload(),
    ctrlKey: true
  }
];

// Common keyboard shortcuts for modals and UI
export const createModalShortcuts = (
  toggleAbout: () => void,
  toggleHelp: () => void,
  closeModals: () => void
) => [
  {
    key: 'Escape',
    description: 'Close modals',
    action: closeModals
  },
  {
    key: '?',
    description: 'Show keyboard shortcuts',
    action: toggleHelp
  },
  {
    key: 'a',
    description: 'Show about information',
    action: toggleAbout,
    ctrlKey: true
  }
];
