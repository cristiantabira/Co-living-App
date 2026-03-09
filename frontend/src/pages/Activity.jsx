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
        <div style={{ padding: '20px' }}>
            <button onClick={() => navigate('/dashboard')}>← Înapoi la Dashboard</button>
            <h2>Activitate Recentă</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {history.length === 0 ? <p>Nicio activitate încă.</p> : history.map(exp => (
                    <div key={exp.id} style={{
                        border: '1px solid #ddd',
                        padding: '15px',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: exp.payerId === currentUser.id ? '#f0fff0' : '#fff0f0'
                    }}>
                        <div>
                            <strong>{exp.description}</strong>
                            <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#666' }}>
                                Plătit de: {exp.payerId === currentUser.id ? 'Tine' : exp.Payer.name}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold' }}>{exp.totalAmount} RON</div>
                            <small>
                                {exp.payerId === currentUser.id 
                                    ? `Ai de recuperat: ${(exp.totalAmount - (exp.totalAmount / (exp.Debtors.length + 1))).toFixed(2)} RON`
                                    : `Datoria ta: ${exp.Debtors.find(d => d.id === currentUser.id)?.ExpenseDebt.amountOwed} RON`}
                            </small>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Activity;