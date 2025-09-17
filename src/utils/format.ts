// src/utils/format.ts

// Formatea moneda con Intl. Uso: formatCurrency(12999.5, "MXN") -> "$12,999.50"
export function formatCurrency(
  amount: number,
  currency: string = "MXN",
  locale: string = "es-MX"
): string {
  const n = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    // Fallback sencillo si Intl falla o currency inválida
    return `${currency} ${n.toFixed(2)}`;
  }
}


export function formatDateETA(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}