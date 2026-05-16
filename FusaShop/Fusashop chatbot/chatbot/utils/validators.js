const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(data) {
  if (!data.name?.trim()) return "El nombre es obligatorio.";
  if (!EMAIL_REGEX.test(data.email || "")) return "Correo inválido.";
  if (!data.message?.trim() || data.message.trim().length < 10) {
    return "El mensaje debe tener al menos 10 caracteres.";
  }
  return "";
}

export function validateProduct(payload) {
  const required = ["nombre", "descripcion", "categoria", "imagen", "estado"];
  for (const field of required) {
    if (!String(payload[field] || "").trim()) return `El campo ${field} es obligatorio.`;
  }
  if (Number(payload.precio) < 0) return "El precio no puede ser negativo.";
  if (!Number.isInteger(Number(payload.stock)) || Number(payload.stock) < 0) {
    return "El stock debe ser un entero mayor o igual a 0.";
  }
  return "";
}
