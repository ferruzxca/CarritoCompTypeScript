// src/components/navbar.ts
import { store as Store } from "../state/store";

export function createNavbar(host: HTMLElement | string = "navbar") {
  const el =
    typeof host === "string" ? document.getElementById(host) : host;
  if (!el) {
    // Si no hay contenedor, lo creamos al vuelo
    const header = document.createElement("header");
    const nav = document.createElement("nav");
    nav.id = "navbar";
    header.appendChild(nav);
    document.body.prepend(header);
  }
  const mount = (typeof host === "string"
    ? document.getElementById(host)
    : host) as HTMLElement;

  mount.innerHTML = `
    <div class="navbar">
      <div class="nav-inner">
        <a class="brand" href="products.html" aria-label="Inicio">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M7 6h13l-1.5 9.5a2 2 0 0 1-2 1.7H9.2a2 2 0 0 1-2-1.5L5 2H2" opacity=".9"/>
            <circle cx="9.5" cy="20" r="1.5" fill="currentColor"/>
            <circle cx="17.5" cy="20" r="1.5" fill="currentColor"/>
          </svg>
          <span>Tienda</span>
        </a>

        <form id="nav-search" role="search" aria-label="Buscar productos">
          <input id="nav-q" type="search" placeholder="Buscar productos" autocomplete="off" />
          <button class="nav-search-btn" title="Buscar" aria-label="Buscar">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-1.06 1.06l.27.28v.79L20 21l1-1zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14"/></svg>
          </button>
        </form>

        <div class="actions">
          <a class="cart-btn" href="cart.html" aria-label="Carrito">
            <span class="cart-text">Carrito</span>
            <span id="nav-cart-count" class="badge">0</span>
          </a>
          <button id="nav-logout" class="nav-btn" type="button" aria-label="Salir">Salir</button>
        </div>
      </div>
      <div class="nav-glow"></div>
    </div>
  `;

  // Buscar
  const form = mount.querySelector<HTMLFormElement>("#nav-search")!;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = (mount.querySelector<HTMLInputElement>("#nav-q")!.value || "").trim();
    const url = new URL("products.html", window.location.href);
    if (q) url.searchParams.set("q", q);
    window.location.href = url.toString();
  });

  // Logout
  mount.querySelector<HTMLButtonElement>("#nav-logout")!.addEventListener("click", () => {
    Store.clearUser();
    window.location.href = "index.html";
  });

  // Badge
  const badge = mount.querySelector<HTMLSpanElement>("#nav-cart-count")!;
  const updateBadge = () => {
    const total = Store.getCart().reduce((a, it) => a + it.qty, 0);
    badge.textContent = String(total);
    badge.classList.add("pulse");
    setTimeout(() => badge.classList.remove("pulse"), 250);
  };
  updateBadge();
  Store.subscribe(updateBadge);
}

// Auto-montaje si existe #navbar
function autoMount() {
  const target = document.getElementById("navbar");
  if (target) createNavbar(target);
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoMount);
} else {
  autoMount();
}

// Export default opcional por si tu HTML usa import default
export default createNavbar;
