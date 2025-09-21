// src/pages/cart.ts
import { store } from "../state/store";
import { formatCurrency } from "../utils/format";

type Cart = ReturnType<typeof store.getCart>;

const $ = <T extends HTMLElement = HTMLElement>(sel: string) =>
  document.querySelector(sel) as T | null;

function renderCart() {
  const cart = store.getCart() as Cart;
  const tbody = $("#cart-body") as HTMLTableSectionElement | null;
  const empty = $("#cart-empty");
  const tableWrap = $("#cart-table-wrap");

  if (!tbody) return;

  tbody.innerHTML = "";

  if (cart.length === 0) {
    if (empty) empty.style.display = "block";
    if (tableWrap) tableWrap.style.display = "none";
    updateSummaryFromCart(cart);
    toggleActionsDisabled(true);
    return;
  } else {
    if (empty) empty.style.display = "none";
    if (tableWrap) tableWrap.style.display = "block";
  }

  const frag = document.createDocumentFragment();

  for (const item of cart) {
    const tr = document.createElement("tr");
    tr.dataset.id = item.productId;
    tr.innerHTML = `
      <td class="c-name"><div class="c-title">${item.name}</div></td>
      <td class="c-price">${formatCurrency(item.price, "MXN")}</td>
      <td class="c-qty">
        <input class="qty" type="number" inputmode="numeric" min="1" step="1" value="${item.qty}" />
      </td>
      <td class="c-subtotal">${formatCurrency(item.subtotal, "MXN")}</td>
      <td class="c-actions"><button class="c-remove" aria-label="Eliminar">Eliminar</button></td>
    `;
    frag.appendChild(tr);
  }

  tbody.appendChild(frag);
  updateSummaryFromCart(cart);
  toggleActionsDisabled(false);
}

function toggleActionsDisabled(disabled: boolean) {
  const btnClear = $("#btn-clear") as HTMLButtonElement | null;
  const btnCheckout = $("#btn-checkout") as HTMLButtonElement | null;
  if (btnClear) btnClear.disabled = disabled;
  if (btnCheckout) btnCheckout.disabled = disabled;
}

function updateSummaryFromCart(cart: Cart) {
  const subtotal = cart.reduce((acc: number, item: any) => acc + item.subtotal, 0);
  const shipping = cart.length > 0 ? 100 : 0;
  const taxes = Math.round(subtotal * 0.16);
  const total = subtotal + shipping + taxes;

  const elSub = $("#sum-subtotal");
  const elShip = $("#sum-shipping");
  const elTax = $("#sum-taxes");
  const elTot = $("#sum-total");

  if (elSub) elSub.textContent = formatCurrency(subtotal, "MXN");
  if (elShip) elShip.textContent = formatCurrency(shipping, "MXN");
  if (elTax) elTax.textContent = formatCurrency(taxes, "MXN");
  if (elTot) elTot.textContent = formatCurrency(total, "MXN");
}

function clampInt(v: string, min: number, max: number) {
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function wireEvents() {
  const tbody = $("#cart-body") as HTMLTableSectionElement | null;

  // qty y eliminar por delegación
  if (tbody) {
    tbody.addEventListener("change", (e) => {
      const target = e.target as HTMLElement;
      if (!(target instanceof HTMLInputElement)) return;
      if (!target.classList.contains("qty")) return;

      const tr = target.closest("tr") as HTMLTableRowElement | null;
      if (!tr) return;
      const id = tr.dataset.id!;
      const nextQty = clampInt(target.value, 1, 999);

      store.updateQty(id, nextQty);

      const item = store.getCart().find((x: any) => x.productId === id);
      if (item) {
        const sub = tr.querySelector(".c-subtotal");
        if (sub) sub.textContent = formatCurrency(item.subtotal, "MXN");
        target.value = String(item.qty);
      }

      updateSummaryFromCart(store.getCart());
    });

    tbody.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (!(target instanceof HTMLButtonElement)) return;
      if (!target.classList.contains("c-remove")) return;

      const tr = target.closest("tr") as HTMLTableRowElement | null;
      if (!tr) return;
      const id = tr.dataset.id!;
      store.remove(id);
      tr.remove();

      const cart = store.getCart();
      if (cart.length === 0) renderCart();
      else updateSummaryFromCart(cart);
    });
  }

  const btnClear = $("#btn-clear") as HTMLButtonElement | null;
  if (btnClear) {
    btnClear.addEventListener("click", () => {
      store.clearCart();
      renderCart();
    });
  }

  const btnCheckout = $("#btn-checkout") as HTMLButtonElement | null;
  if (btnCheckout) {
    btnCheckout.addEventListener("click", () => {
      // Siempre pasar por login antes de checkout
      const url = new URL("login.html", window.location.href);
      url.searchParams.set("next", "checkout.html");
      window.location.href = url.toString();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  wireEvents();
  renderCart();
});
