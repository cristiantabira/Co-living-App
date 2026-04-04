import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [balance, setBalance] = useState({ toReceive: 0, toPay: 0, balance: 0 });
    const navigate = useNavigate();
    
    const user = JSON.parse(localStorage.getItem('user')) || { name: 'Utilizator', role: 'USER' };

    useEffect(() => {
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

    return (
        <div>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-main)', margin: '0' }}>
                    Salut, {user.name}! 👋
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                    Iată situația financiară a apartamentului tău pentru astăzi.
                </p>
            </header>
            
            {/* Secțiunea de Carduri Statistice */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                gap: '24px', 
                marginBottom: '40px' 
            }}>
                <div style={cardStyle('var(--success)')}>
                    <p style={cardLabelStyle}>De recuperat</p>
                    <h2 style={cardValueStyle('var(--success)')}>{balance.toReceive} RON</h2>
                </div>

                <div style={cardStyle('var(--danger)')}>
                    <p style={cardLabelStyle}>De plătit</p>
                    <h2 style={cardValueStyle('var(--danger)')}>{balance.toPay} RON</h2>
                </div>

                <div style={cardStyle('var(--primary)')}>
                    <p style={cardLabelStyle}>Balanță Totală</p>
                    <h2 style={cardValueStyle(balance.balance >= 0 ? 'var(--success)' : 'var(--danger)')}>
                        {balance.balance} RON
                    </h2>
                </div>
            </div>

            {/* Acțiuni Rapide */}
            <section>
                <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Acțiuni Rapide</h3>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                        onClick={() => navigate('/add-expense')}
                        style={primaryButtonStyle}
                    >
                        + Adaugă Cheltuială Nouă
                    </button>
                    <button 
                        onClick={() => navigate('/activity')}
                        style={secondaryButtonStyle}
                    >
                        Vezi Istoric Activitate
                    </button>
                </div>
            </section>
        </div>
    );
}

// Stiluri reutilizabile pentru Dashboard
const cardStyle = (color) => ({
    background: 'var(--bg-card)',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: 'var(--shadow)',
    borderLeft: `6px solid ${color}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
});

const cardLabelStyle = {
    color: 'var(--text-muted)',
    fontSize: '14px',
    fontWeight: '500',
    margin: 0
};

const cardValueStyle = (color) => ({
    color: color,
    fontSize: '32px',
    fontWeight: '700',
    margin: 0
});

const primaryButtonStyle = {
    backgroundColor: 'var(--primary)',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    fontSize: '16px',
    boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)'
};

const secondaryButtonStyle = {
    backgroundColor: 'white',
    color: 'var(--text-main)',
    padding: '12px 24px',
    border: '1px solid #e5e7eb',
    fontSize: '16px'
};

export default Dashboard;