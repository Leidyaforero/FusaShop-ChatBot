import { validateProduct } from "../utils/validators.js";

const PRODUCT_KEY = "fusashop_products_v1";
const BOOTSTRAP_KEY = "fusashop_bootstrap_v3";
const IMAGE_MIGRATION_KEY = "fusashop_catalog_images_v4";

async function loadSeedProducts() {
  let response = await fetch("./data/products.json");
  if (!response.ok) {
    response = await fetch("../data/products.json");
  }
  if (!response.ok) {
    throw new Error("No se pudo cargar data/products.json");
  }
  return response.json();
}

async function migrateCatalogImages() {
  if (localStorage.getItem(IMAGE_MIGRATION_KEY)) return getProducts();
  const seedProducts = await loadSeedProducts();
  const seedById = Object.fromEntries(seedProducts.map((item) => [item.id, item]));
  const products = getProducts();
  let changed = false;
  for (const product of products) {
    const seed = seedById[product.id];
    if (seed?.imagen && product.imagen !== seed.imagen) {
      product.imagen = seed.imagen;
      changed = true;
    }
  }
  if (changed) saveProducts(products);
  localStorage.setItem(IMAGE_MIGRATION_KEY, "true");
  return products;
}

export async function bootstrapProducts() {
  if (localStorage.getItem(BOOTSTRAP_KEY)) {
    return migrateCatalogImages();
  }
  const seedProducts = await loadSeedProducts();
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(seedProducts));
  localStorage.setItem(BOOTSTRAP_KEY, "true");
  localStorage.setItem(IMAGE_MIGRATION_KEY, "true");
  return seedProducts;
}

export function getProducts() {
  return JSON.parse(localStorage.getItem(PRODUCT_KEY) || "[]");
}

function saveProducts(products) {
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
  return products;
}

export function getCategories() {
  return [...new Set(getProducts().map((product) => product.categoria))];
}

export function createProduct(payload) {
  const error = validateProduct(payload);
  if (error) throw new Error(error);
  const products = getProducts();
  const newProduct = {
    ...payload,
    id: crypto.randomUUID(),
    precio: Number(payload.precio),
    stock: Number(payload.stock),
    fechaCreacion: new Date().toISOString()
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(id, payload) {
  const error = validateProduct(payload);
  if (error) throw new Error(error);
  const products = getProducts();
  const index = products.findIndex((product) => product.id === id);
  if (index < 0) throw new Error("Producto no encontrado.");
  products[index] = {
    ...products[index],
    ...payload,
    precio: Number(payload.precio),
    stock: Number(payload.stock)
  };
  saveProducts(products);
  return products[index];
}

export function deleteProduct(id) {
  const products = getProducts().filter((product) => product.id !== id);
  saveProducts(products);
}

export function toggleProductStatus(id) {
  const products = getProducts();
  const target = products.find((product) => product.id === id);
  if (!target) throw new Error("Producto no encontrado.");
  target.estado = target.estado === "activo" ? "inactivo" : "activo";
  saveProducts(products);
  return target;
}
