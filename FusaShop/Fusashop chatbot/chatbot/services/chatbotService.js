import { FUSASHOP_KNOWLEDGE, buildSystemPrompt } from "./knowledge-base.js";

const DOMAIN_TERMS = [
  "producto",
  "product",
  "products",
  "stock",
  "inventario",
  "inventory",
  "categoria",
  "category",
  "categories",
  "tienda",
  "store",
  "shop",
  "fusashop",
  "fusabot",
  "mipyme",
  "mipymes",
  "vendedor",
  "seller",
  "comprador",
  "buyer",
  "pedido",
  "order",
  "orders",
  "carrito",
  "cart",
  "checkout",
  "pago",
  "payment",
  "payu",
  "nequi",
  "daviplata",
  "envio",
  "shipping",
  "delivery",
  "devolucion",
  "return",
  "returns",
  "horario",
  "hours",
  "schedule",
  "soporte",
  "support",
  "fusagasuga",
  "ecommerce",
  "comercio",
  "gemini",
  "laravel",
  "vue"
];

const SENSITIVE_TERMS = [
  "api key",
  "apikey",
  "token",
  "clave",
  "contraseña",
  "password",
  "secret",
  "credential"
];

export function isDomainQuestion(message) {
  const normalized = message.toLowerCase();
  return DOMAIN_TERMS.some((term) => normalized.includes(term));
}

function asksForSensitiveInfo(message) {
  const normalized = message.toLowerCase();
  return SENSITIVE_TERMS.some((term) => normalized.includes(term));
}

function redactSecrets(text) {
  if (!text) return "";
  let sanitized = text;
  sanitized = sanitized.replace(/AIza[0-9A-Za-z\-_]{20,}/g, "[REDACTED_API_KEY]");
  sanitized = sanitized.replace(/(api[\s_-]?key\s*[:=]\s*)([^\s]+)/gi, "$1[REDACTED]");
  return sanitized;
}

function buildLocalReply(message, products = [], lang = "es") {
  const normalized = message.toLowerCase();
  const activeProducts = products.filter((item) => item.estado === "activo");
  const en = lang === "en";
  const kb = FUSASHOP_KNOWLEDGE;

  if (normalized.includes("stock") || normalized.includes("inventario") || normalized.includes("inventory")) {
    const available = activeProducts.filter((item) => Number(item.stock) > 0);
    const top = available.slice(0, 5).map((item) => `${item.nombre} (${item.stock})`).join(", ");
    if (!available.length) {
      return en
        ? "There are currently no active products with available stock."
        : "En este momento no hay productos activos con stock disponible.";
    }
    return en
      ? `We have ${available.length} active products in stock. Examples: ${top}.`
      : `Tenemos ${available.length} productos activos con stock. Algunos disponibles: ${top}.`;
  }

  if (normalized.includes("categoria") || normalized.includes("category")) {
    const categories = [...new Set(activeProducts.map((item) => item.categoria))];
    return en
      ? `Product categories on FusaShop: ${categories.join(", ")}.`
      : `Categorías de productos en FusaShop: ${categories.join(", ")}.`;
  }

  if (normalized.includes("pago") || normalized.includes("payment") || normalized.includes("payu") || normalized.includes("nequi") || normalized.includes("daviplata")) {
    return en
      ? `Payment methods: ${kb.compradores.medios_pago.join(", ")}. ${kb.compradores.seguridad}`
      : `Medios de pago: ${kb.compradores.medios_pago.join(", ")}. ${kb.compradores.seguridad}`;
  }

  if (normalized.includes("vendedor") || normalized.includes("seller") || normalized.includes("negocio")) {
    return en
      ? `To sell on FusaShop: ${kb.vendedores.requisitos.join("; ")}. Benefits: ${kb.vendedores.beneficios.join("; ")}.`
      : `Para vender en FusaShop: ${kb.vendedores.requisitos.join("; ")}. Beneficios: ${kb.vendedores.beneficios.join("; ")}.`;
  }

  if (normalized.includes("horario") || normalized.includes("hours") || normalized.includes("schedule") || normalized.includes("soporte") || normalized.includes("support")) {
    return en
      ? `Support hours: ${kb.soporte.horario}. Channels: ${kb.soporte.canales.join(", ")}.`
      : `Horario de soporte: ${kb.soporte.horario}. Canales: ${kb.soporte.canales.join(", ")}.`;
  }

  if (normalized.includes("devolucion") || normalized.includes("return")) {
    const faq = kb.soporte.faq.find((f) => f.pregunta.includes("devolver"));
    return faq?.respuesta || (en ? "Returns within 5 business days if the item is in original condition." : "Devoluciones hasta 5 días hábiles si el artículo está en su estado original.");
  }

  if (normalized.includes("producto") || normalized.includes("product")) {
    const names = activeProducts.slice(0, 5).map((item) => item.nombre).join(", ");
    return en ? `Featured products: ${names}.` : `Productos destacados: ${names}.`;
  }

  if (normalized.includes("pedido") || normalized.includes("order") || normalized.includes("compra")) {
    return en
      ? `Purchase process: ${kb.compradores.proceso_compra.join(" → ")}.`
      : `Proceso de compra: ${kb.compradores.proceso_compra.join(" → ")}.`;
  }

  return en
    ? "I can help with FusaShop products, stock, categories, payments, sellers, orders, and support."
    : "Puedo ayudarte con productos, stock, categorías, pagos, vendedores, pedidos y soporte de FusaShop.";
}

export async function askGemini({ message, apiKey, context, products = [], lang = "es" }) {
  const locale = lang === "en" ? "en" : "es";

  if (asksForSensitiveInfo(message)) {
    return locale === "en"
      ? "I cannot share or handle credentials. I can help with FusaShop products, orders, payments, and support."
      : "No puedo revelar ni gestionar credenciales. Puedo ayudarte con productos, pedidos, pagos y soporte de FusaShop.";
  }
  if (!isDomainQuestion(message)) {
    return locale === "en"
      ? "I can only answer questions related to FusaShop. How can I help you with our platform?"
      : "Solo puedo ayudarte con temas relacionados con FusaShop. ¿En qué te puedo ayudar sobre nuestra plataforma?";
  }
  if (!apiKey?.trim()) {
    return buildLocalReply(message, products, locale);
  }

  const systemPrompt = buildSystemPrompt(locale);
  const userPrompt =
    locale === "en"
      ? `Catalog context:\n${context}\n\nUser question: ${message}`
      : `Contexto del catálogo:\n${context}\n\nPregunta del usuario: ${message}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 512,
        topP: 0.8
      }
    })
  });

  if (!response.ok) {
    return buildLocalReply(message, products, locale);
  }

  try {
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const safeText = redactSecrets(text || "");
    return safeText || buildLocalReply(message, products, locale);
  } catch (_error) {
    return buildLocalReply(message, products, locale);
  }
}
