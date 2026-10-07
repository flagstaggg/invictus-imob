import { renderContactForm, initContactForm } from '../components/contactForm.js';
import { site } from '../data/site.js';

export function render() {
  return `
    <section class="section page-head">
      <div class="container">
        <p class="eyebrow">Atendimento</p>
        <h1>Fale com a Invictus Mobi</h1>
      </div>
    </section>
    <section class="section section--compact">
      <div class="container contact__grid">
        <div>
          <p>${site.tagline}</p>
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
  initContactForm();
}
