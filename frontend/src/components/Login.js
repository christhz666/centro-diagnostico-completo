import React, { useState } from 'react';
import axios from 'axios';
import { FaHeartbeat, FaUser, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaMicroscope, FaXRay, FaDna, FaExclamationCircle } from 'react-icons/fa';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Usuario y contraseña son requeridos');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { username: username.trim(), password });
      onLogin(res.data.access_token, res.data.usuario);
    } catch (err) {
      if (err.response?.status === 429) setError('Demasiados intentos. Espere 5 minutos.');
      else if (err.response?.status === 401) setError('Usuario o contraseña incorrectos');
      else setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <div className="brand-icon"><FaHeartbeat /></div>
            <h1>Mi Esperanza<br /><span>Centro Diagnostico</span></h1>
            <p>Tecnología médica de vanguardia al servicio de tu salud</p>
          </div>
          <div className="login-features">
            <div className="feature-item">
              <span className="fi"><FaMicroscope /></span>
              <span>Laboratorio Clínico</span>
            </div>
            <div className="feature-item">
              <span className="fi"><FaXRay /></span>
              <span>Imagenología</span>
            </div>
            <div className="feature-item">
              <span className="fi"><FaDna /></span>
              <span>Diagnóstico Especializado</span>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-wrapper">
            <h2>Bienvenido</h2>
            <p className="login-subtitle">Ingresa tus credenciales para continuar</p>

            {error && (
              <div className="login-error">
                <FaExclamationCircle />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group-login">
                <div className="input-icon-wrapper">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                    placeholder="Usuario"
                    autoFocus
                    autoComplete="username"
                    disabled={loading}
                  />
                  <FaUser className="input-icon" />
                </div>
              </div>

              <div className="form-group-login">
                <div className="input-icon-wrapper">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="Contraseña"
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <FaLock className="input-icon" />
                  <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" style={{width:20,height:20,borderWidth:2}} />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <FaArrowRight />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
