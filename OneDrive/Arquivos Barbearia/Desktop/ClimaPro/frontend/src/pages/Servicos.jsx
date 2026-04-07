import React, { useEffect, useState } from 'react';
import api from '../api';
import { PlusCircle, Edit, Trash2, Search, Briefcase } from 'lucide-react';

export default function Servicos() {
  const [servicos, setServicos] = useState([]);
  const [categoriasMestre, setCategoriasMestre] = useState([]);
  const [search, setSearch] = useState('');
  const [nichoFilter, setNichoFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    nome: '', descricao: '', nicho: 'Ar-condicionado', categoria: '', valor_padrao: 0, observacoes: ''
  });

  const loadData = async () => {
    try {
      const qs = new URLSearchParams();
      if(search) qs.append('search', search);
      if(nichoFilter) qs.append('nicho', nichoFilter);
      
      const [resS, resC] = await Promise.all([
         api.get(`/servicos?${qs.toString()}`),
         api.get('/categorias')
      ]);
      setServicos(resS.data);
      setCategoriasMestre(resC.data);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { loadData(); }, [search, nichoFilter]);

  const openModal = (serv = null) => {
    if (serv) {
      setEditingId(serv.id);
      setForm({ ...serv, nicho: serv.nicho || 'Ar-condicionado', categoria: serv.categoria || '' });
    } else {
      setEditingId(null);
      setForm({ nome: '', descricao: '', nicho: 'Ar-condicionado', categoria: '', valor_padrao: 0, observacoes: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/servicos/${editingId}`, form);
      else await api.post('/servicos', form);
      closeModal();
      loadData();
    } catch (err) { alert('Erro ao salvar serviço'); }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Tem certeza que deseja excluir?')) {
      await api.delete(`/servicos/${id}`);
      loadData();
    }
  }

  const catValidas = categoriasMestre.filter(c => c.nicho === form.nicho);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div style={{ position: 'relative', width: '300px' }}>
             <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
             <input type="text" className="form-control" placeholder="Buscar serviços..." style={{ paddingLeft: '2.5rem' }} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{width: '200px'}} value={nichoFilter} onChange={e=>setNichoFilter(e.target.value)}>
             <option value="">Qualquer Nicho</option>
             <option value="Ar-condicionado">Ar-condicionado</option>
             <option value="Segurança eletrônica">Segurança eletrônica</option>
             <option value="Geral">Sem nicho (Geral)</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <PlusCircle size={18} /> Novo Serviço
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nome do Serviço</th>
                <th>Nicho / Categoria</th>
                <th>Valor Padrão (Mão de Obra)</th>
                <th style={{ width: '120px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {servicos.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 500, color: 'var(--primary)' }}>
                     <div className="flex items-center gap-2">
                        <Briefcase size={16} /> 
                        {s.nome}
                     </div>
                  </td>
                  <td>
                    <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{s.nicho}</div>
                    <div style={{fontWeight:600}}>{s.categoria || '-'}</div>
                  </td>
                  <td><span className="badge badge-gold">R$ {Number(s.valor_padrao).toFixed(2)}</span></td>
                  <td>
                    <div className="flex gap-2">
                       <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => openModal(s)}><Edit size={16} /></button>
                       <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(s.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {servicos.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>Nenhum serviço base cadastrado ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="mb-6">{editingId ? 'Editar Serviço' : 'Novo Serviço'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Nome do Serviço *</label>
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

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Descrição Padrão</label>
                  <input type="text" className="form-control" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Valor Mão de Obra Padrão (R$)</label>
                  <input type="number" step="0.01" className="form-control" value={form.valor_padrao} onChange={e => setForm({...form, valor_padrao: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Serviço</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
