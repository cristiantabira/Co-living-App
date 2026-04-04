import { useEffect, useState } from 'react';
import API from '../api/axios';

function AdminDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await API.get('/apartments/admin/overview');
        setData(res.data);
      } catch (err) {
        console.error("Eroare la încărcare dashboard admin:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return <p>Se încarcă datele administrative...</p>;

  return (
    <div>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-main)', margin: '0' }}>
            Panou Administrare Complex 🏢
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Monitorizarea apartamentelor și a activității locatarilor.
        </p>
      </header>

      {data.map(complex => (
        <div key={complex.id} style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--primary)' }}>{complex.name}</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {complex.Apartments?.map(apt => (
              <div key={apt.id} style={aptCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', marginBottom: '12px' }}>
                  <strong style={{ fontSize: '18px' }}>Ap. {apt.number}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Bloc {apt.block}</span>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Locatari:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {apt.Users?.length > 0 ? apt.Users.map(u => (
                      <span key={u.id} style={userBadgeStyle}>{u.name}</span>
                    )) : <em style={{ fontSize: '13px', color: '#999' }}>Niciun locatar alocat</em>}
                  </div>
                </div>

                <div style={{ background: '#f9fafb', padding: '10px', borderRadius: '8px', fontSize: '14px' }}>
                   <span>Total Cheltuieli: </span>
                   <strong style={{ color: 'var(--text-main)' }}>
                     {apt.Expenses?.reduce((acc, curr) => acc + curr.totalAmount, 0) || 0} RON
                   </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const aptCardStyle = {
  background: 'var(--bg-card)',
  padding: '20px',
  borderRadius: '16px',
  boxShadow: 'var(--shadow)',
  border: '1px solid #e5e7eb'
};

const userBadgeStyle = {
  background: '#eef2ff',
  color: '#4338ca',
  padding: '4px 10px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '500'
};

export default AdminDashboard;