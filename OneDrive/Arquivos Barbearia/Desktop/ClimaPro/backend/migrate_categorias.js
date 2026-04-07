const getDb = require('./database');

async function migrate() {
  const db = await getDb();
  
  try {
    console.log('1. Criando tabela de categorias...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_categoria TEXT NOT NULL,
        nicho TEXT NOT NULL,
        descricao TEXT,
        status TEXT DEFAULT 'ativo',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Injetar Nicho Ar-Condicionado
    const catsAr = [
        'Instalação', 'Higienização', 'Manutenção preventiva', 'Manutenção corretiva',
        'Infraestrutura', 'Elétrica', 'Peças e reposição', 'Desinstalação e remanejamento'
    ];
    for (const c of catsAr) {
        await db.run("INSERT INTO categorias (nome_categoria, nicho) SELECT ?, ? WHERE NOT EXISTS(SELECT 1 FROM categorias WHERE nome_categoria = ? AND nicho = ?)", [c, 'Ar-condicionado', c, 'Ar-condicionado']);
    }

    // Injetar Nicho CFTV
    const catsSeg = [
        'Câmeras', 'CFTV / DVR', 'Cerca elétrica', 'Alarmes', 'Sensores', 
        'Interfones', 'Vídeo porteiro', 'Configuração e acesso remoto', 'Manutenção técnica', 'Passagem de cabos'
    ];
    for (const c of catsSeg) {
        await db.run("INSERT INTO categorias (nome_categoria, nicho) SELECT ?, ? WHERE NOT EXISTS(SELECT 1 FROM categorias WHERE nome_categoria = ? AND nicho = ?)", [c, 'Segurança eletrônica', c, 'Segurança eletrônica']);
    }

    console.log('2. Alterando tabela servicos...');
    try { await db.run(`ALTER TABLE servicos ADD COLUMN nicho TEXT DEFAULT 'Geral'`); } catch(e){}
    try { await db.run(`ALTER TABLE servicos ADD COLUMN categoria TEXT DEFAULT 'Geral'`); } catch(e){}

    console.log('3. Alterando tabela materiais...');
    try { await db.run(`ALTER TABLE materiais ADD COLUMN nicho TEXT DEFAULT 'Geral'`); } catch(e){}
    try { await db.run(`ALTER TABLE materiais ADD COLUMN categoria TEXT DEFAULT 'Geral'`); } catch(e){}
    
    // Atualizar registros legados na marra p/ evitar crash de listagem (se estiverem NULL)
    await db.run("UPDATE servicos SET nicho='Geral', categoria='Geral' WHERE nicho IS NULL");
    await db.run("UPDATE materiais SET nicho='Geral', categoria='Geral' WHERE nicho IS NULL");

    console.log('Migração de Categorias finalizada com sucesso!');
  } catch (err) {
    console.error('Erro na migração:', err.message);
  }
  
  await db.close();
}

migrate();
