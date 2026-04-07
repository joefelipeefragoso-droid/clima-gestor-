const getDb = require('./database');

async function migrate_servicos() {
  const db = await getDb();
  
  try {
    // 1. Tabela Base de Serviços (Cadastro Centralizado)
    await db.run(`
      CREATE TABLE IF NOT EXISTS servicos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        categoria TEXT,
        valor_padrao REAL DEFAULT 0,
        observacoes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabela servicos base pronta.');

    // 2. Tabela Intermediária (Relacionamento Orçamento <-> Serviços para o PDF duplo)
    await db.run(`
      CREATE TABLE IF NOT EXISTS orcamento_servicos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orcamento_id INTEGER,
        servico_id INTEGER,
        descricao TEXT,
        quantidade INTEGER DEFAULT 1,
        valor_unitario REAL,
        valor_total REAL,
        FOREIGN KEY (orcamento_id) REFERENCES orcamentos (id)
      )
    `);
    console.log('Tabela orcamento_servicos pronta.');

  } catch (err) {
    console.error('Migration error:', err.message);
  }
  
  await db.close();
  console.log('Migration finished!');
}

migrate_servicos();
