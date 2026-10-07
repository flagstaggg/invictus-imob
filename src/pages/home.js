import { renderHero, initHero } from '../components/hero.js';
import { propertyCard } from '../components/propertyCard.js';
import { renderContactForm, initContactForm } from '../components/contactForm.js';
import { initCarousel } from '../components/carousel.js';
import { neighborhoods } from '../data/properties.js';
import { site } from '../data/site.js';
import { fetchProperties } from '../utils/api.js';

const SERVICOS = [
  { titulo: 'Venda de imóveis de alto padrão', texto: 'Intermediação completa, do anúncio ao registro, com sigilo e eficiência.' },
  { titulo: 'Locação premium', texto: 'Portfólio selecionado de imóveis para locação de alto padrão em Criciúma.' },
  { titulo: 'Avaliação e consultoria patrimonial', texto: 'Laudos e análises de mercado para decisões seguras de investimento.' },
  { titulo: 'Assessoria em investimentos imobiliários', texto: 'Mapeamento de oportunidades e acompanhamento do pós-aquisição.' },
  { titulo: 'Atendimento a clientes de outras cidades', texto: 'Sessões online, visitas agendadas e suporte na mudança para Criciúma.' },
];

// TODO: substituir por depoimentos reais de clientes.
const DEPOIMENTOS = [
  { texto: 'A curadoria da Invictus trouxe opções que nenhum outro banco de dados mostrava. Discrição total.', autor: 'Cliente — comprador de residência em Criciúma' },
  { texto: 'Equipe atenta, do primeiro contato até a entrega das chaves. Profissionalismo raro.', autor: 'Cliente — investidor imobiliário' },
  { texto: 'Compramos estando fora do estado e tudo foi conduzido com transparência e agilidade.', autor: 'Cliente — família em mudança para Santa Catarina' },
];

export async function render() {
  const properties = await fetchProperties();
  const destaques = properties.filter((p) => p.destaque);
  return `
    ${renderHero()}

    <section class="section" id="destaques">
      <div class="container section__head">
        <p class="eyebrow">Vitrine</p>
        <h2>Imóveis em destaque</h2>
        <a class="btn btn--outline" href="#/imoveis">Ver todos os imóveis</a>
      </div>
      <div class="container carousel" data-perview="3" data-label="Imóveis em destaque">
        <div class="carousel__viewport">
          <div class="carousel__track">
            ${destaques.map((p) => propertyCard(p)).join('')}
          </div>
        </div>
        <div class="carousel__controls">
          <button class="carousel__btn" data-carousel-prev aria-label="Anterior">‹</button>
          <div class="carousel__dots"></div>
          <button class="carousel__btn" data-carousel-next aria-label="Próximo">›</button>
        </div>
      </div>
    </section>

    <section class="section section--alt" id="sobre">
      <div class="container about__grid">
        <div class="reveal">
          <p class="eyebrow">A Invictus Mobi</p>
          <h2>Força, legado e conquista</h2>
          <p>A Invictus Mobi nasceu do propósito de elevar o padrão imobiliário de Criciúma. Atuamos com curadoria rigorosa: cada imóvel no nosso portfólio é escolhido por seu potencial único — arquitetura, localização e valor patrimonial.</p>
          <p>Nosso atendimento é personalizado e discreto, com conhecimento profundo do mercado de Criciúma e litoral próximo. Acompanhamos você da primeira busca até a assinatura, e além.</p>
          <div class="stats">
            <!-- TODO: substituir por números reais comprovados -->
            <div class="stat"><span class="stat__number" data-counter="120" data-suffix="+">0</span><p>imóveis intermediados</p></div>
            <div class="stat"><span class="stat__number" data-counter="35" data-suffix="+">0</span><p>bairros atendidos</p></div>
            <div class="stat"><span class="stat__number" data-counter="8" data-suffix=" anos">0</span><p>de mercado</p></div>
          </div>
        </div>
        <figure class="about__media reveal">
          <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80" alt="Interior de imóvel de alto padrão apresentado pela Invictus Mobi" width="1400" height="1050" loading="lazy" />
        </figure>
      </div>
    </section>

    <section class="section" id="servicos">
      <div class="container section__head">
        <p class="eyebrow">O que fazemos</p>
        <h2>Serviços</h2>
      </div>
      <div class="container services__grid">
        ${SERVICOS.map((s) => `<div class="service reveal"><h3>${s.titulo}</h3><p>${s.texto}</p></div>`).join('')}
      </div>
    </section>

    <section class="section section--alt" id="bairros">
      <div class="container section__head">
        <p class="eyebrow">Onde atuamos</p>
        <h2>Bairros e regiões</h2>
      </div>
      <div class="container districts__grid">
        ${neighborhoods.map((n) => `
          <a class="district reveal" href="#/imoveis?bairro=${encodeURIComponent(n.nome)}">
            <img src="${n.imagem}" alt="${n.nome}, Criciúma" width="1200" height="900" loading="lazy" />
            <span class="district__body"><h3>${n.nome}</h3><p>${n.descricao}</p></span>
          </a>`).join('')}
      </div>
    </section>

    <section class="section" id="depoimentos">
      <div class="container section__head">
        <p class="eyebrow">Relatos</p>
        <h2>Depoimentos</h2>
      </div>
      <div class="container carousel carousel--quotes" data-perview="1" data-label="Depoimentos de clientes">
        <div class="carousel__viewport">
          <div class="carousel__track">
            ${DEPOIMENTOS.map((d) => `
              <blockquote class="testimonial">
                <p>“${d.texto}”</p>
                <cite>— ${d.autor}</cite>
              </blockquote>`).join('')}
          </div>
        </div>
        <div class="carousel__controls">
          <button class="carousel__btn" data-carousel-prev aria-label="Anterior">‹</button>
          <div class="carousel__dots"></div>
          <button class="carousel__btn" data-carousel-next aria-label="Próximo">›</button>
        </div>
      </div>
    </section>

    <section class="cta-final">
      <div class="container">
        <h2>Agende uma visita privativa</h2>
        <p>Apresentamos pessoalmente os melhores endereços de Criciúma, no horário que fizer sentido para você.</p>
        <a class="btn btn--gold" href="https://wa.me/${site.whatsappNumber}" target="_blank" rel="noopener">Falar com um consultor</a>
      </div>
    </section>

    <section class="section" id="contato">
      <div class="container contact__grid">
        <div>
          <p class="eyebrow">Contato</p>
          <h2>Conte com a nossa equipe</h2>
          <p>Preencha o formulário e seguiremos o atendimento pelo WhatsApp. Também atendemos pelo telefone e e-mail.</p>
          <ul class="contact__info">
            <li>${site.phoneDisplay}</li>
            <li>${site.email}</li>
            <li>${site.address}</li>
            <li>${site.hours}</li>
          </ul>
        </div>
        ${renderContactForm()}
      </div>
    </section>`;
}

export function init() {
  initHero();
  initContactForm();
  document.querySelectorAll('.carousel').forEach(initCarousel);
}
