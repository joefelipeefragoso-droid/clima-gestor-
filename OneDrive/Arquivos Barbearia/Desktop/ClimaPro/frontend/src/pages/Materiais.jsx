import React, { useEffect, useState } from 'react';
import inventoryService from '../services/inventoryService';
import { PlusCircle, Edit, Trash2, Search, Package } from 'lucide-react';

export default function Materiais() {
  const [materiais, setMateriais] = useState([]);
  const [categoriasMestre, setCategoriasMestre] = useState([]);
  const [search, setSearch] = useState('');
  const [nichoFilter, setNichoFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    nome: '', nicho: 'Ar-condicionado', categoria: '', unidade: 'un', quantidade_estoque: 0, valor_custo: 0, valor_venda: 0, observacoes: ''
  });

  const loadData = async () => {
    try {
      const [resM, resC] = await Promise.all([
          inventoryService.getMateriais({ search, nicho: nichoFilter }),
          inventoryService.getCategorias()
      ]);
      setMateriais(resM.data);
      setCategoriasMestre(resC.data);
    } catch(err) { 
      console.error('Erro ao carregar materiais:', err);
    }
  };

  useEffect(() => { loadData(); }, [search, nichoFilter]);

  const openModal = (mat = null) => {
    if (mat) {
      setEditingId(mat.id);
      setForm({ ...mat, nicho: mat.nicho || 'Ar-condicionado', categoria: mat.categoria || '' });
    } else {
      setEditingId(null);
      setForm({ nome: '', nicho: 'Ar-condicionado', categoria: '', unidade: 'un', quantidade_estoque: 0, valor_custo: 0, valor_venda: 0, observacoes: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await inventoryService.updateMaterial(editingId, form);
      } else {
        await inventoryService.createMaterial(form);
      }
      closeModal();
      loadData();
    } catch (err) { 
      console.error('Erro ao salvar material:', err);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Excluir peça?')) {
      try {
        await inventoryService.deleteMaterial(id);
        loadData();
      } catch (err) {
        console.error('Erro ao deletar material:', err);
      }
    }
  }

  const catValidas = categoriasMestre.filter(c => c.nicho === form.nicho);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div style={{ position: 'relative', width: '300px' }}>
             <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
             <input type="text" className="form-control" placeholder="Buscar peças/materiais..." style={{ paddingLeft: '2.5rem' }} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{width: '200px'}} value={nichoFilter} onChange={e=>setNichoFilter(e.target.value)}>
             <option value="">Qualquer Nicho</option>
             <option value="Ar-condicionado">Ar-condicionado</option>
             <option value="Segurança eletrônica">Segurança eletrônica</option>
             <option value="Geral">Sem nicho (Geral)</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <PlusCircle size={18} /> Cadastrar Nova Peça
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nome da Peça/Material</th>
                <th>Nicho / Categoria</th>
                <th>Estoque (Unid)</th>
                <th>Valor Venda</th>
                <th style={{ width: '120px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {materiais.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500, color: 'var(--primary)' }}>
                     <div className="flex items-center gap-2">
                        <Package size={16} /> 
                        {c.nome}
                     </div>
                  </td>
                  <td>
                    <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{c.nicho}</div>
                    <div style={{fontWeight:600}}>{c.categoria || '-'}</div>
                  </td>
                  <td>{c.quantidade_estoque} {c.unidade}</td>
                  <td>R$ {Number(c.valor_venda).toFixed(2)}</td>
                  <td>
                    <div className="flex gap-2">
                       <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => openModal(c)}><Edit size={16} /></button>
                       <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(c.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {materiais.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>Nenhum material cadastrado ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="mb-6">{editingId ? 'Editar Material' : 'Novo Material'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Nome *</label>
                  <input type="text" className="form-control" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Nicho de Mercado</label>
                  <select className="form-control" value={form.nicho} onChange={e => { setForm({...form, nicho: e.target.value, categoria: ''}); }}>
                    <option value="Ar-condicionado">Ar-condicionado</option>
                    <option value="Segurança eletrônica">Segurança eletrônica</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Categoria Específica</label>
                  <select className="form-control" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                     <option value="">Selecione...</option>
                     {form.nicho === 'Geral' && <option value="Geral">Geral</option>}
                     {catValidas.map(cv => <option key={cv.id} value={cv.nome_categoria}>{cv.nome_categoria}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Unidade (Ex: un, kg, m)</label>
                  <input type="text" className="form-control" value={form.unidade} onChange={e => setForm({...form, unidade: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Qntd Estoque</label>
                  <input type="number" className="form-control" value={form.quantidade_estoque} onChange={e => setForm({...form, quantidade_estoque: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Valor Custo (R$)</label>
                  <input type="number" step="0.01" className="form-control" value={form.valor_custo} onChange={e => setForm({...form, valor_custo: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Valor Venda (R$)</label>
                  <input type="number" step="0.01" className="form-control" value={form.valor_venda} onChange={e => setForm({...form, valor_venda: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
