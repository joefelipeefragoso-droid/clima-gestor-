const getDb = require('./database');

async function migrate() {
  const db = await getDb();
  const columnsToAdd = [
    'tipo_servico TEXT',
    'capacidade_equipamento TEXT',
    'local_instalacao TEXT',
    'prazo_execucao TEXT',
    'forma_pagamento TEXT',
    'garantia TEXT'
  ];

  for (const col of columnsToAdd) {
    try {
      await db.run(`ALTER TABLE orcamentos ADD COLUMN ${col}`);
      console.log(`Column added: ${col}`);
    } catch (err) {
      if (err.message.includes('duplicate column name')) {
         console.log(`Column already exists: ${col}`);
      } else {
         console.error(`Error adding column ${col}:`, err.message);
      }
    }
  }
  
  await db.close();
  console.log('Migration finished!');
}

migrate();
