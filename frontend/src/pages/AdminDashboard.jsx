import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
    const [managedData, setManagedData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                setLoading(true);
                const { data } = await API.get('/apartments/admin/overview');
                // Verificăm dacă datele primite sunt un array
                setManagedData(Array.isArray(data) ? data : []);
                setError(null);
            } catch (err) {
                console.error("Eroare la încărcarea datelor de admin:", err);
                setError("Nu s-au putut încărca datele complexului. Verifică drepturile de administrator.");
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    if (loading) return <div style={{ padding: '20px' }}>Se încarcă datele de administrare...</div>;
    
    if (error) return (
        <div style={{ padding: '20px', color: 'red' }}>
            <p>{error}</p>
            <button onClick={() => navigate('/dashboard')}>Înapoi la Dashboard</button>
        </div>
    );

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Panou Administrator Complex</h2>
                <button onClick={() => navigate('/dashboard')}>Înapoi</button>
            </div>

            {managedData.length === 0 ? (
                <p>Nu aveți complexe alocate pentru administrare.</p>
            ) : (
                managedData.map(complex => (
                    <div key={complex.id} style={complexCardStyle}>
                        <div style={{ borderBottom: '1px solid #eee', marginBottom: '15px' }}>
                            <h3 style={{ margin: '0 0 5px 0' }}>🏢 {complex.name}</h3>
                            <p style={{ color: '#666', fontSize: '14px' }}>{complex.address}</p>
                        </div>
                        
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                            gap: '15px' 
                        }}>
                            {/* Verificare obligatorie pentru Apartments pentru a evita crash-ul */}
                            {complex.Apartments && complex.Apartments.map(apt => (
                                <div key={apt.id} style={aptCardStyle}>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Apt. {apt.number}</div>
                                    <div style={{ color: '#555', fontSize: '13px', marginTop: '5px' }}>
                                        {apt.block ? `Bloc: ${apt.block}` : 'Fără bloc specificat'}
                                    </div>
                                    <p style={{ 
                                        margin: '10px 0 0 0', 
                                        paddingTop: '5px', 
                                        borderTop: '1px solid #eee',
                                        fontSize: '12px' 
                                    }}>
                                        Locatari: {apt.Users?.length || 0}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

const complexCardStyle = { 
    border: '1px solid #ccc', 
    padding: '20px', 
    marginBottom: '20px', 
    borderRadius: '12px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};

const aptCardStyle = { 
    padding: '12px', 
    backgroundColor: '#f8f9fa', 
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    textAlign: 'center'
};

export default AdminDashboard;