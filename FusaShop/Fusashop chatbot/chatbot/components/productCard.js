import { formatCop } from "../utils/formatters.js";
import { PRODUCT_IMAGE_FALLBACK, resolveProductImage } from "../utils/productImages.js";

function formatPrice(precio) {
  return Number(precio) === 0 ? "Gratuito" : formatCop(precio);
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

export function productCardTemplate(product) {
  const imageSrc = resolveProductImage(product);
  const fallback = PRODUCT_IMAGE_FALLBACK;
  return `
    <article class="card">
      <div class="card-media">
        <img
          src="${escapeAttr(imageSrc)}"
          alt="${escapeAttr(product.nombre)}"
          loading="lazy"
          decoding="async"
          data-fallback="${escapeAttr(fallback)}"
          onerror="if(this.src!==this.dataset.fallback){this.src=this.dataset.fallback;this.classList.add('card-img--fallback')}"
        />
      </div>
      <div class="card-content">
        <h3>${product.nombre}</h3>
        <p>${product.descripcion.slice(0, 90)}...</p>
        <p><strong>${formatPrice(product.precio)}</strong></p>
        <p>Stock: ${product.stock}</p>
        <button data-action="detail" data-id="${product.id}">Ver detalle</button>
      </div>
    </article>
  `;
}
