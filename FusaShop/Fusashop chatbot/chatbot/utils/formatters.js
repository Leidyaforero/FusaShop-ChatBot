export function formatCop(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

export function formatDate(isoValue) {
  return new Date(isoValue).toLocaleString("es-CO");
}
