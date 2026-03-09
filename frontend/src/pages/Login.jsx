import { useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

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
            alert('Te-ai logat, barosane!');
            navigate('/dashboard');
        } catch (err) {
            alert('Eroare la logare: ' + err.response.data.message);
        }
    };

    return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Login Co-Living</h2>
        <form onSubmit={handleLogin} style={{ display: 'inline-block', textAlign: 'left' }}>
                            <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Parola" onChange={e => setPassword(e.target.value)} />
                <button type="submit" style={{ width: '100%', marginBottom: '10px' }}>Intră în cont</button>
        </form>
        
        <hr style={{ width: '300px', margin: '20px auto' }} />
        
        <p>Nu ai un cont încă?</p>
        <button 
            onClick={() => navigate('/signup')} 
            style={{ backgroundColor: '#6c757d', color: 'white' }}
        >
            Creează cont nou (Sign Up)
        </button>
    </div>
);


}

export default Login;