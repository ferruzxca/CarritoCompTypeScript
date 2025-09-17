import { store } from "../state/store";
import { createStepper } from "../components/stepper";
import { formatCurrency } from "../utils/format";

/* ===== ubicaciones desde /public/data ===== */
type Ubicaciones = Record<string, Record<string, { cost: number; etaDays: number }>>;
let UBI_CACHE: Ubicaciones | null = null;
async function loadUbicaciones(): Promise<Ubicaciones> {
  if (UBI_CACHE) return UBI_CACHE;
  const res = await fetch("/data/ubicaciones.json", { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar /data/ubicaciones.json");
  UBI_CACHE = (await res.json()) as Ubicaciones;
  return UBI_CACHE;
}
/* ========================================== */

const main = document.querySelector("main") as HTMLElement;
const steps = ["Método de pago", "Dirección y envío", "Revisión y confirmación"];
let currentStep = 0;

function checkSession() { if (!store.getUser()) window.location.href = "index.html"; }
function requireStep(step: number) {
  if (step >= 1 && !store.getPayment()) currentStep = 0;
  if (step >= 2 && !store.getAddress()) currentStep = 1;
}

function render() {
  requireStep(currentStep);
  main.classList.add("checkout-main");
  main.innerHTML = "";
  main.appendChild(createStepper(steps, currentStep));
  if (currentStep === 0) renderPaymentStep();
  else if (currentStep === 1) void renderAddressStep();   // async
  else renderReviewStep();
}

/* ---------- Paso 0: Pago ---------- */
function renderPaymentStep() {
  const section = document.createElement("section");
  section.className = "panel";
  section.setAttribute("aria-label", "Método de pago");
  section.innerHTML = `
    <h2>Método de pago</h2>
    <form id="payment-form" class="form-grid" novalidate>
      <div>
        <label><input type="radio" name="payment-type" value="card" checked /> Tarjeta de crédito/débito</label>
      </div>
      <div id="card-fields" class="form-grid cols-2">
        <div>
          <label for="card-number">Número de tarjeta</label>
          <input type="text" id="card-number" name="card-number" maxlength="19" placeholder="1234 5678 9012 3456" required />
        </div>
        <div>
          <label for="card-holder">Nombre en la tarjeta</label>
          <input type="text" id="card-holder" name="card-holder" required />
        </div>
      </div>

      <div>
        <label><input type="radio" name="payment-type" value="transfer" /> Transferencia bancaria</label>
      </div>
      <div id="transfer-fields" class="form-grid" style="display:none;">
        <div>
          <label for="transfer-ref">Referencia</label>
          <input type="text" id="transfer-ref" name="transfer-ref" />
        </div>
      </div>

      <div id="payment-error" role="alert" style="color: var(--c-err);"></div>
      <div class="step-actions">
        <button type="submit" class="btn btn-primary">Siguiente</button>
      </div>
    </form>
  `;
  main.appendChild(section);

  const form = section.querySelector<HTMLFormElement>("#payment-form")!;
  const cardFields = section.querySelector<HTMLElement>("#card-fields")!;
  const transferFields = section.querySelector<HTMLElement>("#transfer-fields")!;
  const err = section.querySelector<HTMLElement>("#payment-error")!;
  const radios = form.querySelectorAll<HTMLInputElement>('input[name="payment-type"]');

  radios.forEach((r) => r.addEventListener("change", () => {
    const card = r.value === "card" && r.checked;
    cardFields.style.display = card ? "grid" : "none";
    transferFields.style.display = card ? "none" : "grid";
  }));

  form.addEventListener("submit", (e) => {
    e.preventDefault(); err.textContent = "";
    const selected = form.querySelector<HTMLInputElement>('input[name="payment-type"]:checked');
    const type = (selected?.value ?? "card") as "card" | "transfer";

    if (type === "card") {
      const cardNumber = (form.querySelector<HTMLInputElement>("#card-number")!.value || "").replace(/\s+/g, "");
      const cardHolder = form.querySelector<HTMLInputElement>("#card-holder")!.value || "";
      if (!cardNumber || !cardHolder) { err.textContent = "Complete todos los campos."; return; }
      if (!isValidCardNumber(cardNumber)) { err.textContent = "Número de tarjeta inválido."; return; }
      store.setPayment({ type, cardLast4: cardNumber.slice(-4), holder: cardHolder });
    } else {
      const ref = form.querySelector<HTMLInputElement>("#transfer-ref")!.value || "";
      if (!ref) { err.textContent = "Ingrese la referencia."; return; }
      store.setPayment({ type, ref });
    }
    currentStep = 1; render();
  });
}

function isValidCardNumber(cardNum: string): boolean {
  let sum = 0, dbl = false;
  for (let i = cardNum.length - 1; i >= 0; i--) {
    let d = cardNum.charCodeAt(i) - 48; if (d < 0 || d > 9) return false;
    if (dbl) { d *= 2; if (d > 9) d -= 9; } sum += d; dbl = !dbl;
  }
  return sum % 10 === 0;
}

/* ---------- Paso 1: Dirección y envío ---------- */
async function renderAddressStep() {
  const data = await loadUbicaciones();

  const section = document.createElement("section");
  section.className = "panel";
  section.setAttribute("aria-label", "Dirección y envío");
  section.innerHTML = `
    <h2>Dirección y envío</h2>
    <form id="address-form" class="form-grid" novalidate>

      <div class="form-grid cols-2">
        <div><label for="name">Nombre completo</label><input id="name" name="name" required /></div>
        <div><label for="phone">Teléfono</label><input id="phone" name="phone" type="tel" required /></div>
      </div>

      <div class="form-grid cols-3">
        <div><label for="street">Calle</label><input id="street" name="street" required /></div>
        <div><label for="ext">Núm. exterior</label><input id="ext" name="ext" required /></div>
        <div><label for="suburb">Colonia</label><input id="suburb" name="suburb" required /></div>
      </div>

      <div class="form-grid cols-3">
        <div><label for="zip">C.P.</label><input id="zip" name="zip" required /></div>
        <div><label for="city">Ciudad</label><input id="city" name="city" required /></div>
        <div>
          <label for="state">Estado</label>
          <select id="state" name="state" required>
            <option value="">Seleccione</option>
          </select>
        </div>
      </div>

      <fieldset>
        <legend>Opciones de envío</legend>
        <label><input type="radio" name="shipping" value="Económico" required /> Económico 3–5 días</label>
        <label><input type="radio" name="shipping" value="Estándar" /> Estándar 2–3 días</label>
        <label><input type="radio" name="shipping" value="Exprés" /> Exprés 24h</label>
      </fieldset>

      <div id="shipping-info" aria-live="polite" style="margin-top:.4rem;"></div>
      <div id="address-error" role="alert" style="color: var(--c-err);"></div>

      <div class="step-actions">
        <button type="button" id="btn-back" class="btn btn-ghost">Atrás</button>
        <button type="submit" class="btn btn-primary">Siguiente</button>
      </div>
    </form>
  `;
  main.appendChild(section);

  const form = section.querySelector<HTMLFormElement>("#address-form")!;
  const stateSel = form.querySelector<HTMLSelectElement>("#state")!;
  const shippingRadios = form.querySelectorAll<HTMLInputElement>('input[name="shipping"]');
  const info = section.querySelector<HTMLElement>("#shipping-info")!;
  const err = section.querySelector<HTMLElement>("#address-error")!;
  section.querySelector<HTMLButtonElement>("#btn-back")!.addEventListener("click", () => { currentStep = 0; render(); });

  // Estados
  stateSel.innerHTML =
    `<option value="">Seleccione</option>` +
    Object.keys(data).map((s) => `<option value="${s}">${s}</option>`).join("");

  const updateShippingInfo = () => {
    const state = stateSel.value;
    const shipping = Array.from(shippingRadios).find((r) => r.checked)?.value as string | undefined;
    const opt = data?.[state]?.[shipping ?? ""];
    info.textContent = state && shipping && opt
      ? `Costo: ${formatCurrency(opt.cost, "MXN")} · Llega en ${opt.etaDays} día(s)`
      : "";
  };

  stateSel.addEventListener("change", updateShippingInfo);
  shippingRadios.forEach((r) => r.addEventListener("change", updateShippingInfo));

  form.addEventListener("submit", (e) => {
    e.preventDefault(); err.textContent = "";
    const fd = new FormData(form);
    const name = String(fd.get("name") || "");
    const phone = String(fd.get("phone") || "");
    const street = String(fd.get("street") || "");
    const ext = String(fd.get("ext") || "");
    const suburb = String(fd.get("suburb") || "");
    const zip = String(fd.get("zip") || "");
    const city = String(fd.get("city") || "");
    const state = String(fd.get("state") || "");
    const shipping = Array.from(shippingRadios).find((r) => r.checked)?.value as string | undefined;

    if (!name || !phone || !street || !ext || !suburb || !zip || !city || !state || !shipping) {
      err.textContent = "Complete todos los campos."; return;
    }

    const opt = data[state][shipping];
    store.setAddress({ name, phone, street, ext, suburb, zip, city, state });
    store.setShipping({ id: shipping, label: shipping, etaDays: opt.etaDays, cost: opt.cost });

    currentStep = 2; render();
  });
}

/* ---------- Paso 2: Revisión (ticket centrado) ---------- */
function renderReviewStep() {
  const section = document.createElement("section");
  section.className = "panel ticket-wrap";
  section.setAttribute("aria-label", "Revisión y confirmación");

  const cart = store.getCart();
  const address = store.getAddress()!;
  const shipping = store.getShipping()!;
  const payment = store.getPayment()!;

  const subtotal = cart.reduce((a, it) => a + it.subtotal, 0);
  const taxes = Math.round(subtotal * 0.16);
  const total = subtotal + taxes + (shipping.cost || 0);

  const itemsHtml = cart.map(it => `
    <div class="row">
      <span>${it.qty}× ${it.name}</span>
      <span>${formatCurrency(it.subtotal, "MXN")}</span>
    </div>`).join("");

  section.innerHTML = `
    <div class="ticket">
      <h3>🧾 Resumen de compra</h3>

      <div class="row muted"><span>Cliente</span><span>${address.name}</span></div>
      <div class="row muted"><span>Envío</span><span>${shipping.label} · ${formatCurrency(shipping.cost || 0,"MXN")}</span></div>
      <div class="row muted"><span>Pago</span><span>${
        payment.type === "card" ? `Tarjeta **** ${payment.cardLast4}` : `Transferencia (${payment.ref})`
      }</span></div>
      <hr/>

      <div class="items">${itemsHtml}</div>

      <hr/>
      <div class="row"><span>Subtotal</span><span>${formatCurrency(subtotal,"MXN")}</span></div>
      <div class="row"><span>Impuestos (16%)</span><span>${formatCurrency(taxes,"MXN")}</span></div>
      <div class="row"><span>Envío</span><span>${formatCurrency(shipping.cost || 0,"MXN")}</span></div>
      <div class="row total"><span>Total</span><span>${formatCurrency(total,"MXN")}</span></div>

      <div class="barcode"></div>

      <div class="step-actions" style="justify-content:center">
        <button id="btn-back" class="btn btn-ghost">Atrás</button>
        <button id="confirm-btn" class="btn btn-primary">Confirmar compra</button>
      </div>
    </div>
  `;
  main.appendChild(section);

  section.querySelector<HTMLButtonElement>("#btn-back")!.addEventListener("click", () => { currentStep = 1; render(); });
  section.querySelector<HTMLButtonElement>("#confirm-btn")!.addEventListener("click", () => {
    const order = {
      id: Date.now().toString(),
      items: cart, subtotal, shipping: shipping.cost || 0, taxes, total,
      address, shippingOpt: shipping, payment, createdAt: new Date().toISOString(),
    };
    store.saveOrder(order as any);
    store.clearCart();
    window.location.href = "thanks.html";
  });
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", () => { checkSession(); render(); });
