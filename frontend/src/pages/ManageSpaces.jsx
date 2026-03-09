import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

function ManageSpaces() {
    const [view, setView] = useState('complex');
    const [complexes, setComplexes] = useState([]);
    const [users, setUsers] = useState([]);
    const [apartments, setApartments] = useState([]);
    const navigate = useNavigate();

    // State-uri pentru formulare
    const [complexData, setComplexData] = useState({ name: '', address: '' });
    const [aptData, setAptData] = useState({ number: '', block: '', complexId: '' });
    const [assignment, setAssignment] = useState({ userId: '', complexId: '', apartmentId: '' });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [cRes, uRes, aRes] = await Promise.all([
                API.get('/apartments/complexes'),
                API.get('/auth/users'),
                API.get('/apartments/all')
            ]);
            setComplexes(cRes.data);
            setUsers(uRes.data);
            setApartments(aRes.data);
        } catch (err) { console.error(err); }
    };

    const handleComplexSubmit = async (e) => {
        e.preventDefault();
        await API.post('/apartments/complex', complexData);
        alert('Complex creat!');
        loadInitialData();
    };

    const handleAptSubmit = async (e) => {
        e.preventDefault();
        await API.post('/apartments', aptData);
        alert('Apartament creat!');
        loadInitialData();
    };

    const handleAssignUser = async (e) => {
        e.preventDefault();
        // Aici verificăm dacă alocăm Admin la Complex sau User la Apartament
        if (assignment.apartmentId) {
            await API.post('/apartments/assign', { userId: assignment.userId, apartmentId: assignment.apartmentId });
            alert('User alocat la apartament!');
        } else {
            await API.post('/apartments/complex/assign-admin', { userId: assignment.userId, complexId: assignment.complexId });
            alert('Admin alocat la complex!');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <button onClick={() => navigate('/dashboard')}>← Dashboard</button>
            <h2>Admin Hub - Spații și Alocări</h2>
            
            <nav style={{ marginBottom: '20px' }}>
                <button onClick={() => setView('complex')}>+ Complex</button>
                <button onClick={() => setView('apt')}>+ Apartament</button>
                <button onClick={() => setView('assign')}>Alocări (Admin/User)</button>
            </nav>

            {view === 'complex' && (
                <form onSubmit={handleComplexSubmit} style={formStyle}>
                    <h3>Creează Complex</h3>
                    <input placeholder="Nume" onChange={e => setComplexData({...complexData, name: e.target.value})} />
                    <input placeholder="Adresă" onChange={e => setComplexData({...complexData, address: e.target.value})} />
                    <button type="submit">Salvează</button>
                </form>
            )}

            {view === 'apt' && (
                <form onSubmit={handleAptSubmit} style={formStyle}>
                    <h3>Creează Apartament</h3>
                    <select onChange={e => setAptData({...aptData, complexId: e.target.value})}>
                        <option value="">Selectează Complexul</option>
                        {complexes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input placeholder="Număr Apt" onChange={e => setAptData({...aptData, number: e.target.value})} />
                    <input placeholder="Bloc" onChange={e => setAptData({...aptData, block: e.target.value})} />
                    <button type="submit">Salvează</button>
                </form>
            )}

{view === 'assign' && (
    <form onSubmit={handleAssignUser} style={formStyle}>
        <h3>Alocare Personal / Locatari</h3>
        
        <label>1. Selectează Utilizatorul:</label>
        <select onChange={e => setAssignment({...assignment, userId: e.target.value})} required>
            <option value="">-- Alege --</option>
            {users.map(u => (
                <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                </option>
            ))}
        </select>

        <hr />

        <div style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px' }}>
            <label><strong>Varianta A:</strong> Alocă ca ADMIN la Complex</label>
            <select 
                disabled={assignment.apartmentId !== ''} 
                onChange={e => setAssignment({...assignment, complexId: e.target.value})}
            >
                <option value="">-- Selectează Complex --</option>
                {complexes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>

        <p style={{ textAlign: 'center', margin: '5px 0' }}>SAU</p>

        <div style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
            <label><strong>Varianta B:</strong> Alocă ca LOCATAR la Apartament</label>
            <select 
                disabled={assignment.complexId !== ''} 
                onChange={e => setAssignment({...assignment, apartmentId: e.target.value})}
            >
                <option value="">-- Selectează Apartament --</option>
                {apartments.map(a => (
                    <option key={a.id} value={a.id}>
                        {a.Complex?.name} - Ap. {a.number}
                    </option>
                ))}
            </select>
        </div>

        <button type="submit" style={{ marginTop: '10px', backgroundColor: '#007bff', color: 'white' }}>
            Execută Alocarea
        </button>
    </form>
)}
        </div>
    );
}

const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', border: '1px solid #ddd', padding: '15px' };

export default ManageSpaces;