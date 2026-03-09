import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Chemăm un endpoint care ne dă datele userului + detalii despre apartament
                const { data } = await API.get('/auth/me'); 
                setUserData(data);
            } catch (err) {
                console.error("Eroare la încărcarea profilului", err);
            }
        };
        fetchProfile();
    }, []);

    if (!userData) return <p>Se încarcă datele profilului...</p>;

    return (
        <div style={{ padding: '20px' }}>
            <button onClick={() => navigate('/dashboard')}>← Înapoi la Dashboard</button>
            
            <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '20px', borderRadius: '10px' }}>
                <h2>Profilul Meu</h2>
                <p><strong>Nume:</strong> {userData.name}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Rol:</strong> {userData.role}</p>

                <hr />
                
                <h3>Detalii Locuință</h3>
                {userData.Apartment ? (
                    <div>
                        <p><strong>Complex:</strong> {userData.Apartment.Complex?.name || 'N/A'}</p>
                        <p><strong>Bloc/Scară:</strong> {userData.Apartment.block}</p>
                        <p><strong>Număr Apartament:</strong> {userData.Apartment.number}</p>
                    </div>
                ) : (
                    <p style={{ color: 'orange' }}>Nu ești alocat încă niciunui apartament.</p>
                )}
            </div>
        </div>
    );
}

export default Profile;