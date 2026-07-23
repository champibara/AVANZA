export interface PlatformGuide {
  platformName: string;
  title: string;
  description: string;
  steps: string[];
  officialUrl?: string;
  urgencyLevel: "alta" | "media" | "baja";
}

export interface ButtonDef {
  id: string;
  label: string;
  nextNodeId?: string;
  actionType?: "landing" | "platform_guide";
  isPrimary?: boolean;
  platformGuideKey?: string;
}

export interface FlowNode {
  id: string;
  botMessage: string;
  buttons: ButtonDef[];
  isLandingReferral?: boolean;
  platformGuideKey?: string;
}

export const platformGuides: Record<string, PlatformGuide> = {
  stopncii: {
    platformName: "StopNCII.org (Plataforma Internacional)",
    title: "Retiro de imágenes íntimas — mayores de 18 años",
    description: "StopNCII.org genera una \"huella digital cifrada\" (hash) en tu propio teléfono. Tus fotos NUNCA salen de tu dispositivo.",
    steps: [
      "Entra a StopNCII.org desde tu navegador.",
      "Selecciona los archivos o fotos afectadas en tu dispositivo.",
      "El sistema creará un código único (hash) de la imagen sin subir la foto original.",
      "Este hash se comparte con Meta (Instagram/Facebook), TikTok, Bumble, OnlyFans y otras plataformas para bloquear y eliminar duplicados.",
      "Anota tu número de caso y PIN de 9 dígitos para hacer seguimiento.",
    ],
    officialUrl: "https://stopncii.org",
    urgencyLevel: "alta",
  },
  takeitdown: {
    platformName: "Take It Down (NCMEC — Menores de 18 años)",
    title: "Protección para menores de edad frente a contenido íntimo",
    description: "Servicio gratuito administrado por el Centro Nacional para Niños Desaparecidos y Explotados (NCMEC).",
    steps: [
      "Diseñado si tenías menos de 18 años cuando se tomó la foto o video.",
      "Genera una huella digital numérica directamente desde tu navegador.",
      "Las plataformas digitales asociadas escanean sus servidores y eliminan el contenido.",
      "Mantiene el anonimato total de la persona afectada.",
    ],
    officialUrl: "https://takeitdown.ncmec.org",
    urgencyLevel: "alta",
  },
  meta: {
    platformName: "Meta (Instagram / Facebook / Threads)",
    title: "Reporte directo en plataformas de Meta",
    description: "Procedimiento rápido para denunciar publicaciones, mensajes directos o perfiles.",
    steps: [
      "Toma capturas de pantalla de la publicación o chat (conserva la fecha, hora y enlace URL).",
      "Presiona los tres puntos (…) en la publicación o perfil agresor.",
      "Selecciona \"Reportar\" > \"Contenido íntimo no consentido\" o \"Acoso\".",
      "Si recibiste amenazas por mensaje directo, usa también la herramienta StopNCII.",
    ],
    urgencyLevel: "media",
  },
  tiktok_x: {
    platformName: "TikTok / X (Twitter) / Google",
    title: "Eliminación en redes de alto alcance y buscadores",
    description: "Protocolos de retiro directo por infracción de privacidad y violencia digital.",
    steps: [
      "Google: Solicita la eliminación de resultados de búsqueda con contenido explícito no consentido mediante el formulario de privacidad.",
      "TikTok: Usa el botón \"Reportar\" > \"Violación de privacidad / Nudidad\".",
      "X (Twitter): Reporta el tuit especificando \"Publicación de fotos/videos íntimos sin permiso\".",
    ],
    urgencyLevel: "media",
  },
};

export const conversationalTree: Record<string, FlowNode> = {
  welcome: {
    id: "welcome",
    botMessage: "👋 Hola. Soy **AVANZA**, el asistente institucional de orientación del **Ministerio de la Mujer y Poblaciones Vulnerables (MIMP)** del Perú.\n\n🔒 **Importante y Confidencial:**\n• Esta conversación es completamente segura y privada.\n• Te brindo orientación inicial sobre violencia digital de género.\n• No reemplaza una denuncia formal ni una urgencia médica/policial.\n• Si te encuentras en peligro inmediato, llama a la **Línea 100** o al **105 (PNP)**.\n\n¿En qué puedo ayudarte hoy?",
    buttons: [
      { id: "b1", label: "📸 Difundieron mis imágenes íntimas", nextNodeId: "difusion_intima", isPrimary: true },
      { id: "b2", label: "⚠️ Me están extorsionando (Sextorsión)", nextNodeId: "sextorsion" },
      { id: "b3", label: "💬 Sufro acoso / hostigamiento digital", nextNodeId: "acoso_digital" },
      { id: "b4", label: "ℹ️ Información sobre violencia digital", nextNodeId: "info_derechos" },
      { id: "b5", label: "🆘 Teléfonos de emergencia", nextNodeId: "emergencia" },
    ],
  },

  difusion_intima: {
    id: "difusion_intima",
    botMessage: "Lamento mucho que estés pasando por esto. **No es tu culpa** y tienes derecho a ser protegida y apoyada.\n\nLa difusión no consentida de imágenes o videos íntimos es un delito tipificado en el Código Penal del Perú (Art. 154-B).\n\n**Acción recomendada inmediata:**\nPodemos ayudarte a frenar la difusión en internet mediante herramientas de retiro automático. ¿Dónde o qué edad aplica?",
    buttons: [
      { id: "d1", label: "🔒 Para mayores de 18 años (StopNCII)", nextNodeId: "node_stopncii" },
      { id: "d2", label: "🛡️ Para menores de 18 años (Take It Down)", nextNodeId: "node_takeitdown" },
      { id: "d3", label: "📲 Redes específicas (Instagram, TikTok, X)", nextNodeId: "node_redes" },
      { id: "d4", label: "🏛️ Iniciar registro con el MIMP", nextNodeId: "derivacion_landing", isPrimary: true },
      { id: "d5", label: "⬅️ Volver al menú principal", nextNodeId: "welcome" },
    ],
  },

  sextorsion: {
    id: "sextorsion",
    botMessage: "La **sextorsión** ocurre cuando alguien te amenaza o chantajea con publicar imágenes o información personal a cambio de dinero, favores u otro contenido.\n\n⚠️ **Recomendaciones de seguridad prioritarias:**\n1. **No cedas a los chantajes:** Ceder casi nunca detiene al extorsionador.\n2. **No borres las conversaciones:** Guarda capturas de pantalla donde se vea el número, fecha, hora y usuario del extorsionador.\n3. **Bloquea y protege:** Ajusta la privacidad de tus redes sociales a \"Privado\".\n4. **Genera la huella cifrada:** Evita que el material sea publicado activando la protección preventiva.\n\n¿Qué te gustaría hacer a continuación?",
    buttons: [
      { id: "s1", label: "🔒 Proteger contenido con StopNCII", nextNodeId: "node_stopncii" },
      { id: "s2", label: "🏛️ Derivar caso a la Plataforma MIMP", nextNodeId: "derivacion_landing", isPrimary: true },
      { id: "s3", label: "📞 Hablar con especialista de Línea 100", nextNodeId: "emergencia" },
      { id: "s4", label: "⬅️ Volver al menú", nextNodeId: "welcome" },
    ],
  },

  acoso_digital: {
    id: "acoso_digital",
    botMessage: "El **acoso o hostigamiento digital** abarca mensajes persistentes no deseados, seguimiento masivo, suplantación de identidad o comentarios agresivos reiterados.\n\n**¿Cómo responder ante el acoso digital?**\n• Documenta el acoso: Guarda evidencia (capturas de pantalla, URLs de perfiles).\n• Configura filtros de privacidad y bloquea cuentas secundarias.\n• Si el agresor es una expareja o familiar, la Ley N.° 30364 otorga **Medidas de Protección Urgentes** a través del Centro de Emergencia Mujer (CEM).\n\n¿Deseas conocer más o derivar tu caso para asesoría psicosocial y legal del MIMP?",
    buttons: [
      { id: "a1", label: "🏛️ Ir a la Plataforma del MIMP", nextNodeId: "derivacion_landing", isPrimary: true },
      { id: "a2", label: "ℹ️ Conocer mis derechos legales", nextNodeId: "info_derechos" },
      { id: "a3", label: "⬅️ Volver al menú", nextNodeId: "welcome" },
    ],
  },

  info_derechos: {
    id: "info_derechos",
    botMessage: "📖 **Marco Legal y Tus Derechos en el Perú:**\n\n• **Decreto Legislativo N.° 1410 (Art. 154-B Código Penal):** Sanciona con hasta 6 años de cárcel a quien difunde, revela, comercializa o cede imágenes o audios de contenido sexual sin consentimiento.\n• **Ley N.° 30364:** Garantiza una vida libre de violencia y el otorgamiento de medidas de protección inmediatas.\n• **Principio de No Revictimización:** Tienes derecho a ser atendida con empatía, reserva absoluta de tu identidad y sin ser juzgada.\n• **Servicios Gratuitos del MIMP:** Centros de Emergencia Mujer (CEM), Chat 100 y Línea 100.",
    buttons: [
      { id: "i1", label: "📸 Tengo un caso de imágenes íntimas", nextNodeId: "difusion_intima" },
      { id: "i2", label: "🏛️ Registrar mi caso en MIMP AVANZA", nextNodeId: "derivacion_landing", isPrimary: true },
      { id: "i3", label: "⬅️ Menú Principal", nextNodeId: "welcome" },
    ],
  },

  emergencia: {
    id: "emergencia",
    botMessage: "🆘 **Canales Gratuitos de Atención 24/7 en el Perú:**\n\n• **Línea 100 (MIMP):** Marcar gratis al **100** desde cualquier celular o teléfono fijo. Atención telefónica confidencial, psicológica y legal 24 horas.\n• **Chat 100 (MIMP):** Módulo de chat en vivo para orientación personalizada en situaciones de riesgo.\n• **Policía Nacional del Perú (PNP):** Marcar **105** si estás en peligro físico o riesgo inminente.\n• **DIVINDAT PNP (Delitos Informáticos):** Central telefónica (01) 431-8898 para denuncias técnicas de ciberdelitos.\n\n¿Deseas continuar hacia el registro reservado en el portal MIMP?",
    buttons: [
      { id: "e1", label: "🌐 Continuar en Plataforma MIMP", nextNodeId: "derivacion_landing", isPrimary: true },
      { id: "e2", label: "⬅️ Volver al menú", nextNodeId: "welcome" },
    ],
  },

  node_stopncii: {
    id: "node_stopncii",
    botMessage: "ℹ️ **Guía StopNCII.org (Mayores de 18 años):**\n\n1. Ingresas a **StopNCII.org** desde tu navegador.\n2. La herramienta escanea tu foto o video **en tu propia pantalla** y extrae una huella digital matemática (Hash).\n3. Tu foto NUNCA se sube a internet.\n4. Las redes sociales aliadas usan la huella para bloquear la imagen antes o después de que se publique.\n\n¿Deseas además registrar la alerta en el portal del MIMP para asesoría legal?",
    platformGuideKey: "stopncii",
    buttons: [
      { id: "st1", label: "🌐 Ir a la Plataforma MIMP", nextNodeId: "derivacion_landing", isPrimary: true },
      { id: "st2", label: "⬅️ Menú anterior", nextNodeId: "difusion_intima" },
    ],
  },

  node_takeitdown: {
    id: "node_takeitdown",
    botMessage: "🛡️ **Guía Take It Down (NCMEC — Menores de 18 años):**\n\n1. Es un mecanismo internacional especializado para proteger a niños, niñas y adolescentes.\n2. Si tenías menos de 18 años al momento del hecho, genera un hash anonimizado directamente.\n3. Bloquea la circulación del material en las principales plataformas mundiales.\n\n¿Deseas conectar este hecho con la orientación del MIMP?",
    platformGuideKey: "takeitdown",
    buttons: [
      { id: "tk1", label: "🌐 Ir a la Plataforma MIMP", nextNodeId: "derivacion_landing", isPrimary: true },
      { id: "tk2", label: "⬅️ Menú anterior", nextNodeId: "difusion_intima" },
    ],
  },

  node_redes: {
    id: "node_redes",
    botMessage: "📲 **Instrucciones para Redes Sociales y Motores de Búsqueda:**\n\n• **Instagram / Facebook:** Usa la opción de reportar > \"Nudidad / Contenido sexual no consentido\".\n• **Google:** Completa el formulario oficial de Google para remover imágenes personales explícitas no consentidas de los resultados de búsqueda.\n• **TikTok y X:** Selecciona \"Violación de privacidad / Acoso\".",
    platformGuideKey: "meta",
    buttons: [
      { id: "r1", label: "🏛️ Ir a la Plataforma del MIMP", nextNodeId: "derivacion_landing", isPrimary: true },
      { id: "r2", label: "⬅️ Volver", nextNodeId: "difusion_intima" },
    ],
  },

  derivacion_landing: {
    id: "derivacion_landing",
    botMessage: "🏛️ **Derivación a la Plataforma Institucional MIMP — AVANZA**\n\nHas completado la orientación inicial. Para continuar con el proceso y acceder a la plataforma web oficial del Ministerio de la Mujer y Poblaciones Vulnerables, haz clic en el botón de abajo.\n\n*Nota: La plataforma te permitirá conocer el mapa de atención, verificar garantías de privacidad y preparar tu caso sin compromiso.*",
    isLandingReferral: true,
    buttons: [
      { id: "go_landing", label: "🌐 Continuar con el registro del caso en MIMP", actionType: "landing", isPrimary: true },
      { id: "back_main", label: "🔄 Reiniciar orientación", nextNodeId: "welcome" },
    ],
  },
};
