import { useEffect, useState } from 'react';
import API from '../api/axios';

function AdminDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBillForm, setShowBillForm] = useState(false);
  const [billFormData, setBillFormData] = useState({
    scopeType: 'COMPLEX',
    scopeId: '',
    description: '',
    totalAmount: ''
  });
  const [complexes, setComplexes] = useState([]);
  const [apartments, setApartments] = useState([]);

  useEffect(() => {
    fetchAdminData();
    fetchComplexesAndApartments();
  }, []);

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

  const fetchComplexesAndApartments = async () => {
    try {
      const [cRes, aRes] = await Promise.all([
        API.get('/apartments/complexes'),
        API.get('/apartments/all')
      ]);
      setComplexes(cRes.data);
      setApartments(aRes.data);
    } catch (err) {
      console.error("Eroare la încărcare complexe/apartamente:", err);
    }
  };

  const handleBillSubmit = async (e) => {
    e.preventDefault();
    
    if (!billFormData.scopeId || !billFormData.description || !billFormData.totalAmount) {
      alert("Completează toate câmpurile!");
      return;
    }

    try {
      let locatari = 0;
      let distributionDetails = '';

      if (billFormData.scopeType === 'COMPLEX') {
        const aptsInComplex = apartments.filter(a => a.complexId === parseInt(billFormData.scopeId));
        const aptsWithResidents = aptsInComplex.filter(apt => apt.Users && apt.Users.length > 0);

        if (aptsWithResidents.length === 0) {
          alert("Nu sunt apartamente cu locatari în acest complex!");
          return;
        }

        // Calculez suma per apartament, apoi per locutar
        const totalAmount = parseFloat(billFormData.totalAmount);
        const amountPerApt = (totalAmount / aptsWithResidents.length).toFixed(2);
        
        const details = aptsWithResidents.map(apt => {
          const amountPerResident = (amountPerApt / apt.Users.length).toFixed(2);
          locatari += apt.Users.length;
          return `Ap. ${apt.number}: ${amountPerResident} RON/locutar (${apt.Users.length} locatari)`;
        });

        distributionDetails = details.join('\n');
      } else {
        const apt = apartments.find(a => a.id === parseInt(billFormData.scopeId));
        locatari = apt?.Users?.length || 0;

        if (locatari === 0) {
          alert("Nu sunt locatari în acest apartament!");
          return;
        }

        const amountPerPerson = (parseFloat(billFormData.totalAmount) / locatari).toFixed(2);
        distributionDetails = `${amountPerPerson} RON/locutar`;
      }

      await API.post('/expenses/admin/bill', {
        scopeType: billFormData.scopeType,
        scopeId: parseInt(billFormData.scopeId),
        description: billFormData.description,
        totalAmount: parseFloat(billFormData.totalAmount)
      });

      alert(`Factură creată!\n\n${distributionDetails}\n\nTotal: ${locatari} locatari`);
      setBillFormData({ scopeType: 'COMPLEX', scopeId: '', description: '', totalAmount: '' });
      setShowBillForm(false);
      fetchAdminData();
    } catch (err) {
      alert('Eroare: ' + err.response?.data?.message);
    }
  };

  if (loading) return <p>Se încarcă datele administrative...</p>;

  const filteredApartments = billFormData.scopeType === 'COMPLEX' && billFormData.scopeId
    ? apartments.filter(a => a.complexId === parseInt(billFormData.scopeId))
    : [];

  return (
    <div>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-main)', margin: '0' }}>
            Panou Administrare Complex 🏢
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Monitorizarea apartamentelor și a activității locatarilor.
          </p>
        </div>
        <button onClick={() => setShowBillForm(!showBillForm)} style={addBillButtonStyle}>
          {showBillForm ? '✕ Anulează' : '📄 Adaugă Factură'}
        </button>
      </header>

      {showBillForm && (
        <div style={billFormContainerStyle}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: 'var(--text-main)' }}>Crează Factură Administrativă</h2>
          <form onSubmit={handleBillSubmit} style={billFormStyle}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Tip Factură</label>
              <select
                value={billFormData.scopeType}
                onChange={(e) => setBillFormData({ ...billFormData, scopeType: e.target.value, scopeId: '' })}
                style={selectStyle}
              >
                <option value="COMPLEX">Per Complex (toți locatarii)</option>
                <option value="APARTMENT">Per Apartament</option>
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>{billFormData.scopeType === 'COMPLEX' ? 'Complex' : 'Apartament'}</label>
              <select
                value={billFormData.scopeId}
                onChange={(e) => setBillFormData({ ...billFormData, scopeId: e.target.value })}
                required
                style={selectStyle}
              >
                <option value="">Selectează...</option>
                {billFormData.scopeType === 'COMPLEX' ? (
                  complexes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))
                ) : (
                  apartments.map(a => (
                    <option key={a.id} value={a.id}>{a.Complex?.name} - Ap. {a.number}</option>
                  ))
                )}
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Descriere Factură</label>
              <input
                type="text"
                placeholder="Ex: Curent Scară, Apă Complex, Internet..."
                value={billFormData.description}
                onChange={(e) => setBillFormData({ ...billFormData, description: e.target.value })}
                required
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Suma Totală (RON)</label>
              <input
                type="number"
                placeholder="0.00"
                value={billFormData.totalAmount}
                onChange={(e) => setBillFormData({ ...billFormData, totalAmount: e.target.value })}
                required
                step="0.01"
                min="0"
                style={inputStyle}
              />
            </div>

            <button type="submit" style={submitBillButtonStyle}>
              Crează Factură
            </button>
          </form>
        </div>
      )}

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
                   <span>Datorii Restante: </span>
                   <strong style={{ color: 'var(--text-main)' }}>
                     {(apt.totalUnpaidDebt || 0).toFixed(2)} RON
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

const addBillButtonStyle = {
  backgroundColor: 'var(--primary)',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer'
};

const billFormContainerStyle = {
  background: 'var(--bg-card)',
  padding: '30px',
  borderRadius: '16px',
  boxShadow: 'var(--shadow)',
  marginBottom: '40px',
  border: '2px solid var(--primary)'
};

const billFormStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px'
};

const formGroupStyle = {
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
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  fontSize: '14px',
  outline: 'none'
};

const selectStyle = {
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  fontSize: '14px',
  outline: 'none'
};

const submitBillButtonStyle = {
  backgroundColor: 'var(--primary)',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  gridColumn: 'span 1'
};

export default AdminDashboard;