import { site } from '../data/site.js';
import { buildWhatsAppUrl } from '../utils/whatsapp.js';

export function renderContactForm() {
  return `
    <form class="contact-form" id="contact-form" novalidate>
      <div class="field">
        <label for="c-nome">Nome completo</label>
        <input id="c-nome" name="nome" type="text" autocomplete="name" required aria-describedby="e-nome" />
        <p class="field-error" id="e-nome" hidden>Informe seu nome.</p>
      </div>
      <div class="field">
        <label for="c-email">E-mail</label>
        <input id="c-email" name="email" type="email" autocomplete="email" required aria-describedby="e-email" />
        <p class="field-error" id="e-email" hidden>Informe um e-mail válido.</p>
      </div>
      <div class="field">
        <label for="c-telefone">Telefone / WhatsApp</label>
        <input id="c-telefone" name="telefone" type="tel" autocomplete="tel" required aria-describedby="e-telefone" />
        <p class="field-error" id="e-telefone" hidden>Informe um telefone válido.</p>
      </div>
      <div class="field">
        <label for="c-interesse">Interesse</label>
        <select id="c-interesse" name="interesse" required aria-describedby="e-interesse">
          <option value="">Selecione…</option>
          <option>Comprar imóvel</option>
          <option>Alugar imóvel</option>
          <option>Avaliação patrimonial</option>
          <option>Investimento imobiliário</option>
          <option>Outro assunto</option>
        </select>
        <p class="field-error" id="e-interesse" hidden>Selecione uma opção.</p>
      </div>
      <div class="field field--full">
        <label for="c-mensagem">Mensagem</label>
        <textarea id="c-mensagem" name="mensagem" rows="5" required aria-describedby="e-mensagem"></textarea>
        <p class="field-error" id="e-mensagem" hidden>Escreva sua mensagem.</p>
      </div>
      <label class="check field--full">
        <input id="c-lgpd" name="lgpd" type="checkbox" required aria-describedby="e-lgpd" />
        <span>Autorizo o contato da Invictus Mobi conforme a LGPD (Lei nº 13.709/2018). Meus dados serão usados apenas para esta solicitação.</span>
      </label>
      <p class="field-error" id="e-lgpd" hidden>É preciso aceitar o consentimento para continuar.</p>
      <p class="form-status" id="form-status" role="status" hidden></p>
      <button class="btn btn--gold" type="submit">Enviar solicitação</button>
    </form>`;
}

// Isolado para troca futura por uma API real (fetch para endpoint/CRM).
export function sendContactRequest(payload) {
  const message =
    `Olá! Sou ${payload.nome}.\nE-mail: ${payload.email}\nTelefone: ${payload.telefone}\n` +
    `Interesse: ${payload.interesse}\n\nMensagem:\n${payload.mensagem}`;
  // TODO: substituir abertura direta por chamada a API real.
  window.open(buildWhatsAppUrl(message), '_blank', 'noopener');
}

export function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const setError = (input, errorEl, show) => {
    errorEl.hidden = !show;
    input.setAttribute('aria-invalid', String(show));
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = form.nome;
    const email = form.email;
    const telefone = form.telefone;
    const interesse = form.interesse;
    const mensagem = form.mensagem;
    const lgpd = form.lgpd;
    let ok = true;

    const bad = (input, id, invalid) => {
      setError(input, document.getElementById(id), invalid);
      if (invalid && ok) { ok = false; input.focus(); }
    };

    bad(nome, 'e-nome', nome.value.trim().length < 2);
    bad(email, 'e-email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
    bad(telefone, 'e-telefone', telefone.value.replace(/\D/g, '').length < 8);
    bad(interesse, 'e-interesse', !interesse.value);
    bad(mensagem, 'e-mensagem', mensagem.value.trim().length < 5);
    setError(lgpd, document.getElementById('e-lgpd'), !lgpd.checked);
    if (!lgpd.checked && ok) { ok = false; lgpd.focus(); }

    if (!ok) return;
    sendContactRequest({
      nome: nome.value.trim(),
      email: email.value.trim(),
      telefone: telefone.value.trim(),
      interesse: interesse.value,
      mensagem: mensagem.value.trim(),
    });
    const status = document.getElementById('form-status');
    status.hidden = false;
    status.textContent = 'Mensagem preparada no WhatsApp. Obrigado pelo contato — retornaremos em breve.';
    form.reset();
  });
}
