const db = require('./database');

async function testUpdate() {
  try {
    const d = await db();
    const id = 1; // Assuming ID 1 exists
    const nome = 'Teste Update Antigravity';
    const telefone = '123';
    const whatsapp = '456';
    const cpf_cnpj = '789';
    const endereco = 'rua 1';
    const bairro = 'bairro 1';
    const cidade = 'cidade 1';
    const observacoes = 'obs 1';
    
    await d.run(
      'UPDATE clientes SET nome = ?, telefone = ?, whatsapp = ?, cpf_cnpj = ?, endereco = ?, bairro = ?, cidade = ?, observacoes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [nome, telefone, whatsapp, cpf_cnpj, endereco, bairro, cidade, observacoes, id]
    );
    console.log('Update success, ID:', id);
  } catch (err) {
    console.error('Update FAILED:', err.message);
  }
}

testUpdate();
