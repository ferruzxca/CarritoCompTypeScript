import { store } from "../state/store";

const main = document.querySelector("main") as HTMLElement;
const params = new URLSearchParams(location.search);
const NEXT = params.get("next") || "products.html";

document.addEventListener("DOMContentLoaded", () => render());

function render() {
  main.innerHTML = `
    <section class="panel" aria-label="Inicio de sesión">
      <h1>Iniciar sesión</h1>
      <form id="login-form" class="form-grid cols-2" novalidate>
        <div><label for="email">Correo</label><input id="email" type="email" required /></div>
        <div><label for="pwd">Contraseña</label><input id="pwd" type="password" required /></div>
        <div id="login-error" role="alert" style="color: var(--c-err); grid-column:1/-1;"></div>
        <div class="step-actions" style="grid-column:1/-1;">
          <button class="btn btn-primary" type="submit">Entrar</button>
        </div>
      </form>
      <div id="session-hint" style="margin-top:.9rem; display:none;"></div>
    </section>
  `;

  const form = main.querySelector<HTMLFormElement>("#login-form")!;
  const err = main.querySelector<HTMLElement>("#login-error")!;
  const hint = main.querySelector<HTMLElement>("#session-hint")!;
  const existing = store.getUser?.();

  if (existing) {
    hint.style.display = "block";
    hint.innerHTML = `
      <div class="panel" style="background: rgba(255,255,255,.04); border-style:dashed">
        Sesión activa como <strong>${existing.email}</strong>.
        <div class="step-actions">
          <button id="btn-continue" class="btn btn-secondary" type="button">Continuar</button>
          <button id="btn-logout" class="btn btn-ghost" type="button">Cambiar de usuario</button>
        </div>
      </div>`;
    hint.querySelector<HTMLButtonElement>("#btn-continue")!
      .addEventListener("click", () => { window.location.href = NEXT; });
    hint.querySelector<HTMLButtonElement>("#btn-logout")!
      .addEventListener("click", () => { store.clearUser(); render(); });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    err.textContent = "";
    const email = (form.querySelector<HTMLInputElement>("#email")!.value || "").trim();
    const pwd = (form.querySelector<HTMLInputElement>("#pwd")!.value || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = "Correo inválido."; return; }
    if (pwd.length < 4) { err.textContent = "Contraseña muy corta."; return; }
    store.setUser({ id: String(Date.now()), email, nombre: email.split("@")[0] });
    window.location.href = NEXT;
  });
}
