export interface GuiaApoyo {
  id: string;
  titulo: string;
  descripcion: string;
  pasos: string[];
  urlOficial?: string;
  urgencia: "alta" | "media" | "baja";
  etiquetas: string[];
}

export const guiasApoyo: GuiaApoyo[] = [
  {
    id: "stopncii",
    titulo: "StopNCII.org — Retiro de imágenes íntimas (+18)",
    descripcion: "StopNCII.org genera una \"huella digital cifrada\" (hash) en tu propio teléfono. Tus fotos NUNCA salen de tu dispositivo.",
    pasos: [
      "Entra a StopNCII.org desde tu navegador (encuentras el enlace en la landing del MIMP).",
      "Selecciona los archivos o fotos afectadas en tu dispositivo.",
      "El sistema creará un código único (hash) de la imagen sin subir la foto original.",
      "Este hash se comparte con Meta (Instagram/Facebook), TikTok, Bumble, OnlyFans y otras plataformas para bloquear y eliminar duplicados.",
      "Anota tu número de caso y PIN de 9 dígitos para hacer seguimiento.",
    ],
    urlOficial: "https://stopncii.org",
    urgencia: "alta",
    etiquetas: ["imágenes íntimas", "difusión", "stopncii", "hash", "mayoría de edad"],
  },
  {
    id: "takeitdown",
    titulo: "Take It Down (NCMEC) — Protección para menores de 18 años",
    descripcion: "Servicio gratuito administrado por el Centro Nacional para Niños Desaparecidos y Explotados (NCMEC).",
    pasos: [
      "Diseñado si tenías menos de 18 años cuando se tomó la foto o video.",
      "Genera una huella digital numérica directamente desde tu navegador.",
      "Las plataformas digitales asociadas escanean sus servidores y eliminan el contenido.",
      "Mantiene el anonimato total de la persona afectada.",
    ],
    urlOficial: "https://takeitdown.ncmec.org",
    urgencia: "alta",
    etiquetas: ["menores", "ncmec", "takeitdown", "menor de edad", "adolescente"],
  },
  {
    id: "meta",
    titulo: "Meta (Instagram / Facebook / Threads) — Reporte directo",
    descripcion: "Procedimiento rápido para denunciar publicaciones, mensajes directos o perfiles en las plataformas de Meta.",
    pasos: [
      "Toma capturas de pantalla de la publicación o chat (conserva la fecha, hora y enlace URL).",
      "Presiona los tres puntos (…) en la publicación o perfil del agresor.",
      "Selecciona \"Reportar\" > \"Contenido íntimo no consentido\" o \"Acoso\".",
      "Si recibiste amenazas por mensaje directo, usa también la herramienta StopNCII.",
    ],
    urgencia: "media",
    etiquetas: ["instagram", "facebook", "threads", "meta", "red social"],
  },
  {
    id: "tiktok_x",
    titulo: "TikTok / X (Twitter) / Google — Eliminación en redes y buscadores",
    descripcion: "Protocolos de retiro directo por infracción de privacidad y violencia digital.",
    pasos: [
      "Google: Solicita la eliminación de resultados de búsqueda con contenido explícito no consentido mediante el formulario de privacidad de Google.",
      "TikTok: Usa el botón \"Reportar\" > \"Violación de privacidad / Nudidad\".",
      "X (Twitter): Reporta el tuit especificando \"Publicación de fotos/videos íntimos sin permiso\".",
    ],
    urgencia: "media",
    etiquetas: ["tiktok", "twitter", "x", "google", "buscador", "red social"],
  },
  {
    id: "marco_legal",
    titulo: "Marco Legal Peruano — Tus derechos",
    descripcion: "Conoce las leyes que protegen a las víctimas de violencia digital en el Perú.",
    pasos: [
      "Decreto Legislativo N.° 1410 (Art. 154-B Código Penal): Sanciona con hasta 6 años de cárcel a quien difunde, revela, comercializa o cede imágenes o audios de contenido sexual sin consentimiento.",
      "Ley N.° 30364: Garantiza una vida libre de violencia y el otorgamiento de medidas de protección inmediatas.",
      "Principio de No Revictimización: Tienes derecho a ser atendida con empatía, reserva absoluta de tu identidad y sin ser juzgada.",
      "Servicios Gratuitos del MIMP: Centros de Emergencia Mujer (CEM), Chat 100 y Línea 100.",
    ],
    urgencia: "media",
    etiquetas: ["derechos", "legal", "ley", "código penal", "30364", "1410", "marco legal"],
  },
  {
    id: "canales_emergencia",
    titulo: "Canales de Emergencia — Atención 24/7",
    descripcion: "Líneas gratuitas y confidenciales disponibles todo el año.",
    pasos: [
      "Línea 100 (MIMP): Marca gratis al 100 desde cualquier celular o teléfono fijo. Atención psicológica y legal 24 horas.",
      "Chat 100 (MIMP): Chat en vivo para orientación personalizada en situaciones de riesgo.",
      "Policía Nacional del Perú (PNP): Marca 105 si estás en peligro físico o riesgo inminente.",
      "DIVINDAT PNP (Delitos Informáticos): Central (01) 431-8898 para denuncias técnicas de ciberdelitos.",
      "Centro de Emergencia Mujer (CEM): Acude al CEM más cercano para asesoría legal y contención psicosocial.",
    ],
    urgencia: "alta",
    etiquetas: ["emergencia", "línea 100", "chat 100", "105", "pnp", "divindat", "cem", "teléfono"],
  },
  {
    id: "sextorsion",
    titulo: "Sextorsión — Qué hacer si te están chantajeando",
    descripcion: "La sextorsión ocurre cuando alguien te amenaza con publicar imágenes o información personal a cambio de dinero, favores u otro contenido.",
    pasos: [
      "No cedas a los chantajes: Ceder casi nunca detiene al extorsionador.",
      "No borres las conversaciones: Guarda capturas de pantalla con número, fecha, hora y usuario.",
      "Bloquea y protege: Ajusta la privacidad de tus redes sociales a \"Privado\".",
      "Genera la huella cifrada: Usa StopNCII o Take It Down para evitar que el material sea publicado.",
      "Denuncia: Acude al CEM, Línea 100 o DIVINDAT PNP.",
    ],
    urgencia: "alta",
    etiquetas: ["sextorsión", "chantaje", "extorsión", "amenaza"],
  },
  {
    id: "acoso_digital",
    titulo: "Acoso Digital — Pasos para protegerte",
    descripcion: "El acoso digital abarca mensajes persistentes no deseados, suplantación de identidad y comentarios agresivos reiterados.",
    pasos: [
      "Documenta el acoso: Guarda capturas de pantalla con URLs de perfiles y fechas.",
      "Configura filtros de privacidad y bloquea cuentas secundarias.",
      "Si el agresor es una expareja o familiar, la Ley 30364 otorga Medidas de Protección Urgentes a través del CEM.",
      "Reporta el perfil en la plataforma donde ocurre el acoso.",
      "Acude al CEM o llama a la Línea 100 para asesoría legal y contención.",
    ],
    urgencia: "media",
    etiquetas: ["acoso", "hostigamiento", "ciberacoso", "suplantación"],
  },
];

export function buscarGuias(consulta: string): GuiaApoyo[] {
  const terminos = consulta.toLowerCase().split(/\s+/);
  return guiasApoyo.filter(g =>
    g.etiquetas.some(et => terminos.some(t => et.includes(t) || t.includes(et)))
  );
}

export function guiaPorId(id: string): GuiaApoyo | undefined {
  return guiasApoyo.find(g => g.id === id);
}
