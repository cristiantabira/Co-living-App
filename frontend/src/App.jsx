import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Activity from './pages/Activity';
import AddExpense from './pages/AddExpense';
import Signup from './pages/SignUp';
import Users from './pages/Users';
import ManageSpaces from './pages/ManageSpaces';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import MainLayout from './components/MainLayout'; // Importăm layout-ul nou

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute publice (fără meniu lateral) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Rute private (Îmbrăcate în MainLayout pentru a avea Sidebar-ul) */}
        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
        <Route path="/activity" element={<MainLayout><Activity /></MainLayout>} />
        <Route path="/add-expense" element={<MainLayout><AddExpense /></MainLayout>} />
        
        {/* Rute de Management */}
        <Route path="/users" element={<MainLayout><Users /></MainLayout>} />
        <Route path="/manage-spaces" element={<MainLayout><ManageSpaces /></MainLayout>} />
        <Route path="/admin-dashboard" element={<MainLayout><AdminDashboard /></MainLayout>} />

        {/* Redirecționări și Error Handling */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<h2>404 - Pagina nu a fost găsită</h2>} />
      </Routes>
    </Router>
  );
}

export default App;