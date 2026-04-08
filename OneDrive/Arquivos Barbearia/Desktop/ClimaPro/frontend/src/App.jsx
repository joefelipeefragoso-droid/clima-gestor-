import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Home, Calendar, Users, Briefcase, Settings, Package, PenTool, Wrench } from 'lucide-react';
import { BASE_URL } from './services/api';
import configService from './services/configService';

// Placeholders for Pages
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Agenda from './pages/Agenda';
import Materiais from './pages/Materiais';
import Servicos from './pages/Servicos';
import Orcamentos from './pages/Orcamentos';
import OrcamentoDetalhe from './pages/OrcamentoDetalhe';
import Categorias from './pages/Categorias';
import Configuracoes from './pages/Configuracoes';

function Sidebar() {
  const [logo, setLogo] = useState(null);
  
  useEffect(() => {
    configService.get().then(res => {
      if (res.data?.logo_url) setLogo(`${BASE_URL}${res.data.logo_url}`);
    }).catch(err => {
      console.error('Erro ao carregar configuração no App:', err);
    });
  }, []);

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        {logo ? (
          <img src={logo} alt="Logo" style={{ height: '32px', width: 'auto', borderRadius: '4px' }} />
        ) : (
          <PenTool />
        )}
        <span style={{marginLeft: '8px'}}>ClimaGestor</span>
      </div>
      <ul className="nav-menu">
        <li>
          <NavLink to="/" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} end>
            <Home size={20} /> Início
          </NavLink>
        </li>
        <li>
          <NavLink to="/agenda" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            <Calendar size={20} /> Agenda
          </NavLink>
        </li>
        <li>
          <NavLink to="/clientes" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            <Users size={20} /> Clientes
          </NavLink>
        </li>
        <li>
          <NavLink to="/orcamentos" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            <Briefcase size={20} /> Orçamentos
          </NavLink>
        </li>
        <li>
          <NavLink to="/servicos" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            <Wrench size={20} /> Serviços Padrão
          </NavLink>
        </li>
        <li>
          <NavLink to="/materiais" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            <Package size={20} /> Materiais
          </NavLink>
        </li>
        <li>
          <NavLink to="/configuracoes" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            <Settings size={20} /> Configurações
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

function BottomNav() {
  return (
    <div className="bottom-nav">
      <NavLink to="/" className={({isActive}) => isActive ? 'bottom-nav-link active' : 'bottom-nav-link'} end>
        <Home size={22} />
        <span>Início</span>
      </NavLink>
      <NavLink to="/agenda" className={({isActive}) => isActive ? 'bottom-nav-link active' : 'bottom-nav-link'}>
        <Calendar size={22} />
        <span>Agenda</span>
      </NavLink>
      <NavLink to="/clientes" className={({isActive}) => isActive ? 'bottom-nav-link active' : 'bottom-nav-link'}>
        <Users size={22} />
        <span>Clientes</span>
      </NavLink>
      <NavLink to="/orcamentos" className={({isActive}) => isActive ? 'bottom-nav-link active' : 'bottom-nav-link'}>
        <Briefcase size={22} />
        <span>Orçamentos</span>
      </NavLink>
      <NavLink to="/configuracoes" className={({isActive}) => isActive ? 'bottom-nav-link active' : 'bottom-nav-link'}>
        <Settings size={22} />
        <span>Perfil</span>
      </NavLink>
    </div>
  );
}

function Layout({ children, title }) {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <div className="page-title">{title}</div>
          <div></div>
        </header>
        <main className="content-area">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout title="Dashboard"><Dashboard /></Layout>} />
        <Route path="/agenda" element={<Layout title="Agenda"><Agenda /></Layout>} />
        <Route path="/clientes" element={<Layout title="Clientes"><Clientes /></Layout>} />
        <Route path="/orcamentos" element={<Layout title="Orçamentos"><Orcamentos /></Layout>} />
        <Route path="/orcamento/:id" element={<Layout title="Central do Projeto"><OrcamentoDetalhe /></Layout>} />
        <Route path="/categorias" element={<Layout title="Nichos e Categorias"><Categorias /></Layout>} />
        <Route path="/servicos" element={<Layout title="Serviços (Mão de Obra)"><Servicos /></Layout>} />
        <Route path="/materiais" element={<Layout title="Materiais (Estoque)"><Materiais /></Layout>} />
        <Route path="/configuracoes" element={<Layout title="Configurações & Perfil"><Configuracoes /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
