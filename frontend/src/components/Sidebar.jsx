import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠', roles: ['USER', 'ADMIN', 'GOD'] },
    { name: 'Activitate', path: '/activity', icon: '📊', roles: ['USER', 'ADMIN', 'GOD'] },
    { name: 'Profilul Meu', path: '/profile', icon: '👤', roles: ['USER', 'ADMIN', 'GOD'] },
    { name: 'Admin Complex', path: '/admin-dashboard', icon: '🏢', roles: ['ADMIN', 'GOD'] },
    { name: 'Gestionare Utilizatori', path: '/users', icon: '👥', roles: ['GOD'] },
    { name: 'Administrare Spații', path: '/manage-spaces', icon: '⚙️', roles: ['ADMIN', 'GOD'] },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ width: '260px', height: '100vh', background: '#fff', borderRight: '1px solid #e5e7eb', position: 'fixed', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px', fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)', borderBottom: '1px solid #f3f4f6' }}>
        Co-Living App
      </div>
      
      <nav style={{ flex: 1, padding: '16px' }}>
        {menuItems.filter(item => item.roles.includes(user.role)).map(item => {
  const isActive = location.pathname === item.path;
  return (
    <div 
      key={item.path}
      onClick={() => navigate(item.path)}
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '4px',
        cursor: 'pointer',
        display: 'flex', 
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.2s ease',
        // Efectul de activ:
        backgroundColor: isActive ? '#f3f4f6' : 'transparent',
        color: isActive ? 'var(--primary)' : 'var(--text-main)',
        fontWeight: isActive ? '600' : '400',
        borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
      }}
    >
      <span style={{ fontSize: '18px' }}>{item.icon}</span> 
      {item.name}
    </div>
  );
})}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid #f3f4f6' }}>
        <button onClick={handleLogout} style={{ width: '100%', padding: '10px', backgroundColor: 'var(--danger)', color: 'white', border: 'none' }}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;