import { useState } from 'react'
import { api } from '../api';

export default function ForgotPassword({ onNavigate }) {

  const [form, setForm] = useState({ username: ""});
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
      const res = await fetch("/api/forgotpwd", {
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
                    <h1>Forgot Your Password? No Problem!</h1>
                    <p>Enter either your username or email to receive a request to change it!</p>
                    </div>

                    <form id="forgot-form" onSubmit={handleSubmit} noValidate>

                    <div className="form-group">
                        <label htmlFor="username">Username or Email</label>
                        <input type="text" id="username" name="username" value={form.username}
                            placeholder="Enter your username" autoComplete="username" onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn">Get Password</button>

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