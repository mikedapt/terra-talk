import { useState, useEffect } from 'react'
import { api } from '../api';

export default function ForumRegister({ onNavigate }) {

  // Create Variables for Form Fields

  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "", agree: false });
  const [status, setStatus] = useState("");

  // Get Values from Form for Variables

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
      const res = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
         setStatus(data.error || "Something went wrong");
         return;
      }
      setStatus("Registered!");
      onNavigate('login');
    } catch {
      setStatus("Network error");
    }
  };

  // Create Values to provide feedback for Password Strength

  const [passwordValue, setPasswordValue] = useState("");
  const [strengthValue, setStrengthValue] = useState("");

  //Get Password from passwordValue State

  const copyValue = () => {
    setForm({ password: passwordValue }); // Copies the value into targetState
  };



  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  function updateStrength(pw) {

    if (!pw) return '';

    let score = 0;
    if (pw.length >= 8)            score++;
    if (/[A-Z]/.test(pw))          score++;
    if (/[0-9]/.test(pw))          score++;
    if (/[^A-Za-z0-9]/.test(pw))   score++;

    const bar  = document.getElementById('strength-bar');
    const text = document.getElementById('strength-text');
    bar.dataset.score = pw.length ? score : 0;
    text.textContent  = pw.length ? strengthLabels[score] : 'Enter a password';
  }

  //function showError(field, message) {
    //const input = document.getElementById(field);
    //const error = document.getElementById(field + '-error');
    //input.classList.add('error');
    //error.textContent = message;
    //error.classList.add('visible');
  //}

  //function clearError(field) {
    //const input = document.getElementById(field);
    //const error = document.getElementById(field + '-error');
    //input.classList.remove('error');
    //error.classList.remove('visible');
  //}

  return (
    <div className="page-content">

              <div className="auth-container">
                <div className="card">

                  <div className="logo">
                    <h1>TerraTalk</h1>
                    <p>Create your account to join the community.</p>
                  </div>

                  <form id="register-form" onSubmit={handleSubmit} noValidate>

                    <div className="form-group">
                      <label htmlFor="username">Username</label>
                      <input type="text" id="username" name="username"
                            placeholder="Choose a username" value={form.username} autoComplete="username"
                            minLength="3" maxLength="20" required
                            onChange={handleChange} />
                      <div className="field-error" id="username-error"></div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input type="email" id="email" name="email"
                            placeholder="you@example.com" value={form.email} autoComplete="email" required
                            onChange={handleChange} />
                      <div className="field-error" id="email-error"></div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <input type="password" id="password" name="password"
                            value={form.password}

                            placeholder="Min. 8 characters" autoComplete="new-password"
                            minLength="8" required
                            onChange={(event) => {handleChange(event);setStrengthValue(updateStrength(event.target.value));}} />
                      <div className="strength-wrap">
                        <div className="strength-bar" id="strength-bar" data-score="0">
                          <span></span><span></span><span></span><span></span>
                        </div>
                        <div className="strength-text" id="strength-text">Enter a password</div>
                      </div>
                      <div className="field-error" id="password-error"></div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirm">Confirm Password</label>
                      <input type="password" id="confirm" name="confirm"
                            placeholder="Re-enter your password" autoComplete="new-password" required
                            onChange={handleChange} />
                      <div className="field-error" id="confirm-error"></div>
                    </div>

                    <div className="checkbox-group">
                      <input type="checkbox" id="agree" name="agree" checked={form.agree} onChange={handleChecked} required /> <span> I agree to the <button className="btn-link" onClick={() => onNavigate('terms')}>Terms of Service</button> and <button className="btn-link" onClick={() => onNavigate('login')}>Community Rules</button> </span>
                    </div>

                    <button type="submit" className="btn" >Create Account</button>

                    <div className="divider"></div>

                    

                  </form>

                  <p className="exst_accnt_text"> Already have an account? <button className="btn-link" onClick={() => onNavigate('login')}>Log in</button></p>

                  <button className="btn-submit-reply" onClick={() => onNavigate('home')}>Return to Homepage</button>

                </div>
              </div>

        </div>
  )
}