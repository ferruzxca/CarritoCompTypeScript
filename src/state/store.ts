
import type {
  Product,
  CartItem,
  User,
  Payment,
  Address,
  ShippingOption,
  Order,
} from "../types/models";
import { safeGet, safeSet } from "../utils/storage";

type Listener = () => void;

const K = {
  user: "app:user",
  cart: "app:cart",
  payment: "app:payment",
  address: "app:address",
  shippingOpt: "app:shippingOpt",
  lastOrder: "app:order:last",
};

function clampQty(qty: number, min = 1, max = 999) {
  const n = Number.isFinite(qty) ? Math.trunc(qty) : min;
  return Math.max(min, Math.min(max, n));
}

export class Store {
  private user: User | null = null;
  private cart: CartItem[] = [];
  private payment: Payment | null = null;
  private address: Address | null = null;
  private shippingOpt: ShippingOption | null = null;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.hydrate();
  }

  private hydrate() {
    this.user = safeGet<User>(K.user) ?? null;
    this.cart = safeGet<CartItem[]>(K.cart) ?? [];
    this.payment = safeGet<Payment>(K.payment) ?? null;
    this.address = safeGet<Address>(K.address) ?? null;
    this.shippingOpt = safeGet<ShippingOption>(K.shippingOpt) ?? null;

    // saneo inicial
    this.cart = this.cart.map((it) => {
      const q = clampQty(it.qty);
      return { ...it, qty: q, subtotal: it.price * q };
    });
  }

  private persist() {
    safeSet(K.user, this.user);
    safeSet(K.cart, this.cart);
    safeSet(K.payment, this.payment);
    safeSet(K.address, this.address);
    safeSet(K.shippingOpt, this.shippingOpt);
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  private notify() {
    for (const l of this.listeners) l();
  }

  // -------- User --------
  getUser() {
    return this.user;
  }
  setUser(u: User) {
    this.user = u;
    this.persist();
    this.notify();
  }
  clearUser() {
    this.user = null;
    this.persist();
    this.notify();
  }

  // -------- Cart --------
  getCart(): CartItem[] {
    return this.cart.map((it) => ({ ...it }));
  }

  addToCart(p: Product, qty: number) {
    const add = Math.min(clampQty(qty), p.stock ?? 999);
    const i = this.cart.findIndex((it) => it.productId === p.id);
    if (i >= 0) {
      const next = clampQty(this.cart[i].qty + add);
      const clamped = Math.min(next, p.stock ?? next);
      this.cart[i].qty = clamped;
      this.cart[i].subtotal = clamped * this.cart[i].price;
    } else {
      const initial = Math.min(add, p.stock ?? add);
      this.cart.push({
        productId: p.id,
        name: p.name,
        price: p.price,
        qty: initial,
        subtotal: p.price * initial,
      });
    }
    this.persist();
    this.notify();
  }

  updateQty(id: string, qty: number, maxStock?: number) {
    const idx = this.cart.findIndex((it) => it.productId === id);
    if (idx < 0) return;
    const q = Math.min(clampQty(qty), maxStock ?? 999);
    this.cart[idx].qty = q;
    this.cart[idx].subtotal = q * this.cart[idx].price;
    this.persist();
    this.notify();
  }

  remove(id: string) {
    this.cart = this.cart.filter((it) => it.productId !== id);
    this.persist();
    this.notify();
  }

  clearCart() {
    this.cart = [];
    this.persist();
    this.notify();
  }

  // -------- Payment --------
  setPayment(data: Payment) {
    this.payment = data;
    this.persist();
    this.notify();
  }
  getPayment() {
    return this.payment;
  }

  // -------- Address --------
  setAddress(data: Address) {
    this.address = data;
    this.persist();
    this.notify();
  }
  getAddress() {
    return this.address;
  }

  // -------- Shipping --------
  setShipping(option: ShippingOption) {
    this.shippingOpt = option;
    this.persist();
    this.notify();
  }
  getShipping() {
    return this.shippingOpt;
  }

  // -------- Orders --------
  saveOrder(order: Order) {
    safeSet(K.lastOrder, order);
  }
  getLastOrder() {
    return safeGet<Order>(K.lastOrder) ?? null;
  }

  // -------- Totales útiles --------
  getTotals() {
    const subtotal = this.cart.reduce((a, it) => a + it.subtotal, 0);
    const taxes = Math.round(subtotal * 0.16);
    const shipping = this.shippingOpt?.cost ?? 0;
    const total = subtotal + taxes + shipping;
    return { subtotal, taxes, shipping, total };
  }

  resetCheckout() {
    this.payment = null;
    this.address = null;
    this.shippingOpt = null;
    this.persist();
    this.notify();
  }
}

// Singleton
export const store = new Store();

// Wrappers para permitir `import * as store` y usar `store.getCart()` directamente
export const getCart = () => store.getCart();
export const addToCart = (p: Product, qty: number) => store.addToCart(p, qty);
export const updateQty = (id: string, qty: number, maxStock?: number) =>
  store.updateQty(id, qty, maxStock);
export const remove = (id: string) => store.remove(id);
export const clearCart = () => store.clearCart();

export const getUser = () => store.getUser();
export const setUser = (u: User) => store.setUser(u);
export const clearUser = () => store.clearUser();

export const setPayment = (p: Payment) => store.setPayment(p);
export const getPayment = () => store.getPayment();

export const setAddress = (a: Address) => store.setAddress(a);
export const getAddress = () => store.getAddress();

export const setShipping = (s: ShippingOption) => store.setShipping(s);
export const getShipping = () => store.getShipping();

export const saveOrder = (o: Order) => store.saveOrder(o);
export const getLastOrder = () => store.getLastOrder();
export const getTotals = () => store.getTotals();
export const resetCheckout = () => store.resetCheckout();
