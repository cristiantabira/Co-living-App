import { useState } from 'react';
import API from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

function SignUp() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', formData);
      alert('Cont creat cu succes! Te poți loga.');
      navigate('/login');
    } catch (err) {
      alert('Eroare la creare cont: ' + (err.response?.data?.message || 'Email deja existent'));
    }
  };

  return (
    <div style={containerStyle}>
      <div style={loginCardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: 'var(--primary)', margin: '0 0 8px 0', fontSize: '28px' }}>Alătură-te comunității</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Începe să gestionezi cheltuielile inteligent.</p>
        </div>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Nume Complet</label>
            <input 
              type="text" 
              placeholder="Ion Popescu" 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required 
              style={inputStyle}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Adresă Email</label>
            <input 
              type="email" 
              placeholder="nume@exemplu.com" 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              required 
              style={inputStyle}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Parolă</label>
            <input 
              type="password" 
              placeholder="Minim 6 caractere" 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              required 
              style={inputStyle}
            />
          </div>

          <button type="submit" style={submitButtonStyle}>
            Creează Cont
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Ai deja un cont? </span>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
            Loghează-te
          </Link>
        </div>
      </div>
    </div>
  );
}

// Stilurile sunt aceleași ca la Login (containerStyle, loginCardStyle, etc.)
const containerStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyCenter: 'center', background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' };
const loginCardStyle = { background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', width: '100%', maxWidth: '400px' };
const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '14px', fontWeight: '600', color: '#374151' };
const inputStyle = { padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '16px' };
const submitButtonStyle = { backgroundColor: 'var(--primary)', color: 'white', padding: '14px', border: 'none', fontSize: '16px', fontWeight: '600' };

export default SignUp;