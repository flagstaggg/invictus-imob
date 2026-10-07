import { site } from '../data/site.js';

export function buildWhatsAppUrl(message) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${site.whatsappNumber}?text=${text}`;
}

export function propertyMessage(p) {
  return `Olá! Tenho interesse no imóvel ${p.titulo} (código ${p.codigo}). Poderia me passar mais informações?`;
}

export function favoritesMessage(list) {
  const lines = list.map((p) => `• ${p.codigo} — ${p.titulo} (${p.bairro})`).join('\n');
  return `Olá! Salvei estes imóveis e gostaria de conversar com um consultor:\n\n${lines}`;
}
