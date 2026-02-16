import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaFileInvoiceDollar, FaEye, FaPrint, FaMoneyBillWave, 
  FaSearch, FaTimes, FaCheck, FaClock, FaDownload,
  FaUser, FaReceipt
} from 'react-icons/fa';

const API = '/api';

function Facturas() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pagando, setPagando] = useState(false);
  const [formPago, setFormPago] = useState({ monto: '', metodo_pago: 'efectivo', referencia: '' });
  const [descargando, setDescargando] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchFacturas(); }, []);

  const fetchFacturas = async () => {
    try {
      const res = await axios.get(`${API}/facturas/`, { headers });
      setFacturas(res.data.facturas || []);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const verDetalle = async (id) => {
    try {
      const res = await axios.get(`${API}/facturas/${id}`, { headers });
      setDetalle(res.data);
      setPagando(false);
    } catch (err) { console.error(err); }
  };

  const registrarPago = async () => {
    if (!formPago.monto || parseFloat(formPago.monto) <= 0) return;
    try {
      await axios.post(`${API}/facturas/${detalle.id}/pagar`, {
        monto: parseFloat(formPago.monto),
        metodo_pago: formPago.metodo_pago,
        referencia: formPago.referencia
      }, { headers });
      await fetchFacturas();
      await verDetalle(detalle.id);
      setPagando(false);
      setFormPago({ monto: '', metodo_pago: 'efectivo', referencia: '' });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error al registrar pago');
    }
  };

  const descargarPDF = async (facturaId, numeroFactura) => {
    setDescargando(true);
    try {
      const res = await axios.get(`${API}/impresion/factura-termica/${facturaId}`, {
        headers,
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) {
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura_${numeroFactura}_80mm.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setTimeout(() => window.URL.revokeObjectURL(url), 30000);
    } catch (err) {
      console.error(err);
      alert('Error al generar PDF');
    } finally {
      setDescargando(false);
    }
  };

  const descargarPDFCarta = async (facturaId, numeroFactura) => {
    setDescargando(true);
    try {
      const res = await axios.get(`${API}/facturas/${facturaId}/pdf`, {
        headers,
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) {
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura_${numeroFactura}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setTimeout(() => window.URL.revokeObjectURL(url), 30000);
    } catch (err) {
      console.error(err);
      alert('Error al generar PDF');
    } finally {
      setDescargando(false);
    }
  };

  const formatMoney = (n) => {
    return 'RD$ ' + Number(n || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 });
  };
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-DO') : '-';

  const facturasFiltradas = facturas.filter(f => {
    const matchTexto = filtro === '' || 
      (f.numero_factura || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (f.paciente?.nombre || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (f.paciente?.apellido || '').toLowerCase().includes(filtro.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || f.estado === filtroEstado;
    return matchTexto && matchEstado;
  });

  const totalPagadas = facturas.filter(f => f.estado === 'pagada').reduce((s, f) => s + (f.total || 0), 0);
  const totalPendientes = facturas.filter(f => f.estado === 'pendiente').reduce((s, f) => s + (f.total || 0), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">
          <span className="page-title-icon"><FaFileInvoiceDollar /></span>
          Facturacion
        </h2>
      </div>

      <div className="stats-grid" style={{marginBottom: 24}}>
        <div className="stat-card green">
          <div className="stat-info">
            <h4>Cobrado</h4>
            <div className="stat-value" style={{fontSize: 20}}>{formatMoney(totalPagadas)}</div>
          </div>
          <div className="stat-icon-box green"><FaCheck /></div>
        </div>
        <div className="stat-card orange">
          <div className="stat-info">
            <h4>Pendiente</h4>
            <div className="stat-value" style={{fontSize: 20}}>{formatMoney(totalPendientes)}</div>
          </div>
          <div className="stat-icon-box orange"><FaClock /></div>
        </div>
        <div className="stat-card purple">
          <div className="stat-info">
            <h4>Total Facturas</h4>
            <div className="stat-value">{facturas.length}</div>
          </div>
          <div className="stat-icon-box purple"><FaReceipt /></div>
        </div>
      </div>

      <div className="card" style={{marginBottom: 24}}>
        <div className="card-body" style={{padding: '16px 24px'}}>
          <div style={{display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center'}}>
            <div className="search-box" style={{flex: 1, minWidth: 200}}>
              <FaSearch className="search-icon" />
              <input className="search-input" placeholder="Buscar factura o paciente..." value={filtro} onChange={e => setFiltro(e.target.value)} />
            </div>
            <div className="tabs-container" style={{marginBottom: 0}}>
              <button className={`tab-btn ${filtroEstado === 'todos' ? 'active' : ''}`} onClick={() => setFiltroEstado('todos')}>Todos</button>
              <button className={`tab-btn ${filtroEstado === 'pendiente' ? 'active' : ''}`} onClick={() => setFiltroEstado('pendiente')}>Pendientes</button>
              <button className={`tab-btn ${filtroEstado === 'pagada' ? 'active' : ''}`} onClick={() => setFiltroEstado('pagada')}>Pagadas</button>
              <button className={`tab-btn ${filtroEstado === 'parcial' ? 'active' : ''}`} onClick={() => setFiltroEstado('parcial')}>Parcial</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body no-pad">
          {loading ? (
            <div className="loading-spinner"><div className="spinner"></div></div>
          ) : facturasFiltradas.length === 0 ? (
            <div className="empty-state">
              <FaFileInvoiceDollar className="empty-icon" />
              <p>No hay facturas</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>No Factura</th><th>Paciente</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {facturasFiltradas.map(f => (
                    <tr key={f.id}>
                      <td><strong>{f.numero_factura}</strong></td>
                      <td>
                        <div style={{display:'flex', alignItems:'center', gap: 8}}>
                          <div style={{width: 32, height: 32, borderRadius: 8, background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0}}><FaUser /></div>
                          <span>{f.paciente?.nombre} {f.paciente?.apellido}</span>
                        </div>
                      </td>
                      <td>{formatDate(f.fecha_factura)}</td>
                      <td><strong style={{color: 'var(--success)'}}>{formatMoney(f.total)}</strong></td>
                      <td><span className={`badge badge-${f.estado}`}>{f.estado}</span></td>
                      <td>
                        <div style={{display:'flex', gap: 6}}>
                          <button className="btn btn-sm btn-outline" onClick={() => verDetalle(f.id)} title="Ver detalle"><FaEye /></button>
                          <button className="btn btn-sm btn-primary" onClick={() => descargarPDF(f.id, f.numero_factura)} disabled={descargando} title="Imprimir 80mm"><FaPrint /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {detalle && (
        <div className="modal-overlay" onClick={() => setDetalle(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 600}}>
            <button className="close-btn" onClick={() => setDetalle(null)}><FaTimes /></button>
            
            <h3 style={{display:'flex', alignItems:'center', gap: 10}}>
              <FaFileInvoiceDollar style={{color:'var(--primary)'}} />
              Factura {detalle.numero_factura}
            </h3>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20, padding: 16, background: 'var(--gray-50)', borderRadius: 12}}>
              <div>
                <small style={{color:'var(--gray-500)', fontSize: 11, textTransform: 'uppercase', fontWeight: 600}}>Paciente</small>
                <div style={{fontWeight: 600, fontSize: 14}}>{detalle.paciente?.nombre} {detalle.paciente?.apellido}</div>
              </div>
              <div>
                <small style={{color:'var(--gray-500)', fontSize: 11, textTransform: 'uppercase', fontWeight: 600}}>NCF</small>
                <div style={{fontWeight: 600, fontSize: 14}}>{detalle.ncf || 'N/A'}</div>
              </div>
              <div>
                <small style={{color:'var(--gray-500)', fontSize: 11, textTransform: 'uppercase', fontWeight: 600}}>Fecha</small>
                <div style={{fontWeight: 600, fontSize: 14}}>{formatDate(detalle.fecha_factura)}</div>
              </div>
              <div>
                <small style={{color:'var(--gray-500)', fontSize: 11, textTransform: 'uppercase', fontWeight: 600}}>Estado</small>
                <div><span className={`badge badge-${detalle.estado}`}>{detalle.estado}</span></div>
              </div>
            </div>

            <div className="table-wrapper" style={{marginBottom: 16}}>
              <table className="data-table">
                <thead><tr><th>Descripcion</th><th style={{textAlign:'right'}}>Total</th></tr></thead>
                <tbody>
                  {(detalle.detalles || []).map(d => (
                    <tr key={d.id}><td>{d.descripcion}</td><td style={{textAlign:'right', fontWeight: 600}}>{formatMoney(d.total)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{background: 'var(--gray-50)', borderRadius: 12, padding: 16, marginBottom: 16}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom: 6, fontSize: 14}}>
                <span>Subtotal</span><span>{formatMoney(detalle.subtotal)}</span>
              </div>
              {detalle.descuento > 0 && (
                <div style={{display:'flex', justifyContent:'space-between', marginBottom: 6, fontSize: 14, color: 'var(--danger)'}}>
                  <span>Descuento</span><span>-{formatMoney(detalle.descuento)}</span>
                </div>
              )}
              <div style={{display:'flex', justifyContent:'space-between', marginBottom: 6, fontSize: 14}}>
                <span>ITBIS (18%)</span><span>{formatMoney(detalle.itbis)}</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize: 18, fontWeight: 800, color: 'var(--primary)', borderTop: '2px solid var(--gray-200)', paddingTop: 10, marginTop: 6}}>
                <span>TOTAL</span><span>{formatMoney(detalle.total)}</span>
              </div>
              {detalle.saldo > 0 && (
                <div style={{display:'flex', justifyContent:'space-between', fontSize: 14, fontWeight: 700, color: 'var(--danger)', marginTop: 6}}>
                  <span>Saldo Pendiente</span><span>{formatMoney(detalle.saldo)}</span>
                </div>
              )}
            </div>

            {detalle.pagos && detalle.pagos.length > 0 && (
              <div style={{marginBottom: 16}}>
                <h4 style={{fontSize: 14, fontWeight: 700, marginBottom: 10, display:'flex', alignItems:'center', gap: 6}}>
                  <FaMoneyBillWave style={{color:'var(--success)'}} /> Pagos Registrados
                </h4>
                {detalle.pagos.map(p => (
                  <div key={p.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding: '10px 14px', background: 'var(--success-bg)', borderRadius: 8, marginBottom: 6}}>
                    <div>
                      <strong style={{fontSize: 13}}>{formatMoney(p.monto)}</strong>
                      <span style={{fontSize: 11, color: 'var(--gray-500)', marginLeft: 8}}>{p.metodo_pago}</span>
                    </div>
                    <span style={{fontSize: 12, color: 'var(--gray-500)'}}>{formatDate(p.fecha_pago)}</span>
                  </div>
                ))}
              </div>
            )}

            {detalle.estado !== 'pagada' && !pagando && (
              <button className="btn btn-success btn-block" onClick={() => { setPagando(true); setFormPago({ monto: String(detalle.saldo || detalle.total), metodo_pago: 'efectivo', referencia: '' }); }}>
                <FaMoneyBillWave /> Registrar Pago
              </button>
            )}

            {pagando && (
              <div style={{background: 'var(--gray-50)', borderRadius: 12, padding: 18, marginTop: 8}}>
                <h4 style={{fontSize: 14, fontWeight: 700, marginBottom: 14}}>Registrar Pago</h4>
                <div className="form-grid" style={{gridTemplateColumns: '1fr 1fr'}}>
                  <div className="form-group">
                    <label>Monto (RD$)</label>
                    <input type="number" step="0.01" value={formPago.monto} onChange={e => setFormPago({...formPago, monto: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Metodo</label>
                    <select value={formPago.metodo_pago} onChange={e => setFormPago({...formPago, metodo_pago: e.target.value})}>
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  <div className="form-group" style={{gridColumn: '1/-1'}}>
                    <label>Referencia (opcional)</label>
                    <input type="text" value={formPago.referencia} onChange={e => setFormPago({...formPago, referencia: e.target.value})} placeholder="No de referencia" />
                  </div>
                </div>
                <div style={{display:'flex', gap: 10, marginTop: 14}}>
                  <button className="btn btn-outline" onClick={() => setPagando(false)}>Cancelar</button>
                  <button className="btn btn-success" onClick={registrarPago}><FaCheck /> Confirmar Pago</button>
                </div>
              </div>
            )}

            <div style={{display:'flex', gap: 10, marginTop: 16}}>
              <button className="btn btn-primary" onClick={() => descargarPDF(detalle.id, detalle.numero_factura)} disabled={descargando} style={{flex: 1}}>
                <FaPrint /> {descargando ? 'Generando...' : 'Imprimir 80mm'}
              </button>
              <button className="btn btn-outline" onClick={() => descargarPDFCarta(detalle.id, detalle.numero_factura)} disabled={descargando}>
                <FaDownload /> PDF Carta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Facturas;
