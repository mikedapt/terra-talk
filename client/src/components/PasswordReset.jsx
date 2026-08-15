import { useState, useEffect } from 'react'
import { api } from '../api';

export default function PasswordReset({ onNavigate }) {

  const [form, setForm] = useState({ password: "", confirm: ""});
  const [status, setStatus] = useState("");
  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleChecked = (e) => {
    setForm({ ...form, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/api/resetpwd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setStatus(data.message || data.error || "Something went wrong");

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
                    <p>Enter either your username or email to receive a request to change it!</p>
                    </div>

                    <form id="forgot-form" onSubmit={handleSubmit} noValidate>

                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <input type="text" id="password" name="password" value={form.password}
                            placeholder="Enter password" autoComplete="password" onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm">Confirm Password</label>
                        <input type="text" id="confirm" name="confirm" value={form.confirm}
                            placeholder="Enter password" autoComplete="confirm" onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn">Reset Password</button>

                    <div className="divider"></div>

                    </form>

                    <p className="loginfooter-text">
                    Don't have an account? <button className="btn-link" onClick={() => onNavigate('register')}>Sign up</button>
                    </p>

                    <div className="form-group">
                        <button className="btn" onClick={() => onNavigate('home')}>Return to Homepage</button>
                    </div>

                </div>
            </div>

        </div>
  )
}