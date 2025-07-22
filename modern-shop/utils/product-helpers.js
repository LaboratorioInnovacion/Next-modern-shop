export function calculateDiscount(originalPrice, currentPrice) {
  const original = Number.parseFloat(originalPrice.replace("$", ""))
  const current = Number.parseFloat(currentPrice.replace("$", ""))
  return Math.round(((original - current) / original) * 100)
}

export function getStockStatus(quantity) {
  if (quantity === 0) return { status: "out-of-stock", text: "Agotado", color: "text-red-500" }
  if (quantity < 5) return { status: "low-stock", text: "Pocas unidades", color: "text-yellow-500" }
  return { status: "in-stock", text: "En stock", color: "text-green-500" }
}

export function generateProductSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}
