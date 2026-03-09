import { useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/auth/register', formData);
            alert('Cont creat! Acum te poți loga.');
            navigate('/login');
        } catch (err) {
            alert('Eroare: ' + err.response?.data?.message);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Creează cont nou</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
                <input type="text" placeholder="Nume complet" onChange={e => setFormData({...formData, name: e.target.value})} required />
                <input type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} required />
                <input type="password" placeholder="Parolă" onChange={e => setFormData({...formData, password: e.target.value})} required />
                <button type="submit">Înregistrare</button>
            </form>
        </div>
    );
}

export default Signup;