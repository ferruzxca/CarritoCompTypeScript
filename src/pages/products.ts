import type { Product } from '../types/models';
import { createProductCard } from '../components/product-card';
import { showToast } from '../components/toast';
import { store } from "../state/store";
if (!store.getUser()) {
  window.location.href = "index.html"; // fuerza ir a login si no hay sesión
}

const productsContainer = document.getElementById('products-list')!;
const navbar = document.querySelector('nav')!;
const searchInput = document.getElementById('search') as HTMLInputElement;
const filterCategory = document.getElementById('filter-category') as HTMLSelectElement;
const filterStock = document.getElementById('filter-stock') as HTMLSelectElement;
const sortPrice = document.getElementById('sort-price') as HTMLSelectElement;

let products: Product[] = [];
let filteredProducts: Product[] = [];

async function loadProducts() {
  try {
    const res = await fetch('/data/productos.json'); // Ruta pública
    if (!res.ok) throw new Error('Error al cargar productos');
    products = await res.json();
    filteredProducts = [...products];
    renderProducts();
  } catch (error) {
    productsContainer.innerHTML = `<p>Error al cargar productos.</p>`;
  }
}

function renderProducts() {
  productsContainer.innerHTML = '';
  if (filteredProducts.length === 0) {
    productsContainer.innerHTML = '<p>No se encontraron productos.</p>';
    return;
  }
  filteredProducts.forEach((p) => {
    const card = createProductCard(p);
    card.addEventListener('add-to-cart', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      store.addToCart(detail.product, detail.qty);
      showToast(`Agregaste ${detail.qty} x ${detail.product.name} al carrito.`);
    });
    productsContainer.appendChild(card);
  });
}

function applyFilters() {
  let temp = [...products];

  // Filtro categoría
  const cat = filterCategory.value;
  if (cat !== 'all') {
    temp = temp.filter((p) => p.category === cat);
  }

  // Filtro stock
  if (filterStock.value === 'inStock') {
    temp = temp.filter((p) => p.stock > 0);
  }

  // Búsqueda
  const searchTerm = searchInput.value.trim().toLowerCase();
  if (searchTerm) {
    temp = temp.filter((p) => p.name.toLowerCase().includes(searchTerm));
  }

  // Ordenar por precio
  if (sortPrice.value === 'asc') {
    temp.sort((a, b) => a.price - b.price);
  } else if (sortPrice.value === 'desc') {
    temp.sort((a, b) => b.price - a.price);
  }

  filteredProducts = temp;
  renderProducts();
}

function setupFilters() {
  filterCategory.addEventListener('change', applyFilters);
  filterStock.addEventListener('change', applyFilters);
  sortPrice.addEventListener('change', applyFilters);
  searchInput.addEventListener('input', applyFilters);
}

function checkSession() {
  if (!store.getUser ()) {
    window.location.href = 'index.html';
  }
}

function setupNavbar() {
  const nav = document.querySelector('nav')!;
  nav.addEventListener('search-products', (e: Event) => {
    const detail = (e as CustomEvent).detail as string;
    searchInput.value = detail;
    applyFilters();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  checkSession();
  setupNavbar();
  setupFilters();
  loadProducts();
});