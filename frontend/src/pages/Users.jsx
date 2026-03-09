import { useEffect, useState } from 'react';
import API from '../api/axios';

function Users() {
    const [users, setUsers] = useState([]);
    const [complexes, setComplexes] = useState([]);
    const [selectedComplex, setSelectedComplex] = useState({}); // Stocăm complexul ales per user

    const fetchData = async () => {
        try {
            const [uRes, cRes] = await Promise.all([
                API.get('/auth/users'),
                API.get('/apartments/complexes')
            ]);
            setUsers(uRes.data);
            setComplexes(cRes.data);
        } catch (err) {
            console.error("Eroare la încărcare:", err);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const payload = { 
                userId, 
                newRole,
                // Trimitem complexId doar dacă e ADMIN și s-a selectat ceva
                complexId: newRole === 'ADMIN' ? selectedComplex[userId] : null 
            };

            if (newRole === 'ADMIN' && !selectedComplex[userId]) {
                alert("Te rugăm să selectezi un complex pentru acest Admin!");
                return;
            }

            await API.put('/auth/update-role', payload);
            alert('Rol actualizat cu succes!');
            fetchData(); 
        } catch (err) {
            alert('Eroare: ' + (err.response?.data?.message || 'Nu ai permisiunea necesară!'));
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Gestionare Utilizatori (GOD Mode)</h2>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f4' }}>
                        <th>Nume</th>
                        <th>Email</th>
                        <th>Rol Curent</th>
                        <th>Acțiuni de Administrare</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>
                                <span style={{ 
                                    padding: '4px 8px', 
                                    borderRadius: '4px', 
                                    backgroundColor: u.role === 'GOD' ? '#ffd700' : u.role === 'ADMIN' ? '#007bff' : '#eee',
                                    color: u.role === 'ADMIN' ? 'white' : 'black'
                                }}>
                                    {u.role}
                                </span>
                            </td>
                            <td>
                                {u.role !== 'GOD' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {/* Dropdown pentru selectat complexul înainte de a-l face ADMIN */}
                                        <select 
                                            onChange={(e) => setSelectedComplex({...selectedComplex, [u.id]: e.target.value})}
                                            style={{ padding: '5px' }}
                                        >
                                            <option value="">Alege Complex...</option>
                                            {complexes.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>

                                        <button 
                                            onClick={() => handleRoleChange(u.id, 'ADMIN')}
                                            style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                                        >
                                            Fă-l ADMIN
                                        </button>

                                        <button 
                                            onClick={() => handleRoleChange(u.id, 'USER')}
                                            style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                                        >
                                            Fă-l USER
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Users;