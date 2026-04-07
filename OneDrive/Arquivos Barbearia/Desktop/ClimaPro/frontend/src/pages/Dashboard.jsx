import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../api';
import { Users, Calendar, Briefcase, PlusCircle, Activity, ChevronRight, Droplet } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState({
    totalClientes: 0,
    totalAgendamentosHoje: 0,
    orcamentosMes: 0,
    valorOrcamentosMes: 0,
    statusOrcamentos: [],
    ultimosClientes: [],
    proximosAgendamentos: []
  });
  
  const [config, setConfig] = useState({ nome_empresa: 'ClimaGestor' });

  useEffect(() => {
    api.get('/dashboard').then(res => setData(res.data)).catch(console.error);
    api.get('/config').then(res => setConfig(res.data)).catch(console.error);
  }, []);

  return (
    <div>
      {/* Top Header / Greeting (inspired by neo-banking header) */}
      <div className="flex justify-between items-center mb-6">
         <div>
            <div className="flex items-center gap-2 mb-1">
               <Droplet size={18} color="var(--primary)" />
               <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {config.nome_empresa}
               </p>
            </div>
            <h1 style={{ fontSize: '2rem', color: 'var(--text-main)' }}>Felipe</h1>
         </div>
         <div className="flex gap-2">
            <NavLink to="/orcamentos" className="btn btn-primary btn-sm">
               Nova Venda
            </NavLink>
         </div>
      </div>

      {/* Main Gold Card (Neo-Banking primary card) */}
      <div className="card card-gold mb-6">
         <div className="decor-circle decor-1"></div>
         <div className="decor-circle decor-2"></div>
         <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="flex justify-between items-start mb-4">
               <div>
                  <p style={{ fontWeight: 600, opacity: 0.8, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Faturamento do Mês</p>
                  <h2 style={{ fontSize: '3rem', fontWeight: 800, marginTop: '0.25rem', letterSpacing: '-1px' }}>
                     R$ {Number(data.valorOrcamentosMes || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h2>
               </div>
               <div style={{ background: 'rgba(0,0,0,0.1)', padding: '0.5rem', borderRadius: '50%' }}>
                  <Activity size={24} color="#111827" />
               </div>
            </div>
            
            <div className="flex items-center gap-4 mt-6">
               <div style={{ background: 'rgba(0,0,0,0.05)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-pill)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 800 }}>{data.orcamentosMes}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Orçamentos</span>
               </div>
            </div>
         </div>
      </div>

      {/* Secondary White Card (Neo-Banking secondary info) */}
      <div className="card card-white mb-6">
         <div className="flex justify-between items-center mb-6">
            <div>
               <p style={{ fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94A3B8' }}>Operação Diária</p>
               <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Agenda & Clientes</h3>
            </div>
            <NavLink to="/agenda" style={{ background: '#F1F5F9', padding: '0.75rem', borderRadius: '50%', color: '#0F172A' }}>
               <ChevronRight size={20} />
            </NavLink>
         </div>
         
         <div className="grid grid-cols-2 gap-4">
            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
               <div className="flex items-center gap-3 mb-2">
                  <Calendar size={18} color="var(--secondary)" />
                  <span style={{ fontWeight: 700, color: '#475569' }}>Hoje</span>
               </div>
               <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{data.totalAgendamentosHoje}</h2>
            </div>
            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
               <div className="flex items-center gap-3 mb-2">
                  <Users size={18} color="var(--success)" />
                  <span style={{ fontWeight: 700, color: '#475569' }}>Total</span>
               </div>
               <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{data.totalClientes}</h2>
            </div>
         </div>
      </div>

      {/* Dark Module - Recent Activities */}
      <div className="card card-dark mb-6">
         <div className="flex justify-between items-center mb-6">
            <h3 style={{ fontSize: '1.25rem' }}>Agendamentos Recentes</h3>
            <NavLink to="/agenda" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none' }}>Ver Todos</NavLink>
         </div>
         
         <div className="flex flex-col gap-4">
            {data.proximosAgendamentos.map(a => (
               <div key={a.id} className="flex justify-between items-center" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex items-center gap-4">
                     <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '50%' }}>
                        <Users size={20} color="var(--text-main)" />
                     </div>
                     <div>
                        <h4 style={{ fontSize: '1rem', marginBottom: '2px' }}>{a.cliente_nome || 'Sem Cds'}</h4>
                        <p style={{ fontSize: '0.75rem', fontWeight: 500 }}>{a.tipo_servico || 'Serviço'} • {a.data} {a.hora}</p>
                     </div>
                  </div>
                  <div>
                     <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>{a.status}</span>
                  </div>
               </div>
            ))}
            {data.proximosAgendamentos.length === 0 && <p style={{ textAlign: 'center', padding: '1rem' }}>Sua agenda está livre.</p>}
         </div>
      </div>
    </div>
  );
}
