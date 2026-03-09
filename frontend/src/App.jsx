import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Activity from './pages/Activity';
import AddExpense from './pages/AddExpense';
import Signup from './pages/SignUp';
import Users from './pages/Users';
import ManageSpaces from './pages/ManageSpaces';
import Profile from './pages/Profile'; // O creăm imediat
import AdminDashboard from './pages/AdminDashboard'; // O creăm și pe asta

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/add-expense" element={<AddExpense />} />
        
        {/* Rute de Management */}
        <Route path="/users" element={<Users />} />
        <Route path="/manage-spaces" element={<ManageSpaces />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Redirecționări și Error Handling */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<h2>404 - Pagina nu a fost găsită</h2>} />
      </Routes>
    </Router>
  );
}

export default App;