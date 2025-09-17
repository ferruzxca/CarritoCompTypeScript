// src/pages/cart.ts
import * as store from "../state/store";
import { formatCurrency } from "../utils/format";

type Cart = ReturnType<typeof store.getCart>;

function $(sel: string) { return document.querySelector(sel) as HTMLElement | null; }

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
    return;
  }
  if (empty) empty.style.display = "none";
  if (tableWrap) tableWrap.style.display = "block";

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
    tbody.appendChild(tr);
  }

  attachRowHandlers(tbody);
  updateSummaryFromCart(cart);
}

function attachRowHandlers(tbody: HTMLTableSectionElement) {
  // Qty
  tbody.querySelectorAll<HTMLInputElement>("input.qty").forEach((inp) => {
    inp.addEventListener("change", (e) => {
      const input = e.currentTarget as HTMLInputElement;
      const tr = input.closest("tr");
      if (!tr) return;
      const id = tr.dataset.id!;
      const nextQty = clampInt(input.value, 1, 999);

      store.updateQty(id, nextQty);

      const item = store.getCart().find((x: any) => x.productId === id);
      if (item) {
        const sub = tr.querySelector(".c-subtotal");
        if (sub) sub.textContent = formatCurrency(item.subtotal, "MXN");
        input.value = String(item.qty);
      }
      updateSummaryFromCart(store.getCart());
    });
  });

  // Remove
  tbody.querySelectorAll<HTMLButtonElement>("button.c-remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const b = e.currentTarget as HTMLButtonElement;
      const tr = b.closest("tr");
      if (!tr) return;
      const id = tr.dataset.id!;
      store.remove(id);
      tr.remove();
      const cart = store.getCart();
      if (cart.length === 0) renderCart();
      else updateSummaryFromCart(cart);
    });
  });
}

function updateSummaryFromCart(cart: ReturnType<typeof store.getCart>) {
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

  const btnCheckout = $("#btn-checkout") as HTMLButtonElement | null;
  if (btnCheckout) btnCheckout.disabled = cart.length === 0;
}

function clampInt(v: string, min: number, max: number) {
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function wireActions() {
  const btnClear = $("#btn-clear") as HTMLButtonElement | null;
  if (btnClear) btnClear.addEventListener("click", () => { store.clearCart(); renderCart(); });

  const btnCheckout = $("#btn-checkout") as HTMLButtonElement | null;
  if (btnCheckout) btnCheckout.addEventListener("click", () => { window.location.href = "checkout.html"; });
}

document.addEventListener("DOMContentLoaded", () => { wireActions(); renderCart(); });
