import { getProducts } from "./productService.js";

const STOCK_HISTORY_KEY = "fusashop_stock_history_v1";
const PRODUCT_KEY = "fusashop_products_v1";

function getHistory() {
  return JSON.parse(localStorage.getItem(STOCK_HISTORY_KEY) || "[]");
}

function saveHistory(history) {
  localStorage.setItem(STOCK_HISTORY_KEY, JSON.stringify(history));
}

function saveProducts(products) {
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
}

export function registerStockMovement({ productoId, tipo, cantidad, descripcion }) {
  const qty = Number(cantidad);
  if (!Number.isInteger(qty) || qty <= 0) {
    throw new Error("La cantidad debe ser un entero mayor a 0.");
  }
  if (!["entrada", "salida"].includes(tipo)) {
    throw new Error("Tipo de movimiento inválido.");
  }

  const products = getProducts();
  const product = products.find((item) => item.id === productoId);
  if (!product) throw new Error("Producto no encontrado.");

  const nextStock = tipo === "entrada" ? product.stock + qty : product.stock - qty;
  if (nextStock < 0) throw new Error("No hay stock suficiente para esta salida.");
  product.stock = nextStock;
  saveProducts(products);

  const movement = {
    idMovimiento: crypto.randomUUID(),
    productoId,
    productoNombre: product.nombre,
    tipo,
    cantidad: qty,
    fecha: new Date().toISOString(),
    descripcion: descripcion?.trim() || ""
  };
  const history = getHistory();
  history.unshift(movement);
  saveHistory(history);
  return movement;
}

export function listStockHistory() {
  return getHistory();
}
