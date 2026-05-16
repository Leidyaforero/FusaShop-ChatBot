export const PRODUCT_IMAGE_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23e8f5e9' width='800' height='600'/%3E%3Ctext x='400' y='290' text-anchor='middle' fill='%231a6b3a' font-family='Arial,sans-serif' font-size='22' font-weight='600'%3EFusaShop%3C/text%3E%3Ctext x='400' y='330' text-anchor='middle' fill='%23666' font-family='Arial,sans-serif' font-size='16'%3EImagen no disponible%3C/text%3E%3C/svg%3E";

const IMG = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&h=600&q=80`;

/** Imágenes del catálogo semilla: cada URL corresponde al producto descrito. */
export const CATALOG_IMAGES = {
  "p-001": IMG("photo-1447933601403-0c6688de566e"),
  "p-002": IMG("photo-1606313564200-4f1e448e0c8d"),
  "p-003": IMG("photo-1596755273877-6b57d932f164"),
  "p-004": IMG("photo-1601925260368-ae84f83ba550"),
  "p-005": IMG("photo-1521572163474-6864f9cf17ab"),
  "p-006": IMG("photo-1542291026-7eec264c27ff"),
  "p-007": IMG("photo-1505740420928-5e560c06d30e"),
  "p-008": IMG("photo-1625948515291-696704bf0b0c"),
  "p-009": IMG("photo-1556909114-f6e7ad7d4046"),
  "p-010": IMG("photo-1507473885765-e6ed057f782c"),
  "p-011": IMG("photo-1570175179973-40d04bb5220e"),
  "p-012": IMG("photo-1564890369478-c89ca71d185e"),
  "p-013": IMG("photo-1587049352846-4a222e784d38"),
  "p-014": IMG("photo-1548036328-c9fa89d128fa"),
  "p-015": IMG("photo-1527864550417-7fd91fc51a46")
};

export function catalogImageUrl(productId) {
  return CATALOG_IMAGES[productId] || PRODUCT_IMAGE_FALLBACK;
}

export function resolveProductImage(product) {
  if (product?.id && CATALOG_IMAGES[product.id]) {
    return CATALOG_IMAGES[product.id];
  }
  if (product?.imagen?.trim()) return product.imagen.trim();
  if (product?.id) return catalogImageUrl(product.id);
  return PRODUCT_IMAGE_FALLBACK;
}

export function bindProductImageFallback(img) {
  if (!img || img.dataset.fallbackBound === "true") return;
  img.dataset.fallbackBound = "true";
  img.addEventListener("error", () => {
    if (img.src !== PRODUCT_IMAGE_FALLBACK) {
      img.src = PRODUCT_IMAGE_FALLBACK;
      img.classList.add("card-img--fallback");
    }
  });
}
