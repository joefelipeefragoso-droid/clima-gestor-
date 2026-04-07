const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const getDb = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuração do multer para upload de logo
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'logo_' + Date.now() + ext);
  }
});
const upload = multer({ storage: storage });

// Configuração do multer para fotos do orçamento
const storageFotos = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/orcamentos/')
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'foto_' + Date.now() + ext);
  }
});
const uploadFotos = multer({ storage: storageFotos });

/* --- ROTAS: DASHBOARD --- */
app.get('/api/dashboard', async (req, res) => {
  const db = await getDb();
  try {
    const totalClientes = await db.get('SELECT COUNT(*) as total FROM clientes');
    const totalAgendamentosHoje = await db.get("SELECT COUNT(*) as total FROM agendamentos WHERE data = date('now')");
    
    // Orçamentos do mês atual
    const mesAtual = new Date().toISOString().substring(0, 7); // YYYY-MM
    const orcamentosMes = await db.get("SELECT COUNT(*) as total, SUM(valor_total) as valor FROM orcamentos WHERE data_emissao LIKE ?", [`${mesAtual}%`]);
    
    // Group by status
    const statusOrcamentos = await db.all("SELECT status, COUNT(*) as quantidade FROM orcamentos GROUP BY status");
    
    // Resumo para as listas do dashboard
    const ultimosClientes = await db.all("SELECT id, nome, telefone, created_at FROM clientes ORDER BY created_at DESC LIMIT 5");
    const proximosAgendamentos = await db.all(`
      SELECT a.id, a.data, a.hora, a.status, a.tipo_servico, c.nome as cliente_nome
      FROM agendamentos a 
      LEFT JOIN clientes c ON a.cliente_id = c.id
      WHERE a.data >= date('now')
      ORDER BY a.data ASC, a.hora ASC LIMIT 5
    `);

    res.json({
      totalClientes: totalClientes.total || 0,
      totalAgendamentosHoje: totalAgendamentosHoje.total || 0,
      orcamentosMes: orcamentosMes.total || 0,
      valorOrcamentosMes: orcamentosMes.valor || 0,
      statusOrcamentos,
      ultimosClientes,
      proximosAgendamentos
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* --- ROTAS: CONFIGURAÇÕES EMPRESA --- */
app.get('/api/config', async (req, res) => {
  const db = await getDb();
  let config = await db.get('SELECT * FROM empresa_config LIMIT 1');
  if(!config){
    await db.run('INSERT INTO empresa_config (nome_empresa) VALUES (?)', ['Empresa Padrão']);
    config = await db.get('SELECT * FROM empresa_config LIMIT 1');
  }
  res.json(config);
});

app.put('/api/config', upload.single('logo'), async (req, res) => {
  try {
    const db = await getDb();
    const { nome_empresa, cnpj, telefone, email, endereco, cidade, rodape_pdf } = req.body;
    
    let updateFields = ['nome_empresa = ?', 'cnpj = ?', 'telefone = ?', 'email = ?', 'endereco = ?', 'cidade = ?', 'rodape_pdf = ?', 'updated_at = CURRENT_TIMESTAMP'];
    let updateValues = [nome_empresa, cnpj, telefone, email, endereco, cidade, rodape_pdf];
    
    if (req.file) {
      updateFields.push('logo_url = ?');
      updateValues.push('/uploads/' + req.file.filename);
    }
    
    const configIdQuery = await db.get('SELECT id FROM empresa_config LIMIT 1');
    const id = configIdQuery ? configIdQuery.id : 1;
    updateValues.push(id);
    
    const query = `UPDATE empresa_config SET ${updateFields.join(', ')} WHERE id = ?`;
    await db.run(query, updateValues);
    
    const updatedConfig = await db.get('SELECT * FROM empresa_config LIMIT 1');
    res.json(updatedConfig);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* --- ROTAS: CLIENTES --- */
app.get('/api/clientes', async (req, res) => {
  const db = await getDb();
  const search = req.query.search;
  let query = 'SELECT * FROM clientes ORDER BY criacao_hack DESC';
  let params = [];
  
  // Usando um hack simples de order porque criamos created_at, mas SQLite converte datas localmente...
  query = 'SELECT * FROM clientes ORDER BY id DESC';
  
  if (search) {
     query = 'SELECT * FROM clientes WHERE nome LIKE ? OR telefone LIKE ? OR cpf_cnpj LIKE ? ORDER BY id DESC';
     params = [`%${search}%`, `%${search}%`, `%${search}%`];
  }
  const clientes = await db.all(query, params);
  res.json(clientes);
});

app.get('/api/clientes/:id', async (req, res) => {
  const db = await getDb();
  const cliente = await db.get('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
  res.json(cliente || {});
});

app.post('/api/clientes', async (req, res) => {
  try {
    const db = await getDb();
    const { nome, telefone, whatsapp, cpf_cnpj, endereco, bairro, cidade, observacoes } = req.body;
    const result = await db.run(
      'INSERT INTO clientes (nome, telefone, whatsapp, cpf_cnpj, endereco, bairro, cidade, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nome, telefone, whatsapp, cpf_cnpj, endereco, bairro, cidade, observacoes]
    );
    res.json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clientes/:id', async (req, res) => {
   try {
     const db = await getDb();
     const { id } = req.params;
     const { nome, telefone, whatsapp, cpf_cnpj, endereco, bairro, cidade, observacoes } = req.body;
     await db.run(
       'UPDATE clientes SET nome = ?, telefone = ?, whatsapp = ?, cpf_cnpj = ?, endereco = ?, bairro = ?, cidade = ?, observacoes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
       [nome, telefone, whatsapp, cpf_cnpj, endereco, bairro, cidade, observacoes, id]
     );
     res.json({ id });
   } catch (err) {
     res.status(500).json({ error: err.message });
   }
});

app.delete('/api/clientes/:id', async (req, res) => {
  const db = await getDb();
  await db.run('DELETE FROM clientes WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

/* --- ROTAS: AGENDAMENTOS --- */
app.get('/api/agendamentos', async (req, res) => {
  const db = await getDb();
  const agendamentos = await db.all(`
    SELECT a.*, c.nome as cliente_nome
    FROM agendamentos a
    LEFT JOIN clientes c ON a.cliente_id = c.id
    ORDER BY a.data ASC, a.hora ASC
  `);
  res.json(agendamentos);
});

app.post('/api/agendamentos', async (req, res) => {
  try {
    const db = await getDb();
    const { cliente_id, telefone, endereco, data, hora, tipo_servico, tecnico_responsavel, observacoes, status } = req.body;
    const result = await db.run(
      'INSERT INTO agendamentos (cliente_id, telefone, endereco, data, hora, tipo_servico, tecnico_responsavel, observacoes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [cliente_id, telefone, endereco, data, hora, tipo_servico, tecnico_responsavel, observacoes, status || 'agendado']
    );
    res.json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/agendamentos/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { cliente_id, telefone, endereco, data, hora, tipo_servico, tecnico_responsavel, observacoes, status } = req.body;
    await db.run(
      'UPDATE agendamentos SET cliente_id=?, telefone=?, endereco=?, data=?, hora=?, tipo_servico=?, tecnico_responsavel=?, observacoes=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [cliente_id, telefone, endereco, data, hora, tipo_servico, tecnico_responsavel, observacoes, status, req.params.id]
    );
    res.json({ id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/agendamentos/:id', async (req, res) => {
  const db = await getDb();
  await db.run('DELETE FROM agendamentos WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

/* --- ROTAS: CATEGORIAS --- */
app.get('/api/categorias', async (req, res) => {
  const db = await getDb();
  const { nicho } = req.query;
  let query = 'SELECT * FROM categorias ORDER BY nome_categoria ASC';
  let params = [];
  if (nicho) {
     query = 'SELECT * FROM categorias WHERE nicho = ? ORDER BY nome_categoria ASC';
     params = [nicho];
  }
  const categorias = await db.all(query, params);
  res.json(categorias);
});

app.post('/api/categorias', async (req, res) => {
  try {
    const db = await getDb();
    const { nome_categoria, nicho, descricao, status } = req.body;
    const result = await db.run(
      'INSERT INTO categorias (nome_categoria, nicho, descricao, status) VALUES (?, ?, ?, ?)',
      [nome_categoria, nicho || 'Geral', descricao, status || 'ativo']
    );
    res.json({ id: result.lastID });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/categorias/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { nome_categoria, nicho, descricao, status } = req.body;
    await db.run(
      'UPDATE categorias SET nome_categoria=?, nicho=?, descricao=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [nome_categoria, nicho, descricao, status, req.params.id]
    );
    res.json({ id: req.params.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/categorias/:id', async (req, res) => {
  const db = await getDb();
  await db.run('DELETE FROM categorias WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

/* --- ROTAS: MATERIAIS --- */
app.get('/api/materiais', async (req, res) => {
  const db = await getDb();
  const { search, nicho, categoria } = req.query;
  let query = 'SELECT * FROM materiais WHERE 1=1';
  let params = [];
  
  if (nicho) { query += ' AND nicho = ?'; params.push(nicho); }
  if (categoria) { query += ' AND categoria = ?'; params.push(categoria); }
  if (search) {
     query += ' AND (nome LIKE ? OR categoria LIKE ?)';
     params.push(`%${search}%`); params.push(`%${search}%`);
  }
  query += ' ORDER BY nome ASC';
  const materiais = await db.all(query, params);
  res.json(materiais);
});

app.post('/api/materiais', async (req, res) => {
  try {
    const db = await getDb();
    const { nome, nicho, categoria, unidade, quantidade_estoque, valor_custo, valor_venda, observacoes } = req.body;
    const result = await db.run(
      'INSERT INTO materiais (nome, nicho, categoria, unidade, quantidade_estoque, valor_custo, valor_venda, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nome, nicho || 'Geral', categoria || 'Geral', unidade, quantidade_estoque || 0, valor_custo || 0, valor_venda || 0, observacoes]
    );
    res.json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/materiais/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { nome, nicho, categoria, unidade, quantidade_estoque, valor_custo, valor_venda, observacoes } = req.body;
    await db.run(
      'UPDATE materiais SET nome=?, nicho=?, categoria=?, unidade=?, quantidade_estoque=?, valor_custo=?, valor_venda=?, observacoes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [nome, nicho || 'Geral', categoria || 'Geral', unidade, quantidade_estoque || 0, valor_custo || 0, valor_venda || 0, observacoes, req.params.id]
    );
    res.json({ id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/materiais/:id', async (req, res) => {
  const db = await getDb();
  await db.run('DELETE FROM materiais WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

/* --- ROTAS: SERVICOS BASE --- */
app.get('/api/servicos', async (req, res) => {
  const db = await getDb();
  const { search, nicho, categoria } = req.query;
  let query = 'SELECT * FROM servicos WHERE 1=1';
  let params = [];
  
  if (nicho) { query += ' AND nicho = ?'; params.push(nicho); }
  if (categoria) { query += ' AND categoria = ?'; params.push(categoria); }
  if (search) {
     query += ' AND (nome LIKE ? OR categoria LIKE ?)';
     params.push(`%${search}%`); params.push(`%${search}%`);
  }
  query += ' ORDER BY nome ASC';
  const items = await db.all(query, params);
  res.json(items);
});

app.post('/api/servicos', async (req, res) => {
  try {
    const db = await getDb();
    const { nome, nicho, descricao, categoria, valor_padrao, observacoes } = req.body;
    const result = await db.run(
      'INSERT INTO servicos (nome, nicho, descricao, categoria, valor_padrao, observacoes) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, nicho || 'Geral', descricao, categoria || 'Geral', valor_padrao || 0, observacoes]
    );
    res.json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/servicos/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { nome, nicho, descricao, categoria, valor_padrao, observacoes } = req.body;
    await db.run(
      'UPDATE servicos SET nome=?, nicho=?, descricao=?, categoria=?, valor_padrao=?, observacoes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [nome, nicho || 'Geral', descricao, categoria || 'Geral', valor_padrao || 0, observacoes, req.params.id]
    );
    res.json({ id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/servicos/:id', async (req, res) => {
  const db = await getDb();
  await db.run('DELETE FROM servicos WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

/* --- ROTAS: ORÇAMENTOS --- */
app.get('/api/orcamentos', async (req, res) => {
  const db = await getDb();
  const { status, search } = req.query;
  
  let query = `
    SELECT o.*, c.nome as cliente_nome
    FROM orcamentos o
    LEFT JOIN clientes c ON o.cliente_id = c.id
    WHERE 1=1
  `;
  let params = [];
  
  if (status) {
    query += ` AND o.status = ?`;
    params.push(status);
  }
  
  if (search) {
    query += ` AND (c.nome LIKE ? OR o.numero_orcamento LIKE ? OR c.telefone LIKE ?)`;
    params.push(`%${search}%`);
    params.push(`%${search}%`);
    params.push(`%${search}%`);
  }
  
  query += ` ORDER BY o.id DESC`;
  
  const orcamentos = await db.all(query, params);
  res.json(orcamentos);
});

app.get('/api/orcamentos/:id', async (req, res) => {
  const db = await getDb();
  const orcamento = await db.get(`
    SELECT o.*, c.nome as cliente_nome, c.telefone as cliente_telefone, c.endereco as cliente_endereco, c.cpf_cnpj as cliente_cpf
    FROM orcamentos o
    LEFT JOIN clientes c ON o.cliente_id = c.id
    WHERE o.id = ?
  `, [req.params.id]);
  
  if (orcamento) {
    const itens = await db.all('SELECT *, nicho as nicho_filtro, categoria as categoria_filtro FROM orcamento_itens WHERE orcamento_id = ?', [req.params.id]);
    const servicos = await db.all('SELECT *, nicho as nicho_filtro, categoria as categoria_filtro FROM orcamento_servicos WHERE orcamento_id = ?', [req.params.id]);
    orcamento.itens = itens;
    orcamento.servicos = servicos;
  }
  res.json(orcamento || {});
});

app.post('/api/orcamentos', async (req, res) => {
  try {
    const db = await getDb();
    const { cliente_id, data_emissao, descricao_servico, mao_de_obra, deslocamento, desconto, valor_total, validade, observacoes, status, itens, tipo_servico, capacidade_equipamento, local_instalacao, prazo_execucao, forma_pagamento, garantia, status_servico, data_execucao, aprovado_cliente, tipo_documento, descricao_detalhada, tecnico_responsavel } = req.body;
    
    // Gerar um número de orçamento incremental simples
    const lastNum = await db.get('SELECT MAX(numero_orcamento) as m FROM orcamentos');
    const numero_orcamento = (lastNum && lastNum.m ? lastNum.m : 1000) + 1;
    
    const result = await db.run(
      'INSERT INTO orcamentos (numero_orcamento, cliente_id, data_emissao, descricao_servico, mao_de_obra, deslocamento, desconto, valor_total, validade, observacoes, status, tipo_servico, capacidade_equipamento, local_instalacao, prazo_execucao, forma_pagamento, garantia, status_servico, data_execucao, aprovado_cliente, tipo_documento, descricao_detalhada, tecnico_responsavel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [numero_orcamento, cliente_id, data_emissao, descricao_servico, mao_de_obra || 0, deslocamento || 0, desconto || 0, valor_total || 0, validade, observacoes, status || 'em aberto', tipo_servico, capacidade_equipamento, local_instalacao, prazo_execucao, forma_pagamento, garantia, status_servico, data_execucao, aprovado_cliente, tipo_documento, descricao_detalhada, tecnico_responsavel]
    );
    
    const orcamento_id = result.lastID;
    
    // Insert itens
    if (itens && itens.length > 0) {
      for (let item of itens) {
        await db.run(
          'INSERT INTO orcamento_itens (orcamento_id, material_id, descricao, quantidade, valor_unitario, valor_total, nicho, categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [orcamento_id, item.material_id, item.descricao, item.quantidade, item.valor_unitario, item.valor_total, item.nicho_filtro || null, item.categoria_filtro || null]
        );
      }
    }
    
    // Insert servicos
    if (req.body.servicos && req.body.servicos.length > 0) {
      for (let s of req.body.servicos) {
        await db.run(
          'INSERT INTO orcamento_servicos (orcamento_id, servico_id, descricao, quantidade, valor_unitario, valor_total, nicho, categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [orcamento_id, s.servico_id, s.descricao, s.quantidade, s.valor_unitario, s.valor_total, s.nicho_filtro || null, s.categoria_filtro || null]
        );
      }
    }
    
    res.json({ id: orcamento_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orcamentos/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { cliente_id, data_emissao, descricao_servico, mao_de_obra, deslocamento, desconto, valor_total, validade, observacoes, status, itens, tipo_servico, capacidade_equipamento, local_instalacao, prazo_execucao, forma_pagamento, garantia, status_servico, data_execucao, aprovado_cliente, tipo_documento, descricao_detalhada, tecnico_responsavel } = req.body;
    const orcamento_id = req.params.id;
    
    await db.run(
      'UPDATE orcamentos SET cliente_id=?, data_emissao=?, descricao_servico=?, mao_de_obra=?, deslocamento=?, desconto=?, valor_total=?, validade=?, observacoes=?, status=?, tipo_servico=?, capacidade_equipamento=?, local_instalacao=?, prazo_execucao=?, forma_pagamento=?, garantia=?, status_servico=?, data_execucao=?, aprovado_cliente=?, tipo_documento=?, descricao_detalhada=?, tecnico_responsavel=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [cliente_id, data_emissao, descricao_servico, mao_de_obra || 0, deslocamento || 0, desconto || 0, valor_total || 0, validade, observacoes, status, tipo_servico, capacidade_equipamento, local_instalacao, prazo_execucao, forma_pagamento, garantia, status_servico, data_execucao, aprovado_cliente, tipo_documento, descricao_detalhada, tecnico_responsavel, orcamento_id]
    );

    // Simplest way to update itens: delete all and recreate
    await db.run('DELETE FROM orcamento_itens WHERE orcamento_id = ?', [orcamento_id]);
    if (itens && itens.length > 0) {
      for (let item of itens) {
         await db.run(
          'INSERT INTO orcamento_itens (orcamento_id, material_id, descricao, quantidade, valor_unitario, valor_total, nicho, categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [orcamento_id, item.material_id, item.descricao, item.quantidade, item.valor_unitario, item.valor_total, item.nicho_filtro || null, item.categoria_filtro || null]
        );
      }
    }
    
    // Update servicos similarly
    await db.run('DELETE FROM orcamento_servicos WHERE orcamento_id = ?', [orcamento_id]);
    if (req.body.servicos && req.body.servicos.length > 0) {
      for (let s of req.body.servicos) {
         await db.run(
          'INSERT INTO orcamento_servicos (orcamento_id, servico_id, descricao, quantidade, valor_unitario, valor_total, nicho, categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [orcamento_id, s.servico_id, s.descricao, s.quantidade, s.valor_unitario, s.valor_total, s.nicho_filtro || null, s.categoria_filtro || null]
        );
      }
    }
    
    res.json({ id: orcamento_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/orcamentos/:id', async (req, res) => {
  const db = await getDb();
  await db.run('DELETE FROM orcamento_itens WHERE orcamento_id = ?', [req.params.id]);
  await db.run('DELETE FROM orcamentos WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

app.put('/api/orcamentos/:id/status', async (req, res) => {
  try {
    const db = await getDb();
    const { status } = req.body;
    const { id } = req.params;
    // Sincroniza ambos os campos para evitar confusão entre lista e detalhes
    await db.run('UPDATE orcamentos SET status = ?, etapa_orcamento = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, status, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* --- ROTAS: MICRO-ERP (ORÇAMENTO DETALHADO) --- */
app.get('/api/orcamentos/:id/detalhada', async (req, res) => {
  const db = await getDb();
  const orcId = req.params.id;
  try {
    const orcamento = await db.get(`
      SELECT o.*, c.nome as cliente_nome, c.telefone as cliente_telefone, c.endereco as cliente_endereco, c.cpf_cnpj as cliente_cpf, c.observacoes as cliente_obs
      FROM orcamentos o
      LEFT JOIN clientes c ON o.cliente_id = c.id
      WHERE o.id = ?
    `, [orcId]);
    
    if (!orcamento) return res.status(404).json({error: 'Not found'});

    orcamento.itens = await db.all('SELECT * FROM orcamento_itens WHERE orcamento_id = ?', [orcId]);
    orcamento.servicos = await db.all('SELECT * FROM orcamento_servicos WHERE orcamento_id = ?', [orcId]);
    orcamento.gastos = await db.all('SELECT * FROM gastos_orcamento WHERE orcamento_id = ? ORDER BY data DESC', [orcId]);
    orcamento.lembretes = await db.all('SELECT * FROM lembretes_orcamento WHERE orcamento_id = ?', [orcId]);
    orcamento.fotos = await db.all('SELECT * FROM fotos_orcamento WHERE orcamento_id = ? ORDER BY created_at DESC', [orcId]);
    
    res.json(orcamento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orcamentos/:id/base', async (req, res) => {
  try {
    const db = await getDb();
    const orcId = req.params.id;
    const { cliente_id, data_emissao, etapa_orcamento, dias_garantia, observacoes, valor_total, total_servicos, total_materiais, total_gastos, status_servico, data_execucao, aprovado_cliente, tipo_documento, descricao_detalhada, tecnico_responsavel, forma_pagamento } = req.body;
    
    await db.run(
      `UPDATE orcamentos SET 
       cliente_id=?, data_emissao=?, etapa_orcamento=?, status=?, dias_garantia=?, observacoes=?, 
       valor_total=?, total_servicos=?, total_materiais=?, total_gastos=?, status_servico=?, data_execucao=?, 
       aprovado_cliente=?, tipo_documento=?, descricao_detalhada=?, tecnico_responsavel=?, forma_pagamento=?, updated_at=CURRENT_TIMESTAMP 
       WHERE id=?`,
      [cliente_id, data_emissao, etapa_orcamento, etapa_orcamento, dias_garantia, observacoes, valor_total, total_servicos, total_materiais, total_gastos, status_servico, data_execucao, aprovado_cliente, tipo_documento, descricao_detalhada, tecnico_responsavel, forma_pagamento, orcId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orcamentos/:id/gastos', async (req, res) => {
  try {
    const db = await getDb();
    const { descricao, categoria, valor, data, observacao } = req.body;
    const result = await db.run(
      'INSERT INTO gastos_orcamento (orcamento_id, descricao, categoria, valor, data, observacao) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.id, descricao, categoria, valor, data, observacao]
    );
    res.json({ id: result.lastID });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/gastos/:id', async (req, res) => {
  const db = await getDb();
  await db.run('DELETE FROM gastos_orcamento WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

app.post('/api/orcamentos/:id/lembretes', async (req, res) => {
  try {
    const db = await getDb();
    const { status, data_lembrete, hora_lembrete, observacao } = req.body;
    const result = await db.run(
      'INSERT INTO lembretes_orcamento (orcamento_id, status, data_lembrete, hora_lembrete, observacao) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, status || 'pendente', data_lembrete, hora_lembrete, observacao]
    );
    res.json({ id: result.lastID });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/lembretes/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('UPDATE lembretes_orcamento SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orcamentos/:id/fotos', uploadFotos.single('foto'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({error: 'Nenhum arquivo.'});
    const db = await getDb();
    const url = '/uploads/orcamentos/' + req.file.filename;
    const descricao = req.body.descricao || '';
    const result = await db.run(
      'INSERT INTO fotos_orcamento (orcamento_id, url, descricao) VALUES (?, ?, ?)',
      [req.params.id, url, descricao]
    );
    res.json({ id: result.lastID, url });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/fotos/:id', async (req, res) => {
  const db = await getDb();
  await db.run('DELETE FROM fotos_orcamento WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

app.post('/api/orcamentos/:id/duplicar', async (req, res) => {
  try {
    const db = await getDb();
    const oldId = req.params.id;
    
    const o = await db.get('SELECT * FROM orcamentos WHERE id = ?', [oldId]);
    if(!o) return res.status(404).json({error: 'Orçamento não encontrado.'});
    
    const lastNum = await db.get('SELECT MAX(numero_orcamento) as m FROM orcamentos');
    const newNum = (lastNum && lastNum.m ? lastNum.m : 1000) + 1;
    
    // Inserir base clonada
    const resBase = await db.run(
      `INSERT INTO orcamentos 
       (numero_orcamento, cliente_id, data_emissao, descricao_servico, mao_de_obra, deslocamento, desconto, valor_total, validade, observacoes, status, tipo_servico, capacidade_equipamento, local_instalacao, prazo_execucao, forma_pagamento, garantia, dias_garantia, etapa_orcamento, total_servicos, total_materiais, total_gastos)
       VALUES (?, ?, date('now'), ?, ?, ?, ?, ?, ?, ?, 'em aberto', ?, ?, ?, ?, ?, ?, ?, 'novo', ?, ?, ?)`,
      [newNum, o.cliente_id, 
       o.descricao_servico, o.mao_de_obra, o.deslocamento, o.desconto, o.valor_total, o.validade, o.observacoes, 
       o.tipo_servico, o.capacidade_equipamento, o.local_instalacao, o.prazo_execucao, o.forma_pagamento, o.garantia, o.dias_garantia, o.total_servicos, o.total_materiais, o.total_gastos]
    );
    
    const newId = resBase.lastID;
    
    // Duplicar Materiais
    const itens = await db.all('SELECT * FROM orcamento_itens WHERE orcamento_id = ?', [oldId]);
    for(let it of itens) {
       await db.run('INSERT INTO orcamento_itens (orcamento_id, material_id, descricao, quantidade, valor_unitario, valor_total) VALUES (?, ?, ?, ?, ?, ?)',
       [newId, it.material_id, it.descricao, it.quantidade, it.valor_unitario, it.valor_total]);
    }
    
    // Duplicar Servicos
    const servicos = await db.all('SELECT * FROM orcamento_servicos WHERE orcamento_id = ?', [oldId]);
    for(let s of servicos) {
       await db.run('INSERT INTO orcamento_servicos (orcamento_id, servico_id, descricao, quantidade, valor_unitario, valor_total) VALUES (?, ?, ?, ?, ?, ?)',
       [newId, s.servico_id, s.descricao, s.quantidade, s.valor_unitario, s.valor_total]);
    }
    
    // (Não duplica gastos nem lembretes conforme requisito, ou se quiser duplicar tudo, faria o mesmo loop)
    
    res.json({ id: newId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
