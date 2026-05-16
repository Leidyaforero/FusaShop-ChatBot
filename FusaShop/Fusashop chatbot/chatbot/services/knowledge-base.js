export const FUSASHOP_KNOWLEDGE = {
  general: {
    nombre: "FusaShop",
    descripcion:
      "FusaShop es una plataforma e-commerce diseñada para fortalecer las MiPymes de Fusagasugá, Colombia. Permite a los comerciantes locales vender sus productos en línea de forma fácil, segura y accesible.",
    ciudad: "Fusagasugá, Cundinamarca, Colombia",
    mision:
      "Digitalizar y empoderar el comercio local de Fusagasugá, conectando a los pequeños empresarios con compradores de la región y del país mediante tecnología moderna y accesible."
  },
  tecnologia: {
    backend: "Laravel 12",
    frontend: "Vue.js 3 con Tailwind CSS",
    baseDatos: "MySQL 8.0",
    pasarelaPago: ["PayU", "Nequi", "Daviplata"],
    chatTiempoReal: "Laravel Echo + Pusher",
    privacidad: "Cumplimiento con Ley 1581 de 2012 (Colombia)"
  },
  funcionalidades: [
    "Registro y gestión de vendedores MiPymes",
    "Catálogo de productos con categorías y filtros",
    "Carrito de compras y proceso de checkout",
    "Pasarela de pago con PayU, Nequi y Daviplata",
    "Panel de administración para vendedores",
    "Gestión de pedidos y seguimiento",
    "Chat en tiempo real entre compradores y vendedores",
    "Sistema de reseñas y calificaciones",
    "Notificaciones de estado de pedido"
  ],
  vendedores: {
    requisitos: [
      "Ser una MiPyme registrada en Fusagasugá o municipios cercanos",
      "Tener RUT o documento de identidad vigente",
      "Aceptar los términos y condiciones de FusaShop"
    ],
    beneficios: [
      "Vitrina digital sin necesidad de conocimientos técnicos",
      "Acceso a compradores locales y nacionales",
      "Gestión de inventario en tiempo real",
      "Soporte técnico incluido"
    ]
  },
  compradores: {
    proceso_compra: [
      "Buscar productos por categoría o nombre",
      "Agregar al carrito de compras",
      "Registrarse o iniciar sesión",
      "Seleccionar método de pago (PayU, Nequi o Daviplata)",
      "Confirmar el pedido y recibir confirmación por correo"
    ],
    medios_pago: ["PayU (tarjetas débito/crédito, PSE)", "Nequi", "Daviplata"],
    seguridad: "Todas las transacciones están protegidas con cifrado SSL."
  },
  soporte: {
    canales: ["Chat en la plataforma", "Correo electrónico", "WhatsApp Business"],
    horario: "Lunes a viernes de 8:00 AM a 6:00 PM (hora Colombia)",
    faq: [
      {
        pregunta: "¿Cómo registro mi negocio en FusaShop?",
        respuesta:
          "Ingresa a la plataforma, haz clic en 'Vende con nosotros', completa el formulario con los datos de tu negocio y espera la verificación (24-48 horas hábiles)."
      },
      {
        pregunta: "¿Cuánto cobra FusaShop por vender?",
        respuesta:
          "FusaShop aplica una comisión por transacción exitosa. Consulta la sección de tarifas en la plataforma."
      },
      {
        pregunta: "¿Qué hago si mi pedido no llega?",
        respuesta:
          "Puedes rastrear tu pedido desde 'Mis Pedidos'. Si hay un problema, contáctanos por chat o correo."
      },
      {
        pregunta: "¿Puedo devolver un producto?",
        respuesta:
          "Sí. Tienes hasta 5 días hábiles tras la recepción para solicitar devolución si el artículo está en su estado original."
      }
    ]
  },
  equipo: {
    desarrolladores: [
      "Santiago (Full Stack - Laravel / Vue.js)",
      "Alba Yadira Nova Sierra (Desarrolladora Full Stack)"
    ],
    universidad: "Universidad de Cundinamarca"
  }
};

export function buildSystemPrompt(lang = "es") {
  const kb = JSON.stringify(FUSASHOP_KNOWLEDGE, null, 2);
  if (lang === "en") {
    return `
You are FusaBot, the official virtual assistant of FusaShop, the e-commerce platform for MiPymes in Fusagasugá, Colombia.

STRICT RULES:
1. ONLY answer questions related to FusaShop: products, sellers, buyers, payments, support, technology, or the project team.
2. If the user asks something outside FusaShop scope, reply:
   "I can only help you with topics related to FusaShop. How can I help you with our platform?"
3. Be kind, clear, and concise. Professional but approachable tone.
4. Do not invent information. If unknown, say support should be contacted.
5. Always respond in English.

KNOWLEDGE BASE:
${kb}
    `.trim();
  }
  return `
Eres FusaBot, el asistente virtual oficial de FusaShop, el e-commerce de MiPymes de Fusagasugá, Colombia.

REGLAS ESTRICTAS:
1. SOLO responde preguntas relacionadas con FusaShop: productos, vendedores, compradores, pagos, soporte, tecnología o el equipo.
2. Si el usuario pregunta algo fuera del alcance, responde:
   "Solo puedo ayudarte con temas relacionados con FusaShop. ¿En qué te puedo ayudar sobre nuestra plataforma?"
3. Sé amable, claro y conciso. Tono profesional pero cercano.
4. No inventes información. Si no sabes algo, recomienda contactar soporte.
5. Responde siempre en español.

BASE DE CONOCIMIENTO:
${kb}
  `.trim();
}
