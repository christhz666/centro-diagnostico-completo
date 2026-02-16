import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaEye, FaFileAlt, FaFlask, FaTimes } from 'react-icons/fa';

const VisorResultados = () => {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [selectedResultado, setSelectedResultado] = useState(null);
  const [detalleResultado, setDetalleResultado] = useState(null);

  const API_URL = 'http://192.9.135.84:5000/api';

  useEffect(() => {
    fetchResultados();
  }, []);

  const fetchResultados = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/resultados/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setResultados(response.data.resultados || []);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar resultados');
      setLoading(false);
    }
  };

  const verDetalle = async (resultadoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/resultados/${resultadoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDetalleResultado(response.data);
      setSelectedResultado(resultadoId);
    } catch (error) {
      console.error('Error al obtener detalle:', error);
      alert('Error al cargar detalles del análisis');
    }
  };

  const renderValores = (datos) => {
    if (!datos || typeof datos !== 'object') return null;

    return (
      <div style={styles.valoresGrid}>
        {Object.entries(datos).map(([parametro, info]) => {
          if (typeof info !== 'object') return null;
          
          const valor = info.valor;
          const unidad = info.unidad || '';
          const referencia = info.referencia || '';
          const estado = info.estado || 'normal';
          
          const esNormal = estado === 'normal';
          
          return (
            <div key={parametro} style={{
              ...styles.valorCard,
              borderLeft: `4px solid ${esNormal ? '#4CAF50' : '#FF9800'}`
            }}>
              <div style={styles.valorHeader}>
                <strong>{parametro.replace(/_/g, ' ').toUpperCase()}</strong>
                <span style={{
                  ...styles.estadoBadge,
                  backgroundColor: esNormal ? '#4CAF50' : '#FF9800'
                }}>
                  {estado}
                </span>
              </div>
              <div style={styles.valorNumero}>
                {valor} <span style={styles.unidad}>{unidad}</span>
              </div>
              <div style={styles.valorReferencia}>
                Rango: {referencia}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const resultadosFiltrados = resultados.filter(r => 
    r.nombre_archivo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Cargando análisis...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        <FaFlask /> Visor de Análisis Médicos
      </h2>

      <div style={styles.searchBar}>
        <FaSearch style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Buscar análisis..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.stats}>
        <p>?? <strong>{resultadosFiltrados.length}</strong> análisis disponibles</p>
      </div>

      <div style={styles.grid}>
        {resultadosFiltrados.map((resultado) => (
          <div key={resultado.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.tipoArchivo}>
                <FaFileAlt /> {resultado.tipo_archivo?.toUpperCase()}
              </span>
              <span style={{
                ...styles.badge,
                backgroundColor: resultado.estado_validacion === 'validado' ? '#4CAF50' : '#FF9800'
              }}>
                {resultado.estado_validacion}
              </span>
            </div>
            
            <div style={styles.cardBody}>
              <h4 style={styles.fileName}>{resultado.nombre_archivo}</h4>
              <p style={styles.date}>
                ?? {resultado.fecha ? new Date(resultado.fecha).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </p>
            </div>

            <div style={styles.cardFooter}>
              <button 
                onClick={() => verDetalle(resultado.id)}
                style={styles.btnView}
              >
                <FaEye /> Ver Valores
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de detalle */}
      {detalleResultado && (
        <div style={styles.modal} onClick={() => setDetalleResultado(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3><FaFlask /> Resultados de Análisis</h3>
              <button 
                onClick={() => setDetalleResultado(null)}
                style={styles.closeButton}
              >
                <FaTimes />
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.infoSection}>
                <p><strong>Archivo:</strong> {detalleResultado.nombre_archivo}</p>
                <p><strong>Estado:</strong> <span style={{
                  color: detalleResultado.estado_validacion === 'validado' ? '#4CAF50' : '#FF9800',
                  fontWeight: 'bold'
                }}>
                  {detalleResultado.estado_validacion?.toUpperCase()}
                </span></p>
                <p><strong>Fecha:</strong> {new Date(detalleResultado.fecha).toLocaleString('es-ES')}</p>
              </div>

              {detalleResultado.interpretacion && (
                <div style={styles.interpretacion}>
                  <h4>?? Interpretación</h4>
                  <p>{detalleResultado.interpretacion}</p>
                </div>
              )}

              <div style={styles.valoresSection}>
                <h4>?? Valores de Laboratorio</h4>
                {renderValores(detalleResultado.datos)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f5f7fa'
  },
  title: {
    fontSize: '28px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#2c3e50'
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '16px'
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },
  searchBar: {
    position: 'relative',
    marginBottom: '20px'
  },
  searchIcon: {
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#999',
    fontSize: '18px'
  },
  searchInput: {
    width: '100%',
    padding: '14px 14px 14px 45px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '15px'
  },
  stats: {
    marginBottom: '20px',
    color: '#666',
    fontSize: '16px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    cursor: 'pointer'
  },
  cardHeader: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tipoArchivo: {
    fontWeight: 'bold',
    color: '#2196F3',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  badge: {
    padding: '5px 12px',
    borderRadius: '12px',
    fontSize: '11px',
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  cardBody: {
    padding: '20px'
  },
  fileName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
    wordBreak: 'break-word'
  },
  date: {
    fontSize: '14px',
    color: '#666'
  },
  cardFooter: {
    padding: '15px',
    borderTop: '1px solid #e0e0e0',
    backgroundColor: '#fafafa'
  },
  btnView: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
  },
  modalHeader: {
    padding: '20px',
    borderBottom: '2px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666'
  },
  modalBody: {
    padding: '20px'
  },
  infoSection: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  interpretacion: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#e3f2fd',
    borderRadius: '8px',
    borderLeft: '4px solid #2196F3'
  },
  valoresSection: {
    marginTop: '20px'
  },
  valoresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '15px',
    marginTop: '15px'
  },
  valorCard: {
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0'
  },
  valorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    fontSize: '13px'
  },
  estadoBadge: {
    padding: '3px 8px',
    borderRadius: '10px',
    fontSize: '10px',
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  valorNumero: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '5px'
  },
  unidad: {
    fontSize: '14px',
    fontWeight: 'normal',
    color: '#7f8c8d'
  },
  valorReferencia: {
    fontSize: '12px',
    color: '#95a5a6',
    fontStyle: 'italic'
  }
};

export default VisorResultados;
