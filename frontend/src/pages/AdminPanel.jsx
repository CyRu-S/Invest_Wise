import { useEffect, useMemo, useState } from 'react';
import {
  Filter,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  UserCog,
  Users,
} from 'lucide-react';
import api from '../services/api';
import './AdminPanelPage.css';

function formatDate(value) {
  if (!value) return 'Pending';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

function getRoleCount(users, role) {
  return users.filter((user) => user.role === role).length;
}

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats'),
      ]);

      setUsers(usersResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/admin/users/${id}`);
      setMessage({ type: 'success', text: 'User deleted successfully.' });
      fetchData();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Delete failed.',
      });
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setMessage({ type: 'success', text: `Role updated to ${role}.` });
      fetchData();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Update failed.',
      });
    }
  };

  const derivedStats = useMemo(() => {
    const verifiedUsers = users.filter((user) => user.verified).length;
    const googleUsers = users.filter((user) => user.authProvider === 'GOOGLE').length;
    const adminUsers = getRoleCount(users, 'ADMIN');

    return {
      verifiedUsers,
      googleUsers,
      adminUsers,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !searchQuery ||
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [roleFilter, searchQuery, users]);

  if (loading) {
    return (
      <div className="page-container admin-panel-page">
        <div className="admin-panel-loading">
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container admin-panel-page" id="admin-panel-page">

      <section className="admin-panel-hero">
        <div className="admin-panel-hero__copy">
          <span className="admin-panel-hero__kicker">
            <Sparkles size={16} />
            Admin Control Surface
          </span>
          <h1>Manage platform access, role distribution from one workspace.</h1>
          <p>
            Review account coverage, adjust role permissions, and keep the platform healthy without
            dropping back into generic utility screens.
          </p>
          <div className="admin-panel-hero__chips">
            <span className="admin-panel-chip">User operations</span>
            <span className="admin-panel-chip">Role governance</span>
          </div>
        </div>

        <div className="admin-panel-hero__summary">
          <div className="admin-panel-hero__stat admin-panel-hero__stat--indigo">
            <span>Total users</span>
            <strong>{stats?.totalUsers ?? users.length}</strong>
          </div>
          <div className="admin-panel-hero__stat admin-panel-hero__stat--indigo">
            <span>Verified accounts</span>
            <strong>{derivedStats.verifiedUsers}</strong>
          </div>
          <div className="admin-panel-hero__stat admin-panel-hero__stat--indigo">
            <span>Google sign-ins</span>
            <strong>{derivedStats.googleUsers}</strong>
          </div>
          <div className="admin-panel-hero__stat admin-panel-hero__stat--indigo">
            <span>Admin seats</span>
            <strong>{derivedStats.adminUsers}</strong>
          </div>
        </div>
      </section>

      {message.text ? (
        <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
          {message.text}
        </div>
      ) : null}

      <section className="admin-panel-overview">
        <div className="admin-panel-overview__headline">
          <span className="admin-panel-section-eyebrow">
            <ShieldCheck size={16} />
            Role Snapshot
          </span>
          <h2>Watch the user mix before changing permissions.</h2>
        </div>

        <div className="admin-panel-overview__metrics">
          <div className="admin-panel-metric admin-panel-metric--indigo">
            <span>Investors</span>
            <strong>{stats?.investors ?? getRoleCount(users, 'INVESTOR')}</strong>
          </div>
          <div className="admin-panel-metric admin-panel-metric--violet">
            <span>Advisors</span>
            <strong>{stats?.advisors ?? getRoleCount(users, 'ADVISOR')}</strong>
          </div>
          <div className="admin-panel-metric admin-panel-metric--emerald">
            <span>Analysts</span>
            <strong>{stats?.analysts ?? getRoleCount(users, 'ANALYST')}</strong>
          </div>
          <div className="admin-panel-metric admin-panel-metric--amber">
            <span>Admins</span>
            <strong>{derivedStats.adminUsers}</strong>
          </div>
        </div>
      </section>

      <section className="admin-panel-workspace">
        <div className="admin-panel-workspace__header">
          <div>
            <span className="admin-panel-section-eyebrow">
              <Users size={16} />
              User Management
            </span>
            <h2>Search, filter, and update accounts in-place.</h2>
          </div>
          <p>
            Use the controls below to audit the active user list, adjust role assignments, and
            remove accounts when necessary.
          </p>
        </div>

        <div className="admin-panel-toolbar">
          <label className="admin-panel-field admin-panel-field--search">
            <Search size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name or email"
            />
          </label>

          <label className="admin-panel-field admin-panel-field--select">
            <span className="admin-panel-field__label">
              <Filter size={15} />
              Role filter
            </span>
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option value="ALL">All roles</option>
              <option value="INVESTOR">Investor</option>
              <option value="ADVISOR">Advisor</option>
              <option value="ANALYST">Analyst</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
        </div>

        {filteredUsers.length ? (
          <div className="admin-panel-table-shell">
            <table className="admin-panel-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Provider</th>
                  <th>Verified</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-panel-user">
                        <div className="admin-panel-user__avatar">
                          {user.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="admin-panel-user__identity">
                          <strong>{user.fullName}</strong>
                          <span>
                            <Mail size={14} />
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-panel-badge admin-panel-badge--${user.role?.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-panel-badge admin-panel-badge--provider-${user.authProvider?.toLowerCase()}`}>
                        {user.authProvider}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-panel-badge ${user.verified ? 'admin-panel-badge--verified' : 'admin-panel-badge--muted'}`}>
                        {user.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="admin-panel-actions">
                        <label className="admin-panel-role-editor">
                          <UserCog size={15} />
                          <select
                            value={user.role}
                            onChange={(event) => handleRoleChange(user.id, event.target.value)}
                          >
                            <option value="INVESTOR">INVESTOR</option>
                            <option value="ADVISOR">ADVISOR</option>
                            <option value="ANALYST">ANALYST</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </label>

                        <button
                          className="admin-panel-delete"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-panel-empty">
            <UserCheck size={20} />
            <h3>No users match the current filters.</h3>
            <p>Try broadening the search or resetting the selected role filter.</p>
          </div>
        )}
      </section>
    </div>
  );
}
