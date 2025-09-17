let toastTimeout: number | null = null;

export function showToast(message: string, duration = 3000) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.style.position = 'fixed';
    toast.style.bottom = '1rem';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'var(--c-primary)';
    toast.style.color = 'var(--c-text)';
    toast.style.padding = '0.75rem 1.5rem';
    toast.style.borderRadius = 'var(--border-radius)';
    toast.style.boxShadow = 'var(--shadow-soft)';
    toast.style.zIndex = '1000';
    toast.style.fontWeight = '600';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  toastTimeout = window.setTimeout(() => {
    if (toast) toast.style.opacity = '0';
  }, duration);
}