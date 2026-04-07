const getDb = require('./database');

async function migrate_professional() {
  const db = await getDb();
  
  try {
    console.log('Iniciando migração profissional...');

    // Adicionando novos campos à tabela orcamentos
    const columns = [
      { name: 'status_servico', type: 'TEXT DEFAULT "Aguardando aprovação"' },
      { name: 'data_execucao', type: 'TEXT' },
      { name: 'aprovado_cliente', type: 'TEXT DEFAULT "Não"' },
      { name: 'tipo_documento', type: 'TEXT DEFAULT "ORÇAMENTO"' },
      { name: 'descricao_detalhada', type: 'TEXT' },
      { name: 'tecnico_responsavel', type: 'TEXT' }
    ];

    for (const col of columns) {
      try {
        await db.run(`ALTER TABLE orcamentos ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Coluna ${col.name} adicionada.`);
      } catch (e) {
        console.log(`Coluna ${col.name} já existe ou erro: ${e.message}`);
      }
    }

    console.log('Migração concluída com sucesso!');
  } catch (err) {
    console.error('Erro na migração:', err.message);
  } finally {
    await db.close();
  }
}

migrate_professional();
