const db = require('./database');

async function testInsert() {
  try {
    const d = await db();
    const nome = 'Teste Antigravity';
    const telefone = '123';
    const whatsapp = '456';
    const cpf_cnpj = '789';
    const endereco = 'rua 1';
    const bairro = 'bairro 1';
    const cidade = 'cidade 1';
    const observacoes = 'obs 1';
    
    const result = await d.run(
      'INSERT INTO clientes (nome, telefone, whatsapp, cpf_cnpj, endereco, bairro, cidade, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nome, telefone, whatsapp, cpf_cnpj, endereco, bairro, cidade, observacoes]
    );
    console.log('Insert success, ID:', result.lastID);
  } catch (err) {
    console.error('Insert FAILED:', err.message);
  }
}

testInsert();
