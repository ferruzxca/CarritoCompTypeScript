export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  rating: number;
  img: string;
  shipFrom: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  subtotal: number;
}

export interface User {
  id: string;
  email: string;
  nombre: string;
}

export interface Address {
  name: string;
  phone: string;
  street: string;
  ext: string;
  suburb: string;
  zip: string;
  city: string;
  state: string;
}

export interface Payment {
  type: 'card' | 'transfer';
  cardLast4?: string;
  holder?: string;
  ref?: string;
}

export interface ShippingOption {
  id: string;
  label: string;
  etaDays: number;
  cost: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  taxes: number;
  total: number;
  address: Address;
  shippingOpt: ShippingOption;
  payment: Payment;
  createdAt: string;
}