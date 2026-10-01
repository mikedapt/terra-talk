import { useState } from 'react'

export default function PasswordReset({ token, onNavigate }) {

  const [form, setForm] = useState({ password: "", confirm: "", token: token || "" });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setStatus("Passwords do not match");
      return;
    }
    try {
      const res = await fetch("http://localhost:3001/api/resetpwd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.message) {
        setStatus(data.message);
        setTimeout(() => onNavigate('login'), 2000);
      } else {
        setStatus(data.error || "Something went wrong");
      }
    } catch {
      setStatus("Network error");
    }
  };

  return (
    <div className="page-content">

            <div className="auth-container">
                <div className="card">

                    <div className="logo">
                    <h1>Enter New Password</h1>
                    <p>Enter and confirm your new password below.</p>
                    </div>

                    {!token && (
                      <p style={{ color: 'red', textAlign: 'center' }}>
                        Invalid or missing reset link. Please request a new one.
                      </p>
                    )}

                    <form id="forgot-form" onSubmit={handleSubmit} noValidate>

                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <input type="password" id="password" name="password" value={form.password}
                            placeholder="Enter new password" autoComplete="new-password" onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm">Confirm Password</label>
                        <input type="password" id="confirm" name="confirm" value={form.confirm}
                            placeholder="Confirm new password" autoComplete="new-password" onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn" disabled={!token}>Reset Password</button>

                    {status && <p style={{ color: 'white' }}>{status}</p>}

                    <div className="divider"></div>

                    </form>

                    <div className="form-group">
                        <button className="btn" onClick={() => onNavigate('home')}>Return to Homepage</button>
                    </div>

                </div>
            </div>

        </div>
  )
}
