import { store } from "../state/store";
import { formatCurrency } from "../utils/format";

const main = document.querySelector("main") as HTMLElement;

document.addEventListener("DOMContentLoaded", () => render());

function render() {
  main.innerHTML = "";
  const wrap = document.createElement("section");
  wrap.className = "invoice-wrap";

  const order = store.getLastOrder();
  if (!order) {
    wrap.innerHTML = `
      <div class="invoice">
        <div class="invoice-header">
          <div class="brand-row">
            <div class="brand-mark" aria-hidden="true"></div>
            <div>
              <div class="brand-name">Tienda</div>
              <div class="muted">Factura</div>
            </div>
          </div>
          <div class="meta">
            <div><strong>Pedido:</strong> —</div>
            <div><strong>Fecha:</strong> —</div>
            <span class="badge-paid">PENDIENTE</span>
          </div>
        </div>
        <div class="invoice-body">
          <div class="box">No se encontró un pedido reciente.</div>
        </div>
      </div>`;
    main.appendChild(wrap);
    return;
  }

  const created = new Date(order.createdAt || Date.now());
  const fecha = created.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });

  const address = order.address;
  const payment = order.payment;
  const shipping = order.shippingOpt;

  const itemsRows = order.items
    .map(
      (it: any) => `
      <tr>
        <td>${it.name}</td>
        <td class="td-center">${it.qty}</td>
        <td class="td-right">${formatCurrency(it.price, "MXN")}</td>
        <td class="td-right">${formatCurrency(it.subtotal, "MXN")}</td>
      </tr>`
    )
    .join("");

  wrap.innerHTML = `
    <div class="invoice" role="document" aria-label="Factura">
      <div class="invoice-header">
        <div class="brand-row">
          <div class="brand-mark" aria-hidden="true"></div>
          <div>
            <div class="brand-name">Tienda</div>
            <div class="muted">Factura electrónica</div>
          </div>
        </div>
        <div class="meta">
          <div><strong>Factura:</strong> #${order.id}</div>
          <div><strong>Fecha:</strong> ${fecha}</div>
          <span class="badge-paid">PAGADO</span>
        </div>
      </div>

      <div class="invoice-body">
        <div class="cols">
          <div class="box">
            <h4>Facturar a</h4>
            <div>${address?.name ?? "—"}</div>
            <div>${address?.street ?? ""} ${address?.ext ?? ""}</div>
            <div>${address?.suburb ?? ""}, ${address?.zip ?? ""}</div>
            <div>${address?.city ?? ""}, ${address?.state ?? ""}</div>
            <div>Tel: ${address?.phone ?? "—"}</div>
          </div>
          <div class="box">
            <h4>Envío y pago</h4>
            <div><strong>Envío:</strong> ${shipping?.label ?? "—"} · ${formatCurrency(order.shipping ?? 0,"MXN")}</div>
            <div><strong>Pago:</strong> ${
              payment?.type === "card" ? `Tarjeta **** ${payment.cardLast4}` : `Transferencia ${payment?.ref ?? ""}`
            }</div>
          </div>
        </div>

        <table class="tbl-invoice" aria-label="Detalle de productos">
          <thead>
            <tr>
              <th>Producto</th>
              <th class="td-center">Cantidad</th>
              <th class="td-right">Precio</th>
              <th class="td-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="totals">
          <div></div>
          <div class="totals-box" aria-label="Totales">
            <div class="totals-row"><span>Subtotal</span><span>${formatCurrency(order.subtotal ?? 0, "MXN")}</span></div>
            <div class="totals-row"><span>Impuestos (16%)</span><span>${formatCurrency(order.taxes ?? 0, "MXN")}</span></div>
            <div class="totals-row"><span>Envío</span><span>${formatCurrency(order.shipping ?? 0, "MXN")}</span></div>
            <div class="totals-row total"><span>Total</span><span>${formatCurrency(order.total ?? 0, "MXN")}</span></div>
          </div>
        </div>
      </div>

      <div class="invoice-footer">
        <div class="muted">Gracias por su compra. Conserve esta factura para su registro.</div>
        <div class="actions">
          <button id="btn-print" class="btn btn-ghost" type="button">Imprimir</button>
          <a class="btn btn-primary" href="products.html">Seguir comprando</a>
        </div>
      </div>
    </div>
  `;

  main.appendChild(wrap);
  document.getElementById("btn-print")?.addEventListener("click", () => window.print());
}
