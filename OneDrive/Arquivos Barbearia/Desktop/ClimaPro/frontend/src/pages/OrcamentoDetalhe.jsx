import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { 
  ArrowLeft, FileText, User, Wrench, Package, 
  DollarSign, Clock, Shield, Image as ImageIcon, Copy,
  Save, PlusCircle, Trash2, CheckCircle
} from 'lucide-react';
import { generateOrcamentoPDF } from '../utils/pdfHelper';
import { flattenImage } from '../utils/imageUtils';
import StatusDropdown from '../components/StatusDropdown';

export default function OrcamentoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('resumo');
  const [loading, setLoading] = useState(true);
  
  // Dados Mestre do Orçamento
  const [orcamento, setOrcamento] = useState(null);
  
  // Dicionários para Auxílio
  const [clientes, setClientes] = useState([]);
  const [servicosBase, setServicosBase] = useState([]);
  const [materiaisBase, setMateriaisBase] = useState([]);
  const [categoriasMestre, setCategoriasMestre] = useState([]);
  const [config, setConfig] = useState(null);
  
  // Formulários Temporários das Abas
  const [baseForm, setBaseForm] = useState({ 
    cliente_id: '', 
    etapa_orcamento: 'novo', 
    observacoes: '', 
    dias_garantia: 30, 
    data_emissao: '',
    tipo_documento: 'ORÇAMENTO',
    status_servico: 'Aguardando aprovação',
    data_execucao: '',
    aprovado_cliente: 'Não',
    forma_pagamento: 'Pix',
    tecnico_responsavel: '',
    descricao_detalhada: '',
    desconto: 0
  });
  const [servicosForm, setServicosForm] = useState([]);
  const [materiaisForm, setMateriaisForm] = useState([]);
  const [gastosForm, setGastosForm] = useState([]);
  const [lembretesForm, setLembretesForm] = useState([]);
  const [fotosForm, setFotosForm] = useState([]);

  useEffect(() => {
    loadMestres();
  }, [id]);

  const loadMestres = async () => {
    setLoading(true);
    try {
      // Carregar Auxiliares
      const [resCli, resServ, resMat, resConf, resCat] = await Promise.all([
        api.get('/clientes'),
        api.get('/servicos'),
        api.get('/materiais'),
        api.get('/config'),
        api.get('/categorias')
      ]);
      setClientes(resCli.data);
      setServicosBase(resServ.data);
      setMateriaisBase(resMat.data);
      setConfig(resConf.data);
      setCategoriasMestre(resCat.data);

      if (id === 'novo') {
        const hHoje = new Date().toISOString().split('T')[0];
        setBaseForm({ 
          cliente_id: '', 
          etapa_orcamento: 'novo', 
          observacoes: '', 
          dias_garantia: 30, 
          data_emissao: hHoje,
          tipo_documento: 'ORÇAMENTO',
          status_servico: 'Aguardando aprovação',
          data_execucao: hHoje,
          aprovado_cliente: 'Não',
          forma_pagamento: 'Pix',
          tecnico_responsavel: '',
          descricao_detalhada: '',
          desconto: 0
        });
        setOrcamento({ numero_orcamento: 'TBD', total_servicos: 0, total_materiais: 0, total_gastos: 0, valor_total: 0 });
      } else {
        const resOrc = await api.get(`/orcamentos/${id}/detalhada`);
        const item = resOrc.data;
        setOrcamento(item);
        setBaseForm({
            cliente_id: item.cliente_id || '',
            etapa_orcamento: item.etapa_orcamento || 'novo',
            observacoes: item.observacoes || '',
            dias_garantia: item.dias_garantia || 30,
            data_emissao: item.data_emissao || new Date().toISOString().split('T')[0],
            tipo_documento: item.tipo_documento || 'ORÇAMENTO',
            status_servico: item.status_servico || 'Aguardando aprovação',
            data_execucao: item.data_execucao || '',
            aprovado_cliente: item.aprovado_cliente || 'Não',
            forma_pagamento: item.forma_pagamento || 'Pix',
            tecnico_responsavel: item.tecnico_responsavel || '',
            descricao_detalhada: item.descricao_detalhada || '',
            desconto: item.desconto || 0
        });
        setServicosForm(item.servicos || []);
        setMateriaisForm(item.itens || []);
        setGastosForm(item.gastos || []);
        setLembretesForm(item.lembretes || []);
        setFotosForm(item.fotos || []);
      }
    } catch (err) {
      console.error(err);
      alert('Erro: ' + err.message + ' | ' + (err.response?.data?.error || '') + ' | URL: ' + err.config?.url);
      navigate('/orcamentos');
    } finally {
      setLoading(false);
    }
  };

  const formatBRL = (val) => {
    const num = isNaN(val) || val === '' || val === null ? 0 : Number(val);
    if (num < 0) return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(0);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };

  const recalcularTotais = () => {
    let tServ = servicosForm.reduce((acc, s) => acc + (Number(s.valor_total)||0), 0);
    let tMat = materiaisForm.reduce((acc, m) => acc + (Number(m.valor_total)||0), 0);
    let tGasto = gastosForm.reduce((acc, g) => acc + (Number(g.valor)||0), 0);
    let tDesc = Number(baseForm.desconto) || 0;
    
    let tGeral = (tServ + tMat) - tDesc; 
    
    return { tServ, tMat, tGasto, tDesc, tGeral };
  };

  // ---- SAVE MASTER ----
  const handleSaveMaster = async () => {
    try {
      const totais = recalcularTotais();
      const payloadBase = {
        ...baseForm,
        total_servicos: totais.tServ,
        total_materiais: totais.tMat,
        total_gastos: totais.tGasto,
        desconto: totais.tDesc,
        valor_total: totais.tGeral
      };

      if (id === 'novo') {
         // Create new
         const res = await api.post('/orcamentos', {
             ...payloadBase,
             status: baseForm.etapa_orcamento,
             itens: materiaisForm,
             servicos: servicosForm
         });
         alert('Orçamento criado com sucesso!');
         navigate(`/orcamento/${res.data.id}`);
      } else {
         // Aqui, idealmente salvamos TUDO na rota base para orcamentos com ID.
         // A rota PUT /api/orcamentos/:id/base atualiza as colunas novas
         await api.put(`/orcamentos/${id}/base`, payloadBase);
         
         // Mas também temos o PUT antigo /orcamentos/:id que limpa e salva Itens e Servicos.
         // Para simplificar e não refatorar 100% o ORM pesado anterior:
         await api.put(`/orcamentos/${id}`, {
             ...payloadBase,
             status: baseForm.etapa_orcamento,
             itens: materiaisForm,
             servicos: servicosForm
         });
         
         alert('Orçamento (Base, Mat. & Serv.) salvo com sucesso!');
         loadMestres();
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar');
    }
  };

  const handleDuplicar = async () => {
     if (id === 'novo') return;
     if(!window.confirm('Deseja realmente duplicar este projeto?')) return;
     try {
       const res = await api.post(`/orcamentos/${id}/duplicar`);
       alert('Projeto duplicado!');
       navigate(`/orcamento/${res.data.id}`);
     } catch(e) { alert('Erro ao duplicar: ' + e.response?.data?.error); }
  };

  const handleGerarPDF = () => {
     if(id === 'novo') return alert('Salve o orçamento antes de gerar.');
     const fullOrcamento = {
        ...orcamento,
        ...baseForm,
        itens: materiaisForm,
        servicos: servicosForm,
        mao_de_obra: servicosForm.reduce((acc, s) => acc + (Number(s.valor_total)||0), 0)
     };
     // Recuperar os dados completos do cliente a partir da lista baseada no baseForm.cliente_id
     const cli = clientes.find(c => c.id == baseForm.cliente_id);
     if(cli) {
        fullOrcamento.cliente_nome = cli.nome;
        fullOrcamento.cliente_telefone = cli.telefone;
        fullOrcamento.cliente_endereco = cli.endereco;
        fullOrcamento.cliente_cidade = cli.cidade;
     }

     generateOrcamentoPDF(fullOrcamento, config);
  };

  // ----- SUB ROTINAS PARA GASTOS, LEMBRETES E FOTOS -----
  
  // GASTOS
  const [novoGasto, setNovoGasto] = useState({descricao: '', categoria: 'deslocamento', valor: 0, data: new Date().toISOString().split('T')[0]});
  const handleAddGasto = async (e) => {
      e.preventDefault();
      if(id === 'novo') return alert('Salve o orçamento uma vez primeiro para habilitar Gastos.');
      try {
          await api.post(`/orcamentos/${id}/gastos`, novoGasto);
          setNovoGasto({descricao: '', categoria: 'deslocamento', valor: 0, data: new Date().toISOString().split('T')[0]});
          loadMestres();
      } catch(e) { console.error(e); }
  };
  const handleDeleteGasto = async (gid) => {
      if(!window.confirm('Tem certeza?')) return;
      await api.delete(`/gastos/${gid}`);
      loadMestres();
  };

  // FOTOS
  const [fotoFile, setFotoFile] = useState(null);
  const handleUploadFoto = async () => {
      if(id === 'novo') return alert('Salve primeiro');
      if(!fotoFile) return;
      
      try {
         // Processar imagem para remover transparência e garantir fundo branco
         const processedBlob = await flattenImage(fotoFile);
         
         const formData = new FormData();
         // Enviar como .jpg para o servidor
         formData.append('foto', processedBlob, 'foto.jpg');
         formData.append('descricao', 'Anexo');
         
         await api.post(`/orcamentos/${id}/fotos`, formData, {headers: { 'Content-Type': 'multipart/form-data' }});
         setFotoFile(null);
         loadMestres();
      } catch(e) { 
         console.error(e);
         alert('Erro ao subir foto'); 
      }
  };
  const handleDeleteFoto = async (fid) => {
      if(!window.confirm('Excluir?')) return;
      await api.delete(`/fotos/${fid}`);
      loadMestres();
  };

  // Helpers SERVIÇOS & MATERIAIS
  const addServico = () => setServicosForm([...servicosForm, { servico_id: '', descricao: '', quantidade: 1, valor_unitario: 0, valor_total: 0, nicho_filtro: '', categoria_filtro: '' }]);
  const updateServico = (idx, field, val) => {
     const newS = [...servicosForm];
     if(field === 'quantidade' && Number(val)<1) val=1;
     if(field === 'valor_unitario' && Number(val)<0) val=0;
     newS[idx][field] = val;
     
     if (field === 'nicho_filtro') newS[idx].categoria_filtro = ''; 
     
     if (field === 'servico_id' && val !== '') {
        const s = servicosBase.find(x => x.id == val);
        if (s) { newS[idx].descricao = s.nome; newS[idx].valor_unitario = s.valor_padrao; }
     }
     if (field === 'quantidade' || field === 'valor_unitario' || field === 'servico_id') {
        const q = Number(newS[idx].quantidade)||0;
        const v = Number(newS[idx].valor_unitario)||0;
        newS[idx].valor_total = q*v;
     }
     setServicosForm(newS);
  };
  const delServico = (idx) => setServicosForm(servicosForm.filter((_,i)=>i!==idx));

  const addMat = () => setMateriaisForm([...materiaisForm, { material_id: '', descricao: '', quantidade: 1, valor_unitario: 0, valor_total: 0, nicho_filtro: '', categoria_filtro: '' }]);
  const updateMat = (idx, field, val) => {
     const newM = [...materiaisForm];
     if(field === 'quantidade' && Number(val)<1) val=1;
     if(field === 'valor_unitario' && Number(val)<0) val=0;
     newM[idx][field] = val;
     
     if (field === 'nicho_filtro') newM[idx].categoria_filtro = '';
     
     if (field === 'material_id' && val !== '') {
        const m = materiaisBase.find(x => x.id == val);
        if (m) { newM[idx].descricao = m.nome; newM[idx].valor_unitario = m.valor_venda; }
     }
     if (field === 'quantidade' || field === 'valor_unitario' || field === 'material_id') {
        const q = Number(newM[idx].quantidade)||0;
        const v = Number(newM[idx].valor_unitario)||0;
        newM[idx].valor_total = q*v;
     }
     setMateriaisForm(newM);
  };
  const delMat = (idx) => setMateriaisForm(materiaisForm.filter((_,i)=>i!==idx));

  if (loading) return <div className="p-8 text-center">Carregando central...</div>;

  const { tServ, tMat, tGasto, tDesc, tGeral } = recalcularTotais();
  const lucroPrevisto = tGeral - tGasto;

  return (
    <div className="content-area" style={{ maxWidth: '1400px', paddingBottom: '100px' }}>
      
      {/* HEADER MASTER */}
      <div className="flex justify-between items-center mb-6">
         <div className="flex items-center gap-4">
             <button onClick={() => navigate('/orcamentos')} className="btn btn-outline" style={{padding: '0.5rem', borderRadius: '50%'}}>
                <ArrowLeft size={20} />
             </button>
             <div>
                <h1 style={{ fontSize: '1.75rem', margin: 0 }}>
                  {id === 'novo' ? 'Novo Orçamento' : `Projeto #${orcamento.numero_orcamento}`}
                </h1>
                <p className="text-muted" style={{ margin: 0 }}>Gestão Completa (Micro-ERP)</p>
             </div>
         </div>

         <div className="flex gap-2">
            {id !== 'novo' && (
              <>
                 <button className="btn btn-outline" onClick={handleDuplicar} title="Duplicar">
                   <Copy size={18} /> <span className="hidden md:inline">Clonar</span>
                 </button>
                 <button className="btn btn-outline" onClick={handleGerarPDF}>
                   <FileText size={18} /> <span className="hidden md:inline">PDF</span>
                 </button>
              </>
            )}
            <button className="btn btn-primary" onClick={handleSaveMaster}>
               <Save size={18} /> <span className="hidden md:inline">Salvar Geral</span>
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* SIDEBAR TABS (MOBILE = HORIZONTAL OVERFLOW, DESKTOP = VERTICAL) */}
          <div className="md:col-span-1">
             <div className="card card-dark" style={{ padding: '1rem' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    
                    <button className={`btn w-full ${activeTab==='resumo' ? 'btn-primary' : 'btn-outline'}`} style={{justifyContent: 'flex-start'}} onClick={() => setActiveTab('resumo')}>
                       <FileText size={16}/> Resumo & Cliente
                    </button>
                    
                    <button className={`btn w-full ${activeTab==='servicos' ? 'btn-primary' : 'btn-outline'}`} style={{justifyContent: 'flex-start'}} onClick={() => setActiveTab('servicos')}>
                       <Wrench size={16}/> Mão de Obra
                    </button>
                    
                    <button className={`btn w-full ${activeTab==='materiais' ? 'btn-primary' : 'btn-outline'}`} style={{justifyContent: 'flex-start'}} onClick={() => setActiveTab('materiais')}>
                       <Package size={16}/> Peças e Materiais
                    </button>
                    
                    <button className={`btn w-full ${activeTab==='gastos' ? 'btn-primary' : 'btn-outline'}`} style={{justifyContent: 'flex-start'}} onClick={() => setActiveTab('gastos')}>
                       <DollarSign size={16}/> Despesas Extras
                    </button>

                    <button className={`btn w-full ${activeTab==='fotos' ? 'btn-primary' : 'btn-outline'}`} style={{justifyContent: 'flex-start'}} onClick={() => setActiveTab('fotos')}>
                       <ImageIcon size={16}/> Galeria de Fotos
                    </button>
                    
                    <button className={`btn w-full ${activeTab==='ops' ? 'btn-primary' : 'btn-outline'}`} style={{justifyContent: 'flex-start'}} onClick={() => setActiveTab('ops')}>
                       <Clock size={16}/> Lembretes e Garantia
                    </button>

                 </div>
                 
                 {/* MINI DASHBOARD LATERAL */}
                 {id !== 'novo' && (
                     <div className="mt-8 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 className="mb-4 text-muted">Contabilidade</h4>
                        
                        <div className="flex justify-between mb-2"><span style={{fontSize:'0.8rem'}}>Rec. Mão de Obra</span><strong className="text-secondary">{formatBRL(tServ)}</strong></div>
                        <div className="flex justify-between mb-2"><span style={{fontSize:'0.8rem'}}>Revenda Materiais</span><strong>{formatBRL(tMat)}</strong></div>
                        <div className="flex justify-between mb-2"><span style={{fontSize:'0.8rem', color: 'var(--danger)'}}>Desconto</span><strong style={{color:'var(--danger)'}}>- {formatBRL(tDesc)}</strong></div>
                        <div className="flex justify-between mb-2"><span style={{fontSize:'0.8rem', color: 'var(--danger)'}}>Total Gastos</span><strong style={{color:'var(--danger)'}}>- {formatBRL(tGasto)}</strong></div>
                        
                        <div className="flex justify-between mt-4 pt-2" style={{borderTop: '1px dashed rgba(255,255,255,0.2)'}}>
                            <span style={{fontSize:'0.9rem', color: 'var(--primary)'}}>Lucro Previsto</span>
                            <strong style={{color:'var(--primary)'}}>{formatBRL(lucroPrevisto)}</strong>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span style={{fontSize:'0.85rem'}}>Venda ao Cliente</span>
                            <strong>{formatBRL(tGeral)}</strong>
                        </div>
                     </div>
                 )}
             </div>
          </div>

          {/* MASTER PAINEL VIEW */}
          <div className="md:col-span-3">
             <div className="card card-dark" style={{ minHeight: '600px' }}>
                
                {/* 1. RESUMO & CLIENTE */}
                {activeTab === 'resumo' && (
                   <div>
                      <h3 className="mb-4" style={{color: 'var(--primary)'}}>Dados do Cliente e Etapa</h3>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                         <div className="form-group mb-0" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Cliente Vinculado</label>
                            <select className="form-control" value={baseForm.cliente_id} onChange={e=>setBaseForm({...baseForm, cliente_id: e.target.value})}>
                                <option value="">--- Selecionar Cliente ---</option>
                                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome} ({c.telefone})</option>)}
                            </select>
                         </div>
                         
                         <div className="form-group mb-0">
                            <label className="form-label">Etapa / Status Atual</label>
                            <div className="mt-1">
                               <StatusDropdown 
                                  currentStatus={baseForm.etapa_orcamento} 
                                  onStatusChange={async (newStatus) => {
                                     setBaseForm({ ...baseForm, etapa_orcamento: newStatus });
                                     if (id !== 'novo') {
                                        try {
                                           await api.put(`/orcamentos/${id}/status`, { status: newStatus });
                                           // Atualiza o objeto orcamento mestre para manter coerência
                                           setOrcamento(prev => ({ ...prev, etapa_orcamento: newStatus, status: newStatus }));
                                        } catch (e) {
                                           console.error("Erro ao salvar status:", e);
                                        }
                                     }
                                  }} 
                               />
                            </div>
                         </div>
                         
                         <div className="form-group mb-0">
                            <label className="form-label">Data Emissão</label>
                            <input type="date" className="form-control" value={baseForm.data_emissao} onChange={e=>setBaseForm({...baseForm, data_emissao: e.target.value})} />
                         </div>

                         <div className="form-group mb-0" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Anotações Internas (Cliente / Local / Defeito)</label>
                            <textarea className="form-control" rows="2" value={baseForm.observacoes} onChange={e=>setBaseForm({...baseForm, observacoes: e.target.value})}></textarea>
                         </div>

                         <hr style={{ gridColumn: 'span 2', opacity: 0.1, margin: '10px 0' }} />

                         <h4 style={{ gridColumn: 'span 2', color: 'var(--primary)', margin: '10px 0 5px 0' }}>Informações do Documento Profissional</h4>

                         <div className="form-group mb-0">
                            <label className="form-label">Tipo de Documento</label>
                            <select className="form-control" value={baseForm.tipo_documento} onChange={e=>setBaseForm({...baseForm, tipo_documento: e.target.value})}>
                               <option value="ORÇAMENTO">ORÇAMENTO</option>
                               <option value="NOTA DE SERVIÇO">NOTA DE SERVIÇO</option>
                            </select>
                         </div>

                         <div className="form-group mb-0">
                            <label className="form-label">Status do Serviço (Obrigatório)</label>
                            <select className="form-control" value={baseForm.status_servico} onChange={e=>setBaseForm({...baseForm, status_servico: e.target.value})}>
                               <option value="Aguardando aprovação">Aguardando aprovação</option>
                               <option value="Aprovado">Aprovado</option>
                               <option value="Em execução">Em execução</option>
                               <option value="Finalizado">Finalizado</option>
                               <option value="Pago">Pago</option>
                            </select>
                         </div>

                         <div className="form-group mb-0">
                            <label className="form-label">Técnico Responsável</label>
                            <input type="text" className="form-control" value={baseForm.tecnico_responsavel} onChange={e=>setBaseForm({...baseForm, tecnico_responsavel: e.target.value})} placeholder="Nome do técnico" />
                         </div>

                         <div className="form-group mb-0">
                            <label className="form-label">Data de Execução</label>
                            <input type="date" className="form-control" value={baseForm.data_execucao} onChange={e=>setBaseForm({...baseForm, data_execucao: e.target.value})} />
                         </div>

                         <div className="form-group mb-0">
                            <label className="form-label">Aprovado pelo Cliente?</label>
                            <select className="form-control" value={baseForm.aprovado_cliente} onChange={e=>setBaseForm({...baseForm, aprovado_cliente: e.target.value})}>
                               <option value="Não">Não</option>
                               <option value="Sim">Sim</option>
                            </select>
                         </div>

                         <div className="form-group mb-0">
                            <label className="form-label">Forma de Pagamento</label>
                            <select className="form-control" value={baseForm.forma_pagamento} onChange={e=>setBaseForm({...baseForm, forma_pagamento: e.target.value})}>
                               <option value="Pix">Pix</option>
                               <option value="Dinheiro">Dinheiro</option>
                               <option value="Cartão">Cartão</option>
                            </select>
                         </div>

                         <div className="form-group mb-0">
                            <label className="form-label">Desconto (R$)</label>
                            <input type="number" step="0.01" min="0" className="form-control" value={baseForm.desconto} onChange={e=>setBaseForm({...baseForm, desconto: e.target.value})} />
                         </div>

                         <div className="form-group mb-0" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Descrição Detalhada do Serviço</label>
                            <textarea 
                               className="form-control" 
                               rows="4" 
                               value={baseForm.descricao_detalhada} 
                               onChange={e=>setBaseForm({...baseForm, descricao_detalhada: e.target.value})}
                               placeholder="Descreva aqui o serviço executado detalhadamente..."
                            ></textarea>
                            <p style={{fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px'}}>Ex: Serviço executado parcialmente / concluído, aguardando aprovação do cliente</p>
                         </div>
                      </div>
                      <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>* Lembre-se de clicar no botão superior 'Salvar Geral' para gravar edições desta aba ou das abas de serviços e materiais.</p>
                   </div>
                )}

                {/* 2. SERVIÇOS (MÃO DE OBRA) */}
                {activeTab === 'servicos' && (
                   <div>
                      <div className="flex justify-between items-center mb-4">
                         <h3 style={{color: '#3b82f6', margin:0}}>Lista de Serviços / Mão de Obra</h3>
                         <button className="btn btn-sm btn-outline" onClick={addServico}><PlusCircle size={14}/> Adicionar Serviço</button>
                      </div>
                      
                      <div className="table-container">
                         <table className="table" style={{ fontSize: '0.8rem' }}>
                            <thead style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                               <tr>
                                 <th>Busca Mestra</th>
                                 <th>Descritivo</th>
                                 <th style={{width:'80px'}}>Qtd</th>
                                 <th style={{width:'120px'}}>Unitário</th>
                                 <th style={{width:'120px'}}>Total</th>
                                 <th style={{width:'50px'}}></th>
                               </tr>
                            </thead>
                            <tbody>
                               {servicosForm.map((s, idx) => (
                                 <tr key={idx}>
                                    <td style={{display: 'flex', gap: '4px'}}>
                                       <select className="form-control" style={{padding:'0.4rem', width:'100px'}} value={s.nicho_filtro||''} onChange={(e) => updateServico(idx, 'nicho_filtro', e.target.value)}>
                                          <option value="">Nicho</option>
                                          <option value="Ar-condicionado">Ar</option>
                                          <option value="Segurança eletrônica">Seg</option>
                                          <option value="Geral">Geral</option>
                                       </select>
                                       <select className="form-control" style={{padding:'0.4rem', width:'100px'}} value={s.categoria_filtro||''} onChange={(e) => updateServico(idx, 'categoria_filtro', e.target.value)}>
                                          <option value="">Cód/Cat</option>
                                          {categoriasMestre.filter(c => !s.nicho_filtro || c.nicho === s.nicho_filtro).map(cv => <option key={cv.id} value={cv.nome_categoria}>{cv.nome_categoria}</option>)}
                                       </select>
                                       <select className="form-control" style={{padding:'0.4rem'}} value={s.servico_id} onChange={(e) => updateServico(idx, 'servico_id', e.target.value)}>
                                          <option value="">Serviços...</option>
                                          {servicosBase.filter(sb => (!s.nicho_filtro || sb.nicho === s.nicho_filtro) && (!s.categoria_filtro || sb.categoria === s.categoria_filtro)).map(sb => <option key={sb.id} value={sb.id}>{sb.nome}</option>)}
                                       </select>
                                    </td>
                                    <td><input type="text" className="form-control" style={{padding:'0.4rem'}} placeholder="Livre.." value={s.descricao} onChange={e=>updateServico(idx,'descricao',e.target.value)}/></td>
                                    <td><input type="number" step="1" min="1" className="form-control" style={{padding:'0.4rem'}} value={s.quantidade} onChange={e=>updateServico(idx,'quantidade',e.target.value)}/></td>
                                    <td><input type="number" step="0.01" min="0" className="form-control" style={{padding:'0.4rem'}} value={s.valor_unitario} onChange={e=>updateServico(idx,'valor_unitario',e.target.value)}/></td>
                                    <td style={{fontWeight:600}}>{formatBRL(s.valor_total)}</td>
                                    <td><button onClick={()=>delServico(idx)} style={{color:'var(--danger)', background:'none', border:'none', cursor:'pointer'}}><Trash2 size={16}/></button></td>
                                 </tr>
                               ))}
                               {servicosForm.length === 0 && <tr><td colSpan="6" className="text-center p-4">Sem serviços lançados.</td></tr>}
                            </tbody>
                         </table>
                      </div>
                   </div>
                )}

                {/* 3. MATERIAIS */}
                {activeTab === 'materiais' && (
                   <div>
                      <div className="flex justify-between items-center mb-4">
                         <h3 style={{color: 'var(--primary)', margin:0}}>Lista de Peças e Materiais</h3>
                         <button className="btn btn-sm btn-outline" onClick={addMat}><PlusCircle size={14}/> Adicionar Peça</button>
                      </div>
                      
                      <div className="table-container">
                         <table className="table" style={{ fontSize: '0.8rem' }}>
                            <thead style={{ background: 'rgba(251, 191, 36, 0.05)' }}>
                               <tr>
                                 <th>Busca Mestra</th>
                                 <th>Descritivo</th>
                                 <th style={{width:'80px'}}>Qtd</th>
                                 <th style={{width:'120px'}}>Unitário</th>
                                 <th style={{width:'120px'}}>Total</th>
                                 <th style={{width:'50px'}}></th>
                               </tr>
                            </thead>
                            <tbody>
                               {materiaisForm.map((m, idx) => (
                                 <tr key={idx}>
                                    <td style={{display: 'flex', gap: '4px'}}>
                                       <select className="form-control" style={{padding:'0.4rem', width:'100px'}} value={m.nicho_filtro||''} onChange={(e) => updateMat(idx, 'nicho_filtro', e.target.value)}>
                                          <option value="">Nicho</option>
                                          <option value="Ar-condicionado">Ar</option>
                                          <option value="Segurança eletrônica">Seg</option>
                                          <option value="Geral">Geral</option>
                                       </select>
                                       <select className="form-control" style={{padding:'0.4rem', width:'100px'}} value={m.categoria_filtro||''} onChange={(e) => updateMat(idx, 'categoria_filtro', e.target.value)}>
                                          <option value="">Cód/Cat</option>
                                          {categoriasMestre.filter(c => !m.nicho_filtro || c.nicho === m.nicho_filtro).map(cv => <option key={cv.id} value={cv.nome_categoria}>{cv.nome_categoria}</option>)}
                                       </select>
                                       <select className="form-control" style={{padding:'0.4rem'}} value={m.material_id} onChange={(e) => updateMat(idx, 'material_id', e.target.value)}>
                                          <option value="">Peças...</option>
                                          {materiaisBase.filter(sb => (!m.nicho_filtro || sb.nicho === m.nicho_filtro) && (!m.categoria_filtro || sb.categoria === m.categoria_filtro)).map(mb => <option key={mb.id} value={mb.id}>{mb.nome}</option>)}
                                       </select>
                                    </td>
                                    <td><input type="text" className="form-control" style={{padding:'0.4rem'}} placeholder="Livre.." value={m.descricao} onChange={e=>updateMat(idx,'descricao',e.target.value)}/></td>
                                    <td><input type="number" step="1" min="1" className="form-control" style={{padding:'0.4rem'}} value={m.quantidade} onChange={e=>updateMat(idx,'quantidade',e.target.value)}/></td>
                                    <td><input type="number" step="0.01" min="0" className="form-control" style={{padding:'0.4rem'}} value={m.valor_unitario} onChange={e=>updateMat(idx,'valor_unitario',e.target.value)}/></td>
                                    <td style={{fontWeight:600}}>{formatBRL(m.valor_total)}</td>
                                    <td><button onClick={()=>delMat(idx)} style={{color:'var(--danger)', background:'none', border:'none', cursor:'pointer'}}><Trash2 size={16}/></button></td>
                                 </tr>
                               ))}
                               {materiaisForm.length === 0 && <tr><td colSpan="6" className="text-center p-4">Sem peças lançadas.</td></tr>}
                            </tbody>
                         </table>
                      </div>
                   </div>
                )}

                {/* 4. GASTOS EXTRAS */}
                {activeTab === 'gastos' && (
                   <div>
                      <h3 className="mb-4" style={{color: 'var(--danger)'}}>Gestão de Custos e Despesas do Projeto</h3>
                      <p style={{fontSize:'0.8rem', color:'var(--text-muted)'}} className="mb-4">Lance aqui os gastos reais de execução deste orçamento (Gasolina, Refeições, Ferramentas Quebradas). Estes gastos afetam diretamente a sua métrica de Lucro Limpo final.</p>
                      
                      {id === 'novo' ? <div className="p-4 bg-red-900 rounded">Salve o orçamento para liberar.</div> : (
                      <>
                      <form onSubmit={handleAddGasto} className="grid grid-cols-5 gap-2 mb-6 card" style={{background: 'rgba(255,255,255,0.02)', padding: '1rem'}}>
                         <div style={{gridColumn:'span 2'}}>
                            <input type="text" className="form-control" placeholder="Descrição do custo (Ex: Almoço Equipe)" value={novoGasto.descricao} onChange={e=>setNovoGasto({...novoGasto,descricao:e.target.value})} required/>
                         </div>
                         <div>
                            <select className="form-control" value={novoGasto.categoria} onChange={e=>setNovoGasto({...novoGasto,categoria:e.target.value})}>
                               <option value="deslocamento">Deslocamento/Pedágio</option>
                               <option value="alimentacao">Alimentação</option>
                               <option value="material_extra">Material Imediato Extra</option>
                               <option value="terceirizado">Terceirizado/Ajudante</option>
                               <option value="outro">Outro</option>
                            </select>
                         </div>
                         <div>
                            <input type="number" className="form-control" step="0.01" min="0" placeholder="R$" value={novoGasto.valor} onChange={e=>setNovoGasto({...novoGasto,valor:e.target.value})} required/>
                         </div>
                         <div>
                            <button className="btn btn-outline w-full" style={{borderColor:'var(--danger)', color:'var(--danger)'}}>Registrar</button>
                         </div>
                      </form>

                      <table className="table">
                        <thead><tr><th>Descritivo</th><th>Categoria</th><th>Valor</th><th></th></tr></thead>
                        <tbody>
                          {gastosForm.map(g => (
                            <tr key={g.id}>
                               <td>{g.descricao}</td><td>{g.categoria}</td>
                               <td style={{color:'var(--danger)'}}>{formatBRL(g.valor)}</td>
                               <td><button onClick={()=>handleDeleteGasto(g.id)} style={{color:'var(--danger)', background:'none', border:'none', cursor:'pointer'}}><Trash2 size={16}/></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </>
                      )}
                   </div>
                )}

                {/* 5. FOTOS */}
                {activeTab === 'fotos' && (
                   <div>
                      <h3 className="mb-4">Arquivo Multi-Midia do Projeto</h3>
                      <p style={{fontSize:'0.8rem', color:'var(--text-muted)'}} className="mb-4">Bata e anexe fotos de antes/depois do equipamento, foto de laudo técnico ou da medição da pressão de gás.</p>
                      
                      {id === 'novo' ? <div className="p-4 bg-red-900 rounded">Salve o orçamento para liberar.</div> : (
                      <>
                      <div className="flex gap-4 mb-6 items-center">
                         <input type="file" className="form-control" onChange={e => setFotoFile(e.target.files[0])} accept="image/*"/>
                         <button className="btn btn-primary whitespace-nowrap" onClick={handleUploadFoto}>Subir Imagem</button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {fotosForm.map(f => (
                           <div key={f.id} style={{position:'relative', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', overflow:'hidden'}}>
                               <img src={`http://localhost:3001${f.url}`} alt={f.descricao} style={{width:'100%', height:'150px', objectFit:'cover', display:'block'}}/>
                               <button onClick={()=>handleDeleteFoto(f.id)} style={{position:'absolute', top:5, right:5, background:'rgba(0,0,0,0.7)', color:'white', border:'none', padding:'4px', borderRadius:'4px', cursor:'pointer'}}><Trash2 size={14}/></button>
                           </div>
                         ))}
                         {fotosForm.length === 0 && <span className="text-muted text-sm">Nenhuma foto no laudo.</span>}
                      </div>
                      </>
                      )}
                   </div>
                )}

                {/* 6. GARANTIA & LEMBRETES */}
                {activeTab === 'ops' && (
                   <div>
                       <h3 className="mb-4"><Shield size={20} style={{display:'inline', marginRight:'8px'}}/> Cobertura de Garantia</h3>
                       <div className="form-group mb-8">
                          <label className="form-label">Dias de Garantia Oferecida (Apenas Digite Números)</label>
                          <input type="number" className="form-control" style={{maxWidth:'200px'}} value={baseForm.dias_garantia} onChange={e=>setBaseForm({...baseForm, dias_garantia: e.target.value})} />
                          <p style={{marginTop:'4px', fontSize:'0.75rem', color:'var(--text-muted)'}}>* Refletido automaticamente no corpo final do PDF com data de vencimento calculada a partir de hoje.</p>
                       </div>

                       <h3 className="mb-4"><Clock size={20} style={{display:'inline', marginRight:'8px'}}/> Agenda Pós-Venda / Lembretes</h3>
                       <p style={{fontSize:'0.8rem', color:'var(--text-muted)'}} className="mb-4">Não dependa de excel. Crie e agende lembretes como: Ligar para confirmar aprovação, Agendar Limpeza preventiva de 6 meses, Ligar para cobrar Restante do pagamento.</p>
                       <div className="p-4" style={{background:'rgba(255,255,255,0.02)', borderRadius:'8px'}}>
                           <em className="text-muted text-sm">Módulo avançado de calendário será liberado aqui no futuro. Por enquanto, utilize as Anotações Internas Gerais.</em>
                       </div>
                   </div>
                )}

             </div>
          </div>

      </div>

    </div>
  );
}
