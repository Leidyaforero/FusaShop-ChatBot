import {
  bootstrapProducts,
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  toggleProductStatus,
  updateProduct
} from "../services/productService.js";
import { formatCop, formatDate } from "../utils/formatters.js";
import { registerStockMovement, listStockHistory } from "../services/stockService.js";
import {
  getAuthorProfile,
  hasPinConfigured,
  saveAuthorProfile,
  setupAuthorPin,
  verifyAuthorPin
} from "../services/authorService.js";

const productForm = document.getElementById("productForm");
const stockForm = document.getElementById("stockForm");
const productTableBody = document.getElementById("productTableBody");
const stockHistoryBody = document.getElementById("stockHistoryBody");
const productFeedback = document.getElementById("productFeedback");
const stockFeedback = document.getElementById("stockFeedback");
const resetFormBtn = document.getElementById("resetForm");
const authorForm = document.getElementById("authorForm");
const authorPinSetupForm = document.getElementById("authorPinSetupForm");
const authorUnlockForm = document.getElementById("authorUnlockForm");
const authorFeedback = document.getElementById("authorFeedback");
const AUTHOR_UNLOCK_SESSION_KEY = "fusashop_author_unlock_session_v1";

function renderCategorySelects() {
  const categories = getCategories();
  const options = categories.map((category) => `<option value="${category}">${category}</option>`).join("");
  productForm.elements.categoria.innerHTML = `<option value="">Seleccione</option>${options}`;
  stockForm.elements.productoId.innerHTML = `<option value="">Seleccione</option>${getProducts()
    .map((product) => `<option value="${product.id}">${product.nombre}</option>`)
    .join("")}`;
}

function renderProductsTable() {
  productTableBody.innerHTML = getProducts()
    .map(
      (product) => `
      <tr>
        <td>${product.nombre}</td>
        <td>${product.categoria}</td>
        <td>${Number(product.precio) === 0 ? "Gratuito" : formatCop(product.precio)}</td>
        <td>${product.stock}</td>
        <td>${product.estado}</td>
        <td>
          <div class="action-group">
            <button class="outline" data-action="edit" data-id="${product.id}">
              <i class="fa-solid fa-pen-to-square"></i> Editar
            </button>
            <button class="danger" data-action="delete" data-id="${product.id}">
              <i class="fa-solid fa-trash"></i> Eliminar
            </button>
            <button data-action="toggle" data-id="${product.id}">
              <i class="fa-solid ${product.estado === "activo" ? "fa-toggle-off" : "fa-toggle-on"}"></i>
              ${product.estado === "activo" ? "Desactivar" : "Activar"}
            </button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");
}

function renderStockHistory() {
  stockHistoryBody.innerHTML = listStockHistory()
    .map(
      (move) => `
      <tr>
        <td>${formatDate(move.fecha)}</td>
        <td>${move.productoNombre}</td>
        <td>${move.tipo}</td>
        <td>${move.cantidad}</td>
        <td>${move.descripcion || "-"}</td>
      </tr>
    `
    )
    .join("");
}

function refreshAll() {
  renderCategorySelects();
  renderProductsTable();
  renderStockHistory();
}

function resetProductForm() {
  productForm.reset();
  productForm.elements.id.value = "";
}

function bindProductActions() {
  productTableBody.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-id]");
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    const selected = getProducts().find((item) => item.id === id);
    if (!selected) return;
    try {
      if (action === "edit") {
        Object.entries(selected).forEach(([key, value]) => {
          if (productForm.elements[key]) productForm.elements[key].value = value;
        });
        return;
      }
      if (action === "delete") {
        deleteProduct(id);
      } else if (action === "toggle") {
        toggleProductStatus(id);
      }
      refreshAll();
    } catch (error) {
      productFeedback.textContent = error.message;
    }
  });
}

function bindProductForm() {
  productForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(productForm).entries());
    const id = payload.id;
    delete payload.id;
    try {
      if (id) {
        updateProduct(id, payload);
        productFeedback.textContent = "Producto actualizado correctamente.";
      } else {
        createProduct(payload);
        productFeedback.textContent = "Producto creado correctamente.";
      }
      resetProductForm();
      refreshAll();
    } catch (error) {
      productFeedback.textContent = error.message;
    }
  });
}

function bindStockForm() {
  stockForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(stockForm).entries());
    try {
      registerStockMovement(payload);
      stockForm.reset();
      stockFeedback.textContent = "Movimiento registrado correctamente.";
      refreshAll();
    } catch (error) {
      stockFeedback.textContent = error.message;
    }
  });
}

function setAuthorFormLockedState(locked) {
  [...authorForm.elements].forEach((field) => {
    if (field.tagName === "BUTTON") return;
    field.disabled = locked;
  });
}

function renderAuthorForm() {
  const author = getAuthorProfile();
  Object.entries(author).forEach(([key, value]) => {
    if (authorForm.elements[key]) authorForm.elements[key].value = value;
  });
}

function bindAuthorSection() {
  const isUnlocked = sessionStorage.getItem(AUTHOR_UNLOCK_SESSION_KEY) === "true";
  setAuthorFormLockedState(!isUnlocked);

  if (hasPinConfigured()) {
    authorPinSetupForm.style.display = "none";
  }

  authorPinSetupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const pin = authorPinSetupForm.elements.pin.value.trim();
    try {
      if (hasPinConfigured()) {
        throw new Error("El PIN ya fue configurado.");
      }
      await setupAuthorPin(pin);
      authorFeedback.textContent = "PIN configurado correctamente.";
      authorPinSetupForm.reset();
      authorPinSetupForm.style.display = "none";
    } catch (error) {
      authorFeedback.textContent = error.message;
    }
  });

  authorUnlockForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const pin = authorUnlockForm.elements.pin.value.trim();
    const valid = await verifyAuthorPin(pin);
    if (!valid) {
      authorFeedback.textContent = "PIN incorrecto.";
      return;
    }
    sessionStorage.setItem(AUTHOR_UNLOCK_SESSION_KEY, "true");
    setAuthorFormLockedState(false);
    authorFeedback.textContent = "Edicion desbloqueada para esta sesion.";
    authorUnlockForm.reset();
  });

  authorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const unlocked = sessionStorage.getItem(AUTHOR_UNLOCK_SESSION_KEY) === "true";
    if (!unlocked) {
      authorFeedback.textContent = "Debes desbloquear con PIN para modificar.";
      return;
    }
    const payload = Object.fromEntries(new FormData(authorForm).entries());
    saveAuthorProfile(payload);
    authorFeedback.textContent = "Datos del autor guardados correctamente.";
  });
}

async function init() {
  await bootstrapProducts();
  bindProductActions();
  bindProductForm();
  bindStockForm();
  bindAuthorSection();
  resetFormBtn.addEventListener("click", resetProductForm);
  renderAuthorForm();
  refreshAll();
}

init();
