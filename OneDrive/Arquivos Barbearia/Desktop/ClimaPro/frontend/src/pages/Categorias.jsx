import React, { useEffect, useState } from 'react';
import inventoryService from '../services/inventoryService';
import { PlusCircle, Search, Edit, Trash2 } from 'lucide-react';

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({ nome_categoria: '', nicho: 'Ar-condicionado', descricao: '', status: 'ativo' });
  const [editingId, setEditingId] = useState(null);
  const [nichoFilter, setNichoFilter] = useState('');

  const loadData = async () => {
    try {
      const res = await inventoryService.getCategorias(nichoFilter);
      setCategorias(res.data);
    } catch (err) { 
      console.error('Erro ao carregar categorias:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [nichoFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await inventoryService.updateCategoria(editingId, form);
        setEditingId(null);
      } else {
        await inventoryService.createCategoria(form);
      }
      setForm({ nome_categoria: '', nicho: 'Ar-condicionado', descricao: '', status: 'ativo' });
      loadData();
    } catch (err) { 
      console.error('Erro ao salvar categoria:', err);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ nome_categoria: cat.nome_categoria, nicho: cat.nicho, descricao: cat.descricao||'', status: cat.status });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Excluir categoria? Se houverem serviços atrelados eles ficarão soltos.')) {
      try {
        await inventoryService.deleteCategoria(id);
        loadData();
      } catch (err) {
        console.error('Erro ao deletar categoria:', err);
      }
    }
  };

  return (
    <div className="content-area">
      <h1 className="mb-6" style={{color: 'var(--primary)'}}>Gestão de Categorias e Nichos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* FORMULÁRIO */}
        <div className="md:col-span-1">
          <div className="card card-dark">
            <h3 className="mb-4">{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nicho Pai</label>
                <select className="form-control" value={form.nicho} onChange={e=>setForm({...form, nicho: e.target.value})} required>
                   <option value="Ar-condicionado">Ar-condicionado</option>
                   <option value="Segurança eletrônica">Segurança Eletrônica (CFTV/Alarmes)</option>
                   <option value="Serviços Gerais">Serviços Gerais / Pedreiro</option>
                   <option value="Energia Solar">Energia Solar</option>
                   <option value="Outros">Outras Áreas</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nome da Categoria</label>
                <input type="text" className="form-control" placeholder="Ex: Câmeras IP" value={form.nome_categoria} onChange={e=>setForm({...form, nome_categoria: e.target.value})} required />
              </div>
              
              <div className="form-group">
                <label className="form-label">Descrição (Opcional)</label>
                <textarea className="form-control" rows="2" value={form.descricao} onChange={e=>setForm({...form, descricao: e.target.value})}></textarea>
              </div>

              <button type="submit" className="btn btn-primary w-full mt-4">
                <PlusCircle size={18} /> {editingId ? 'Atualizar Categoria' : 'Salvar Categoria'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline w-full mt-2" onClick={() => {setEditingId(null); setForm({ nome_categoria: '', nicho: 'Ar-condicionado', descricao: '', status: 'ativo' });}}>
                  Cancelar Edição
                </button>
              )}
            </form>
          </div>
        </div>

        {/* LISTAGEM */}
        <div className="md:col-span-2">
          <div className="card card-dark flex justify-between items-center mb-4">
            <div className="form-group mb-0" style={{flex: 1, maxWidth: '300px'}}>
               <select className="form-control" value={nichoFilter} onChange={e=>setNichoFilter(e.target.value)}>
                   <option value="">Todos os Nichos</option>
                   <option value="Ar-condicionado">Apenas Ar-condicionado</option>
                   <option value="Segurança eletrônica">Apenas Segurança Eletrônica</option>
                   <option value="Geral">Sem Nicho / Geral</option>
               </select>
            </div>
          </div>

          <div className="card card-dark" style={{padding:0}}>
            <table className="table">
              <thead>
                <tr>
                  <th>Categoria / SubÁrea</th>
                  <th>Nicho Raiz</th>
                  <th>Descritivo</th>
                  <th style={{textAlign:'center', width:'100px'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map(c => (
                  <tr key={c.id}>
                    <td style={{fontWeight: 600}}>{c.nome_categoria}</td>
                    <td><span style={{background:'rgba(255,255,255,0.1)', padding:'4px 8px', borderRadius:'4px', fontSize:'0.75rem'}}>{c.nicho}</span></td>
                    <td style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{c.descricao || '-'}</td>
                    <td style={{textAlign:'center'}}>
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => handleEdit(c)} className="btn btn-sm" style={{color: 'var(--secondary)'}}><Edit size={16}/></button>
                        <button onClick={() => handleDelete(c.id)} className="btn btn-sm" style={{color: 'var(--danger)'}}><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categorias.length === 0 && <tr><td colSpan="4" className="text-center p-8">Sem categorias aqui.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
