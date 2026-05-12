import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

function AddExpense() {
    const [description, setDescription] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [roommates, setRoommates] = useState([]);
    const [selectedDebtors, setSelectedDebtors] = useState({});
    const [showCustomSplit, setShowCustomSplit] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoommates = async () => {
            try {
                const { data } = await API.get('/apartments/roommates');
                const currentUser = JSON.parse(localStorage.getItem('user'));
                const others = data.filter(r => r.id !== currentUser.id);
                setRoommates(others);
                const initialDebtors = {};
                others.forEach(r => {
                    initialDebtors[r.id] = { selected: true, amount: '' };
                });
                setSelectedDebtors(initialDebtors);
            } catch (err) {
                console.error("Eroare la încărcare colegi:", err);
            }
        };
        fetchRoommates();
    }, []);

    const handleCheckboxChange = (id) => {
        setSelectedDebtors({
            ...selectedDebtors,
            [id]: { ...selectedDebtors[id], selected: !selectedDebtors[id]?.selected }
        });
    };

    const handleAmountChange = (id, value) => {
        setSelectedDebtors({
            ...selectedDebtors,
            [id]: { ...selectedDebtors[id], amount: value }
        });
    };

    const getSelectedCount = () => Object.values(selectedDebtors).filter(d => d?.selected).length;
    
    const getEqualSplitAmount = () => {
        if (!totalAmount || getSelectedCount() === 0) return 0;
        return (parseFloat(totalAmount) / (getSelectedCount() + 1)).toFixed(2);
    };

    const validateSplit = () => {
        const selectedList = Object.entries(selectedDebtors)
            .filter(([_, d]) => d?.selected)
            .map(([id, d]) => ({ id, amount: parseFloat(d?.amount || 0) }));

        const totalDebtors = selectedList.reduce((sum, d) => sum + d.amount, 0);
        const totalExpected = parseFloat(totalAmount) || 0;

        if (Math.abs(totalDebtors - totalExpected) > 0.01) {
            alert(`Suma debitorilor (${totalDebtors.toFixed(2)}) nu egalează totalul (${totalExpected.toFixed(2)})`);
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateSplit()) return;

        const debtorsData = Object.entries(selectedDebtors)
            .filter(([_, d]) => d?.selected)
            .map(([id, d]) => ({
                userId: parseInt(id),
                amountOwed: parseFloat(d?.amount || 0).toFixed(2)
            }));

        try {
            await API.post('/expenses', {
                description,
                totalAmount: parseFloat(totalAmount),
                category: 'General',
                debtors: debtorsData
            });
            navigate('/dashboard');
        } catch (err) {
            alert('Eroare: ' + err.response?.data?.message);
        }
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-main)', margin: '0' }}>
                    Adaugă Cheltuială 💸
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                    Introdu detaliile și împarte suma cu colegii de apartament.
                </p>
            </header>

            <form onSubmit={handleSubmit} style={formCardStyle}>
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Ce ai plătit?</label>
                    <input 
                        type="text" 
                        placeholder="Ex: Factură Enel, Consumabile, Pizza..." 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required 
                        style={inputStyle}
                    />
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Suma Totală (RON)</label>
                    <input 
                        type="number" 
                        placeholder="0.00" 
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        required 
                        step="0.01"
                        style={inputStyle}
                    />
                </div>

                <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <label style={labelStyle}>Cine participă la cheltuială?</label>
                        <button
                            type="button"
                            onClick={() => setShowCustomSplit(!showCustomSplit)}
                            style={toggleButtonStyle}
                        >
                            {showCustomSplit ? '🔒 Egal' : '⚙️ Custom'}
                        </button>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        {showCustomSplit 
                            ? 'Editează suma pe care fiecare persoană o datorează.' 
                            : 'Suma se va împărți egal între tine și cei selectați.'}
                    </p>
                    <div style={debtorsGridStyle}>
                        {roommates.map(roommate => (
                            <div key={roommate.id}>
                                <label style={debtorOptionStyle(selectedDebtors[roommate.id]?.selected)}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedDebtors[roommate.id]?.selected || false}
                                        onChange={() => handleCheckboxChange(roommate.id)}
                                        style={{ marginRight: '10px' }}
                                    />
                                    {roommate.name}
                                </label>
                                {showCustomSplit && selectedDebtors[roommate.id]?.selected && (
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={selectedDebtors[roommate.id]?.amount || ''}
                                        onChange={(e) => handleAmountChange(roommate.id, e.target.value)}
                                        step="0.01"
                                        min="0"
                                        style={customAmountInputStyle}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {!showCustomSplit && (
                    <div style={summaryBoxStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Recuperezi per persoană:</span>
                            <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '20px' }}>
                                {getEqualSplitAmount()} RON
                            </span>
                        </div>
                    </div>
                )}

                {showCustomSplit && (
                    <div style={summaryBoxStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Total alocat debitorilor:</span>
                            <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '20px' }}>
                                {Object.entries(selectedDebtors)
                                    .filter(([_, d]) => d?.selected)
                                    .reduce((sum, [_, d]) => sum + parseFloat(d?.amount || 0), 0)
                                    .toFixed(2)} RON
                            </span>
                        </div>
                        <div style={{ fontSize: '12px', color: totalAmount && Math.abs(Object.entries(selectedDebtors)
                                    .filter(([_, d]) => d?.selected)
                                    .reduce((sum, [_, d]) => sum + parseFloat(d?.amount || 0), 0) - parseFloat(totalAmount)) > 0.01 ? '#ef4444' : '#22c55e' }}>
                            {totalAmount && Math.abs(Object.entries(selectedDebtors)
                                    .filter(([_, d]) => d?.selected)
                                    .reduce((sum, [_, d]) => sum + parseFloat(d?.amount || 0), 0) - parseFloat(totalAmount)) > 0.01 
                                ? '❌ Suma debitorilor trebuie să egaleze totalul!' 
                                : '✅ Suma este corectă'}
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button type="submit" style={submitButtonStyle}>
                        Salvează Cheltuiala
                    </button>
                    <button type="button" onClick={() => navigate('/dashboard')} style={cancelButtonStyle}>
                        Anulează
                    </button>
                </div>
            </form>
        </div>
    );
}

// Stiluri pentru AddExpense
const formCardStyle = {
    background: 'var(--bg-card)',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: 'var(--shadow)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
};

const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
};

const labelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-main)'
};

const inputStyle = {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
};

const customAmountInputStyle = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    marginTop: '6px',
    width: '100%',
    outline: 'none',
};

const debtorsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '12px'
};

const debtorOptionStyle = (isSelected) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '8px',
    border: `1px solid ${isSelected ? 'var(--primary)' : '#e5e7eb'}`,
    backgroundColor: isSelected ? '#f5f3ff' : 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s'
});

const summaryBoxStyle = {
    background: '#f9fafb',
    padding: '20px',
    borderRadius: '12px',
    border: '1px dashed #e5e7eb'
};

const toggleButtonStyle = {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#f3f4f6',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s'
};

const submitButtonStyle = {
    flex: 1,
    backgroundColor: 'var(--primary)',
    color: 'white',
    padding: '14px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600'
};

const cancelButtonStyle = {
    padding: '14px 24px',
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid #e5e7eb',
    fontSize: '16px'
};

export default AddExpense;