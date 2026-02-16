import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import './App.css';

import { 
  FaHeartbeat, FaChartPie, FaPlusCircle, FaFileInvoiceDollar, 
  FaUserMd, FaCogs, FaSignOutAlt, FaBars, FaTimes, FaUsers, 
  FaFlask, FaFileMedicalAlt, FaClipboardList, FaUser, 
  FaCalendarAlt, FaChevronLeft, FaCalculator
} from 'react-icons/fa';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RegistroInteligente from './components/RegistroInteligente';
import Facturas from './components/Facturas';
import PortalMedico from './components/PortalMedico';
import AdminPanel from './components/AdminPanel';
import Perfil from './components/Perfil';
import BuscadorPacientes from './components/BuscadorPacientes';
import FormularioPaciente from './components/FormularioPaciente';
import FormularioOrden from './components/FormularioOrden';
import CrearFacturaCompleta from './components/CrearFacturaCompleta';
import Cotizaciones from './components/Cotizaciones';

// ============ SIDEBAR ============
function Sidebar({ user, onLogout, collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const roleLabels = {
    admin: 'Administrador',
    recepcion: 'Recepción',
    medico: 'Médico',
    laboratorio: 'Laboratorio',
    facturacion: 'Facturación',
    digitador: 'Digitador'
  };

  const roleName = roleLabels[user?.rol] || user?.rol || 'Usuario';
  const initial = user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U';

  // Menús según rol
  const getMenuItems = () => {
    const common = [
      { section: 'Principal' },
      { path: '/', icon: <FaChartPie />, label: 'Dashboard' },
    ];

    if (user?.rol === 'medico') {
      return [
        ...common,
        { section: 'Clínico' },
        { path: '/portal-medico', icon: <FaFlask />, label: 'Exámenes y Resultados' },
        { path: '/registro', icon: <FaPlusCircle />, label: 'Nueva Orden' },
      ];
    }

    if (user?.rol === 'laboratorio') {
      return [
        ...common,
        { section: 'Laboratorio' },
        { path: '/portal-medico', icon: <FaFileMedicalAlt />, label: 'Resultados' },
        { path: '/registro', icon: <FaPlusCircle />, label: 'Registro' },
      ];
    }

    if (user?.rol === 'facturacion') {
      return [
        ...common,
        { section: 'Finanzas' },
        { path: '/facturas', icon: <FaFileInvoiceDollar />, label: 'Facturación' },
        { path: '/registro', icon: <FaPlusCircle />, label: 'Registro' },
      ];
    }

    // admin, recepcion, etc - ven todo
    return [
      ...common,
      { section: 'Gestión' },
      { path: '/registro', icon: <FaPlusCircle />, label: 'Nuevo Registro' },
      { path: '/facturas', icon: <FaFileInvoiceDollar />, label: 'Facturación' },
      { path: '/portal-medico', icon: <FaFlask />, label: 'Exámenes y Resultados' },
      ...(user?.rol === 'admin' ? [
        { section: 'Sistema' },
        { path: '/admin', icon: <FaCogs />, label: 'Administración' },
      ] : []),
    ];
  };

  const menuItems = getMenuItems();

  return (
    <>
      <div className={`sidebar-overlay ${mobileOpen ? 'show' : ''}`} onClick={() => setMobileOpen(false)} />
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand" onClick={() => setMobileOpen(false)}>
            <FaHeartbeat className="sidebar-brand-icon" />
            <span className="sidebar-brand-text">Mi Esperanza</span>
          </Link>
          <button className="sidebar-toggle" onClick={() => {
            if (window.innerWidth <= 768) setMobileOpen(false);
            else setCollapsed(!collapsed);
          }}>
            {collapsed ? <FaBars /> : <FaChevronLeft />}
          </button>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initial}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.nombre || 'Usuario'}</span>
            <span className="sidebar-user-role">{roleName}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, i) => {
            if (item.section) {
              return <div key={`s-${i}`} className="nav-section-title">{item.section}</div>;
            }
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="btn-sidebar-logout" onClick={onLogout}>
            <FaSignOutAlt />
            <span className="sidebar-footer-text">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ============ TOPBAR ============
function Topbar({ onMenuToggle }) {
  const location = useLocation();
  const titles = {
    '/': { icon: <FaChartPie />, label: 'Dashboard' },
    '/registro': { icon: <FaPlusCircle />, label: 'Nuevo Registro' },
    '/facturas': { icon: <FaFileInvoiceDollar />, label: 'Facturación' },
    '/portal-medico': { icon: <FaFlask />, label: 'Exámenes y Resultados' },
    '/cotizaciones': { icon: <FaCalculator />, label: 'Cotizaciones' },
    '/admin': { icon: <FaCogs />, label: 'Administración' },
    '/perfil': { icon: <FaUser />, label: 'Mi Perfil' },
  };

  const current = titles[location.pathname] || { icon: <FaChartPie />, label: 'Mi Esperanza Centro Diagnóstico' };
  const today = new Date().toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={onMenuToggle}>
          <FaBars />
        </button>
        <div className="topbar-title">
          <span className="topbar-icon">{current.icon}</span>
          {current.label}
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-date">
          <FaCalendarAlt />
          <span>{today}</span>
        </div>
      </div>
    </header>
  );
}

// ============ APP ============
function AppContent({ user, onLogout }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        user={user}
        onLogout={onLogout}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <div className="content-area">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/registro" element={<RegistroInteligente />} />
            <Route path="/facturas" element={<Facturas />} />
            <Route path="/portal-medico" element={<PortalMedico />} />
            <Route path="/admin" element={user?.rol === 'admin' ? <AdminPanel user={user} /> : <Navigate to="/" />} />
            <Route path="/perfil" element={<Perfil user={user} />} />
            <Route path="/buscar" element={<BuscadorPacientes />} />
            <Route path="/nuevo-paciente" element={<FormularioPaciente />} />
            <Route path="/nueva-orden" element={<FormularioOrden />} />
            <Route path="/cotizaciones" element={<Cotizaciones />} />
            <Route path="/crear-factura" element={<CrearFacturaCompleta />} />
            <Route path="/crear-factura/:ordenId" element={<CrearFacturaCompleta />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      try { setUser(JSON.parse(userData)); } catch(e) { handleLogout(); }
    }
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <AppContent user={user} onLogout={handleLogout} />
    </Router>
  );
}

export default App;
