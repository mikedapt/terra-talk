import { useState, useEffect } from 'react'
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function ForumLogin({ onNavigate }) {

  const [form, setForm] = useState({ username: "", password: "", remember: false});
  const [status, setStatus] = useState("");
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleChecked = (e) => {
    setForm({ ...form, [e.target.name]: e.target.checked });
  };

  // Submit Form Values to Server Side

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
         setStatus(data.error || "Something went wrong");
         return;
      }
      setStatus("Logged In!");
      //setStatus(res.ok ? "Logged In!" : data.error || "Something went wrong");
      login(data.token, data.user);
      onNavigate('home');

    } catch {
      setStatus("Network error");
    }
  };

  return (
    <div className="page-content">
        
            <div className="auth-container">
                <div className="card">

                    <div className="logo">
                    <h1>TerraTalk</h1>
                    <p>Welcome back! Please log in to continue.</p>
                    </div>

                    <form id="login-form" onSubmit={handleSubmit} noValidate>

                    <div className="form-group">
                        <label htmlFor="username">Username or Email</label>
                        <input type="text" id="username" name="username" value={form.username}
                            placeholder="Enter your username" autoComplete="username" onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" value={form.password}
                            placeholder="Enter your password" autoComplete="current-password" onChange={handleChange} required />
                    </div>

                    <div className="row">
                        <label className="remember" value={form.password}>
                        <input type="checkbox" name="remember" onChange={handleChecked} />
                        Remember me
                        </label>
                        <button className="forgot" onClick={() => onNavigate('forgotpwd')}>Forgot password?</button>
                    </div>

                    <button type="submit" className="btn">Log In</button>

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