import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

function Activity() {
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await API.get('/expenses/history');
                setHistory(data);
            } catch (err) {
                console.error("Eroare la istoric:", err);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-main)', margin: '0' }}>
                        Activitate Recentă 📊
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                        Istoricul cheltuielilor și datoriilor din apartamentul tău.
                    </p>
                </div>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {history.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px' }}>
                        <p style={{ color: 'var(--text-muted)' }}>Nicio activitate înregistrată încă.</p>
                    </div>
                ) : (
                    history.map(exp => {
                        const isPayer = exp.payerId === currentUser.id;
                        const accentColor = isPayer ? 'var(--success)' : 'var(--danger)';
                        
                        return (
                            <div key={exp.id} style={activityCardStyle(accentColor)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={iconBadgeStyle(accentColor)}>
                                        {isPayer ? '⬆️' : '⬇️'}
                                    </div>
                                    <div>
                                        <strong style={{ fontSize: '16px', display: 'block' }}>{exp.description}</strong>
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                            {isPayer ? 'Plătit de tine' : `Plătit de ${exp.Payer?.name}`}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '700', fontSize: '18px', color: 'var(--text-main)' }}>
                                        {exp.totalAmount} RON
                                    </div>
                                    <div style={{ fontSize: '13px', fontWeight: '500', color: accentColor, marginTop: '4px' }}>
                                        {isPayer 
                                            ? `Ai de recuperat: ${(exp.totalAmount - (exp.totalAmount / (exp.Debtors.length + 1))).toFixed(2)} RON`
                                            : `Datoria ta: ${exp.Debtors.find(d => d.id === currentUser.id)?.ExpenseDebt.amountOwed} RON`}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// Stiluri pentru pagina de Activitate
const activityCardStyle = (color) => ({
    background: 'var(--bg-card)',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: 'var(--shadow)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeft: `5px solid ${color}`,
    transition: 'transform 0.2s ease',
});

const iconBadgeStyle = (color) => ({
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: `${color}15`, // Culoarea cu opacitate mică pentru fundalul icoanei
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
});

export default Activity;