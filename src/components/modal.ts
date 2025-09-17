export function createModal(content: HTMLElement | string): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.tabIndex = -1;

  const modal = document.createElement('div');
  modal.className = 'modal-content';
  modal.tabIndex = 0;

  if (typeof content === 'string') {
    modal.innerHTML = content;
  } else {
    modal.appendChild(content);
  }

  overlay.appendChild(modal);

  // Focus trap
  let lastFocusedElement: HTMLElement | null = null;

  function trapFocus(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      } else if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else if (e.key === 'Escape') {
      close();
    }
  }

  function open() {
    lastFocusedElement = document.activeElement as HTMLElement;
    document.body.appendChild(overlay);
    modal.focus();
    document.addEventListener('keydown', trapFocus);
  }

  function close() {
    document.removeEventListener('keydown', trapFocus);
    if (overlay.parentElement) {
      overlay.parentElement.removeChild(overlay);
    }
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      close();
    }
  });

  return Object.assign(overlay, { open, close });
}