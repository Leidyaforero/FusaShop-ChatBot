import { productCardTemplate } from "../components/productCard.js";
import { showModal } from "../components/modal.js";
import { askGemini } from "../services/chatbotService.js";
import { getAuthorProfile } from "../services/authorService.js";
import { bootstrapProducts, getCategories, getProducts } from "../services/productService.js";
import { formatCop } from "../utils/formatters.js";
import { PRODUCT_IMAGE_FALLBACK, resolveProductImage } from "../utils/productImages.js";
import { validateContact } from "../utils/validators.js";

const productGrid = document.getElementById("productGrid");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");
const featuredCategories = document.getElementById("featuredCategories");

function renderCategories() {
  const categories = getCategories();
  categoryFilter.innerHTML = `<option value="">Todas las categorías</option>${categories
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("")}`;
  featuredCategories.innerHTML = categories
    .slice(0, 5)
    .map((category) => `<span class="chip">${category}</span>`)
    .join("");
}

function renderProducts() {
  const category = categoryFilter.value;
  const query = searchInput.value.toLowerCase().trim();
  const products = getProducts().filter((product) => {
    if (product.estado !== "activo") return false;
    const matchesCategory = !category || product.categoria === category;
    const matchesQuery = !query || product.nombre.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });
  productGrid.innerHTML = products.map(productCardTemplate).join("");
}

function setupProductDetails() {
  productGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action='detail']");
    if (!button) return;
    const product = getProducts().find((item) => item.id === button.dataset.id);
    if (!product) return;
    const imageSrc = resolveProductImage(product);
    showModal(`
      <h3>${product.nombre}</h3>
      <img
        src="${imageSrc}"
        alt="${product.nombre}"
        data-fallback="${PRODUCT_IMAGE_FALLBACK}"
        onerror="if(this.src!==this.dataset.fallback){this.src=this.dataset.fallback}"
        style="width:100%;max-height:220px;object-fit:cover;border-radius:0.5rem;background:#e8f5e9;"
      />
      <p>${product.descripcion}</p>
      <p><strong>Precio:</strong> ${product.precio === 0 ? "Gratuito" : formatCop(product.precio)}</p>
      <p><strong>Stock:</strong> ${product.stock}</p>
      <p><strong>Estado:</strong> ${product.estado}</p>
    `);
  });
}

function setupContactForm() {
  const form = document.getElementById("contactForm");
  const feedback = document.getElementById("contactFeedback");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(form).entries());
    const error = validateContact(formData);
    if (error) {
      feedback.textContent = error;
      feedback.style.color = "#cb334f";
      return;
    }
    feedback.textContent = "Mensaje enviado correctamente.";
    feedback.style.color = "#00a86b";
    form.reset();
  });
}

function renderAuthorPublicProfile() {
  const target = document.getElementById("authorPublicCard");
  if (!target) return;
  const author = getAuthorProfile();
  const githubLine = author.github ? `<p><strong>Perfil:</strong> ${author.github}</p>` : "";
  target.innerHTML = `
    <p><strong>Autor:</strong> ${author.nombre}</p>
    <p><strong>Rol:</strong> ${author.rol}</p>
    <p><strong>Email:</strong> ${author.email}</p>
    ${githubLine}
    <p>${author.descripcion}</p>
  `;
}

async function loadGeminiKeyFromEnv() {
  const envPaths = ["./.env", "/.env"];
  for (const envPath of envPaths) {
    try {
      const response = await fetch(envPath, { cache: "no-store" });
      if (!response.ok) continue;
      const envText = await response.text();
      const match = envText.match(/^\s*GEMINI_API_KEY\s*=\s*(.+)\s*$/m);
      if (!match) continue;
      const value = match[1].trim().replace(/^["']|["']$/g, "");
      if (value) return value;
    } catch (_error) {
      // Ignore fetch/parse errors and try the next path.
    }
  }
  return "";
}

const CHAT_LANG_SESSION_KEY = "fusashop_chat_lang_v1";
const CHAT_DECLARATION_SESSION_KEY = "fusashop_chat_declaration_v1";

const TRANSUMAN_DECLARATION = {
  es: {
    button: "Declaración Persona Transhumana",
    text: "Soy LIBRE, AUTÓNOMO Y RESPONSABLE a través del diálogo y la construcción, como ideal regulativo; me dirijo, controlo y dicto mis propias leyes."
  },
  en: {
    button: "Transhuman Person Declaration",
    text: "I am FREE, AUTONOMOUS AND RESPONSIBLE through dialogue and construction, as a regulatory ideal; I guide myself, control and dictate my own laws."
  }
};

function getChatLang() {
  const v = sessionStorage.getItem(CHAT_LANG_SESSION_KEY);
  return v === "en" || v === "es" ? v : null;
}

function setChatLang(lang) {
  sessionStorage.setItem(CHAT_LANG_SESSION_KEY, lang);
}

function hasAcceptedDeclaration() {
  return sessionStorage.getItem(CHAT_DECLARATION_SESSION_KEY) === "true";
}

function setDeclarationAccepted() {
  sessionStorage.setItem(CHAT_DECLARATION_SESSION_KEY, "true");
}

const CHAT_FAQS = {
  es: [
    { label: "Productos destacados", query: "¿Qué productos activos y destacados hay en FusaShop?" },
    { label: "Stock disponible", query: "¿Qué stock tienen los productos del catálogo?" },
    { label: "Medios de pago", query: "¿Qué medios de pago acepta FusaShop?" },
    { label: "Vender en FusaShop", query: "¿Cómo registro mi negocio MiPyme en FusaShop?" },
    { label: "Soporte y horarios", query: "¿Cuál es el horario de soporte de FusaShop?" }
  ],
  en: [
    { label: "Featured products", query: "What active or featured products does FusaShop offer?" },
    { label: "Available stock", query: "What stock availability do products have in the catalog?" },
    { label: "Payment methods", query: "What payment methods does FusaShop accept?" },
    { label: "Sell on FusaShop", query: "How do I register my MiPyme business on FusaShop?" },
    { label: "Support hours", query: "What are FusaShop support hours and channels?" }
  ]
};

async function setupChatbot() {
  const chatbot = document.getElementById("chatbot");
  const toggleBtn = document.getElementById("chatbotToggle");
  const closeBtn = document.getElementById("chatbotClose");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const messages = document.getElementById("chatMessages");
  const disclaimer = document.getElementById("chatbotDisclaimer");
  const langPicker = document.getElementById("chatLangPicker");
  const langEsBtn = document.getElementById("chatLangEs");
  const langEnBtn = document.getElementById("chatLangEn");
  const declarationPicker = document.getElementById("chatDeclarationPicker");
  const declarationBtn = document.getElementById("chatDeclarationBtn");
  const faqWrap = document.getElementById("chatFaqWrap");
  const faqTitle = document.getElementById("chatFaqTitle");
  const faqButtons = document.getElementById("chatFaqButtons");
  const submitBtn = form.querySelector("button[type='submit']");
  const CHATBOT_KEY_STORAGE = "fusashop_gemini_key_v1";

  let chatSending = false;

  function applyChatLangUI(lang) {
    if (lang === "en") {
      input.placeholder = "Ask a question about FusaShop...";
      if (disclaimer) {
        disclaimer.textContent =
          "I only answer about FusaShop: products, payments, sellers, orders, and support.";
      }
      if (declarationBtn) {
        declarationBtn.textContent = TRANSUMAN_DECLARATION.en.button;
        declarationBtn.setAttribute("aria-label", TRANSUMAN_DECLARATION.en.button);
        declarationBtn.setAttribute("title", TRANSUMAN_DECLARATION.en.button);
      }
    } else {
      input.placeholder = "Haz una pregunta sobre FusaShop...";
      if (disclaimer) {
        disclaimer.textContent =
          "Responde solo sobre FusaShop: productos, pagos, vendedores, pedidos y soporte.";
      }
      if (declarationBtn) {
        declarationBtn.textContent = TRANSUMAN_DECLARATION.es.button;
        declarationBtn.setAttribute("aria-label", TRANSUMAN_DECLARATION.es.button);
        declarationBtn.setAttribute("title", TRANSUMAN_DECLARATION.es.button);
      }
    }
  }

  function userLabel(lang) {
    return lang === "en" ? "You" : "Tú";
  }

  function assistantLabel(lang) {
    return lang === "en" ? "FusaBot" : "FusaBot";
  }

  function assistantWelcomeMessage(lang) {
    return lang === "en"
      ? "Hello! I'm FusaBot, FusaShop's assistant. Read the Transhuman Person Declaration to continue."
      : "¡Hola! Soy FusaBot, el asistente de FusaShop. Lee la Declaración Persona Transhumana para continuar.";
  }

  function pushMessage(author, text) {
    const bubble = document.createElement("p");
    bubble.textContent = `${author}: ${text}`;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  function setChatFormEnabled(enabled) {
    input.disabled = !enabled;
    if (submitBtn) submitBtn.disabled = !enabled;
    faqButtons?.querySelectorAll("button").forEach((btn) => {
      btn.disabled = !enabled;
    });
  }

  function renderChatFaqs(lang) {
    if (!faqWrap || !faqButtons) return;
    if (!lang) {
      faqWrap.hidden = true;
      faqButtons.innerHTML = "";
      return;
    }
    faqWrap.hidden = false;
    if (faqTitle) {
      faqTitle.textContent = lang === "en" ? "Frequently asked questions" : "Preguntas frecuentes";
    }
    faqButtons.innerHTML = "";
    const items = CHAT_FAQS[lang] || [];
    for (const item of items) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chat-faq-chip";
      btn.textContent = item.label;
      btn.addEventListener("click", () => {
        void sendChatMessage({ display: item.label, query: item.query });
      });
      faqButtons.appendChild(btn);
    }
  }

  function syncLanguageControls() {
    const lang = getChatLang();
    const declared = hasAcceptedDeclaration();
    if (!langPicker) return;
    if (!lang) {
      langPicker.hidden = false;
      if (declarationPicker) declarationPicker.hidden = true;
      setChatFormEnabled(false);
      renderChatFaqs(null);
      if (disclaimer) {
        disclaimer.textContent =
          "Productos, pagos, vendedores y soporte. / Products, payments, sellers, and support.";
      }
      return;
    }
    langPicker.hidden = true;
    applyChatLangUI(lang);
    if (declarationPicker) {
      declarationPicker.hidden = declared;
    }
    if (declared) {
      setChatFormEnabled(true);
      renderChatFaqs(lang);
    } else {
      setChatFormEnabled(false);
      renderChatFaqs(null);
    }
  }

  function showDeclaration() {
    const lang = getChatLang();
    if (!lang) return;
    const copy = TRANSUMAN_DECLARATION[lang];
    pushMessage(copy.button, copy.text);
    setDeclarationAccepted();
    if (declarationPicker) declarationPicker.hidden = true;
    setChatFormEnabled(true);
    renderChatFaqs(lang);
    pushMessage(
      assistantLabel(lang),
      lang === "en"
        ? "Thank you. How can I help you with FusaShop today?"
        : "Gracias. ¿En qué puedo ayudarte con FusaShop hoy?"
    );
    setTimeout(() => input.focus(), 50);
  }

  function buildChatContext(lang) {
    return lang === "en"
      ? `
Platform: FusaShop (Fusagasugá, Colombia)
Categories: ${getCategories().join(", ")}
Active products: ${getProducts().filter((item) => item.estado === "activo").length}
Payments: PayU, Nequi, Daviplata
Support: Monday to Friday, 8:00 a.m. to 6:00 p.m. (Colombia time)
      `.trim()
      : `
Plataforma: FusaShop (Fusagasugá, Colombia)
Categorías: ${getCategories().join(", ")}
Productos activos: ${getProducts().filter((item) => item.estado === "activo").length}
Pagos: PayU, Nequi, Daviplata
Soporte: Lunes a viernes, 8:00 am a 6:00 pm (hora Colombia)
      `.trim();
  }

  async function sendChatMessage({ display, query }) {
    const lang = getChatLang();
    const text = (display ?? query ?? "").trim();
    const question = (query ?? display ?? "").trim();
    if (!lang || !hasAcceptedDeclaration() || !text || !question || chatSending) return;

    chatSending = true;
    input.disabled = true;
    if (submitBtn) submitBtn.disabled = true;
    faqButtons?.querySelectorAll("button").forEach((b) => {
      b.disabled = true;
    });

    pushMessage(userLabel(lang), text);
    try {
      const reply = await askGemini({
        message: question,
        apiKey: storedKey || localStorage.getItem(CHATBOT_KEY_STORAGE) || "",
        context: buildChatContext(lang),
        products: getProducts(),
        lang
      });
      pushMessage(assistantLabel(lang), reply);
    } catch (error) {
      pushMessage(
        assistantLabel(lang),
        lang === "en" ? "Something went wrong while processing your request." : "Ocurrió un error al procesar tu solicitud."
      );
      console.error("Gemini request failed:", error?.message || "unknown error");
    } finally {
      chatSending = false;
      if (getChatLang() && hasAcceptedDeclaration()) {
        input.disabled = false;
        if (submitBtn) submitBtn.disabled = false;
        faqButtons?.querySelectorAll("button").forEach((b) => {
          b.disabled = false;
        });
      }
    }
  }

  function selectLang(choice) {
    setChatLang(choice);
    syncLanguageControls();
    pushMessage(assistantLabel(choice), assistantWelcomeMessage(choice));
    setTimeout(() => declarationBtn?.focus(), 50);
  }

  function openChatbot() {
    chatbot.classList.remove("chatbot-hidden");
    toggleBtn.classList.add("chatbot-toggle-hidden");
    chatbot.setAttribute("aria-hidden", "false");
    toggleBtn.setAttribute("aria-expanded", "true");
    syncLanguageControls();
    if (!getChatLang()) {
      setTimeout(() => langEsBtn?.focus(), 60);
    } else if (!hasAcceptedDeclaration()) {
      setTimeout(() => declarationBtn?.focus(), 60);
    } else {
      setTimeout(() => input.focus(), 60);
    }
  }

  function closeChatbot() {
    chatbot.classList.add("chatbot-hidden");
    toggleBtn.classList.remove("chatbot-toggle-hidden");
    chatbot.setAttribute("aria-hidden", "true");
    toggleBtn.setAttribute("aria-expanded", "false");
  }

  function resetChatAssistantForNextOpen() {
    sessionStorage.removeItem(CHAT_LANG_SESSION_KEY);
    sessionStorage.removeItem(CHAT_DECLARATION_SESSION_KEY);
    messages.innerHTML = "";
    input.value = "";
    syncLanguageControls();
  }

  toggleBtn.addEventListener("click", () => {
    const isHidden = chatbot.classList.contains("chatbot-hidden");
    if (isHidden) openChatbot();
    else closeChatbot();
  });
  closeBtn.addEventListener("click", () => {
    resetChatAssistantForNextOpen();
    closeChatbot();
  });

  const envKey = await loadGeminiKeyFromEnv();
  if (envKey) {
    localStorage.setItem(CHATBOT_KEY_STORAGE, envKey);
  }
  const storedKey = localStorage.getItem(CHATBOT_KEY_STORAGE) || "";

  langEsBtn?.addEventListener("click", () => selectLang("es"));
  langEnBtn?.addEventListener("click", () => selectLang("en"));
  declarationBtn?.addEventListener("click", showDeclaration);

  syncLanguageControls();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const lang = getChatLang();
    if (!lang || !hasAcceptedDeclaration()) return;
    const message = input.value.trim();
    if (!message) return;
    input.value = "";
    await sendChatMessage({ display: message, query: message });
  });
}

async function init() {
  await bootstrapProducts();
  renderCategories();
  renderProducts();
  setupProductDetails();
  setupContactForm();
  renderAuthorPublicProfile();
  await setupChatbot();
  categoryFilter.addEventListener("change", renderProducts);
  searchInput.addEventListener("input", renderProducts);
}

init();
