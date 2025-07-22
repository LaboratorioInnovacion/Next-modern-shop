export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function parseCurrency(priceString) {
  return Number.parseFloat(priceString.replace(/[^0-9.-]+/g, ""))
}
