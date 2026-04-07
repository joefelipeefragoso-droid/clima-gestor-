const getDb = require('./database');

async function initDB() {
  const db = await getDb();
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS empresa_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_empresa TEXT,
      logo_url TEXT,
      cnpj TEXT,
      telefone TEXT,
      email TEXT,
      endereco TEXT,
      cidade TEXT,
      rodape_pdf TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      telefone TEXT,
      whatsapp TEXT,
      cpf_cnpj TEXT,
      endereco TEXT,
      bairro TEXT,
      cidade TEXT,
      observacoes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS agendamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      telefone TEXT,
      endereco TEXT,
      data TEXT,
      hora TEXT,
      tipo_servico TEXT,
      tecnico_responsavel TEXT,
      observacoes TEXT,
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    );

    CREATE TABLE IF NOT EXISTS materiais (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      categoria TEXT,
      unidade TEXT,
      quantidade_estoque INTEGER,
      valor_custo REAL,
      valor_venda REAL,
      observacoes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orcamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_orcamento INTEGER,
      cliente_id INTEGER,
      data_emissao TEXT,
      descricao_servico TEXT,
      mao_de_obra REAL,
      deslocamento REAL,
      desconto REAL,
      valor_total REAL,
      validade TEXT,
      observacoes TEXT,
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    );

    CREATE TABLE IF NOT EXISTS orcamento_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orcamento_id INTEGER,
      material_id INTEGER,
      descricao TEXT,
      quantidade INTEGER,
      valor_unitario REAL,
      valor_total REAL,
      FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id),
      FOREIGN KEY (material_id) REFERENCES materiais(id)
    );
  `);

  // Insert default config if empty
  const configCount = await db.get('SELECT COUNT(*) as count FROM empresa_config');
  if (configCount.count === 0) {
    await db.run('INSERT INTO empresa_config (nome_empresa, cnpj, rodape_pdf) VALUES (?, ?, ?)', ['Minha Empresa de Climatização', '00.000.000/0001-00', 'Obrigado por escolher nossos serviços!']);
  }
  
  console.log('Database initialized.');
  await db.close();
}

initDB().catch(console.error);
