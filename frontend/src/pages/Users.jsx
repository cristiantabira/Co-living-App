import { useEffect, useState } from 'react';
import API from '../api/axios';

function Users() {
    const [users, setUsers] = useState([]);
    const [complexes, setComplexes] = useState([]);
    const [selectedComplex, setSelectedComplex] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Verificăm dacă rutele sunt corecte conform backend-ului tău
            const uRes = await API.get('/auth/users');
            const cRes = await API.get('/apartments/complexes');
            
            // Debug: Vezi în consolă ce vine de la server
            console.log("Utilizatori primiți:", uRes.data);

            // Ne asigurăm că setăm un array, chiar dacă serverul trimite null sau obiect
            setUsers(Array.isArray(uRes.data) ? uRes.data : uRes.data.users || []);
            setComplexes(cRes.data || []);
        } catch (err) {
            console.error("Eroare la încărcare date:", err);
            alert("Nu am putut încărca utilizatorii. Verifică consola!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const payload = { 
                userId, 
                newRole,
                complexId: newRole === 'ADMIN' ? selectedComplex[userId] : null 
            };

            if (newRole === 'ADMIN' && !selectedComplex[userId]) {
                alert("Te rugăm să selectezi un complex pentru acest Admin!");
                return;
            }

            await API.put('/auth/update-role', payload);
            alert('Rol actualizat cu succes!');
            fetchData(); // Refresh listă
        } catch (err) {
            alert('Eroare: ' + (err.response?.data?.message || 'Eroare server'));
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Se încarcă utilizatorii...</div>;

    return (
        <div>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-main)', margin: '0' }}>
                    Control Utilizatori 👥
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                    Total: {users.length} utilizatori găsiți.
                </p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {users.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>Nu există utilizatori de afișat.</p>
                ) : (
                    users.map(u => (
                        <div key={u.id} style={userCardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                                <div style={avatarStyle(u.role)}>
                                    {u.name ? u.name.charAt(0) : '?'}
                                </div>
                                <div>
                                    <strong style={{ fontSize: '16px', display: 'block' }}>{u.name}</strong>
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{u.email}</span>
                                </div>
                                <div style={roleBadgeStyle(u.role)}>{u.role}</div>
                            </div>

                            {u.role !== 'GOD' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {u.role !== 'ADMIN' && (
                                        <select 
                                            onChange={(e) => setSelectedComplex({...selectedComplex, [u.id]: e.target.value})}
                                            style={adminSelectStyle}
                                        >
                                            <option value="">Alege Complex...</option>
                                            {complexes.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    )}

                                    <button 
                                        onClick={() => handleRoleChange(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                                        style={u.role === 'ADMIN' ? secondaryBtnStyle : primaryBtnStyle}
                                    >
                                        {u.role === 'ADMIN' ? 'Revocă Admin' : 'Fă-l ADMIN'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// Stilurile rămân aceleași (userCardStyle, avatarStyle, etc.)
const userCardStyle = { background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const avatarStyle = (role) => ({ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: role === 'GOD' ? '#FEF3C7' : role === 'ADMIN' ? '#DBEAFE' : '#F3F4F6', color: role === 'GOD' ? '#92400E' : role === 'ADMIN' ? '#1E40AF' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' });
const roleBadgeStyle = (role) => ({ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: role === 'GOD' ? '#FEF3C7' : role === 'ADMIN' ? '#DBEAFE' : '#F3F4F6', color: role === 'GOD' ? '#92400E' : role === 'ADMIN' ? '#1E40AF' : '#374151', textTransform: 'uppercase', marginLeft: '10px' });
const adminSelectStyle = { padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', backgroundColor: '#fff' };
const primaryBtnStyle = { backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px' };
const secondaryBtnStyle = { backgroundColor: 'white', color: 'var(--danger)', border: '1px solid var(--danger)', padding: '8px 16px', borderRadius: '8px' };

export default Users;