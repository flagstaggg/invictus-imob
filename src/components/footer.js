import { brandMark } from './brand.js';
import { site } from '../data/site.js';

export function renderFooter() {
  const footer = document.getElementById('site-footer');
  footer.innerHTML = `
    <div class="container footer__grid">
      <div class="footer__brand">
        <a href="#/" aria-label="Invictus Mobi — Início">${brandMark()}</a>
        <p>${site.tagline}</p>
        <p class="footer__creci">${site.creci} · ${site.cnpj}</p><!-- TODO: dados reais -->
      </div>
      <nav aria-label="Navegação do rodapé">
        <h2>Navegação</h2>
        <ul>
          <li><a href="#/">Início</a></li>
          <li><a href="#/imoveis">Imóveis</a></li>
          <li><a href="#/contato">Contato</a></li>
        </ul>
      </nav>
      <div>
        <h2>Contato</h2>
        <ul>
          <li><a href="tel:${site.phoneDisplay}">${site.phoneDisplay}</a></li>
          <li><a href="mailto:${site.email}">${site.email}</a></li>
          <li><a href="https://wa.me/${site.whatsappNumber}" target="_blank" rel="noopener">WhatsApp</a></li>
        </ul>
        <p>${site.hours}</p>
      </div>
      <div>
        <h2>Escritório</h2>
        <p>${site.address}</p>
        <ul class="footer__social">
          <li><a href="${site.social.instagram}" target="_blank" rel="noopener">Instagram</a></li>
          <li><a href="${site.social.linkedin}" target="_blank" rel="noopener">LinkedIn</a></li>
          <li><a href="${site.social.youtube}" target="_blank" rel="noopener">YouTube</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__bottom container">
      <p>© ${new Date().getFullYear()} Invictus Mobi. Todos os direitos reservados.</p>
      <p>Privacidade: tratamos seus dados conforme a LGPD e não compartilhamos informações sem consentimento. Os favoritos são guardados apenas no armazenamento local deste navegador — nunca em nossos servidores.</p>
    </div>`;
}
