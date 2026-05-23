import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [balance, setBalance] = useState({ toReceive: 0, toPay: 0, balance: 0 });
    const [tasks, setTasks] = useState([]);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        type: 'TASK',
        priority: 'MEDIUM',
        dueDate: ''
    });
    const navigate = useNavigate();
    
    const user = JSON.parse(localStorage.getItem('user')) || { name: 'Utilizator', role: 'USER' };
    const apartment = JSON.parse(localStorage.getItem('apartment')) || { number: '?' };

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const { data } = await API.get('/expenses/balance');
                setBalance(data);
            } catch (err) {
                console.error("Eroare la preluarea balanței:", err);
                if (err.response?.status === 401) navigate('/login');
            }
        };
        fetchBalance();
        fetchTasks();
    }, [navigate]);

    const fetchTasks = async () => {
        try {
            const { data } = await API.get('/tasks');
            setTasks(data);
        } catch (err) {
            console.error("Eroare la preluarea task-urilor:", err);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) {
            alert("Titlul task-ului este obligatoriu!");
            return;
        }

        try {
            await API.post('/tasks', {
                ...newTask,
                dueDate: newTask.dueDate || null
            });
            setNewTask({ title: '', description: '', type: 'TASK', priority: 'MEDIUM', dueDate: '' });
            setShowTaskForm(false);
            fetchTasks();
        } catch (err) {
            alert('Eroare: ' + err.response?.data?.message);
        }
    };

    const handleToggleTask = async (taskId) => {
        try {
            await API.patch(`/tasks/${taskId}/toggle`);
            fetchTasks();
        } catch (err) {
            console.error("Eroare la marcarea task-ului:", err);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm("Ești sigur că vrei să ștergi acest task?")) {
            try {
                await API.delete(`/tasks/${taskId}`);
                fetchTasks();
            } catch (err) {
                alert('Eroare: ' + err.response?.data?.message);
            }
        }
    };

    const pendingTasks = tasks.filter(t => t.status === 'PENDING');
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
    const shoppingTasks = pendingTasks.filter(t => t.type === 'SHOPPING');
    const otherPendingTasks = pendingTasks.filter(t => t.type !== 'SHOPPING');

    const getTaskIcon = (type) => {
        switch(type) {
            case 'SHOPPING': return '🛒';
            case 'REMINDER': return '🔔';
            default: return '✓';
        }
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'HIGH': return '#ef4444';
            case 'MEDIUM': return '#f97316';
            case 'LOW': return '#22c55e';
            default: return '#6b7280';
        }
    };

    return (
        <div>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-main)', margin: '0' }}>
                    Salut, {user.name}! 👋
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                    Iată situația financiară și task-urile apartamentului tău pentru astăzi.
                </p>
            </header>
            
            {/* Secțiunea de Carduri Statistice */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                gap: '24px', 
                marginBottom: '40px' 
            }}>
                <div style={cardStyle('var(--success)')} onClick={() => navigate('/debts-details')} style={{...cardStyle('var(--success)'), cursor: 'pointer', transition: 'transform 0.2s'}}>
                    <p style={cardLabelStyle}>De recuperat</p>
                    <h2 style={cardValueStyle('var(--success)')}>{balance.toReceive} RON</h2>
                    <small style={{color: 'var(--text-muted)'}}>Click pentru detalii</small>
                </div>

                <div style={cardStyle('var(--danger)')} onClick={() => navigate('/debts-details')} style={{...cardStyle('var(--danger)'), cursor: 'pointer', transition: 'transform 0.2s'}}>
                    <p style={cardLabelStyle}>De plătit</p>
                    <h2 style={cardValueStyle('var(--danger)')}>{balance.toPay} RON</h2>
                    <small style={{color: 'var(--text-muted)'}}>Click pentru detalii</small>
                </div>

                <div style={cardStyle('var(--primary)')}>
                    <p style={cardLabelStyle}>Balanță Totală</p>
                    <h2 style={cardValueStyle(balance.balance >= 0 ? 'var(--success)' : 'var(--danger)')}>
                        {balance.balance} RON
                    </h2>
                </div>
            </div>

            {/* Acțiuni Rapide */}
            <section style={{ marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Acțiuni Rapide</h3>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <button 
                        onClick={() => navigate('/add-expense')}
                        style={primaryButtonStyle}
                    >
                        💸 Adaugă Cheltuială Nouă
                    </button>
                    <button 
                        onClick={() => navigate('/activity')}
                        style={secondaryButtonStyle}
                    >
                        📊 Vezi Istoric Cheltuieli
                    </button>
                </div>
            </section>

            {/* Tasks Section */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>📋 {apartment.number} - Task-uri Shared cu Colegii</h3>
                    <button 
                        onClick={() => setShowTaskForm(!showTaskForm)}
                        style={addTaskButtonStyle}
                    >
                        {showTaskForm ? '✕' : '+ Adaugă'}
                    </button>
                </div>

                {showTaskForm && (
                    <div style={taskFormStyle}>
                        <form onSubmit={handleAddTask}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                                <input
                                    type="text"
                                    placeholder="Titlu task..."
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                    required
                                    style={inputStyle}
                                />
                                <select 
                                    value={newTask.type}
                                    onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                                    style={inputStyle}
                                >
                                    <option value="TASK">✓ Task</option>
                                    <option value="SHOPPING">🛒 Cumpărături</option>
                                    <option value="REMINDER">🔔 Reminder</option>
                                </select>
                                <select 
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                                    style={inputStyle}
                                >
                                    <option value="LOW">🟢 Prioritate Joasă</option>
                                    <option value="MEDIUM">🟡 Prioritate Medie</option>
                                    <option value="HIGH">🔴 Prioritate Înaltă</option>
                                </select>
                            </div>
                            <textarea
                                placeholder="Descriere opțională..."
                                value={newTask.description}
                                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                                style={{...inputStyle, minHeight: '80px', fontFamily: 'inherit'}}
                            />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <input
                                    type="date"
                                    value={newTask.dueDate}
                                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                                    style={{...inputStyle, flex: 1}}
                                />
                                <button type="submit" style={submitTaskButtonStyle}>Salvează</button>
                                <button type="button" onClick={() => setShowTaskForm(false)} style={cancelButtonStyle}>Anulează</button>
                            </div>
                        </form>
                    </div>
                )}

                {pendingTasks.length > 0 && shoppingTasks.length > 0 && (
                    <div style={{ marginBottom: '30px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '12px' }}>
                            🛒 Lista de Cumpărături ({shoppingTasks.length})
                        </h4>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {shoppingTasks.map(task => {
                                const items = task.description 
                                    ? task.description.split('\n').filter(line => line.trim())
                                    : [];
                                
                                return (
                                    <div key={task.id} style={shoppingCardStyle}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: items.length > 0 ? '12px' : '0' }}>
                                            <div>
                                                <strong style={{ color: 'var(--text-main)', fontSize: '16px' }}>{task.title}</strong>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteTask(task.id)}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        {items.length > 0 && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '8px', borderLeft: '2px solid #fbbf2440' }}>
                                                {items.map((item, idx) => (
                                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-main)' }}>
                                                        <input
                                                            type="checkbox"
                                                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                                        />
                                                        <span>• {item.trim()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {otherPendingTasks.length > 0 && (
                    <div style={{ marginBottom: '30px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '12px' }}>
                            De Făcut ({otherPendingTasks.length})
                        </h4>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {otherPendingTasks.map(task => (
                                <div key={task.id} style={taskCardStyle(task.priority)}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                                        <input
                                            type="checkbox"
                                            checked={false}
                                            onChange={() => handleToggleTask(task.id)}
                                            style={{ marginTop: '4px', cursor: 'pointer', width: '20px', height: '20px' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '18px' }}>{getTaskIcon(task.type)}</span>
                                                <strong style={{ color: 'var(--text-main)' }}>{task.title}</strong>
                                            </div>
                                            {task.description && (
                                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                                                    {task.description}
                                                </p>
                                            )}
                                            {task.dueDate && (
                                                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                                                    📅 {new Date(task.dueDate).toLocaleDateString('ro-RO')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteTask(task.id)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {completedTasks.length > 0 && (
                    <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '12px' }}>
                            Completate ({completedTasks.length})
                        </h4>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {completedTasks.map(task => (
                                <div key={task.id} style={{...taskCardStyle(task.priority), opacity: 0.6}}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                                        <input
                                            type="checkbox"
                                            checked={true}
                                            onChange={() => handleToggleTask(task.id)}
                                            style={{ marginTop: '4px', cursor: 'pointer', width: '20px', height: '20px' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '18px', textDecoration: 'line-through' }}>
                                                    {getTaskIcon(task.type)}
                                                </span>
                                                <strong style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                                    {task.title}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteTask(task.id)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tasks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        <p style={{ fontSize: '16px', margin: '0' }}>Niciun task. Fă clic pe "+ Adaugă" pentru a crea unul! 🎯</p>
                    </div>
                )}
            </section>
        </div>
    );
}

// Stiluri reutilizabile pentru Dashboard
const cardStyle = (color) => ({
    background: 'var(--bg-card)',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: 'var(--shadow)',
    borderLeft: `6px solid ${color}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
});

const cardLabelStyle = {
    color: 'var(--text-muted)',
    fontSize: '14px',
    fontWeight: '500',
    margin: 0
};

const cardValueStyle = (color) => ({
    color: color,
    fontSize: '32px',
    fontWeight: '700',
    margin: 0
});

const primaryButtonStyle = {
    backgroundColor: 'var(--primary)',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    fontSize: '16px',
    boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
};

const secondaryButtonStyle = {
    backgroundColor: 'white',
    color: 'var(--text-main)',
    padding: '12px 24px',
    border: '1px solid #e5e7eb',
    fontSize: '16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
};

const addTaskButtonStyle = {
    backgroundColor: 'var(--primary)',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
};

const taskFormStyle = {
    background: 'var(--bg-card)',
    padding: '20px',
    borderRadius: '12px',
    border: '2px solid var(--primary)',
    marginBottom: '20px'
};

const inputStyle = {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    outline: 'none'
};

const taskCardStyle = (priority) => ({
    background: 'var(--bg-card)',
    padding: '16px',
    borderRadius: '10px',
    border: `2px solid ${getPriorityColor(priority)}20`,
    borderLeft: `4px solid ${getPriorityColor(priority)}`,
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    cursor: 'pointer',
    transition: 'all 0.2s'
});

const shoppingListStyle = {
    background: 'var(--bg-card)',
    padding: '16px',
    borderRadius: '10px',
    border: '2px solid #fbbf2420',
    borderLeft: '4px solid #fbbf24',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
};

const shoppingItemStyle = (priority) => ({
    padding: '10px 12px',
    borderRadius: '6px',
    background: 'rgba(251, 191, 36, 0.05)',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    borderBottom: '1px dashed #fbbf2440'
});

const shoppingCardStyle = {
    background: 'var(--bg-card)',
    padding: '16px',
    borderRadius: '10px',
    border: '2px solid #fbbf2420',
    borderLeft: '4px solid #fbbf24',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
};

const getPriorityColor = (priority) => {
    switch(priority) {
        case 'HIGH': return '#ef4444';
        case 'MEDIUM': return '#f97316';
        case 'LOW': return '#22c55e';
        default: return '#6b7280';
    }
};

const submitTaskButtonStyle = {
    backgroundColor: 'var(--primary)',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
};

const cancelButtonStyle = {
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    padding: '10px 20px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
};

export default Dashboard;