import { useEffect, useMemo, useState } from 'react';
import {
  BadgePlus,
  Clock3,
  Filter,
  Mail,
  Search,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  Trash2,
  UserCheck,
  UserCog,
  Users,
} from 'lucide-react';
import api from '../services/api';
import {
  fetchAdminBundle,
  getCachedAdminBundle,
} from '../services/appDataCache';
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
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [inviteForm, setInviteForm] = useState({
    fullName: '',
    email: '',
    role: 'INVESTOR',
    password: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const applyAdminBundle = (bundle) => {
    setUsers(bundle?.users || []);
    setStats(bundle?.stats || null);
    setAuditLogs(bundle?.auditLogs || []);
  };

  const fetchData = async ({ forceRefresh = false, background = false } = {}) => {
    if (!background) {
      setLoading(true);
    }

    try {
      const { data } = await fetchAdminBundle({ forceRefresh });
      applyAdminBundle(data);
    } catch (error) {
      console.error(error);
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const cachedBundle = getCachedAdminBundle();

    if (cachedBundle) {
      applyAdminBundle(cachedBundle);
      setLoading(false);
      fetchData({ forceRefresh: true, background: true });
      return;
    }

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/admin/users/${id}`);
      setMessage({ type: 'success', text: 'User deleted successfully.' });
      await fetchData({ forceRefresh: true });
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
      await fetchData({ forceRefresh: true });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Update failed.',
      });
    }
  };

  const handleInviteSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post('/admin/users', inviteForm);
      const tempPassword = response.data?.data?.temporaryPassword;
      setMessage({
        type: 'success',
        text: tempPassword
          ? `User created successfully. Temporary password: ${tempPassword}`
          : 'User created successfully.',
      });
      setInviteForm({
        fullName: '',
        email: '',
        role: 'INVESTOR',
        password: '',
      });
      await fetchData({ forceRefresh: true });
    } catch (error) {
      console.error(error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to create this account right now.',
      });
    }
  };

  const handleSuspensionToggle = async (user) => {
    try {
      const response = await api.patch(`/admin/users/${user.id}/suspension`, {
        suspended: !user.suspended,
        reason: user.suspended ? 'Account reactivated by admin.' : 'Account suspended by admin.',
      });
      setMessage({ type: 'success', text: response.data?.message || 'Account updated.' });
      await fetchData({ forceRefresh: true });
    } catch (error) {
      console.error(error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to update account access right now.',
      });
    }
  };

  const derivedStats = useMemo(() => {
    const verifiedUsers = users.filter((user) => user.verified).length;
    const googleUsers = users.filter((user) => user.authProvider === 'GOOGLE').length;
    const adminUsers = getRoleCount(users, 'ADMIN');
    const suspendedUsers = users.filter((user) => user.suspended).length;

    return {
      verifiedUsers,
      googleUsers,
      adminUsers,
      suspendedUsers,
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
            <span>Suspended</span>
            <strong>{stats?.suspendedUsers ?? derivedStats.suspendedUsers}</strong>
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
        <div className="admin-panel-invite">
          <div className="admin-panel-invite__copy">
            <span className="admin-panel-section-eyebrow">
              <BadgePlus size={16} />
              Invite Workflow
            </span>
            <h2>Create a new platform account without leaving admin control.</h2>
            <p>
              Add advisors, analysts, investors, or extra admin seats directly from this workspace.
              New accounts are provisioned immediately and can be adjusted from the same table below.
            </p>
          </div>

          <form className="admin-panel-invite__form" onSubmit={handleInviteSubmit}>
            <label className="admin-panel-field">
              <input
                type="text"
                value={inviteForm.fullName}
                onChange={(event) =>
                  setInviteForm((currentForm) => ({ ...currentForm, fullName: event.target.value }))
                }
                placeholder="Full name"
              />
            </label>

            <label className="admin-panel-field">
              <input
                type="email"
                value={inviteForm.email}
                onChange={(event) =>
                  setInviteForm((currentForm) => ({ ...currentForm, email: event.target.value }))
                }
                placeholder="Email address"
              />
            </label>

            <label className="admin-panel-field admin-panel-field--select">
              <span className="admin-panel-field__label">Role</span>
              <select
                value={inviteForm.role}
                onChange={(event) =>
                  setInviteForm((currentForm) => ({ ...currentForm, role: event.target.value }))
                }
              >
                <option value="INVESTOR">Investor</option>
                <option value="ADVISOR">Advisor</option>
                <option value="ANALYST">Analyst</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>

            <label className="admin-panel-field">
              <input
                type="text"
                value={inviteForm.password}
                onChange={(event) =>
                  setInviteForm((currentForm) => ({ ...currentForm, password: event.target.value }))
                }
                placeholder="Temporary password (optional)"
              />
            </label>

            <button type="submit" className="admin-panel-invite__submit">
              <BadgePlus size={16} />
              Create account
            </button>
          </form>
        </div>

        <div className="admin-panel-workspace__header">
          <div>
            <span className="admin-panel-section-eyebrow">
              <Users size={16} />
              User Management
            </span>
            <h2>Search, filter, and update accounts in-place.</h2>
          </div>
          <p>
            Use the controls below to audit the active user list, adjust role assignments, suspend
            access when needed, and remove accounts when necessary.
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
                      <div className="admin-panel-status-stack">
                        <span className={`admin-panel-badge ${user.verified ? 'admin-panel-badge--verified' : 'admin-panel-badge--muted'}`}>
                          {user.verified ? 'Verified' : 'Pending'}
                        </span>
                        {user.suspended ? (
                          <span className="admin-panel-badge admin-panel-badge--suspended">Suspended</span>
                        ) : null}
                      </div>
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
                          className={`admin-panel-suspension ${user.suspended ? 'is-reactivate' : ''}`}
                          onClick={() => handleSuspensionToggle(user)}
                        >
                          {user.suspended ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
                          {user.suspended ? 'Reactivate' : 'Suspend'}
                        </button>

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

      <section className="admin-panel-audit">
        <div className="admin-panel-audit__header">
          <div>
            <span className="admin-panel-section-eyebrow">
              <Clock3 size={16} />
              Audit Trail
            </span>
            <h2>Review the most recent admin-side changes.</h2>
          </div>
          <p>
            Role changes, invites, suspension actions, and deletions all appear here for quick operational context.
          </p>
        </div>

        {auditLogs.length ? (
          <div className="admin-panel-audit__list">
            {auditLogs.map((log) => (
              <div key={log.id} className="admin-panel-audit__item">
                <div>
                  <span>{log.action.replaceAll('_', ' ')}</span>
                  <strong>{log.targetIdentifier || log.targetType}</strong>
                </div>
                <div>
                  <strong>{log.actorName}</strong>
                  <small>{log.details || 'No extra details recorded.'}</small>
                </div>
                <div>
                  <small>{formatDate(log.createdAt)}</small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-panel-empty">
            <Clock3 size={20} />
            <h3>No audit entries yet.</h3>
            <p>The latest admin changes will start appearing here as actions are taken.</p>
          </div>
        )}
      </section>
    </div>
  );
}
