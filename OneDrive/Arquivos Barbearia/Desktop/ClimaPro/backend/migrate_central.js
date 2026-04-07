const getDb = require('./database');

async function migrate_central() {
  const db = await getDb();
  
  try {
    // 1. Tabela Gastos
    await db.run(`
      CREATE TABLE IF NOT EXISTS gastos_orcamento (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orcamento_id INTEGER,
        descricao TEXT,
        categoria TEXT,
        valor REAL,
        data DATETIME,
        observacao TEXT,
        FOREIGN KEY (orcamento_id) REFERENCES orcamentos (id)
      )
    `);
    console.log('Tabela gastos pronta.');

    // 2. Tabela Lembretes
    await db.run(`
      CREATE TABLE IF NOT EXISTS lembretes_orcamento (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orcamento_id INTEGER,
        status TEXT,
        data_lembrete TEXT,
        hora_lembrete TEXT,
        observacao TEXT,
        FOREIGN KEY (orcamento_id) REFERENCES orcamentos (id)
      )
    `);
    console.log('Tabela lembretes pronta.');

    // 3. Tabela Fotos
    await db.run(`
      CREATE TABLE IF NOT EXISTS fotos_orcamento (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orcamento_id INTEGER,
        url TEXT,
        descricao TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (orcamento_id) REFERENCES orcamentos (id)
      )
    `);
    console.log('Tabela fotos pronta.');

    // 4. Update orcamentos: Add dias_garantia (we used to have 'garantia' text but we can add dias_garantia int)
    try {
        await db.run(`ALTER TABLE orcamentos ADD COLUMN dias_garantia INTEGER DEFAULT 30`);
        console.log('Coluna dias_garantia adicionada com sucesso.');
    } catch(e) { /* might exist */ }
    
    // We already have 'status'. I'll add 'etapa_orcamento' just in case to decouple logic.
    try {
        await db.run(`ALTER TABLE orcamentos ADD COLUMN etapa_orcamento TEXT DEFAULT 'novo'`);
        console.log('Coluna etapa_orcamento adicionada com sucesso.');
    } catch(e) { /* might exist */ }

    // Add totals logic purely for caching or analytical reasons? The user asked for total_servicos, etc. 
    try { await db.run(`ALTER TABLE orcamentos ADD COLUMN total_servicos REAL DEFAULT 0`); } catch(e) {}
    try { await db.run(`ALTER TABLE orcamentos ADD COLUMN total_materiais REAL DEFAULT 0`); } catch(e) {}
    try { await db.run(`ALTER TABLE orcamentos ADD COLUMN total_gastos REAL DEFAULT 0`); } catch(e) {}

  } catch (err) {
    console.error('Migration error:', err.message);
  }
  
  await db.close();
  console.log('Migration finished!');
}

migrate_central();
