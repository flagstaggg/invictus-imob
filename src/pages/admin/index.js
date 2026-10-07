import '../../styles/admin.css';

const $ = (sel, root = document) => root.querySelector(sel);

async function api(path, opts = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.erro || 'Erro na requisição');
  return data;
}

let ME = null;

export function render() {
  return '<section class="admin" id="admin-app"><div class="container admin__loading"><p>Carregando painel…</p></div></section>';
}

export async function init() {
  const root = document.getElementById('admin-app');
  try {
    const { user } = await api('/api/admin/me');
    ME = user;
    if (user.trocarSenha) renderTrocarSenha(root);
    else renderShell(root);
  } catch {
    renderLogin(root);
  }
}

/* ---------- Login ---------- */
function renderLogin(root) {
  root.innerHTML = `
    <div class="admin-card">
      <p class="eyebrow">Área restrita</p>
      <h1>Entrar no painel</h1>
      <form id="login-form" class="admin-form">
        <div class="field"><label for="lg-email">E-mail</label><input id="lg-email" type="email" required autocomplete="username" /></div>
        <div class="field"><label for="lg-senha">Senha</label><input id="lg-senha" type="password" required autocomplete="current-password" /></div>
        <p class="admin-error" id="login-erro" hidden></p>
        <button class="btn btn--gold" type="submit">Entrar</button>
      </form>
    </div>`;
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const erro = $('#login-erro');
    erro.hidden = true;
    try {
      const r = await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ email: $('#lg-email').value, senha: $('#lg-senha').value }) });
      ME = (await api('/api/admin/me')).user;
      if (r.trocarSenha) renderTrocarSenha(root);
      else renderShell(root);
    } catch (err) {
      erro.textContent = err.message;
      erro.hidden = false;
    }
  });
}

function renderTrocarSenha(root) {
  root.innerHTML = `
    <div class="admin-card">
      <p class="eyebrow">Primeiro acesso</p>
      <h1>Defina uma nova senha</h1>
      <p class="admin-note">Mínimo de 12 caracteres.</p>
      <form id="ts-form" class="admin-form">
        <div class="field"><label for="ts-atual">Senha atual</label><input id="ts-atual" type="password" required /></div>
        <div class="field"><label for="ts-nova">Nova senha</label><input id="ts-nova" type="password" required minlength="12" /></div>
        <p class="admin-error" id="ts-erro" hidden></p>
        <p class="admin-ok" id="ts-ok" hidden></p>
        <button class="btn btn--gold" type="submit">Salvar e entrar</button>
      </form>
    </div>`;
  $('#ts-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/api/admin/trocar-senha', { method: 'POST', body: JSON.stringify({ senhaAtual: $('#ts-atual').value, novaSenha: $('#ts-nova').value }) });
      ME = (await api('/api/admin/me')).user;
      renderShell(root);
    } catch (err) {
      const erro = $('#ts-erro');
      erro.textContent = err.message;
      erro.hidden = false;
    }
  });
}

/* ---------- Shell ---------- */
function renderShell(root) {
  root.innerHTML = `
    <div class="container admin-shell">
      <header class="admin-top">
        <div>
          <p class="eyebrow">Painel</p>
          <h1>Invictus Mobi</h1>
        </div>
        <div class="admin-top__user">
          <span>${ME.nome} · ${ME.role === 'admin' ? 'Administrador' : 'Corretor'}</span>
          <button class="btn btn--outline" id="admin-logout">Sair</button>
        </div>
      </header>
      <nav class="admin-nav">
        <button class="btn btn--outline" data-view="imoveis">Imóveis</button>
        ${ME.role === 'admin' ? '<button class="btn btn--outline" data-view="usuarios">Usuários</button>' : ''}
      </nav>
      <div id="admin-view"></div>
    </div>`;
  $('#admin-logout').addEventListener('click', async () => {
    await api('/api/admin/logout', { method: 'POST' });
    renderLogin(root);
  });
  root.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.view === 'imoveis') renderImoveisList($('#admin-view'));
    if (b.dataset.view === 'usuarios') renderUsuarios($('#admin-view'));
  }));
  renderImoveisList($('#admin-view'));
}

/* ---------- Imóveis ---------- */
async function renderImoveisList(view, pagina = 1) {
  const busca = view.dataset.busca || '';
  const finalidade = view.dataset.finalidade || '';
  const status = view.dataset.status || '';
  const tipo = view.dataset.tipo || '';
  const qs = new URLSearchParams({ busca, finalidade, status, tipo, pagina: String(pagina) });
  const { itens, total, porPagina } = await api(`/api/admin/imoveis?${qs}`);
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  view.dataset.busca = busca; view.dataset.finalidade = finalidade; view.dataset.status = status; view.dataset.tipo = tipo;
  view.innerHTML = `
    <div class="admin-toolbar">
      <input id="f-busca" type="search" placeholder="Buscar por título, código ou bairro" value="${busca}" />
      <select id="f-finalidade"><option value="">Finalidade</option><option value="venda" ${finalidade==='venda'?'selected':''}>Venda</option><option value="locacao" ${finalidade==='locacao'?'selected':''}>Aluguel</option></select>
      <select id="f-status"><option value="">Status</option>${['rascunho','ativo','vendido','alugado'].map(s=>`<option ${status===s?'selected':''}>${s}</option>`).join('')}</select>
      <select id="f-tipo"><option value="">Tipo</option>${['casa','apartamento','cobertura','terreno','sala-comercial'].map(t=>`<option ${tipo===t?'selected':''}>${t}</option>`).join('')}</select>
      <button class="btn btn--outline" id="f-filtrar">Filtrar</button>
      <button class="btn btn--gold" id="f-novo">Novo imóvel</button>
    </div>
    <p class="admin-note">${total} imóvel(is) encontrado(s)</p>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Título</th><th>Código</th><th>Finalidade</th><th>Tipo</th><th>Status</th><th>Preço</th><th></th></tr></thead>
        <tbody>
          ${itens.map((p) => `
            <tr>
              <td>${p.titulo}</td><td>${p.codigo}</td><td>${p.finalidade === 'venda' ? 'Venda' : 'Aluguel'}</td>
              <td>${p.tipo}</td><td>${p.status}</td><td>R$ ${p.preco.toLocaleString('pt-BR')}</td>
              <td class="admin-table__actions">
                <button class="btn btn--outline btn--sm" data-editar="${p.id}">Editar</button>
                <button class="btn btn--outline btn--sm" data-excluir="${p.id}">Excluir</button>
              </td>
            </tr>`).join('') || '<tr><td colspan="7">Nenhum imóvel.</td></tr>'}
        </tbody>
      </table>
    </div>
    <div class="admin-pager">
      <button class="btn btn--outline btn--sm" id="pg-prev" ${pagina<=1?'disabled':''}>Anterior</button>
      <span>Página ${pagina} de ${paginas}</span>
      <button class="btn btn--outline btn--sm" id="pg-next" ${pagina>=paginas?'disabled':''}>Próxima</button>
    </div>`;
  $('#f-filtrar').addEventListener('click', () => {
    view.dataset.busca = $('#f-busca').value;
    view.dataset.finalidade = $('#f-finalidade').value;
    view.dataset.status = $('#f-status').value;
    view.dataset.tipo = $('#f-tipo').value;
    renderImoveisList(view, 1);
  });
  $('#f-novo').addEventListener('click', () => renderImovelForm(view));
  $('#pg-prev').addEventListener('click', () => renderImoveisList(view, pagina - 1));
  $('#pg-next').addEventListener('click', () => renderImoveisList(view, pagina + 1));
  view.querySelectorAll('[data-editar]').forEach((b) => b.addEventListener('click', () => renderImovelForm(view, b.dataset.editar)));
  view.querySelectorAll('[data-excluir]').forEach((b) => b.addEventListener('click', async () => {
    if (!confirm('Excluir (lógicamente) este imóvel? Ele some do site, mas pode ser restaurado.')) return;
    try { await api(`/api/admin/imoveis/${b.dataset.excluir}`, { method: 'DELETE' }); renderImoveisList(view, pagina); }
    catch (err) { alert(err.message); }
  }));
}

/* ---------- Formulário de imóvel ---------- */
async function renderImovelForm(view, id = null) {
  const usuarios = (await api('/api/admin/usuarios/options')).usuarios;
  let imovel = null;
  if (id) imovel = (await api(`/api/admin/imoveis/${id}`)).imovel;
  let fotos = imovel ? [...imovel.imagens] : [];

  view.innerHTML = `
    <h2>${imovel ? 'Editar imóvel' : 'Novo imóvel'}</h2>
    <form id="im-form" class="admin-form admin-form--grid">
      <div class="field"><label>Título</label><input name="titulo" required value="${imovel?.titulo || ''}" /></div>
      <div class="field"><label>Código de referência</label><input name="codigo" required value="${imovel?.codigo || ''}" /></div>
      <div class="field"><label>Finalidade</label><select name="finalidade"><option value="venda" ${imovel?.finalidade==='venda'?'selected':''}>Venda</option><option value="locacao" ${imovel?.finalidade==='locacao'?'selected':''}>Aluguel</option></select></div>
      <div class="field"><label>Tipo</label><select name="tipo">${['casa','apartamento','cobertura','terreno','sala-comercial'].map(t=>`<option ${imovel?.tipo===t?'selected':''}>${t}</option>`).join('')}</select></div>
      <div class="field"><label>Status</label><select name="status">${['rascunho','ativo','vendido','alugado'].map(s=>`<option ${imovel?.status===s?'selected':''}>${s}</option>`).join('')}</select></div>
      <div class="field"><label>Valor (R$)</label><input name="preco" type="number" min="0" required value="${imovel?.preco ?? ''}" /></div>
      <div class="field"><label>Condomínio (R$)</label><input name="condominio" type="number" min="0" value="${imovel?.condominio ?? ''}" /></div>
      <div class="field"><label>IPTU (R$)</label><input name="iptu" type="number" min="0" value="${imovel?.iptu ?? ''}" /></div>
      <div class="field"><label>Bairro</label><input name="bairro" required value="${imovel?.bairro || ''}" /></div>
      <div class="field"><label>Cidade</label><input name="cidade" required value="${imovel?.cidade || 'Criciúma'}" /></div>
      <div class="field"><label>Área total (m²)</label><input name="area" type="number" step="0.1" value="${imovel?.area ?? ''}" /></div>
      <div class="field"><label>Área construída (m²)</label><input name="areaConstruida" type="number" step="0.1" value="${imovel?.areaConstruida ?? ''}" /></div>
      <div class="field"><label>Quartos</label><input name="quartos" type="number" min="0" value="${imovel?.quartos ?? ''}" /></div>
      <div class="field"><label>Suítes</label><input name="suites" type="number" min="0" value="${imovel?.suites ?? ''}" /></div>
      <div class="field"><label>Banheiros</label><input name="banheiros" type="number" min="0" value="${imovel?.banheiros ?? ''}" /></div>
      <div class="field"><label>Vagas</label><input name="vagas" type="number" min="0" value="${imovel?.vagas ?? ''}" /></div>
      <div class="field"><label>Corretor responsável</label><select name="corretorId"><option value="">—</option>${usuarios.map(u=>`<option value="${u.id}" ${imovel?.corretorId===u.id?'selected':''}>${u.nome}</option>`).join('')}</select></div>
      <div class="field field--full"><label>Descrição</label><textarea name="descricao" rows="5">${imovel?.descricao || ''}</textarea></div>
      <div class="field field--full"><label>Comodidades (uma por linha)</label><textarea name="diferenciais" rows="4">${(imovel?.diferenciais || []).join('\n')}</textarea></div>
      <fieldset class="field--full admin-fieldset"><legend>Endereço</legend>
        <div class="admin-form--grid">
          <div class="field"><label>Rua</label><input name="e_rua" value="${imovel?.endereco?.rua || ''}" /></div>
          <div class="field"><label>Número</label><input name="e_numero" value="${imovel?.endereco?.numero || ''}" /></div>
          <div class="field"><label>Bairro</label><input name="e_bairro" value="${imovel?.endereco?.bairro || ''}" /></div>
          <div class="field"><label>Cidade</label><input name="e_cidade" value="${imovel?.endereco?.cidade || ''}" /></div>
          <div class="field"><label>Estado</label><input name="e_estado" maxlength="2" value="${imovel?.endereco?.estado || ''}" /></div>
          <div class="field"><label>CEP</label><input name="e_cep" value="${imovel?.endereco?.cep || ''}" /></div>
        </div>
      </fieldset>
      <label class="check field--full"><input type="checkbox" name="ocultarEndereco" ${imovel?.ocultarEndereco !== false ? 'checked' : ''} /> <span>Ocultar endereço exato no site público</span></label>
      <label class="check field--full"><input type="checkbox" name="destaque" ${imovel?.destaque ? 'checked' : ''} /> <span>Marcar como destaque</span></label>
      <p class="admin-error" id="im-erro" hidden></p>
      <div class="admin-actions field--full">
        <button class="btn btn--gold" type="submit">Salvar</button>
        <button class="btn btn--outline" type="button" id="im-cancelar">Cancelar</button>
      </div>
    </form>

    <h3>Fotos</h3>
    <div id="fotos-lista" class="fotos-lista"></div>
    <div id="dropzone" class="dropzone" tabindex="0">
      <p>Arraste fotos aqui ou <label class="link">escolha arquivos<input type="file" id="fotos-input" accept="image/jpeg,image/png,image/webp" multiple hidden /></label></p>
      <progress id="upload-progress" max="100" value="0" hidden></progress>
      <p class="admin-note">JPEG, PNG ou WebP · até 8 MB por foto</p>
    </div>
    ${imovel ? `<p class="admin-note">A primeira foto é a capa. Use as setas para reordenar.</p>` : '<p class="admin-note">Salve o imóvel primeiro para enviar fotos.</p>'}
  `;

  function renderFotos() {
    $('#fotos-lista').innerHTML = fotos.map((f, i) => {
      const src = typeof f === 'string' ? f : f.src;
      const alt = typeof f === 'string' ? '' : (f.alt || '');
      return `
        <figure class="foto-item">
          <img src="${src}" alt="${alt || 'Foto do imóvel'}" />
          <figcaption>
            <input data-legenda="${i}" placeholder="Legenda (opcional)" value="${alt}" />
            <div class="foto-item__btns">
              <button type="button" data-up="${i}" title="Mover para cima">↑</button>
              <button type="button" data-down="${i}" title="Mover para baixo">↓</button>
              <button type="button" data-del="${i}" title="Remover">×</button>
            </div>
          </figcaption>
        </figure>`;
    }).join('') || '<p class="admin-note">Nenhuma foto.</p>';
    view.querySelectorAll('[data-legenda]').forEach((inp) => inp.addEventListener('change', () => {
      const i = Number(inp.dataset.legenda);
      const src = typeof fotos[i] === 'string' ? fotos[i] : fotos[i].src;
      fotos[i] = inp.value ? { src, alt: inp.value } : src;
    }));
    view.querySelectorAll('[data-up]').forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.up; if (i > 0) [fotos[i-1], fotos[i]] = [fotos[i], fotos[i-1]]; renderFotos(); }));
    view.querySelectorAll('[data-down]').forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.down; if (i < fotos.length - 1) [fotos[i+1], fotos[i]] = [fotos[i], fotos[i+1]]; renderFotos(); }));
    view.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => { fotos.splice(+b.dataset.del, 1); renderFotos(); }));
  }
  if (imovel) renderFotos();

  $('#im-cancelar').addEventListener('click', () => renderImoveisList(view));

  $('#im-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const num = (v) => (v === '' || v === null ? null : Number(v));
    const body = {
      titulo: fd.get('titulo'), codigo: fd.get('codigo'), finalidade: fd.get('finalidade'), tipo: fd.get('tipo'),
      status: fd.get('status'), preco: num(fd.get('preco')), condominio: num(fd.get('condominio')), iptu: num(fd.get('iptu')),
      bairro: fd.get('bairro'), cidade: fd.get('cidade'), area: num(fd.get('area')), areaConstruida: num(fd.get('areaConstruida')),
      quartos: num(fd.get('quartos')), suites: num(fd.get('suites')), banheiros: num(fd.get('banheiros')), vagas: num(fd.get('vagas')),
      corretorId: fd.get('corretorId') ? Number(fd.get('corretorId')) : null,
      descricao: fd.get('descricao'),
      diferenciais: String(fd.get('diferenciais') || '').split('\n').map((s) => s.trim()).filter(Boolean),
      destaque: fd.get('destaque') === 'on',
      ocultarEndereco: fd.get('ocultarEndereco') === 'on',
      endereco: { rua: fd.get('e_rua'), numero: fd.get('e_numero'), bairro: fd.get('e_bairro'), cidade: fd.get('e_cidade'), estado: fd.get('e_estado'), cep: fd.get('e_cep') },
      imagens: fotos,
    };
    const erro = $('#im-erro');
    erro.hidden = true;
    try {
      if (imovel) await api(`/api/admin/imoveis/${imovel.id}`, { method: 'PUT', body: JSON.stringify(body) });
      else {
        const r = await api('/api/admin/imoveis', { method: 'POST', body: JSON.stringify(body) });
        renderImovelForm(view, r.imovel.id);
        return;
      }
      renderImoveisList(view);
    } catch (err) {
      erro.textContent = err.message;
      erro.hidden = false;
    }
  });

  const input = $('#fotos-input');
  const dz = $('#dropzone');
  dz.addEventListener('click', (e) => { if (e.target.tagName !== 'LABEL' && e.target.tagName !== 'INPUT') input.click(); });
  dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('dropzone--over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('dropzone--over'));
  dz.addEventListener('drop', (e) => { e.preventDefault(); dz.classList.remove('dropzone--over'); upload(e.dataTransfer.files); });
  input.addEventListener('change', () => upload(input.files));

  function upload(fileList) {
    if (!imovel) { alert('Salve o imóvel primeiro.'); return; }
    const fd = new FormData();
    [...fileList].forEach((f) => fd.append('fotos', f));
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/admin/imoveis/${imovel.id}/fotos`);
    xhr.withCredentials = true;
    const prog = $('#upload-progress');
    prog.hidden = false; prog.value = 0;
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) prog.value = Math.round((e.loaded / e.total) * 100); };
    xhr.onload = () => {
      prog.hidden = true;
      if (xhr.status >= 200 && xhr.status < 300) {
        const r = JSON.parse(xhr.responseText);
        fotos = r.imagens;
        renderFotos();
      } else {
        alert(JSON.parse(xhr.responseText || '{}').erro || 'Falha no upload');
      }
    };
    xhr.onerror = () => { prog.hidden = true; alert('Falha no upload'); };
    xhr.send(fd);
  }
}

/* ---------- Usuários (admin) ---------- */
async function renderUsuarios(view) {
  const { usuarios } = await api('/api/admin/usuarios');
  view.innerHTML = `
    <h2>Usuários</h2>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${usuarios.map((u) => `
            <tr>
              <td>${u.nome}</td><td>${u.email}</td><td>${u.role === 'admin' ? 'Administrador' : 'Corretor'}</td>
              <td>${u.ativo ? 'Ativo' : 'Inativo'}</td>
              <td class="admin-table__actions">
                <button class="btn btn--outline btn--sm" data-reset="${u.id}">Redefinir senha</button>
                <button class="btn btn--outline btn--sm" data-toggle="${u.id}">${u.ativo ? 'Desativar' : 'Reativar'}</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <h3>Novo usuário</h3>
    <form id="nu-form" class="admin-form admin-form--grid">
      <div class="field"><label>Nome</label><input name="nome" required /></div>
      <div class="field"><label>E-mail</label><input name="email" type="email" required /></div>
      <div class="field"><label>Senha (mín. 12)</label><input name="senha" type="password" minlength="12" required /></div>
      <div class="field"><label>Perfil</label><select name="role"><option value="corretor">Corretor</option><option value="admin">Administrador</option></select></div>
      <p class="admin-error" id="nu-erro" hidden></p>
      <button class="btn btn--gold field--full" type="submit">Criar usuário</button>
    </form>`;
  $('#nu-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api('/api/admin/usuarios', { method: 'POST', body: JSON.stringify({ nome: fd.get('nome'), email: fd.get('email'), senha: fd.get('senha'), role: fd.get('role') }) });
      renderUsuarios(view);
    } catch (err) {
      const erro = $('#nu-erro'); erro.textContent = err.message; erro.hidden = false;
    }
  });
  view.querySelectorAll('[data-reset]').forEach((b) => b.addEventListener('click', async () => {
    const r = await api(`/api/admin/usuarios/${b.dataset.reset}/resetar-senha`, { method: 'POST' });
    alert(`Senha temporária: ${r.senhaTemporaria}\nInforme ao usuário e peça para trocar no 1º acesso.`);
  }));
  view.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', async () => {
    await api(`/api/admin/usuarios/${b.dataset.toggle}/desativar`, { method: 'POST' });
    renderUsuarios(view);
  }));
}
