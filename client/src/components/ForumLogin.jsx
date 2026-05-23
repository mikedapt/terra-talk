import { useState, useEffect } from 'react'
import { api } from '../api';

export default function ForumLogin({ onNavigate }) {
  return (
    <div className="page-content">
        
            <div className="auth-container">
                <div className="card">

                    <div className="logo">
                    <h1>TerraTalk</h1>
                    <p>Welcome back! Please log in to continue.</p>
                    </div>

                    <form id="login-form" onsubmit="handleLogin(event)" novalidate>

                    <div className="form-group">
                        <label for="username">Username or Email</label>
                        <input type="text" id="username" name="username"
                            placeholder="Enter your username" autocomplete="username" required />
                    </div>

                    <div className="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password"
                            placeholder="Enter your password" autocomplete="current-password" required />
                    </div>

                    <div className="row">
                        <label className="remember">
                        <input type="checkbox" name="remember" />
                        Remember me
                        </label>
                        <a href="#" className="forgot">Forgot password?</a>
                    </div>

                    <button type="submit" className="btn">Log In</button>

                    <div className="divider"></div>

                    </form>

                    <p className="loginfooter-text">
                    Don't have an account? <a href="register.html">Sign up</a>
                    </p>

                    <div className="form-group">
                        <button className="btn" onClick={() => onNavigate('home')}>Return to Homepage</button>
                    </div>

                </div>
            </div>

        </div>
  )
}