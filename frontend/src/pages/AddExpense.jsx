import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

function AddExpense() {
    const [description, setDescription] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [roommates, setRoommates] = useState([]);
    const [selectedDebtors, setSelectedDebtors] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoommates = async () => {
            try {
                const { data } = await API.get('/apartments/roommates');
                const currentUser = JSON.parse(localStorage.getItem('user'));
                const others = data.filter(r => r.id !== currentUser.id);
                setRoommates(others);
                setSelectedDebtors(others.map(r => r.id));
            } catch (err) {
                console.error("Eroare la încărcare colegi:", err);
            }
        };
        fetchRoommates();
    }, []);

    const handleCheckboxChange = (id) => {
        if (selectedDebtors.includes(id)) {
            setSelectedDebtors(selectedDebtors.filter(d => d !== id));
        } else {
            setSelectedDebtors([...selectedDebtors, id]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const participantsCount = selectedDebtors.length + 1;
        const amountPerPerson = parseFloat(totalAmount) / participantsCount;

        const debtorsData = selectedDebtors.map(id => ({
            userId: id,
            amountOwed: amountPerPerson.toFixed(2)
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
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
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
                        style={inputStyle}
                    />
                </div>

                <div style={{ marginTop: '10px' }}>
                    <label style={labelStyle}>Cine participă la cheltuială?</label>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        Suma se va împărți egal între tine și cei selectați.
                    </p>
                    <div style={debtorsGridStyle}>
                        {roommates.map(roommate => (
                            <label key={roommate.id} style={debtorOptionStyle(selectedDebtors.includes(roommate.id))}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedDebtors.includes(roommate.id)}
                                    onChange={() => handleCheckboxChange(roommate.id)}
                                    style={{ marginRight: '10px' }}
                                />
                                {roommate.name}
                            </label>
                        ))}
                    </div>
                </div>

                <div style={summaryBoxStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Recuperezi per persoană:</span>
                        <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '20px' }}>
                            {totalAmount && selectedDebtors.length > 0 
                                ? (totalAmount / (selectedDebtors.length + 1)).toFixed(2) 
                                : '0.00'} RON
                        </span>
                    </div>
                </div>

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