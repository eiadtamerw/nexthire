'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  username: string;
  created_at: string;
  role: string;
};

export default function SettingsPage() {
  const [me, setMe] = useState('');
  const [role, setRole] = useState('user');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [userMsg, setUserMsg] = useState('');
  const [userErr, setUserErr] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  const [profilePic, setProfilePic] = useState('');
  const [picLoading, setPicLoading] = useState(false);
  const [picMsg, setPicMsg] = useState('');
  

  const [templates, setTemplates] = useState<{ offerId: string; offerTitle: string; message: string }[]>([]);
  const [templateEdits, setTemplateEdits] = useState<Record<string, string>>({});
  const [tplLoading, setTplLoading] = useState(false);
  const [tplMsg, setTplMsg] = useState('');

  const isAdmin = role === 'admin';

  useEffect(() => {
    const t = localStorage.getItem('staffToken');
    const exp = Number(localStorage.getItem('staffExpires') || 0);
    if (!t || exp < Date.now()) {
      router.push('/login');
      
      return;
    }
    

    fetch('/api/auth/check', {
      headers: { Authorization: 'Bearer ' + t },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.username) {
          setMe(data.username);
          setRole(data.role || 'user');
          setProfilePic(data.profilePic || '');
         if (data.role === 'admin') {
         loadUsers();
         loadTemplates();  // ⭐
    }        }
      });

    const savedTheme = localStorage.getItem('themeColor');
    if (savedTheme) {
      document.documentElement.style.setProperty('--neon', savedTheme);
    }
  }, [router]);

  function loadUsers() {
    setLoading(true);
    const t = localStorage.getItem('staffToken');
    fetch('/api/users', {
      headers: { Authorization: 'Bearer ' + t },
    })
      .then((r) => {
        if (r.status === 401) throw new Error('Unauthorized');
        return r.json();
      })
      .then((res) => {
        if (res.ok) setUsers(res.users);
        else setError(res.error || 'Failed');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }
    async function loadTemplates() {
    const t = localStorage.getItem('staffToken');
    const [tplRes, offRes] = await Promise.all([
      fetch('/api/templates', { headers: { Authorization: 'Bearer ' + t } }).then(r => r.json()),
      fetch('/api/offers').then(r => r.json()),
    ]);
    const tplList = tplRes.ok ? tplRes.templates : [];
    const offers = offRes.ok ? offRes.offers : [];
    // ادمج: كل أوفر + الرسالة بتاعته (لو موجودة)
    const merged = offers.map((o: any) => {
      const tpl = tplList.find((t: any) => t.offerId === o.id);
      return {
        offerId: o.id,
        offerTitle: o.jobTitle + (o.companyName ? ' — ' + o.companyName : ''),
        message: tpl ? tpl.message : '',
      };
    });
    setTemplates(merged);
    const edits: Record<string, string> = {};
    merged.forEach((m: any) => { edits[m.offerId] = m.message; });
    setTemplateEdits(edits);
  }

  async function saveTemplateEdit(offerId: string, offerTitle: string) {
    setTplLoading(true);
    setTplMsg('');
    const t = localStorage.getItem('staffToken');
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify({
          offerId,
          offerTitle,
          message: templateEdits[offerId] || '',
        }),
      });
      const data = await res.json();
      setTplLoading(false);
      if (!data.ok) { setTplMsg('❌ ' + data.error); return; }
      setTplMsg('✅ Saved');
      loadTemplates();
    } catch (e: any) {
      setTplLoading(false);
      setTplMsg('❌ ' + e.message);
    }
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

      setPwMsg('Password changed successfully');
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

      setUserMsg('User added successfully');
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

  async function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = 150;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d')!;

          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;

          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleProfilePicUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPicMsg('❌ Please choose an image file');
      return;
    }

    setPicLoading(true);
    setPicMsg('');

    try {
      const compressed = await compressImage(file);
      const t = localStorage.getItem('staffToken');

      const res = await fetch('/api/users/profile-pic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify({ profilePic: compressed }),
      });
      const data = await res.json();
      setPicLoading(false);

      if (!data.ok) {
        setPicMsg('❌ ' + (data.error || 'Upload failed'));
        return;
      }

      setProfilePic(compressed);
      localStorage.setItem('staffProfilePic', compressed);
      window.dispatchEvent(
        new CustomEvent('profilePicUpdated', { detail: compressed })
      );
      setPicMsg('✅ Profile picture updated');
    } catch (err: any) {
      setPicLoading(false);
      setPicMsg('❌ ' + err.message);
    }
  }

  async function handleRemoveProfilePic() {
    if (!confirm('Remove your profile picture?')) return;

    setPicLoading(true);
    setPicMsg('');

    try {
      const t = localStorage.getItem('staffToken');
      const res = await fetch('/api/users/profile-pic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify({ profilePic: '' }),
      });
      const data = await res.json();
      setPicLoading(false);

      if (!data.ok) {
        setPicMsg('❌ ' + (data.error || 'Failed to remove'));
        return;
      }

      setProfilePic('');
      localStorage.removeItem('staffProfilePic');
      window.dispatchEvent(
        new CustomEvent('profilePicUpdated', { detail: '' })
      );
      setPicMsg('✅ Profile picture removed');
    } catch (err: any) {
      setPicLoading(false);
      setPicMsg('❌ ' + err.message);
    }
  }

  return (
    <div className="section" style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.025em' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          {isAdmin
            ? 'Manage your account and staff users'
            : 'Manage your account'}
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Profile Picture */}
      <div className="form-section">
        <h3>
          <span className="dot"></span> Profile Picture
        </h3>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginTop: 8,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'rgba(198,232,45,0.1)',
              border: '2px solid var(--neon)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 800,
              color: 'var(--neon)',
              flexShrink: 0,
            }}
          >
            {profilePic ? (
              <img
                src={profilePic}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              (me[0] || '?').toUpperCase()
            )}
          </div>

          <div>
            <label
              htmlFor="profile-pic-upload"
              className="btn btn-primary btn-sm"
              style={{
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {picLoading ? 'Uploading…' : 'Choose a profile picture'}
            </label>

            {profilePic && (
              <button
                type="button"
                onClick={handleRemoveProfilePic}
                disabled={picLoading}
                className="btn btn-ghost btn-sm"
                style={{
                  marginLeft: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#ff6b6b',
                  borderColor: 'rgba(255,107,107,0.3)',
                  cursor: 'pointer',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                Remove
              </button>
            )}

            <input
              id="profile-pic-upload"
              type="file"
              accept="image/*"
              onChange={handleProfilePicUpload}
              disabled={picLoading}
              style={{ display: 'none' }}
            />

            {picMsg && (
              <p
                style={{
                  fontSize: 12,
                  marginTop: 8,
                  color: picMsg.startsWith('✅')
                    ? 'var(--neon)'
                    : '#ff6b6b',
                }}
              >
                {picMsg}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="form-section">
        <h3>
          <span className="dot"></span> Appearance
        </h3>
        <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
          {[
            { name: 'Neon Green', color: '#c6e82d' },
            { name: 'Cyber Blue', color: '#3b82f6' },
            { name: 'Royal Purple', color: '#a855f7' },
            { name: 'Crimson Red', color: '#ef4444' },
          ].map((t) => (
            <button
              key={t.name}
              onClick={() => {
                document.documentElement.style.setProperty('--neon', t.color);
                localStorage.setItem('themeColor', t.color);
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: t.color,
                border: '2px solid #fff',
                cursor: 'pointer',
              }}
              title={t.name}
            />
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className="form-section">
        <h3>
          <span className="dot"></span> Change Your Password
        </h3>

        {pwErr && <div className="alert alert-error">{pwErr}</div>}
        {pwMsg && (
          <div
            className="alert alert-success"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {pwMsg}
          </div>
        )}

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
            <button
              type="submit"
              className="btn btn-primary"
              disabled={pwLoading}
            >
              {pwLoading ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {isAdmin && (
        <>          {/* Confirmation Messages */}
          <div className="form-section">
            <h3>
              <span className="dot"></span> Confirmation Messages
            </h3>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
              Placeholders: <code>{'{name}'}</code> <code>{'{date}'}</code>{' '}
              <code>{'{time}'}</code> <code>{'{job}'}</code>{' '}
              <code>{'{company}'}</code> <code>{'{site}'}</code>
            </p>

            {tplMsg && (
              <div className="alert" style={{ marginBottom: 12 }}>{tplMsg}</div>
            )}

            {templates.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                No offers yet.
              </p>
            ) : (
              templates.map((tpl) => (
                <div
                  key={tpl.offerId}
                  style={{
                    marginBottom: 16,
                    padding: 12,
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                    {tpl.offerTitle}
                  </div>
                  <textarea
                    value={templateEdits[tpl.offerId] ?? ''}
                    onChange={(e) =>
                      setTemplateEdits((prev) => ({
                        ...prev,
                        [tpl.offerId]: e.target.value,
                      }))
                    }
                    placeholder="اكتب الرسالة هنا… استخدم {name} {date} {time} {job} {company} {site}"
                    rows={4}
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 6,
                      padding: 10,
                      color: '#fff',
                      fontFamily: 'inherit',
                      fontSize: 13,
                      resize: 'vertical',
                    }}
                  />
                  <div style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => saveTemplateEdit(tpl.offerId, tpl.offerTitle)}
                      disabled={tplLoading}
                      className="btn btn-primary btn-sm"
                    >
                      {tplLoading ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Add New User */}
          <div className="form-section">
            <h3>
              <span className="dot"></span> Add New Staff User
            </h3>

            {userErr && <div className="alert alert-error">{userErr}</div>}
            {userMsg && (
              <div
                className="alert alert-success"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {userMsg}
              </div>
            )}

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
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={userLoading}
                >
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

            {loading ? (
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>Loading…</p>
            ) : users.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                No users yet.
              </p>
            ) : (
              <div className="table-wrap" style={{ border: 'none' }}>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Username</th>
                      <th>Role</th>
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
                        <td>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              background:
                                u.role === 'admin'
                                  ? 'rgba(198,232,45,0.2)'
                                  : 'rgba(255,255,255,0.1)',
                              color:
                                u.role === 'admin'
                                  ? 'var(--neon)'
                                  : 'var(--muted)',
                            }}
                          >
                            {u.role || 'user'}
                          </span>
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
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                              }}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                              Delete
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
        </>
      )}
    </div>
  );
}