import { useState, useRef } from 'react'
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function ProfileSettings({ onNavigate }) {

  const { user, setUser} = useAuth();

  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);   // local object URL, shown while uploading
  const [status, setStatus] = useState(null);     // { type: 'ok' | 'error', text: string }
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setStatus(null);
    setUploading(true);

    try {
      const form = new FormData();
      form.append('avatar', file);   // must match avatarUpload.single('avatar')

      const res = await fetch('http://localhost:3001/api/me/avatar', {
        method: 'POST',
        // Do NOT set Content-Type here — the browser adds the multipart
        // boundary itself, and overriding it breaks the upload.
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed. Try again.');

      // Update the logged-in user so the avatar refreshes everywhere at once
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
      e.target.value = '';   // lets the user re-pick the same file
    }
  }

  const avatarSrc = preview
    ?? (user?.profile_path ? `http://localhost:3001/profiles/${user.profile_path}` : null);


    return (
      <div className="page-content">

                <div className="profile-card">
                  <div className="profile-header">

                      <h1 className="general-heading">Profile Settings</h1>
                      <hr></hr>
                      <br></br>

                      <div className="avatar-backdrop">
                        {avatarSrc && (
                          <img className="avatar-portrait" src={avatarSrc} alt={`${user?.username ?? 'Your'} profile picture`} />
                        )}
                      </div>

                      <br></br>

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

                      <br></br>
                      <br></br>
                      <hr></hr>
                      <br></br>
                  </div>
                </div>

                <div className="profile-card">
                  <div className="profile-content">
                      <h2><b> Add / Remove Categories </b></h2>
                      <br></br>
                      <p> Categories are the Green Section Names on the Home Page (ie.. INFORMATION, GAMEPLAY, COMMUNITY). 
                        From here you are able to add / remove categories. If you choose to remove a category on the backend, be sure to remove any rows under it in other tables
                        (topics, threads, posts) </p>
                      <br></br>
                      <p> + Add Categories </p>

                      

                      <br></br>
                      <p> - Remove Categories </p>
                      <br></br>
                      <hr></hr>
                      <br></br>
                      <h2><b> Add / Remove Topics </b></h2>
                      <br></br>
                      <p> Topics are the white Sections assigned to a category on the Home Page (ie.. Announcements, Rules & Guidelines, General Discussion, etc...).
                        From here you are able to add / remove topics. If you choose to remove a topic on the backend, be sure to remove any rows under it in other tables
                        (threads, posts)
                      </p>
                      <br></br>
                      <hr></hr>
                      <br></br>
                      <h2><b> Ban Users from Forum</b></h2>
                      <br></br>
                      <p> Here you will be able to ban Specific Users from Interacting on the Forums </p>
                      <br></br>
                      <hr></hr>
                      <br></br>


                      <button className="btn-submit-reply" onClick={() => onNavigate('home')}>Return to Homepage</button>
                  </div>
                </div>

          </div>
    )
  
}