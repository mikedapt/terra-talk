import { useState, useEffect } from 'react'
import { api } from '../api';

export default function ForumRegister({ onNavigate }) {



  const [passwordValue, setPasswordValue] = useState("");
  const [strengthValue, setStrengthValue] = useState("");



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

  function showError(field, message) {
    const input = document.getElementById(field);
    const error = document.getElementById(field + '-error');
    input.classList.add('error');
    error.textContent = message;
    error.classList.add('visible');
  }

  function clearError(field) {
    const input = document.getElementById(field);
    const error = document.getElementById(field + '-error');
    input.classList.remove('error');
    error.classList.remove('visible');
  }

  return (
    <div className="page-content">
          <div className="forum-layout">
            <div className="forum-main">

              <div className="auth-container">
                <div className="card">

                  <div className="logo">
                    <h1>TerraTalk</h1>
                    <p>Create your account to join the community.</p>
                  </div>

                  <form id="register-form" onSubmit="handleRegister(event)" novalidate>

                    <div className="form-group">
                      <label htmlFor="username">Username</label>
                      <input type="text" id="username" name="username"
                            placeholder="Choose a username" autoComplete="username"
                            minLength="3" maxLength="20" required
                            onInput="{clearError('username')}" />
                      <div className="field-error" id="username-error"></div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input type="email" id="email" name="email"
                            placeholder="you@example.com" autoComplete="email" required
                            onInput="{clearError('email')}" />
                      <div className="field-error" id="email-error"></div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <input type="password" id="password" name="password"
                            value={passwordValue}

                            placeholder="Min. 8 characters" autoComplete="new-password"
                            minLength="8" required
                            onChange={(event) => {setPasswordValue(event.target.value);setStrengthValue(updateStrength(event.target.value));}} />
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
                            onInput="{clearError('confirm')}" />
                      <div className="field-error" id="confirm-error"></div>
                    </div>

                    <div className="checkbox-group">
                      <input type="checkbox" id="agree" name="agree" required /> <span> I agree to the <a href="#">Terms of Service</a> and <a href="#">Community Rules</a> </span>
                    </div>

                    <button type="submit" className="btn">Create Account</button>

                    <div className="divider"></div>

                    

                  </form>

                  <p className="exst_accnt_text"> Already have an account? <a href="login.html">Log in</a></p>

                  <button className="btn-submit-reply" onClick={() => onNavigate('home')}>Return to Homepage</button>

                </div>
              </div>

            </div>
          </div>
        </div>
  )
}