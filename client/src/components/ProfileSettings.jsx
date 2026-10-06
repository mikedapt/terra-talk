import { useState, useRef } from 'react'
import { useAuth } from '../AuthContext';

export default function ProfileSettings({ onNavigate }) {

  const { user, setUser } = useAuth();

  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [newUsername, setNewUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [usernameLoading, setUsernameLoading] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setStatus(null);
    setUploading(true);

    try {
      const form = new FormData();
      form.append('avatar', file);

      const res = await fetch('/api/me/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed. Try again.');

      setUser(prev => ({ ...prev, profile_path: data.profile_path }));
      setPreview(null);
      URL.revokeObjectURL(localUrl);
      setStatus({ type: 'ok', text: 'Profile picture updated.' });
    } catch (err) {
      setPreview(null);
      URL.revokeObjectURL(localUrl);
      setStatus({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleUsernameChange() {
    if (!newUsername.trim()) {
      setUsernameStatus({ type: 'error', text: 'Please enter a new username.' });
      return;
    }
    setUsernameLoading(true);
    setUsernameStatus(null);
    try {
      const res = await fetch('/api/me/username', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ username: newUsername.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update username.');
      localStorage.setItem('token', data.token);
      setUser(prev => ({ ...prev, username: data.username }));
      setNewUsername('');
      setUsernameStatus({ type: 'ok', text: 'Username updated successfully.' });
    } catch (err) {
      setUsernameStatus({ type: 'error', text: err.message });
    } finally {
      setUsernameLoading(false);
    }
  }

  async function handlePasswordChange() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setPasswordLoading(true);
    setPasswordStatus(null);
    try {
      const res = await fetch('/api/me/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStatus({ type: 'ok', text: 'Password updated successfully.' });
    } catch (err) {
      setPasswordStatus({ type: 'error', text: err.message });
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleEmailChange() {
    if (!newEmail.trim()) {
      setEmailStatus({ type: 'error', text: 'Please enter a new email.' });
      return;
    }
    setEmailLoading(true);
    setEmailStatus(null);
    try {
      const res = await fetch('/api/me/email', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ email: newEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update email.');
      setNewEmail('');
      setEmailStatus({ type: 'ok', text: 'Email updated successfully.' });
    } catch (err) {
      setEmailStatus({ type: 'error', text: err.message });
    } finally {
      setEmailLoading(false);
    }
  }

  const avatarSrc = preview
    ?? (user?.profile_path ? `/profiles/${user.profile_path}` : null);

  return (
    <div className="page-content">

      <div className="profile-card">
        <div className="profile-header">

          <h1 className="general-heading">Profile Settings</h1>
          <hr />
          <br />

          <div className="avatar-backdrop">
            {avatarSrc && (
              <img className="avatar-portrait" src={avatarSrc} alt={`${user?.username ?? 'Your'} profile picture`} />
            )}
          </div>

          <br />

          <input
            type="file"
            ref={fileInputRef}
            accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <button
            className="btn-submit-reply"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Change picture'}
          </button>

          {status && (
            <p style={{ color: status.type === 'error' ? '#c0392b' : '#2e7d32' }}>
              {status.text}
            </p>
          )}

          <br /><br />
          <hr />
          <br />
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-content">

          <h2>Change Username</h2>
          <br />
          <div className="form-group">
            <label>New Username</label>
            <input
              type="text"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              placeholder={user?.username ?? ''}
            />
          </div>
          <button
            className="btn-submit-reply"
            onClick={handleUsernameChange}
            disabled={usernameLoading}
          >
            {usernameLoading ? 'Saving…' : 'Update Username'}
          </button>
          {usernameStatus && (
            <p style={{ color: usernameStatus.type === 'error' ? '#c0392b' : '#2e7d32', marginTop: '8px' }}>
              {usernameStatus.text}
            </p>
          )}

          <br /><br />
          <hr />
          <br />

          <h2>Change Email</h2>
          <br />
          <div className="form-group">
            <label>New Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="Enter new email"
            />
          </div>
          <button
            className="btn-submit-reply"
            onClick={handleEmailChange}
            disabled={emailLoading}
          >
            {emailLoading ? 'Saving…' : 'Update Email'}
          </button>
          {emailStatus && (
            <p style={{ color: emailStatus.type === 'error' ? '#c0392b' : '#2e7d32', marginTop: '8px' }}>
              {emailStatus.text}
            </p>
          )}

          <br /><br />
          <hr />
          <br />

          <h2>Change Password</h2>
          <br />
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <button
            className="btn-submit-reply"
            onClick={handlePasswordChange}
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Saving…' : 'Update Password'}
          </button>
          {passwordStatus && (
            <p style={{ color: passwordStatus.type === 'error' ? '#c0392b' : '#2e7d32', marginTop: '8px' }}>
              {passwordStatus.text}
            </p>
          )}

          <br /><br />
          <hr />
          <br />

          <button className="btn-submit-reply" onClick={() => onNavigate('home')}>Return to Homepage</button>

        </div>
      </div>

    </div>
  );
}
