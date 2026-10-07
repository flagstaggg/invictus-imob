// Imóveis e imagens são FICTÍCIOS — substituir pelas fotos reais ao publicar.
// As URLs do Unsplash estão centralizadas em IMG_BASE para troca fácil.
const U = 'https://images.unsplash.com';
const img = (id, w = 1600) => `${U}/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

// Catálogo de IDs de fotos livres (Unsplash) usadas como placeholders.
const FOTOS = {
  casa1: ['1600596542815-ffad4c1539a9', '1600585154340-be6161a56a0c', '1512917774080-9991f1c4c750', '1600607687939-ce8a6c25118c'],
  cobertura: ['1613490493576-7fde63acd811', '1560185127-6ed189bf02f4', '1600607687920-4e2a09cf159d', '1493809842364-78817add7ffb'],
  casa2: ['1600047509807-ba8f99d2cdde', '1564013799919-ab600027ffc6', '1568605114967-8130f3a36994', '1600047509807-ba8f99d2cdde'],
  garden: ['1600573472592-401b489a3cdc', '1484154218962-a197022b5858', '1556912173-3bb406ef7e77', '1484154218962-a197022b5858'],
  casa3: ['1600210492486-724fe5c67fb0', '1600585154526-990dced4db0d', '1560448204-e02f11c3d0e2', '1561501900-3701fa6a0864'],
  sala: ['1497366216548-37526070297c', '1497366811353-6870744d04b2', '1497366811353-6870744d04b2', '1556761175-b413da4baf72'],
  praia: ['1507525428034-b723cf961d3e', '1505142468610-359e7d316be0', '1520250497591-112f2f40a3f4', '1571003123894-1f0594d2b5d9'],
  casa4: ['1580587771525-78b9dba3b914', '1556912167-f556f1f39fdf', '1600566753086-00f18fb6b3ea', '1560448075-bb485b067938'],
  penthouse: ['1502672260266-1c1ef2d93688', '1522708323590-d24dbb6b0267', '1502672260266-1c1ef2d93688', '1522708323590-d24dbb6b0267'],
  terreno: ['1500382017468-9049fed747ef', '1464146072230-91cabc968266', '1500534314209-a25ddb2bd429', '1464146072230-91cabc968266'],
  apto: ['1505691938895-1758d7feb511', '1560448075-bb485b067938', '1560448075-bb485b067938', '1595526114035-0d45ed16cfbf'],
  mansao: ['1600607687939-ce8a6c25118c', '1600607687939-ce8a6c25118c', '1600585154340-be6161a56a0c', '1600585154526-990dced4db0d'],
};

const pack = (arr) => arr.map((id) => img(id));

export const properties = [
  {
    id: 'p01', slug: 'residencia-ambar', titulo: 'Residência Âmbar', finalidade: 'venda', tipo: 'casa',
    bairro: 'Pinheirinho', cidade: 'Criciúma', preco: 4850000, area: 620, quartos: 5, suites: 5,
    banheiros: 7, vagas: 6, destaque: true, codigo: 'IMV-0001', dataPublicacao: '2026-09-28',
    descricao: 'Casa contemporânea em loteamento fechado, com área gourmet, piscina aquecida, home theater e vista para o parque.',
    diferenciais: ['Portaria 24h', 'Piscina aquecida', 'Home theater', 'Suíte master com closet'],
    imagens: pack(FOTOS.casa1),
  },
  {
    id: 'p02', slug: 'cobertura-horizonte', titulo: 'Cobertura Horizonte', finalidade: 'venda', tipo: 'cobertura',
    bairro: 'Centro', cidade: 'Criciúma', preco: 7200000, area: 480, quartos: 4, suites: 4,
    banheiros: 6, vagas: 4, destaque: true, codigo: 'IMV-0002', dataPublicacao: '2026-09-20',
    descricao: 'Cobertura duplex com terraço total, vista panorâmica da cidade, elevador privativo e acabamentos em mármore italiano.',
    diferenciais: ['Elevador privativo', 'Terraço total', 'Vista panorâmica', 'Acabamento premium'],
    imagens: pack(FOTOS.cobertura),
  },
  {
    id: 'p03', slug: 'casa-das-acacias', titulo: 'Casa das Acácias', finalidade: 'venda', tipo: 'casa',
    bairro: 'Michel', cidade: 'Criciúma', preco: 3150000, area: 540, quartos: 4, suites: 4,
    banheiros: 5, vagas: 5, destaque: false, codigo: 'IMV-0003', dataPublicacao: '2026-09-10',
    descricao: 'Casa em meio à natureza, com projeto paisagístico, churrasqueira coberta e piscina com cascata.',
    diferenciais: ['Loteamento tranquilo', 'Área verde', 'Churrasqueira gourmet', 'Financiamento nada consta'],
    imagens: pack(FOTOS.casa2),
  },
  {
    id: 'p04', slug: 'apartamento-garden', titulo: 'Apartamento Garden', finalidade: 'venda', tipo: 'apartamento',
    bairro: 'Comerciário', cidade: 'Criciúma', preco: 1890000, area: 210, quartos: 3, suites: 3,
    banheiros: 4, vagas: 3, destaque: true, codigo: 'IMV-0004', dataPublicacao: '2026-10-01',
    descricao: 'Garden com jardim privativo, condomínio-clube completo e acabamentos em porcelanato de grande formato.',
    diferenciais: ['Jardim privativo', 'Condomínio-clube', 'Portaria 24h', 'Academia equipada'],
    imagens: pack(FOTOS.garden),
  },
  {
    id: 'p05', slug: 'residencia-santa-barbara', titulo: 'Residência Santa Bárbara', finalidade: 'venda', tipo: 'casa',
    bairro: 'Santa Bárbara', cidade: 'Criciúma', preco: 2750000, area: 380, quartos: 4, suites: 4,
    banheiros: 5, vagas: 4, destaque: false, codigo: 'IMV-0005', dataPublicacao: '2026-08-30',
    descricao: 'Casa térrea ampla, pé-direito alto, sala com lareira e quintal privativo com área de lazer.',
    diferenciais: ['Térrea', 'Lareira', 'Quintal amplo', 'Próximo a bons colégios'],
    imagens: pack(FOTOS.casa3),
  },
  {
    id: 'p06', slug: 'sala-empresarial-centro', titulo: 'Sala Empresarial', finalidade: 'venda', tipo: 'sala-comercial',
    bairro: 'Centro', cidade: 'Criciúma', preco: 980000, area: 95, quartos: 0, suites: 0,
    banheiros: 2, vagas: 2, destaque: false, codigo: 'IMV-0006', dataPublicacao: '2026-09-05',
    descricao: 'Sala em edifício corporativo na região central, com recepção, coworking e fácil acesso.',
    diferenciais: ['Edifício corporativo', 'Coworking', 'Café gourmet', 'Fácil acesso'],
    imagens: pack(FOTOS.sala),
  },
  {
    id: 'p07', slug: 'casa-de-praia-rincão', titulo: 'Casa de Praia', finalidade: 'locacao', tipo: 'casa',
    bairro: 'Balneário Rincão', cidade: 'Balneário Rincão', preco: 18500, area: 260, quartos: 3, suites: 3,
    banheiros: 4, vagas: 4, destaque: false, codigo: 'IMV-0007', dataPublicacao: '2026-09-15',
    descricao: 'Casa de temporada a poucos passos do mar, com deck, lareira e capacidade para a família toda.',
    diferenciais: ['A 300m da praia', 'Deck amplo', 'Lareira', 'Aceita pets sob consulta'],
    imagens: pack(FOTOS.praia),
  },
  {
    id: 'p08', slug: 'refugio-do-lago', titulo: 'Refúgio do Lago', finalidade: 'venda', tipo: 'casa',
    bairro: 'Próspera', cidade: 'Criciúma', preco: 1450000, area: 300, quartos: 3, suites: 3,
    banheiros: 4, vagas: 4, destaque: false, codigo: 'IMV-0008', dataPublicacao: '2026-09-25',
    descricao: 'Casa em condomínio com vista para o lago, projeto arquitetônico contemporâneo e alta área de lazer.',
    diferenciais: ['Vista para o lago', 'Condomínio fechado', 'Quadra esportiva', 'Trilhas'],
    imagens: pack(FOTOS.casa4),
  },
  {
    id: 'p09', slug: 'penthouse-vertente', titulo: 'Penthouse Vertente', finalidade: 'locacao', tipo: 'cobertura',
    bairro: 'Michel', cidade: 'Criciúma', preco: 12900, area: 320, quartos: 3, suites: 3,
    banheiros: 5, vagas: 3, destaque: true, codigo: 'IMV-0009', dataPublicacao: '2026-09-30',
    descricao: 'Penthouse em edifício de frente para o parque, com sala integrada, área gourmet e piscina privativa.',
    diferenciais: ['Piscina privativa', 'Vista para o parque', 'Edifício novo', 'Condomínio com spa'],
    imagens: pack(FOTOS.penthouse),
  },
  {
    id: 'p10', slug: 'lote-clube-campestre', titulo: 'Lote Clube Campestre', finalidade: 'venda', tipo: 'terreno',
    bairro: 'Próspera', cidade: 'Criciúma', preco: 890000, area: 1200, quartos: 0, suites: 0,
    banheiros: 0, vagas: 2, destaque: false, codigo: 'IMV-0010', dataPublicacao: '2026-08-22',
    descricao: 'Lote de frente para o campo de golfe, em condomínio de alto padrão com infraestrutura completa.',
    diferenciais: ['Frente para o golfe', 'Condomínio fechado', 'Oportunidade', 'Água e luz no lote'],
    imagens: pack(FOTOS.terreno),
  },
  {
    id: 'p11', slug: 'apartamento-vista', titulo: 'Apartamento Vista', finalidade: 'locacao', tipo: 'apartamento',
    bairro: 'Centro', cidade: 'Criciúma', preco: 8750, area: 145, quartos: 2, suites: 2,
    banheiros: 3, vagas: 2, destaque: true, codigo: 'IMV-0011', dataPublicacao: '2026-10-02',
    descricao: 'Apartamento mobiliado de alto padrão, com vista para a cidade, academia e piscina no condomínio.',
    diferenciais: ['Mobiliado', 'Piscina e academia', 'Portaria 24h', 'Vista urbana'],
    imagens: pack(FOTOS.apto),
  },
  {
    id: 'p12', slug: 'mansao-dos-ipes', titulo: 'Mansão dos Ipês', finalidade: 'venda', tipo: 'casa',
    bairro: 'Pinheirinho', cidade: 'Criciúma', preco: 12900000, area: 950, quartos: 6, suites: 6,
    banheiros: 9, vagas: 8, destaque: true, codigo: 'IMV-0012', dataPublicacao: '2026-09-18',
    descricao: 'Mansão em terreno de esquina, com spa privativo, quadra oficial e jardim de inverno.',
    diferenciais: ['Spa privativo', 'Quadra oficial', 'Jardim de inverno', 'Projeto assinado'],
    imagens: pack(FOTOS.mansao),
  },
];

export const neighborhoods = [
  { nome: 'Centro', descricao: 'Coração da cidade, com arquitetura, comércio e gastronomia.', imagem: img('1477959858617-67f85cf4f1df', 1200) },
  { nome: 'Pinheirinho', descricao: 'Bairro nobre residencial, com mansões e tranquilidade.', imagem: img('1600596542815-ffad4c1539a9', 1200) },
  { nome: 'Comerciário', descricao: 'Endereço de famílias, com jardins e condomínios-clube.', imagem: img('1600573472592-401b489a3cdc', 1200) },
  { nome: 'Santa Bárbara', descricao: 'Bairro tradicional e valorizado, de casas amplas.', imagem: img('1600047509807-ba8f99d2cdde', 1200) },
  { nome: 'Michel', descricao: 'Região ascendente, com vista para o parque e lagos.', imagem: img('1613490493576-7fde63acd811', 1200) },
  { nome: 'Próspera', descricao: 'Condomínios clube e loteamentos de alto padrão.', imagem: img('1580587771525-78b9dba3b914', 1200) },
  { nome: 'Balneário Rincão', descricao: 'O litoral imediato de Criciúma, para morar ou investir.', imagem: img('1507525428034-b723cf961d3e', 1200) },
];
