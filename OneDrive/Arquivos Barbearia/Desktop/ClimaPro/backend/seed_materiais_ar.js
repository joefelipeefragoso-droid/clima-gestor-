const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const materiais = [
  // TUBULAÇÃO E CONEXÕES
  { nome: "Tubo de cobre 1/4", categoria: "TUBULAÇÃO E CONEXÕES", unidade: "m" },
  { nome: "Tubo de cobre 3/8", categoria: "TUBULAÇÃO E CONEXÕES", unidade: "m" },
  { nome: "Tubo de cobre 1/2", categoria: "TUBULAÇÃO E CONEXÕES", unidade: "m" },
  { nome: "Tubo de cobre 5/8", categoria: "TUBULAÇÃO E CONEXÕES", unidade: "m" },
  { nome: "Tubo de cobre 3/4", categoria: "TUBULAÇÃO E CONEXÕES", unidade: "m" },
  { nome: "Curva de cobre", categoria: "TUBULAÇÃO E CONEXÕES", unidade: "un" },
  { nome: "Luva de cobre", categoria: "TUBULAÇÃO E CONEXÕES", unidade: "un" },
  { nome: "União de cobre", categoria: "TUBULAÇÃO E CONEXÕES", unidade: "un" },
  { nome: "Redução de cobre", categoria: "TUBULAÇÃO E CONEXÕES", unidade: "un" },
  { nome: "Flange", categoria: "TUBULAÇÃO E CONEXÕES", unidade: "un" },
  { nome: "Porca flare", categoria: "TUBULAÇÃO E CONEXÕES", unidade: "un" },
  
  // ISOLAMENTO
  { nome: "Isolante térmico elastomérico", categoria: "ISOLAMENTO", unidade: "m" },
  { nome: "Espaguete isolante", categoria: "ISOLAMENTO", unidade: "m" },
  { nome: "Fita PVC isolante", categoria: "ISOLAMENTO", unidade: "un" },
  { nome: "Fita aluminizada", categoria: "ISOLAMENTO", unidade: "un" },
  { nome: "Fita térmica", categoria: "ISOLAMENTO", unidade: "un" },
  
  // DRENO
  { nome: "Mangueira de dreno", categoria: "DRENO", unidade: "m" },
  { nome: "Tubo PVC 20mm", categoria: "DRENO", unidade: "m" },
  { nome: "Tubo PVC 25mm", categoria: "DRENO", unidade: "m" },
  { nome: "Joelho PVC", categoria: "DRENO", unidade: "un" },
  { nome: "Curva PVC", categoria: "DRENO", unidade: "un" },
  { nome: "Cola PVC", categoria: "DRENO", unidade: "tubo" },
  { nome: "Abraçadeira plástica", categoria: "DRENO", unidade: "pct" },
  
  // FIXAÇÃO E SUPORTE
  { nome: "Suporte para condensadora", categoria: "FIXAÇÃO E SUPORTE", unidade: "par" },
  { nome: "Mão francesa", categoria: "FIXAÇÃO E SUPORTE", unidade: "un" },
  { nome: "Parafuso", categoria: "FIXAÇÃO E SUPORTE", unidade: "pct" },
  { nome: "Bucha", categoria: "FIXAÇÃO E SUPORTE", unidade: "pct" },
  { nome: "Parafuso sextavado", categoria: "FIXAÇÃO E SUPORTE", unidade: "un" },
  { nome: "Chumbador", categoria: "FIXAÇÃO E SUPORTE", unidade: "un" },
  { nome: "Suporte de parede", categoria: "FIXAÇÃO E SUPORTE", unidade: "un" },
  { nome: "Base de piso condensadora", categoria: "FIXAÇÃO E SUPORTE", unidade: "un" },
  
  // ELÉTRICA
  { nome: "Cabo PP 2x1,5", categoria: "ELÉTRICA", unidade: "m" },
  { nome: "Cabo PP 3x2,5", categoria: "ELÉTRICA", unidade: "m" },
  { nome: "Cabo PP 4x4", categoria: "ELÉTRICA", unidade: "m" },
  { nome: "Fio rígido", categoria: "ELÉTRICA", unidade: "m" },
  { nome: "Disjuntor", categoria: "ELÉTRICA", unidade: "un" },
  { nome: "Contator", categoria: "ELÉTRICA", unidade: "un" },
  { nome: "Relé", categoria: "ELÉTRICA", unidade: "un" },
  { nome: "Tomada", categoria: "ELÉTRICA", unidade: "un" },
  { nome: "Conector Wago", categoria: "ELÉTRICA", unidade: "un" },
  { nome: "Terminal elétrico", categoria: "ELÉTRICA", unidade: "un" },
  { nome: "Fita isolante", categoria: "ELÉTRICA", unidade: "un" },
  { nome: "Canaleta", categoria: "ELÉTRICA", unidade: "un" },
  { nome: "Eletroduto", categoria: "ELÉTRICA", unidade: "m" },
  
  // GÁS REFRIGERANTE
  { nome: "Gás R22", categoria: "GÁS REFRIGERANTE", unidade: "kg" },
  { nome: "Gás R410A", categoria: "GÁS REFRIGERANTE", unidade: "kg" },
  { nome: "Gás R32", categoria: "GÁS REFRIGERANTE", unidade: "kg" },
  { nome: "Óleo compressor", categoria: "GÁS REFRIGERANTE", unidade: "litro" },
  { nome: "Válvula Schrader", categoria: "GÁS REFRIGERANTE", unidade: "un" },
  { nome: "Tampa válvula", categoria: "GÁS REFRIGERANTE", unidade: "un" },
  
  // LIMPEZA E HIGIENIZAÇÃO
  { nome: "Produto limpeza evaporadora", categoria: "LIMPEZA E HIGIENIZAÇÃO", unidade: "litro" },
  { nome: "Produto limpeza condensadora", categoria: "LIMPEZA E HIGIENIZAÇÃO", unidade: "litro" },
  { nome: "Bactericida", categoria: "LIMPEZA E HIGIENIZAÇÃO", unidade: "litro" },
  { nome: "Desengraxante", categoria: "LIMPEZA E HIGIENIZAÇÃO", unidade: "litro" },
  { nome: "Spray limpeza", categoria: "LIMPEZA E HIGIENIZAÇÃO", unidade: "un" },
  { nome: "Água pressurizada", categoria: "LIMPEZA E HIGIENIZAÇÃO", unidade: "serviço" },
  { nome: "Escova limpeza", categoria: "LIMPEZA E HIGIENIZAÇÃO", unidade: "un" },
  { nome: "Pano técnico", categoria: "LIMPEZA E HIGIENIZAÇÃO", unidade: "un" },
  
  // PEÇAS E REPOSIÇÃO
  { nome: "Capacitor", categoria: "PEÇAS E REPOSIÇÃO", unidade: "un" },
  { nome: "Sensor de temperatura", categoria: "PEÇAS E REPOSIÇÃO", unidade: "un" },
  { nome: "Placa eletrônica", categoria: "PEÇAS E REPOSIÇÃO", unidade: "un" },
  { nome: "Motor ventilador", categoria: "PEÇAS E REPOSIÇÃO", unidade: "un" },
  { nome: "Hélice condensadora", categoria: "PEÇAS E REPOSIÇÃO", unidade: "un" },
  { nome: "Turbina evaporadora", categoria: "PEÇAS E REPOSIÇÃO", unidade: "un" },
  { nome: "Compressor", categoria: "PEÇAS E REPOSIÇÃO", unidade: "un" },
  { nome: "Contator", categoria: "PEÇAS E REPOSIÇÃO", unidade: "un" },
  { nome: "Termostato", categoria: "PEÇAS E REPOSIÇÃO", unidade: "un" },
  { nome: "Fusível", categoria: "PEÇAS E REPOSIÇÃO", unidade: "un" },
  
  // INFRAESTRUTURA
  { nome: "Canaleta PVC", categoria: "INFRAESTRUTURA", unidade: "m" },
  { nome: "Tampa canaleta", categoria: "INFRAESTRUTURA", unidade: "un" },
  { nome: "Curva canaleta", categoria: "INFRAESTRUTURA", unidade: "un" },
  { nome: "União canaleta", categoria: "INFRAESTRUTURA", unidade: "un" },
  { nome: "Caixa de passagem", categoria: "INFRAESTRUTURA", unidade: "un" },
  { nome: "Suporte de tubulação", categoria: "INFRAESTRUTURA", unidade: "un" },
  
  // SOLDA E INSTALAÇÃO
  { nome: "Vareta de solda prata", categoria: "SOLDA E INSTALAÇÃO", unidade: "un" },
  { nome: "Fluxo de solda", categoria: "SOLDA E INSTALAÇÃO", unidade: "un" },
  { nome: "Gás maçarico", categoria: "SOLDA E INSTALAÇÃO", unidade: "un" },
  { nome: "Maçarico portátil", categoria: "SOLDA E INSTALAÇÃO", unidade: "un" },
  { nome: "Lixa", categoria: "SOLDA E INSTALAÇÃO", unidade: "un" },
  { nome: "Escova aço", categoria: "SOLDA E INSTALAÇÃO", unidade: "un" },
  
  // ACABAMENTO
  { nome: "Silicone", categoria: "ACABAMENTO", unidade: "tubo" },
  { nome: "Massa vedação", categoria: "ACABAMENTO", unidade: "un" },
  { nome: "Espuma expansiva", categoria: "ACABAMENTO", unidade: "tubo" },
  { nome: "Fita acabamento", categoria: "ACABAMENTO", unidade: "un" },
  { nome: "Tampa estética", categoria: "ACABAMENTO", unidade: "un" }
];

db.serialize(() => {
  const stmt = db.prepare(`
    INSERT INTO materiais (nome, categoria, unidade, quantidade_estoque, valor_custo, valor_venda, observacoes, nicho)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (const mat of materiais) {
    stmt.run([
      mat.nome,
      mat.categoria,
      mat.unidade,
      0, // qntd inicial
      0.0, // custo inicial
      0.0, // venda inicial
      "Importado automaticamente",
      "Ar-condicionado"
    ]);
  }
  
  stmt.finalize();
  console.log(`Sucesso: ${materiais.length} materiais cadastrados no nicho Ar-condicionado!`);
});

db.close();
