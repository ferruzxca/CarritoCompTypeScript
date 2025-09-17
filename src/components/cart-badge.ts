import { store } from '../state/store';

export function createCartBadge(): HTMLElement {
  const badge = document.createElement('span');
  badge.id = 'cart-badge';
  badge.setAttribute('aria-live', 'polite');
  badge.setAttribute('aria-atomic', 'true');
  badge.style.backgroundColor = 'var(--c-ok)';
  badge.style.color = 'var(--c-bg)';
  badge.style.borderRadius = '50%';
  badge.style.padding = '0.15rem 0.5rem';
  badge.style.fontSize = '0.75rem';
  badge.style.fontWeight = '700';
  badge.style.minWidth = '20px';
  badge.style.textAlign = 'center';
  badge.style.position = 'absolute';
  badge.style.top = '-8px';
  badge.style.right = '-12px';

  function update() {
    const cart = store.getCart();
    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    badge.textContent = totalQty.toString();
    badge.style.display = totalQty > 0 ? 'inline-block' : 'none';
  }

  store.subscribe(update);
  update();

  return badge;
}