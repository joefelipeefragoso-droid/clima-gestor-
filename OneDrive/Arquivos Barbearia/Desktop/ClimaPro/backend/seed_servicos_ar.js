const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const servicosArCondicionado = [
  {
    nome: "Instalação Split 9.000 a 12.000 BTUs (padrão)",
    categoria: "Ar-condicionado",
    subcategoria: "Instalação",
    descricao: "Instalação padrão com materiais básicos da garantia. Indicado para equipamentos de 9.000 a 12.000 BTUs.",
    preco: 400
  },
  {
    nome: "Instalação Split 18.000 BTUs",
    categoria: "Ar-condicionado",
    subcategoria: "Instalação",
    descricao: "Instalação padrão para equipamento de 18.000 BTUs.",
    preco: 500
  },
  {
    nome: "Instalação Split 24.000 BTUs",
    categoria: "Ar-condicionado",
    subcategoria: "Instalação",
    descricao: "Instalação padrão para equipamento de 24.000 BTUs.",
    preco: 600
  },
  {
    nome: "Instalação Split 30.000+ BTUs",
    categoria: "Ar-condicionado",
    subcategoria: "Instalação",
    descricao: "Instalação de equipamento acima de 30.000 BTUs, com maior demanda de material e esforço técnico.",
    preco: 750
  },
  {
    nome: "Instalação com infraestrutura embutida",
    categoria: "Ar-condicionado",
    subcategoria: "Instalação",
    descricao: "Instalação com passagem embutida de tubulação e acabamento conforme estrutura do ambiente.",
    preco: 900
  },
  {
    nome: "Instalação em telhado (difícil acesso)",
    categoria: "Ar-condicionado",
    subcategoria: "Instalação",
    descricao: "Instalação com condensadora em telhado ou local de difícil acesso.",
    preco: 700
  },
  {
    nome: "Reinstalação de ar-condicionado",
    categoria: "Ar-condicionado",
    subcategoria: "Instalação",
    descricao: "Retirada de equipamento de um local e reinstalação em outro ambiente.",
    preco: 450
  },
  {
    nome: "Higienização Split 9.000 a 12.000 BTUs",
    categoria: "Ar-condicionado",
    subcategoria: "Higienização",
    descricao: "Limpeza e higienização de evaporadora e itens acessíveis do equipamento de 9.000 a 12.000 BTUs.",
    preco: 120
  },
  {
    nome: "Higienização Split 18.000 BTUs",
    categoria: "Ar-condicionado",
    subcategoria: "Higienização",
    descricao: "Limpeza e higienização de equipamento de 18.000 BTUs.",
    preco: 140
  },
  {
    nome: "Higienização Split 24.000 BTUs",
    categoria: "Ar-condicionado",
    subcategoria: "Higienização",
    descricao: "Limpeza e higienização de equipamento de 24.000 BTUs.",
    preco: 160
  },
  {
    nome: "Higienização Split 30.000+ BTUs",
    categoria: "Ar-condicionado",
    subcategoria: "Higienização",
    descricao: "Limpeza e higienização de equipamento acima de 30.000 BTUs.",
    preco: 180
  },
  {
    nome: "Limpeza pesada (muito sujo/mofo)",
    categoria: "Ar-condicionado",
    subcategoria: "Higienização",
    descricao: "Serviço de limpeza pesada para equipamentos com excesso de sujeira, fungos, mofo ou gordura.",
    preco: 200
  },
  {
    nome: "Higienização com desmontagem completa",
    categoria: "Ar-condicionado",
    subcategoria: "Higienização",
    descricao: "Higienização detalhada com desmontagem completa das partes necessárias para limpeza profunda.",
    preco: 220
  },
  {
    nome: "Manutenção preventiva",
    categoria: "Ar-condicionado",
    subcategoria: "Manutenção",
    descricao: "Verificação preventiva para manter o bom funcionamento do equipamento e evitar falhas futuras.",
    preco: 150
  },
  {
    nome: "Manutenção corretiva (visita técnica)",
    categoria: "Ar-condicionado",
    subcategoria: "Manutenção",
    descricao: "Visita técnica para identificar defeito e realizar correção básica, quando aplicável.",
    preco: 100
  },
  {
    nome: "Revisão geral do sistema",
    categoria: "Ar-condicionado",
    subcategoria: "Manutenção",
    descricao: "Inspeção completa do sistema, componentes e funcionamento geral do equipamento.",
    preco: 180
  },
  {
    nome: "Diagnóstico técnico",
    categoria: "Ar-condicionado",
    subcategoria: "Manutenção",
    descricao: "Avaliação técnica para identificar origem do problema e orientar o reparo correto.",
    preco: 80
  },
  {
    nome: "Troca de sensor",
    categoria: "Ar-condicionado",
    subcategoria: "Manutenção",
    descricao: "Substituição de sensor com verificação do funcionamento após a troca.",
    preco: 120
  },
  {
    nome: "Troca de capacitor",
    categoria: "Ar-condicionado",
    subcategoria: "Manutenção",
    descricao: "Substituição de capacitor do sistema com teste de funcionamento do equipamento.",
    preco: 150
  },
  {
    nome: "Correção de vazamento",
    categoria: "Ar-condicionado",
    subcategoria: "Manutenção",
    descricao: "Localização e correção de vazamento no sistema de refrigeração.",
    preco: 200
  },
  {
    nome: "Recarga de gás (R22 ou R410A)",
    categoria: "Ar-condicionado",
    subcategoria: "Manutenção",
    descricao: "Recarga completa de gás refrigerante conforme necessidade do equipamento.",
    preco: 250
  },
  {
    nome: "Completar gás",
    categoria: "Ar-condicionado",
    subcategoria: "Manutenção",
    descricao: "Complemento de carga de gás refrigerante após avaliação técnica.",
    preco: 180
  },
  {
    nome: "Instalação de ponto elétrico",
    categoria: "Ar-condicionado",
    subcategoria: "Infraestrutura",
    descricao: "Preparação de ponto elétrico para alimentação do equipamento.",
    preco: 150
  },
  {
    nome: "Instalação de disjuntor",
    categoria: "Ar-condicionado",
    subcategoria: "Infraestrutura",
    descricao: "Instalação de disjuntor dedicado conforme necessidade do equipamento.",
    preco: 80
  },
  {
    nome: "Instalação de suporte condensadora",
    categoria: "Ar-condicionado",
    subcategoria: "Infraestrutura",
    descricao: "Instalação de suporte para fixação segura da condensadora.",
    preco: 120
  },
  {
    nome: "Tubulação de cobre (metro)",
    categoria: "Ar-condicionado",
    subcategoria: "Infraestrutura",
    descricao: "Fornecimento/instalação de tubulação de cobre cobrada por metro.",
    preco: 50
  },
  {
    nome: "Passagem de tubulação embutida",
    categoria: "Ar-condicionado",
    subcategoria: "Infraestrutura",
    descricao: "Serviço de passagem embutida da tubulação com ajuste conforme estrutura do ambiente.",
    preco: 200
  },
  {
    nome: "Furação de parede (concreto)",
    categoria: "Ar-condicionado",
    subcategoria: "Infraestrutura",
    descricao: "Furação de parede de concreto para passagem de tubulação e instalação.",
    preco: 100
  },
  {
    nome: "Desinstalação de ar-condicionado",
    categoria: "Ar-condicionado",
    subcategoria: "Serviços extras",
    descricao: "Retirada técnica do equipamento com segurança e preservação das peças principais.",
    preco: 150
  },
  {
    nome: "Mudança de ponto",
    categoria: "Ar-condicionado",
    subcategoria: "Serviços extras",
    descricao: "Alteração do local do equipamento ou adequação do ponto de instalação existente.",
    preco: 200
  },
  {
    nome: "Instalação de dreno",
    categoria: "Ar-condicionado",
    subcategoria: "Serviços extras",
    descricao: "Instalação ou adequação de dreno para escoamento correto da água.",
    preco: 80
  },
  {
    nome: "Correção de vazamento de água",
    categoria: "Ar-condicionado",
    subcategoria: "Serviços extras",
    descricao: "Correção de problemas de drenagem ou inclinação que causam vazamento de água.",
    preco: 100
  },
  {
    nome: "Limpeza de dreno",
    categoria: "Ar-condicionado",
    subcategoria: "Serviços extras",
    descricao: "Desobstrução e limpeza do dreno para evitar gotejamento e retorno de água.",
    preco: 70
  },
  {
    nome: "Vedação e acabamento",
    categoria: "Ar-condicionado",
    subcategoria: "Serviços extras",
    descricao: "Acabamento final da instalação com vedação de furos e ajustes visuais.",
    preco: 50
  }
];

db.serialize(() => {
  const stmt = db.prepare("INSERT INTO servicos (nome, descricao, nicho, categoria, valor_padrao, observacoes) VALUES (?, ?, ?, ?, ?, ?)");
  
  for (const s of servicosArCondicionado) {
    // Map their schema to ours:
    // User's categoria (Ar-condicionado) -> our nicho
    // User's subcategoria (Instalação) -> our categoria
    stmt.run([s.nome, s.descricao, s.categoria, s.subcategoria, s.preco, '']);
  }
  
  stmt.finalize();
  
  console.log('Foram cadastrados ' + servicosArCondicionado.length + ' serviços base de Ar-condicionado!');
});

db.close();
