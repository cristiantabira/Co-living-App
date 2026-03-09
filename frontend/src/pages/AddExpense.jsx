import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

function AddExpense() {
    const [description, setDescription] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [roommates, setRoommates] = useState([]);
    const [selectedDebtors, setSelectedDebtors] = useState([]);
    const navigate = useNavigate();

    // 1. Încărcăm colegii de apartament când se deschide pagina
    useEffect(() => {
        const fetchRoommates = async () => {
            try {
                const { data } = await API.get('/apartments/roommates');
                // Scoatem user-ul curent din lista de debitori (el e payer-ul)
                const currentUser = JSON.parse(localStorage.getItem('user'));
                const others = data.filter(r => r.id !== currentUser.id);
                setRoommates(others);
                // Implicit, toată lumea e selectată
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
        
        // Calculăm suma per om (Payer + Debtors selectați)
        const participantsCount = selectedDebtors.length + 1; // +1 este cel care plătește
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
            alert('Cheltuială adăugată!');
            navigate('/dashboard');
        } catch (err) {
            alert('Eroare: ' + err.response?.data?.message);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Adaugă Cheltuială Nouă</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
                <input 
                    type="text" 
                    placeholder="Descriere (ex: Factură Enel, Pizza)" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required 
                />
                <input 
                    type="number" 
                    placeholder="Suma Totală (RON)" 
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    required 
                />

                <h4>Cine participă la cheltuială? (se împarte egal)</h4>
                {roommates.map(roommate => (
                    <label key={roommate.id} style={{ display: 'block' }}>
                        <input 
                            type="checkbox" 
                            checked={selectedDebtors.includes(roommate.id)}
                            onChange={() => handleCheckboxChange(roommate.id)}
                        />
                        {roommate.name}
                    </label>
                ))}

                <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
                    Suma de recuperat per om: {totalAmount && selectedDebtors.length > 0 
                        ? (totalAmount / (selectedDebtors.length + 1)).toFixed(2) 
                        : 0} RON
                </div>

                <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px' }}>
                    Salvează Cheltuiala
                </button>
                <button type="button" onClick={() => navigate('/dashboard')}>Anulează</button>
            </form>
        </div>
    );
}

export default AddExpense;