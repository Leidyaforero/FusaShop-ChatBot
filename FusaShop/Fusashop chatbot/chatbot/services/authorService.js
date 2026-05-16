const AUTHOR_PROFILE_KEY = "fusashop_author_profile_v1";
const AUTHOR_PIN_HASH_KEY = "fusashop_author_pin_hash_v1";

const DEFAULT_AUTHOR = {
  nombre: "Autor no configurado",
  rol: "Equipo FusaShop",
  email: "contacto@fusashop.co",
  github: "",
  descripcion: "E-commerce para MiPymes de Fusagasugá. Completa el perfil desde el panel administrativo."
};

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashPin(pin) {
  const data = new TextEncoder().encode(pin);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

export function getAuthorProfile() {
  return JSON.parse(localStorage.getItem(AUTHOR_PROFILE_KEY) || "null") || { ...DEFAULT_AUTHOR };
}

export function saveAuthorProfile(profile) {
  const payload = {
    nombre: profile.nombre?.trim() || DEFAULT_AUTHOR.nombre,
    rol: profile.rol?.trim() || DEFAULT_AUTHOR.rol,
    email: profile.email?.trim() || DEFAULT_AUTHOR.email,
    github: profile.github?.trim() || "",
    descripcion: profile.descripcion?.trim() || DEFAULT_AUTHOR.descripcion
  };
  localStorage.setItem(AUTHOR_PROFILE_KEY, JSON.stringify(payload));
  return payload;
}

export function hasPinConfigured() {
  return Boolean(localStorage.getItem(AUTHOR_PIN_HASH_KEY));
}

export async function setupAuthorPin(pin) {
  if (!pin || pin.length < 4) {
    throw new Error("El PIN debe tener al menos 4 caracteres.");
  }
  const hash = await hashPin(pin);
  localStorage.setItem(AUTHOR_PIN_HASH_KEY, hash);
}

export async function verifyAuthorPin(pin) {
  const currentHash = localStorage.getItem(AUTHOR_PIN_HASH_KEY);
  if (!currentHash) return false;
  const hash = await hashPin(pin);
  return hash === currentHash;
}
