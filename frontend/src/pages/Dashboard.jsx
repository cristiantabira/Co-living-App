import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [balance, setBalance] = useState({ toReceive: 0, toPay: 0, balance: 0 });
    const navigate = useNavigate();
    
    const user = JSON.parse(localStorage.getItem('user')) || { name: 'Utilizator', role: 'USER' };

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchBalance = async () => {
            try {
                const { data } = await API.get('/expenses/balance');
                setBalance(data);
            } catch (err) {
                console.error("Eroare la preluarea balanței:", err);
                if (err.response?.status === 401) navigate('/login');
            }
        };

        fetchBalance();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Salut, {user.name}!</h1>
            
            <div style={{ 
                display: 'flex', 
                gap: '20px', 
                margin: '20px 0',
                padding: '20px',
                backgroundColor: '#f4f4f4',
                borderRadius: '8px' 
            }}>
                <div style={{ color: 'green', textAlign: 'center' }}>
                    <h3>De recuperat</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{balance.toReceive} RON</p>
                </div>
                
                <div style={{ width: '2px', backgroundColor: '#ddd' }}></div>

                <div style={{ color: 'red', textAlign: 'center' }}>
                    <h3>De plătit</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{balance.toPay} RON</p>
                </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {/* --- BUTOANE STANDARD (Existente) --- */}
                <button onClick={() => navigate('/add-expense')}>
                    + Adaugă Cheltuială
                </button>
                
                <button onClick={() => navigate('/activity')}>
                    Vezi Istoric Activitate
                </button>

                {/* --- BUTON NOU: PROFIL --- */}
                <button onClick={() => navigate('/profile')} style={{ backgroundColor: '#6c757d', color: 'white' }}>
                    Profilul Meu
                </button>

                {/* --- ADMIN DASHBOARD (Pentru Adminii de Complex) --- */}
                {user.role === 'ADMIN' && (
                    <button onClick={() => navigate('/admin-dashboard')} style={{ backgroundColor: '#007bff', color: 'white' }}>
                        Panel Admin Complex
                    </button>
                )}

                {/* --- ADMIN PANEL USERS (Pentru GOD - Existent) --- */}
                {user.role === 'GOD' && (
                    <button onClick={() => navigate('/users')} style={{ backgroundColor: 'gold' }}>
                        Admin Panel (Users)
                    </button>
                )}

                {/* --- ADMINISTRARE SPAȚII (Pentru GOD/ADMIN - Existent) --- */}
                {(user.role === 'GOD' || user.role === 'ADMIN') && (
                    <button onClick={() => navigate('/manage-spaces')} style={{ backgroundColor: '#28a745', color: 'white' }}>
                        Administrare Spații
                    </button>
                )}

                {/* --- LOGOUT (Existent) --- */}
                <button onClick={handleLogout} style={{ backgroundColor: '#ff4444', color: 'white' }}>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Dashboard;