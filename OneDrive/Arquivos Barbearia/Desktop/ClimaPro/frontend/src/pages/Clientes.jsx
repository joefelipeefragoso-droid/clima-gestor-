import React, { useEffect, useState } from 'react';
import api from '../api';
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    nome: '', telefone: '', whatsapp: '', cpf_cnpj: '', endereco: '', bairro: '', cidade: '', observacoes: ''
  });

  const loadClientes = () => {
    api.get(`/clientes?search=${search}`).then(res => setClientes(res.data)).catch(console.error);
  };

  useEffect(() => {
    loadClientes();
  }, [search]);

  const openModal = (cliente = null) => {
    if (cliente) {
      setEditingId(cliente.id);
      setForm(cliente);
    } else {
      setEditingId(null);
      setForm({ nome: '', telefone: '', whatsapp: '', cpf_cnpj: '', endereco: '', bairro: '', cidade: '', observacoes: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/clientes/${editingId}`, form);
      } else {
        await api.post('/clientes', form);
      }
      closeModal();
      loadClientes();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || err.message;
      alert('Erro ao salvar cliente: ' + errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Tem certeza que deseja excluir?')) {
      await api.delete(`/clientes/${id}`);
      loadClientes();
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4" style={{ width: '400px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
             <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
             <input 
               type="text" 
               className="form-control" 
               placeholder="Buscar por nome, telefone ou CPF/CNPJ..." 
               style={{ paddingLeft: '2.5rem' }}
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <PlusCircle size={18} /> Novo Cliente
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>CPF / CNPJ</th>
                <th>Cidade</th>
                <th style={{ width: '120px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500, color: 'var(--primary)' }}>{c.nome}</td>
                  <td>{c.telefone || c.whatsapp}</td>
                  <td>{c.cpf_cnpj || '-'}</td>
                  <td>{c.cidade || '-'}</td>
                  <td>
                    <div className="flex gap-2">
                       <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => openModal(c)}>
                         <Edit size={16} />
                       </button>
                       <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(c.id)}>
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {clientes.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>Nenhum cliente encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="mb-6">{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Nome Completo / Empresa *</label>
                  <input type="text" className="form-control" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <input type="text" className="form-control" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp</label>
                  <input type="text" className="form-control" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">CPF / CNPJ</label>
                  <input type="text" className="form-control" value={form.cpf_cnpj} onChange={e => setForm({...form, cpf_cnpj: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Endereço</label>
                  <input type="text" className="form-control" value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bairro</label>
                  <input type="text" className="form-control" value={form.bairro} onChange={e => setForm({...form, bairro: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cidade</label>
                  <input type="text" className="form-control" value={form.cidade} onChange={e => setForm({...form, cidade: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Observações</label>
                  <textarea className="form-control" value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})}></textarea>
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
