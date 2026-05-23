import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

function Activity() {
    const [history, setHistory] = useState([]);
    const [expenseType, setExpenseType] = useState('ALL'); // 'ALL', 'ADMIN', 'PERSONAL'
    const [loading, setLoading] = useState(true);
    useNavigate(); // Păstrez pentru posibilități viitoare
    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                let url = '/expenses/history';
                if (expenseType !== 'ALL') {
                    url = `/expenses/by-type?type=${expenseType}`;
                }
                const { data } = await API.get(url);
                setHistory(data);
            } catch (err) {
                console.error("Eroare la istoric:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [expenseType]);

    return (
        <div>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-main)', margin: '0' }}>
                        Istoric Cheltuieli 📊
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                        Istoricul cheltuielilor și datoriilor din apartamentul tău.
                    </p>
                </div>
            </header>

            {/* Filtrare pe tip de cheltuieli */}
            <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setExpenseType('ALL')}
                    style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: expenseType === 'ALL' ? 'var(--primary)' : 'var(--bg-card)',
                        color: expenseType === 'ALL' ? 'white' : 'var(--text-main)',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                    }}
                >
                    📋 Toate
                </button>
                <button
                    onClick={() => setExpenseType('PERSONAL')}
                    style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: expenseType === 'PERSONAL' ? 'var(--primary)' : 'var(--bg-card)',
                        color: expenseType === 'PERSONAL' ? 'white' : 'var(--text-main)',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                    }}
                >
                    👥 Cheltuieli Colegi
                </button>
                <button
                    onClick={() => setExpenseType('ADMIN')}
                    style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: expenseType === 'ADMIN' ? 'var(--primary)' : 'var(--bg-card)',
                        color: expenseType === 'ADMIN' ? 'white' : 'var(--text-main)',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                    }}
                >
                    🏢 Facturile Administratorului
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Se încarcă...</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {history.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px' }}>
                            <p style={{ color: 'var(--text-muted)' }}>Nicio activitate înregistrată pentru această categorie.</p>
                        </div>
                    ) : (
                        history.map(exp => {
                            const isPayer = exp.payerId === currentUser.id;
                            const isAdminBilled = exp.isAdminBilled;
                            const accentColor = isPayer ? 'var(--success)' : 'var(--danger)';
                            
                            // Pentru facturile admin, arătă Complex name; altfel Payer name
                            const paymentSourceName = isAdminBilled ? exp.Complex?.name : exp.Payer?.name;
                            const paymentSourceText = isAdminBilled ? `Datorezi ${paymentSourceName}` : `Plătit de ${paymentSourceName}`;
                            
                            return (
                                <div key={exp.id} style={activityCardStyle(accentColor)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={iconBadgeStyle(accentColor)}>
                                            {isPayer ? '⬆️' : '⬇️'}
                                        </div>
                                        <div>
                                            <strong style={{ fontSize: '16px', display: 'block' }}>{exp.description}</strong>
                                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                                {isPayer ? 'Plătit de tine' : paymentSourceText}
                                            </span>
                                            {isAdminBilled && (
                                                <span style={{ fontSize: '12px', color: 'var(--primary)', marginLeft: '8px', display: 'inline-block', backgroundColor: 'var(--primary)10', padding: '2px 6px', borderRadius: '4px' }}>
                                                    🏢 Admin
                                                </span>
                                            )}
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
            )}
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