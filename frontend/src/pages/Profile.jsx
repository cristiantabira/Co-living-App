import { useEffect, useState } from 'react';
import API from '../api/axios';

function Profile() {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await API.get('/auth/me'); 
                setUserData(data);
            } catch (err) {
                console.error("Eroare la încărcarea profilului", err);
            }
        };
        fetchProfile();
    }, []);

    if (!userData) return (
        <div style={{ padding: '20px', color: 'var(--text-muted)' }}>
            Se încarcă datele profilului...
        </div>
    );

    return (
        <div>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-main)', margin: '0' }}>
                    Profilul Meu 👤
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                    Gestionarea informațiilor personale și detaliile locuinței tale.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                
                {/* Card Informații Personale */}
                <div style={profileCardStyle}>
                    <h3 style={cardTitleStyle}>Informații Personale</h3>
                    <div style={infoRowStyle}>
                        <span style={labelStyle}>Nume complet:</span>
                        <span style={valueStyle}>{userData.name}</span>
                    </div>
                    <div style={infoRowStyle}>
                        <span style={labelStyle}>Email:</span>
                        <span style={valueStyle}>{userData.email}</span>
                    </div>
                    <div style={infoRowStyle}>
                        <span style={labelStyle}>Rol în platformă:</span>
                        <span style={roleBadgeStyle(userData.role)}>{userData.role}</span>
                    </div>
                </div>

                {/* Card Detalii Locuință */}
                <div style={profileCardStyle}>
                    <h3 style={cardTitleStyle}>Detalii Locuință 🏠</h3>
                    {userData.Apartment ? (
                        <>
                            <div style={infoRowStyle}>
                                <span style={labelStyle}>Complex Rezidențial:</span>
                                <span style={valueStyle}>{userData.Apartment.Complex?.name || 'N/A'}</span>
                            </div>
                            <div style={infoRowStyle}>
                                <span style={labelStyle}>Adresă Complex:</span>
                                <span style={valueStyle}>{userData.Apartment.Complex?.address || 'N/A'}</span>
                            </div>
                            <div style={infoRowStyle}>
                                <span style={labelStyle}>Bloc / Scară:</span>
                                <span style={valueStyle}>{userData.Apartment.block || '-'}</span>
                            </div>
                            <div style={infoRowStyle}>
                                <span style={labelStyle}>Număr Apartament:</span>
                                <span style={{ ...valueStyle, fontWeight: '700', color: 'var(--primary)' }}>
                                    {userData.Apartment.number}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <p style={{ color: 'var(--danger)', fontWeight: '500' }}>
                                Nu ești alocat încă niciunui apartament.
                            </p>
                            <small style={{ color: 'var(--text-muted)' }}>
                                Contactează un administrator pentru alocare.
                            </small>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Stiluri pentru pagina Profile
const profileCardStyle = {
    background: 'var(--bg-card)',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: 'var(--shadow)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
};

const cardTitleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 10px 0',
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '15px',
    color: 'var(--text-main)'
};

const infoRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '15px'
};

const labelStyle = {
    color: 'var(--text-muted)',
    fontWeight: '500'
};

const valueStyle = {
    color: 'var(--text-main)',
    fontWeight: '500'
};

const roleBadgeStyle = (role) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    backgroundColor: role === 'GOD' ? '#FEF3C7' : role === 'ADMIN' ? '#DBEAFE' : '#F3F4F6',
    color: role === 'GOD' ? '#92400E' : role === 'ADMIN' ? '#1E40AF' : '#374151',
    textTransform: 'uppercase'
});

export default Profile;