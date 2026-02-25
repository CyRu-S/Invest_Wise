import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      const [u, s] = await Promise.all([api.get('/admin/users'), api.get('/admin/stats')]);
      setUsers(u.data);
      setStats(s.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setMessage({ type: 'success', text: 'User deleted' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Delete failed' });
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setMessage({ type: 'success', text: `Role updated to ${role}` });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;

  return (
    <div className="page-container" id="admin-panel-page">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>Manage users, roles, and platform settings</p>
      </div>

      {message.text && <div className={message.type === 'success' ? 'success-message' : 'error-message'}>{message.text}</div>}

      {/* Stats */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="glass-card stat-card"><div className="stat-label">Total Users</div><div className="stat-value">{stats.totalUsers}</div></div>
          <div className="glass-card stat-card"><div className="stat-label">Investors</div><div className="stat-value">{stats.investors}</div></div>
          <div className="glass-card stat-card"><div className="stat-label">Advisors</div><div className="stat-value">{stats.advisors}</div></div>
          <div className="glass-card stat-card"><div className="stat-label">Analysts</div><div className="stat-value">{stats.analysts}</div></div>
        </div>
      )}

      {/* Users Table */}
      <div className="glass-card" style={{ overflow: 'auto' }}>
        <h3 style={{ marginBottom: '1rem' }}>👥 User Management</h3>
        <table className="data-table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Provider</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td><strong>{u.fullName}</strong></td>
                <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                <td>
                  <select className="form-control" style={{ maxWidth: 130, padding: '0.4rem' }}
                    value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                    <option value="INVESTOR">INVESTOR</option>
                    <option value="ADVISOR">ADVISOR</option>
                    <option value="ANALYST">ANALYST</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td><span className={`badge badge-${u.authProvider === 'GOOGLE' ? 'info' : 'success'}`}>{u.authProvider}</span></td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
