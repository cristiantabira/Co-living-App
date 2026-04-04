import { useEffect, useState } from 'react';
import API from '../api/axios';

function ManageSpaces() {
    const [view, setView] = useState('complexes'); // 'complexes', 'apartments', 'assign'
    const [complexes, setComplexes] = useState([]);
    const [apartments, setApartments] = useState([]);
    const [users, setUsers] = useState([]);

    // Form states
    const [newComplex, setNewComplex] = useState({ name: '', address: '' });
    const [newApt, setNewApt] = useState({ number: '', block: '', complexId: '' });
    const [assignment, setAssignment] = useState({ userId: '', apartmentId: '', complexId: '' });

    const loadData = async () => {
        try {
            const [cRes, aRes, uRes] = await Promise.all([
                API.get('/apartments/complexes'),
                API.get('/apartments/all'),
                API.get('/auth/users')
            ]);
            setComplexes(cRes.data);
            setApartments(aRes.data);
            setUsers(uRes.data);
        } catch (err) {
            console.error("Eroare la încărcarea datelor:", err);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleCreateComplex = async (e) => {
        e.preventDefault();
        await API.post('/apartments/complex', newComplex);
        setNewComplex({ name: '', address: '' });
        loadData();
    };

    const handleCreateApt = async (e) => {
        e.preventDefault();
        await API.post('/apartments', newApt);
        setNewApt({ number: '', block: '', complexId: '' });
        loadData();
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            if (assignment.complexId && !assignment.apartmentId) {
                await API.post('/apartments/complex/assign-admin', { userId: assignment.userId, complexId: assignment.complexId });
                alert("Admin alocat complexului!");
            } else {
                await API.post('/apartments/assign', { userId: assignment.userId, apartmentId: assignment.apartmentId });
                alert("Locatar alocat apartamentului!");
            }
            setAssignment({ userId: '', apartmentId: '', complexId: '' });
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || "Eroare la alocare");
        }
    };

    return (
        <div>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-main)', margin: '0' }}>
                    Administrare Spații ⚙️
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Configurarea structurii locative și alocarea utilizatorilor.</p>
            </header>

            {/* Navigație Tab-uri */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                {['complexes', 'apartments', 'assign'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setView(tab)}
                        style={tab === view ? activeTabStyle : inactiveTabStyle}
                    >
                        {tab === 'complexes' ? '🏢 Complexe' : tab === 'apartments' ? '🔑 Apartamente' : '🤝 Alocări'}
                    </button>
                ))}
            </div>

            <div style={contentCardStyle}>
                {/* VIEW: COMPLEXE */}
                {view === 'complexes' && (
                    <section>
                        <form onSubmit={handleCreateComplex} style={formGridStyle}>
                            <input type="text" placeholder="Nume Complex" value={newComplex.name} onChange={e => setNewComplex({...newComplex, name: e.target.value})} required style={inputStyle} />
                            <input type="text" placeholder="Adresă" value={newComplex.address} onChange={e => setNewComplex({...newComplex, address: e.target.value})} required style={inputStyle} />
                            <button type="submit" style={primaryButtonStyle}>+ Adaugă Complex</button>
                        </form>
                        <table style={tableStyle}>
                            <thead><tr><th style={thStyle}>Nume</th><th style={thStyle}>Adresă</th></tr></thead>
                            <tbody>
                                {complexes.map(c => (
                                    <tr key={c.id} style={{borderBottom: '1px solid #f3f4f6'}}><td style={tdStyle}>{c.name}</td><td style={tdStyle}>{c.address}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {/* VIEW: APARTAMENTE */}
                {view === 'apartments' && (
                    <section>
                        <form onSubmit={handleCreateApt} style={formGridStyle}>
                            <input type="text" placeholder="Nr. Ap" value={newApt.number} onChange={e => setNewApt({...newApt, number: e.target.value})} required style={inputStyle} />
                            <input type="text" placeholder="Bloc/Scară" value={newApt.block} onChange={e => setNewApt({...newApt, block: e.target.value})} style={inputStyle} />
                            <select value={newApt.complexId} onChange={e => setNewApt({...newApt, complexId: e.target.value})} required style={inputStyle}>
                                <option value="">Selectează Complex</option>
                                {complexes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <button type="submit" style={primaryButtonStyle}>+ Adaugă Ap.</button>
                        </form>
                        <table style={tableStyle}>
                            <thead><tr><th style={thStyle}>Apartament</th><th style={thStyle}>Complex</th></tr></thead>
                            <tbody>
                                {apartments.map(a => (
                                    <tr key={a.id} style={{borderBottom: '1px solid #f3f4f6'}}><td style={tdStyle}>{a.block} - {a.number}</td><td style={tdStyle}>{a.Complex?.name}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {/* VIEW: ALOCĂRI */}
                {view === 'assign' && (
                    <section style={{ maxWidth: '500px', margin: '0 auto' }}>
                        <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Utilizator</label>
                                <select onChange={e => setAssignment({...assignment, userId: e.target.value})} required style={inputStyle}>
                                    <option value="">Alege utilizator</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                                </select>
                            </div>
                            
                            <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <label style={labelStyle}>Opțiunea A: Alocă la Apartament (Locatar)</label>
                                <select disabled={!!assignment.complexId} onChange={e => setAssignment({...assignment, apartmentId: e.target.value})} style={inputStyle}>
                                    <option value="">Alege Apartament</option>
                                    {apartments.map(a => <option key={a.id} value={a.id}>{a.Complex?.name} - Ap. {a.number}</option>)}
                                </select>
                            </div>

                            <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <label style={labelStyle}>Opțiunea B: Alocă la Complex (Admin)</label>
                                <select disabled={!!assignment.apartmentId} onChange={e => setAssignment({...assignment, complexId: e.target.value})} style={inputStyle}>
                                    <option value="">Alege Complex</option>
                                    {complexes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <button type="submit" style={primaryButtonStyle}>Finalizează Alocarea</button>
                        </form>
                    </section>
                )}
            </div>
        </div>
    );
}

// Stiluri specifice
const activeTabStyle = { padding: '10px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', fontWeight: '600' };
const inactiveTabStyle = { padding: '10px 20px', backgroundColor: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' };
const contentCardStyle = { background: 'var(--bg-card)', padding: '30px', borderRadius: '16px', boxShadow: 'var(--shadow)' };
const formGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', marginBottom: '30px' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', width: '100%' };
const primaryButtonStyle = { backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '12px 20px', fontWeight: '600' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
const thStyle = { textAlign: 'left', padding: '12px', color: 'var(--text-muted)', borderBottom: '2px solid #f3f4f6' };
const tdStyle = { padding: '12px' };
const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '14px', fontWeight: '600', marginBottom: '5px', display: 'block' };

export default ManageSpaces;