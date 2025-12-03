// lib/paymentIcons.ts
export const PAYMENT_ICON_MAP = {
    default: { icon: "mdi:credit-card-outline" },
  
    visa: { icon: "mdi:credit-card-outline" },
    mastercard: { icon: "mdi:credit-card-outline" },
    americanexpress: { icon: "mdi:credit-card-outline" },
    amex: { icon: "mdi:credit-card-outline" },
    payoneer: { icon: "mdi:credit-card-outline" },
  
    cash: { icon: "mdi:cash-multiple" },
  
    btc: { icon: "mdi:bitcoin" },
    bitcoin: { icon: "mdi:bitcoin" },
  
    eth: { icon: "mdi:ethereum" },
    ethereum: { icon: "mdi:ethereum" },
  
    usdt: { icon: "mdi:currency-usd-circle" },
  } as const;
  
  export type PaymentIconKey = keyof typeof PAYMENT_ICON_MAP;
  
  /**
   * Превращает текст "Visa / MasterCard" → "visa", "mastercard" и т.п.
   * Если ключ не найден — вернётся "default".
   */
  export function normalizePaymentKey(label: string): PaymentIconKey | "default" {
    const raw = label.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
    if (!raw) return "default";
    return (raw in PAYMENT_ICON_MAP ? raw : "default") as PaymentIconKey | "default";
  }
  