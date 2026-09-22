'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  username: string;
  created_at: string;
};

export default function SettingsPage() {
  const [me, setMe] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Change password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Add user form
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [userMsg, setUserMsg] = useState('');
  const [userErr, setUserErr] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('staffToken');
    const exp = Number(localStorage.getItem('staffExpires') || 0);
    if (!t || exp < Date.now()) {
      router.push('/login');
      return;
    }

    // احفظ الـ username من الـ localStorage (كنا خزّناه في login)
    // لو مش موجود، نجيب من الـ API
    fetch('/api/auth/check', {
      headers: { Authorization: 'Bearer ' + t },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.username) {
          setMe(data.username);
        }
      });

    loadUsers();
  }, [router]);

  function loadUsers() {
    setLoading(true);
    const t = localStorage.getItem('staffToken');
    fetch('/api/users', {
      headers: { Authorization: 'Bearer ' + t },
    })
      .then((r) => {
        if (r.status === 401) {
          localStorage.removeItem('staffToken');
          localStorage.removeItem('staffExpires');
          router.push('/login');
          throw new Error('Unauthorized');
        }
        return r.json();
      })
      .then((res) => {
        if (res.ok) setUsers(res.users);
        else setError(res.error || 'Failed');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg('');
    setPwErr('');

    if (newPassword !== confirmPassword) {
      setPwErr('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPwErr('New password must be at least 6 characters');
      return;
    }

    setPwLoading(true);
    const t = localStorage.getItem('staffToken');

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      setPwLoading(false);

      if (!data.ok) {
        setPwErr(data.error || 'Failed to change password');
        return;
      }

      setPwMsg('✅ Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwLoading(false);
      setPwErr(err.message);
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setUserMsg('');
    setUserErr('');

    if (!newUsername || !newUserPassword) {
      setUserErr('Please fill all fields');
      return;
    }
    if (newUserPassword.length < 6) {
      setUserErr('Password must be at least 6 characters');
      return;
    }

    setUserLoading(true);
    const t = localStorage.getItem('staffToken');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify({
          username: newUsername,
          password: newUserPassword,
        }),
      });
      const data = await res.json();
      setUserLoading(false);

      if (!data.ok) {
        setUserErr(data.error || 'Failed to add user');
        return;
      }

      setUserMsg('✅ User added successfully');
      setNewUsername('');
      setNewUserPassword('');
      loadUsers();
    } catch (err: any) {
      setUserLoading(false);
      setUserErr(err.message);
    }
  }

  async function handleDeleteUser(username: string) {
    if (
      !confirm(
        `Delete user "${username}"? All their sessions will be revoked immediately.`
      )
    )
      return;

    const t = localStorage.getItem('staffToken');
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(username)}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + t },
      });
      const data = await res.json();
      if (!data.ok) {
        alert('Error: ' + (data.error || 'Failed'));
        return;
      }
      loadUsers();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  if (loading && !users.length) {
    return (
      <div className="section">
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>
          Loading settings…
        </div>
      </div>
    );
  }

  return (
    <div className="section" style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.025em' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Manage your account and staff users
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Change Password */}
      <div className="form-section">
        <h3>
          <span className="dot"></span> Change Your Password
        </h3>

        {pwErr && <div className="alert alert-error">{pwErr}</div>}
        {pwMsg && <div className="alert alert-success">{pwMsg}</div>}

        <form onSubmit={handleChangePassword}>
          <div className="field">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="field">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={pwLoading}>
              {pwLoading ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Add New User */}
      <div className="form-section">
        <h3>
          <span className="dot"></span> Add New Staff User
        </h3>

        {userErr && <div className="alert alert-error">{userErr}</div>}
        {userMsg && <div className="alert alert-success">{userMsg}</div>}

        <form onSubmit={handleAddUser}>
          <div className="field-row">
            <div className="field">
              <label>Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Password (min 6 chars)</label>
              <input
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={userLoading}>
              {userLoading ? 'Adding…' : 'Add User'}
            </button>
          </div>
        </form>
      </div>

      {/* Users List */}
      <div className="form-section">
        <h3>
          <span className="dot"></span> Staff Users ({users.length})
        </h3>

        {users.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>No users yet.</p>
        ) : (
          <div className="table-wrap" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.username}>
                    <td>{i + 1}</td>
                    <td>
                      <strong>{u.username}</strong>
                      {u.username === me && (
                        <span
                          style={{
                            marginLeft: 8,
                            padding: '2px 8px',
                            borderRadius: 999,
                            fontSize: 10,
                            fontWeight: 800,
                            background: 'rgba(198,232,45,0.15)',
                            color: 'var(--neon)',
                            border: '1px solid rgba(198,232,45,0.4)',
                          }}
                        >
                          YOU
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {u.created_at ? u.created_at.slice(0, 10) : '—'}
                    </td>
                    <td>
                      {u.username !== me && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDeleteUser(u.username)}
                          type="button"
                        >
                          🗑 Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}