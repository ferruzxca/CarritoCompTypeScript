import type { Product } from "../types/models";
import { createProductCard } from "../components/product-card";
import { showToast } from "../components/toast";
import * as store from "../state/store";

const productsContainer = document.getElementById("products-list") as HTMLElement;
const searchInput = document.getElementById("search") as HTMLInputElement;
const filterCategory = document.getElementById("filter-category") as HTMLSelectElement;
const filterStock = document.getElementById("filter-stock") as HTMLSelectElement;
const sortPrice = document.getElementById("sort-price") as HTMLSelectElement;

let products: Product[] = [];
let filtered: Product[] = [];

function safeEl<T extends HTMLElement>(el: T | null, name: string): T {
  if (!el) throw new Error(`Falta el elemento: ${name}`);
  return el;
}
function debounce<T extends (...a: any[]) => void>(fn: T, ms = 200): T {
  let t: number | undefined;
  return ((...args: any[]) => {
    window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), ms);
  }) as T;
}

async function loadProducts() {
  const root = safeEl(productsContainer, "#products-list");
  try {
    root.innerHTML = `<p>Cargando productos…</p>`;
    const res = await fetch("/data/productos.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Error al cargar productos");
    products = (await res.json()) as Product[];
    filtered = [...products];
    renderProducts();
  } catch (e) {
    root.innerHTML = `<p style="color:var(--c-err)">Error al cargar productos.</p>`;
  }
}

function renderProducts() {
  const root = safeEl(productsContainer, "#products-list");
  root.innerHTML = "";

  if (!filtered.length) {
    root.innerHTML = `<p>No se encontraron productos.</p>`;
    return;
  }

  const frag = document.createDocumentFragment();
  for (const p of filtered) {
    const card = createProductCard(p);
    card.addEventListener("add-to-cart", (ev: Event) => {
      const detail = (ev as CustomEvent).detail as { product: Product; qty: number };
      store.addToCart(detail.product, detail.qty);
      showToast(`Agregaste ${detail.qty} × ${detail.product.name} al carrito.`);
    });
    frag.appendChild(card);
  }
  root.appendChild(frag);
}

function applyFilters() {
  let tmp = [...products];

  const cat = filterCategory?.value ?? "all";
  if (cat !== "all") tmp = tmp.filter((p) => p.category === cat);

  const stockSel = filterStock?.value ?? "all";
  if (stockSel === "inStock") tmp = tmp.filter((p) => (p.stock ?? 0) > 0);

  const q = (searchInput?.value ?? "").trim().toLowerCase();
  if (q) tmp = tmp.filter((p) => p.name.toLowerCase().includes(q));

  const ord = sortPrice?.value ?? "none";
  if (ord === "asc") tmp.sort((a, b) => a.price - b.price);
  if (ord === "desc") tmp.sort((a, b) => b.price - a.price);

  filtered = tmp;
  renderProducts();
}

function setupFilters() {
  if (filterCategory) filterCategory.addEventListener("change", applyFilters);
  if (filterStock) filterStock.addEventListener("change", applyFilters);
  if (sortPrice) sortPrice.addEventListener("change", applyFilters);
  if (searchInput) searchInput.addEventListener("input", debounce(applyFilters, 180));
}

function setupNavbarBridge() {
  const nav = document.querySelector("nav");
  if (!nav) return;
  nav.addEventListener("search-products", (e: Event) => {
    const term = (e as CustomEvent<string>).detail || "";
    if (searchInput) {
      searchInput.value = term;
      applyFilters();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavbarBridge();
  setupFilters();
  loadProducts();
});
