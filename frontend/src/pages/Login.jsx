import { useState } from 'react';
import API from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      alert('Date de logare incorecte!');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={loginCardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: 'var(--primary)', margin: '0 0 8px 0', fontSize: '28px' }}>Co-Living App</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Bine ai revenit! Intră în contul tău.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Adresă Email</label>
            <input 
              type="email" 
              placeholder="nume@exemplu.com" 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={inputStyle}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Parolă</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={inputStyle}
            />
          </div>

          <button type="submit" style={submitButtonStyle}>
            Autentificare
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Nu ai un cont? </span>
          <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
            Creează unul acum
          </Link>
        </div>
      </div>
    </div>
  );
}

// Stiluri pentru Login
const containerStyle = {
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
};

const loginCardStyle = {
  background: 'white',
  padding: '40px',
  borderRadius: '20px',
  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  width: '100%',
  maxWidth: '400px'
};

const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '14px', fontWeight: '600', color: '#374151' };
const inputStyle = { padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '16px', outline: 'none' };
const submitButtonStyle = { backgroundColor: 'var(--primary)', color: 'white', padding: '14px', border: 'none', fontSize: '16px', fontWeight: '600', marginTop: '10px' };

export default Login;