import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUsers, FaClipboardList, FaMoneyBillWave, FaUserPlus, 
  FaFileInvoiceDollar, FaFlask, FaCogs, FaArrowUp,
  FaCalendarCheck, FaHourglassHalf, FaCheckDouble, FaHandHoldingMedical
} from 'react-icons/fa';

const API = '/api';

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMedico = user?.rol === 'medico';
  const isAdmin = user?.rol === 'admin';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/reportes/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error("Error dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const formatMoney = (n) => `RD$ ${Number(n || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header con saludo */}
      <div className="page-header">
        <div>
          <h2 className="page-title" style={{marginBottom: 4}}>
            <span className="page-title-icon"><FaHandHoldingMedical /></span>
            Hola, {user?.nombre || 'Usuario'}
          </h2>
          <p style={{color: 'var(--gray-500)', fontSize: 14, marginLeft: 58}}>
            {isMedico ? 'Panel de Exámenes y Resultados' : 'Panel de Control General'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card purple" onClick={() => navigate(isMedico ? '/portal-medico' : '/registro')}>
          <div className="stat-info">
            <h4>{isMedico ? 'Pacientes' : 'Pacientes Hoy'}</h4>
            <div className="stat-value">{stats?.pacientes?.hoy || 0}</div>
            <div className="stat-subtitle"><FaArrowUp /> Registrados</div>
          </div>
          <div className="stat-icon-box purple"><FaUsers /></div>
        </div>

        <div className="stat-card orange" onClick={() => navigate(isMedico ? '/portal-medico' : '/registro')}>
          <div className="stat-info">
            <h4>Órdenes Pendientes</h4>
            <div className="stat-value">{stats?.ordenes?.pendientes || 0}</div>
            <div className="stat-subtitle"><FaHourglassHalf /> Por procesar</div>
          </div>
          <div className="stat-icon-box orange"><FaClipboardList /></div>
        </div>

        {!isMedico && (
          <div className="stat-card green" onClick={() => navigate('/facturas')}>
            <div className="stat-info">
              <h4>Ingresos Hoy</h4>
              <div className="stat-value" style={{fontSize: 22}}>{formatMoney(stats?.ingresos?.hoy)}</div>
              <div className="stat-subtitle"><FaArrowUp /> Ventas del día</div>
            </div>
            <div className="stat-icon-box green"><FaMoneyBillWave /></div>
          </div>
        )}

        {isMedico && (
          <div className="stat-card green" onClick={() => navigate('/portal-medico')}>
            <div className="stat-info">
              <h4>Resultados Listos</h4>
              <div className="stat-value">{stats?.ordenes?.completadas || 0}</div>
              <div className="stat-subtitle"><FaCheckDouble /> Para revisar</div>
            </div>
            <div className="stat-icon-box green"><FaFlask /></div>
          </div>
        )}

        <div className="stat-card blue">
          <div className="stat-info">
            <h4>{isMedico ? 'Órdenes Completadas' : 'Total General'}</h4>
            <div className="stat-value" style={{fontSize: isMedico ? 30 : 22}}>
              {isMedico 
                ? (stats?.ordenes?.completadas || 0)
                : formatMoney(stats?.ingresos?.mes || stats?.ingresos?.total || 0)
              }
            </div>
            <div className="stat-subtitle"><FaCalendarCheck /> {isMedico ? 'Finalizadas' : 'Este mes'}</div>
          </div>
          <div className="stat-icon-box blue">
            {isMedico ? <FaCheckDouble /> : <FaMoneyBillWave />}
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="content-grid">
        <div className="card">
          <div className="card-header">
            <h3><span className="card-h-icon">?</span> Acciones Rápidas</h3>
          </div>
          <div className="card-body">
            <div className="quick-actions-grid">
              {!isMedico && (
                <Link to="/registro" className="quick-action-card">
                  <FaUserPlus className="qa-icon" />
                  <span className="qa-label">Nuevo Registro</span>
                  <span className="qa-desc">Paciente y Orden</span>
                </Link>
              )}

              {isMedico && (
                <Link to="/registro" className="quick-action-card">
                  <FaClipboardList className="qa-icon" />
                  <span className="qa-label">Nueva Orden</span>
                  <span className="qa-desc">Solicitar exámenes</span>
                </Link>
              )}

              <Link to="/portal-medico" className="quick-action-card">
                <FaFlask className="qa-icon" />
                <span className="qa-label">{isMedico ? 'Ver Resultados' : 'Exámenes'}</span>
                <span className="qa-desc">{isMedico ? 'Buscar historial' : 'Resultados'}</span>
              </Link>

              {!isMedico && (
                <Link to="/facturas" className="quick-action-card">
                  <FaFileInvoiceDollar className="qa-icon" />
                  <span className="qa-label">Facturación</span>
                  <span className="qa-desc">Cobros y recibos</span>
                </Link>
              )}

              {isAdmin && (
                <Link to="/admin" className="quick-action-card">
                  <FaCogs className="qa-icon" />
                  <span className="qa-label">Admin</span>
                  <span className="qa-desc">Configuración</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
