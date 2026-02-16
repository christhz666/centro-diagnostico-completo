import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FaSearch, FaUser, FaFlask, FaFileMedicalAlt, FaClipboardList,
  FaArrowLeft, FaCheck, FaClock, FaDownload,
  FaCalendarAlt, FaPhone, FaEnvelope, FaTint, FaAllergies,
  FaEye, FaHistory, FaFileAlt, FaPrint, FaTimes
} from 'react-icons/fa';

const API = '/api';

function PortalMedico() {
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [historial, setHistorial] = useState(null);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [tabActivo, setTabActivo] = useState('ordenes');
  const [ordenDetalle, setOrdenDetalle] = useState(null);
  const [loadingOrden, setLoadingOrden] = useState(false);
  const [resultadoDetalle, setResultadoDetalle] = useState(null);
  const [loadingResultado, setLoadingResultado] = useState(false);
  const timeoutRef = useRef(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (busqueda.length < 2) { setResultadosBusqueda([]); return; }
    timeoutRef.current = setTimeout(buscarPacientes, 350);
    return () => clearTimeout(timeoutRef.current);
  }, [busqueda]);

  const buscarPacientes = async () => {
    setBuscando(true);
    try {
      const res = await axios.get(`${API}/medico/buscar?q=${encodeURIComponent(busqueda)}`, { headers });
      setResultadosBusqueda(res.data.pacientes || []);
    } catch (err) { console.error(err); }
    finally { setBuscando(false); }
  };

  const seleccionarPaciente = async (pac) => {
    setPacienteSeleccionado(pac);
    setBusqueda('');
    setResultadosBusqueda([]);
    setLoadingHistorial(true);
    setTabActivo('ordenes');
    setOrdenDetalle(null);
    setResultadoDetalle(null);
    try {
      const res = await axios.get(`${API}/medico/historial/${pac.id}`, { headers });
      setHistorial(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingHistorial(false); }
  };

  const verOrden = async (ordenId) => {
    setLoadingOrden(true);
    try {
      const res = await axios.get(`${API}/ordenes/${ordenId}`, { headers });
      setOrdenDetalle(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingOrden(false); }
  };

  const verResultado = async (resultadoId) => {
    setLoadingResultado(true);
    try {
      const res = await axios.get(`${API}/resultados/${resultadoId}`, { headers });
      setResultadoDetalle(res.data);
    } catch (err) {
      console.error(err);
      alert('Error al cargar resultado');
    }
    finally { setLoadingResultado(false); }
  };

  const imprimirResultado = () => {
    if (!resultadoDetalle) return;
    const win = window.open('', '_blank');
    const pac = resultadoDetalle.paciente;
    const valoresHtml = (resultadoDetalle.valores || []).map(v => {
      const esNumerico = v.ref_min && v.ref_max;
      const color = v.estado === 'alto' ? '#ef4444' : v.estado === 'bajo' ? '#f59e0b' : '#10b981';
      return '<tr>' +
        '<td style="padding:8px;border-bottom:1px solid #eee">' + v.parametro + '</td>' +
        '<td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;color:' + color + '">' + v.valor + ' ' + (v.unidad || '') + '</td>' +
        (esNumerico ? '<td style="padding:8px;border-bottom:1px solid #eee;color:#888;font-size:12px">' + v.ref_min + ' - ' + v.ref_max + ' ' + (v.unidad || '') + '</td>' : '<td style="padding:8px;border-bottom:1px solid #eee"></td>') +
        '</tr>';
    }).join('');

    win.document.write('<html><head><title>Resultado - Mi Esperanza</title>');
    win.document.write('<style>body{font-family:Arial,sans-serif;padding:30px;max-width:700px;margin:0 auto}h2{text-align:center;color:#4f46e5;margin-bottom:5px}table{width:100%;border-collapse:collapse;margin:15px 0}.header-info{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:15px 0;padding:15px;background:#f3f4f6;border-radius:8px}.header-info p{margin:3px 0;font-size:13px}.interpretacion{background:#f0fdf4;border-left:4px solid #10b981;padding:15px;margin:15px 0;border-radius:4px}.footer{text-align:center;color:#888;font-size:11px;margin-top:30px;border-top:1px solid #eee;padding-top:10px}</style>');
    win.document.write('</head><body>');
    win.document.write('<h2>MI ESPERANZA</h2>');
    win.document.write('<p style="text-align:center;color:#666;font-size:13px">CENTRO DIAGNOSTICO</p>');
    win.document.write('<p style="text-align:center;color:#888;font-size:11px">RNC: 000-00000-0 | Tel: 809-000-0000</p>');
    win.document.write('<hr style="border:1px solid #4f46e5;margin:15px 0">');
    win.document.write('<h3 style="text-align:center;color:#333">RESULTADO DE ' + (resultadoDetalle.estudio || '').toUpperCase() + '</h3>');
    win.document.write('<div class="header-info">');
    if (pac) {
      win.document.write('<p><strong>Paciente:</strong> ' + pac.nombre + ' ' + pac.apellido + '</p>');
      win.document.write('<p><strong>Cedula:</strong> ' + (pac.cedula || 'N/A') + '</p>');
    }
    win.document.write('<p><strong>Fecha:</strong> ' + new Date(resultadoDetalle.fecha).toLocaleDateString('es-DO') + '</p>');
    win.document.write('<p><strong>Codigo:</strong> ' + (resultadoDetalle.codigo || '') + '</p>');
    win.document.write('</div>');
    win.document.write('<table><thead><tr style="background:#4f46e5;color:white"><th style="padding:10px;text-align:left">Parametro</th><th style="padding:10px;text-align:left">Resultado</th><th style="padding:10px;text-align:left">Ref.</th></tr></thead><tbody>');
    win.document.write(valoresHtml);
    win.document.write('</tbody></table>');
    if (resultadoDetalle.interpretacion) {
      win.document.write('<div class="interpretacion"><strong>Interpretacion:</strong><br>' + resultadoDetalle.interpretacion + '</div>');
    }
    win.document.write('<div class="footer"><p>Mi Esperanza Centro Diagnostico</p><p>Documento generado: ' + new Date().toLocaleString('es-DO') + '</p></div>');
    win.document.write('</body></html>');
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const volver = () => {
    if (resultadoDetalle) { setResultadoDetalle(null); }
    else if (ordenDetalle) { setOrdenDetalle(null); }
    else { setPacienteSeleccionado(null); setHistorial(null); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-DO', { day:'2-digit', month:'2-digit', year:'numeric' }) : '-';
  const formatMoney = (n) => 'RD$ ' + Number(n || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 });

  const getEstadoColor = (estado) => {
    if (estado === 'alto') return 'var(--danger)';
    if (estado === 'bajo') return 'var(--warning)';
    return 'var(--success)';
  };

  // ===== MODAL RESULTADO DETALLE =====
  if (resultadoDetalle) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-title">
            <span className="page-title-icon"><FaFileMedicalAlt /></span>
            {resultadoDetalle.estudio}
          </h2>
          <div style={{display:'flex',gap:10}}>
            <button className="btn btn-outline" onClick={() => setResultadoDetalle(null)}><FaArrowLeft /> Volver</button>
            <button className="btn btn-primary" onClick={imprimirResultado}><FaPrint /> Imprimir</button>
          </div>
        </div>

        <div className="card" style={{marginBottom:24}}>
          <div className="card-body">
            <div className="historial-header">
              {resultadoDetalle.paciente && (
                <>
                  <div className="historial-info-card"><label>Paciente</label><span>{resultadoDetalle.paciente.nombre} {resultadoDetalle.paciente.apellido}</span></div>
                  <div className="historial-info-card"><label>Cedula</label><span>{resultadoDetalle.paciente.cedula || 'N/A'}</span></div>
                </>
              )}
              <div className="historial-info-card"><label>Fecha</label><span>{formatDate(resultadoDetalle.fecha)}</span></div>
              <div className="historial-info-card"><label>Estudio</label><span>{resultadoDetalle.codigo} - {resultadoDetalle.estudio}</span></div>
              {resultadoDetalle.categoria && <div className="historial-info-card"><label>Categoria</label><span>{resultadoDetalle.categoria}</span></div>}
              <div className="historial-info-card"><label>Estado</label><span className="badge badge-success">{resultadoDetalle.estado_validacion || 'validado'}</span></div>
            </div>
          </div>
        </div>

        <div className="card" style={{marginBottom:24}}>
          <div className="card-header"><h3><span className="card-h-icon"><FaFlask /></span> Valores del Analisis</h3></div>
          <div className="card-body no-pad">
            {resultadoDetalle.valores && resultadoDetalle.valores.length > 0 ? (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Parametro</th><th>Resultado</th><th>Unidad</th><th>Ref. Min</th><th>Ref. Max</th><th>Estado</th></tr></thead>
                  <tbody>
                    {resultadoDetalle.valores.map((v, i) => (
                      <tr key={i}>
                        <td><strong>{v.parametro}</strong></td>
                        <td><strong style={{color: getEstadoColor(v.estado), fontSize: 15}}>{v.valor}</strong></td>
                        <td style={{color:'var(--gray-500)'}}>{v.unidad || '-'}</td>
                        <td style={{color:'var(--gray-400)',fontSize:13}}>{v.ref_min || '-'}</td>
                        <td style={{color:'var(--gray-400)',fontSize:13}}>{v.ref_max || '-'}</td>
                        <td>
                          {v.estado === 'alto' ? <span className="badge badge-danger">Alto</span> :
                           v.estado === 'bajo' ? <span className="badge badge-warning">Bajo</span> :
                           <span className="badge badge-success">Normal</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state"><p>Sin valores registrados</p></div>
            )}
          </div>
        </div>

        {resultadoDetalle.interpretacion && (
          <div className="card">
            <div className="card-header"><h3><span className="card-h-icon"><FaFileAlt /></span> Interpretacion</h3></div>
            <div className="card-body">
              <div style={{padding:16,background:'var(--success-bg)',borderRadius:12,borderLeft:'4px solid var(--success)',fontSize:14,lineHeight:1.7,color:'var(--gray-700)'}}>
                {resultadoDetalle.interpretacion}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== DETALLE DE ORDEN =====
  if (ordenDetalle) {
    const pacInfo = historial?.paciente;
    return (
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-title"><span className="page-title-icon"><FaClipboardList /></span> Orden {ordenDetalle.numero_orden}</h2>
          <button className="btn btn-outline" onClick={volver}><FaArrowLeft /> Volver</button>
        </div>
        <div className="card" style={{marginBottom:24}}>
          <div className="card-body">
            <div className="historial-header">
              <div className="historial-info-card"><label>Paciente</label><span>{pacInfo?.nombre} {pacInfo?.apellido}</span></div>
              <div className="historial-info-card"><label>Fecha</label><span>{formatDate(ordenDetalle.fecha_orden)}</span></div>
              <div className="historial-info-card"><label>Estado</label><span className={"badge badge-" + ordenDetalle.estado}>{ordenDetalle.estado}</span></div>
              <div className="historial-info-card"><label>Estudios</label><span>{(ordenDetalle.detalles || []).length}</span></div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3><span className="card-h-icon"><FaFlask /></span> Examenes</h3></div>
          <div className="card-body no-pad">
            {ordenDetalle.detalles && ordenDetalle.detalles.length > 0 ? (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Codigo</th><th>Examen</th><th>Precio</th><th>Estado</th><th>Resultado</th></tr></thead>
                  <tbody>
                    {ordenDetalle.detalles.map((d, i) => (
                      <tr key={i}>
                        <td><span style={{fontSize:11,fontWeight:700,color:'var(--primary)',background:'var(--primary-bg)',padding:'3px 8px',borderRadius:4}}>{d.estudio?.codigo || '-'}</span></td>
                        <td><strong>{d.estudio?.nombre || 'N/A'}</strong></td>
                        <td>{formatMoney(d.precio_final)}</td>
                        <td><span className={"badge badge-" + d.estado}>{d.estado}</span></td>
                        <td>{d.estado === 'completado' ? <span className="badge badge-success">Disponible</span> : <span className="badge badge-warning">Pendiente</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state"><FaFlask className="empty-icon" /><p>No hay examenes</p></div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===== HISTORIAL =====
  if (pacienteSeleccionado && historial && !loadingHistorial) {
    const pac = historial.paciente;
    return (
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-title"><span className="page-title-icon"><FaUser /></span> {pac.nombre} {pac.apellido}</h2>
          <button className="btn btn-outline" onClick={volver}><FaArrowLeft /> Buscar otro</button>
        </div>
        <div className="card" style={{marginBottom:24}}>
          <div className="card-body">
            <div className="historial-header">
              <div className="historial-info-card"><label><FaUser style={{marginRight:4}} /> Cedula</label><span>{pac.cedula || 'N/A'}</span></div>
              <div className="historial-info-card"><label><FaPhone style={{marginRight:4}} /> Telefono</label><span>{pac.telefono || 'N/A'}</span></div>
              <div className="historial-info-card"><label><FaEnvelope style={{marginRight:4}} /> Email</label><span>{pac.email || 'N/A'}</span></div>
              <div className="historial-info-card"><label><FaCalendarAlt style={{marginRight:4}} /> Nacimiento</label><span>{formatDate(pac.fecha_nacimiento)}</span></div>
              {pac.tipo_sangre && <div className="historial-info-card"><label><FaTint style={{marginRight:4}} /> Sangre</label><span>{pac.tipo_sangre}</span></div>}
              {pac.alergias && <div className="historial-info-card"><label><FaAllergies style={{marginRight:4}} /> Alergias</label><span style={{color:'var(--danger)'}}>{pac.alergias}</span></div>}
            </div>
          </div>
        </div>

        <div className="stats-grid" style={{marginBottom:24}}>
          <div className="stat-card purple"><div className="stat-info"><h4>Ordenes</h4><div className="stat-value">{historial.total_ordenes || 0}</div></div><div className="stat-icon-box purple"><FaClipboardList /></div></div>
          <div className="stat-card green"><div className="stat-info"><h4>Resultados</h4><div className="stat-value">{historial.total_resultados || 0}</div></div><div className="stat-icon-box green"><FaFileMedicalAlt /></div></div>
          <div className="stat-card blue"><div className="stat-info"><h4>Facturas</h4><div className="stat-value">{historial.total_facturas || 0}</div></div><div className="stat-icon-box blue"><FaFileAlt /></div></div>
        </div>

        <div className="tabs-container">
          <button className={"tab-btn " + (tabActivo === 'ordenes' ? 'active' : '')} onClick={() => setTabActivo('ordenes')}><FaClipboardList /> Ordenes ({(historial.ordenes || []).length})</button>
          <button className={"tab-btn " + (tabActivo === 'resultados' ? 'active' : '')} onClick={() => setTabActivo('resultados')}><FaFileMedicalAlt /> Resultados ({(historial.resultados || []).length})</button>
        </div>

        {tabActivo === 'ordenes' && (
          <div className="card">
            <div className="card-header"><h3><span className="card-h-icon"><FaClipboardList /></span> Ordenes</h3></div>
            <div className="card-body no-pad">
              {historial.ordenes && historial.ordenes.length > 0 ? (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead><tr><th>Orden</th><th>Fecha</th><th>Examenes</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {historial.ordenes.map(o => (
                        <tr key={o.id}>
                          <td><strong>{o.numero_orden}</strong></td>
                          <td>{formatDate(o.fecha_orden)}</td>
                          <td><span style={{background:'var(--primary-bg)',color:'var(--primary)',padding:'4px 10px',borderRadius:12,fontSize:12,fontWeight:600}}>{o.total_estudios || 0} estudios</span></td>
                          <td><span className={"badge badge-" + o.estado}>{o.estado}</span></td>
                          <td><button className="btn btn-sm btn-primary" onClick={() => verOrden(o.id)}><FaEye /> Ver</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state"><FaClipboardList className="empty-icon" /><p>No hay ordenes</p></div>
              )}
            </div>
          </div>
        )}

        {tabActivo === 'resultados' && (
          <div className="card">
            <div className="card-header"><h3><span className="card-h-icon"><FaFileMedicalAlt /></span> Resultados</h3></div>
            <div className="card-body">
              {historial.resultados && historial.resultados.length > 0 ? (
                <div>
                  {historial.resultados.map((r, i) => (
                    <div key={i} className="resultado-item">
                      <div style={{display:'flex',alignItems:'center',gap:14,flex:1}}>
                        <div style={{width:44,height:44,borderRadius:12,background:'var(--success-bg)',color:'var(--success)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}><FaFileAlt /></div>
                        <div>
                          <strong style={{display:'block',fontSize:14}}>{r.estudio}</strong>
                          <span style={{fontSize:12,color:'var(--gray-500)'}}>{formatDate(r.fecha)}</span>
                        </div>
                      </div>
                      <div style={{display:'flex',gap:8,alignItems:'center'}}>
                        <span className="badge badge-success">Listo</span>
                        <button className="btn btn-sm btn-primary" onClick={() => verResultado(r.id)}><FaEye /> Ver Analisis</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state"><FaFileMedicalAlt className="empty-icon" /><p>No hay resultados</p><small>Apareceran cuando esten listos</small></div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== BUSQUEDA =====
  return (
    <div className="page-container">
      <div className="page-header"><h2 className="page-title"><span className="page-title-icon"><FaFlask /></span> Examenes y Resultados</h2></div>
      <div className="card" style={{maxWidth:700,margin:'0 auto'}}>
        <div className="card-body" style={{padding:32}}>
          <div style={{textAlign:'center',marginBottom:28}}>
            <div style={{width:72,height:72,borderRadius:20,background:'var(--primary-bg)',color:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,margin:'0 auto 16px'}}><FaSearch /></div>
            <h3 style={{fontSize:20,fontWeight:700,color:'var(--gray-800)',marginBottom:6}}>Buscar Paciente</h3>
            <p style={{color:'var(--gray-500)',fontSize:14}}>Busca por nombre, cedula o telefono</p>
          </div>
          <div className="search-box" style={{marginBottom:20}}>
            <FaSearch className="search-icon" />
            <input type="text" className="search-input" placeholder="Escriba nombre, cedula o telefono..." value={busqueda} onChange={e => setBusqueda(e.target.value)} autoFocus style={{paddingLeft:42,fontSize:15,padding:'14px 16px 14px 42px'}} />
          </div>
          {buscando && <div style={{textAlign:'center',padding:20}}><div className="spinner" style={{margin:'0 auto'}}></div></div>}
          {resultadosBusqueda.length > 0 && (
            <div style={{marginTop:8}}>
              {resultadosBusqueda.map(p => (
                <div key={p.id} className="result-item-inline" onClick={() => seleccionarPaciente(p)}>
                  <div className="result-avatar"><FaUser /></div>
                  <div className="result-info"><strong>{p.nombre}</strong><span>{p.cedula || p.telefono || ''}</span></div>
                  <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); seleccionarPaciente(p); }}><FaEye /> Ver</button>
                </div>
              ))}
            </div>
          )}
          {!buscando && busqueda.length >= 2 && resultadosBusqueda.length === 0 && (
            <div className="empty-state" style={{padding:30}}><FaSearch className="empty-icon" style={{fontSize:36}} /><p>No se encontraron pacientes</p></div>
          )}
        </div>
      </div>
      {loadingHistorial && <div style={{textAlign:'center',padding:40}}><div className="spinner" style={{margin:'0 auto',width:50,height:50}}></div><p style={{marginTop:14,color:'var(--gray-500)'}}>Cargando historial...</p></div>}
    </div>
  );
}

export default PortalMedico;
