import type { Product } from '../types/models';

export function createProductCard(product: Product): HTMLElement {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.tabIndex = 0;
  card.setAttribute('aria-label', product.name);

  card.innerHTML = `
    <img src="/img/${product.img}" alt="${product.name}" loading="lazy" />
    <h3>${product.name}</h3>
    <p class="price">$${product.price.toLocaleString('es-MX')}</p>
    <p class="rating">⭐ ${product.rating.toFixed(1)}</p>
    <p class="stock">${product.stock > 0 ? `En stock: ${product.stock}` : 'Agotado'}</p>
    <label for="qty-${product.id}">Cantidad:</label>
    <input type="number" id="qty-${product.id}" min="1" max="${product.stock}" value="1" />
    <button aria-label="Agregar ${product.name} al carrito">Agregar al carrito</button>
  `;

  const qtyInput = card.querySelector('input') as HTMLInputElement;
  const addBtn = card.querySelector('button') as HTMLButtonElement;

  addBtn.addEventListener('click', () => {
    const qty = Math.min(Math.max(Number(qtyInput.value), 1), product.stock);
    if (qty > 0 && qty <= product.stock) {
      card.dispatchEvent(
        new CustomEvent('add-to-cart', {
          detail: { product, qty },
          bubbles: true,
        })
      );
    }
  });

  return card;
}