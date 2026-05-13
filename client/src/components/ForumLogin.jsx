import { useState, useEffect } from 'react'
import { api } from '../api';

export default function ForumLogin({ onNavigate }) {
  return (
    <div className="page-content">
        
            <div class="auth-container">
                <div class="card">

                    <div class="logo">
                    <h1>TerraTalk</h1>
                    <p>Welcome back! Please log in to continue.</p>
                    </div>

                    <form id="login-form" onsubmit="handleLogin(event)" novalidate>

                    <div class="form-group">
                        <label for="username">Username or Email</label>
                        <input type="text" id="username" name="username"
                            placeholder="Enter your username" autocomplete="username" required />
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password"
                            placeholder="Enter your password" autocomplete="current-password" required />
                    </div>

                    <div class="row">
                        <label class="remember">
                        <input type="checkbox" name="remember" />
                        Remember me
                        </label>
                        <a href="#" class="forgot">Forgot password?</a>
                    </div>

                    <button type="submit" class="btn">Log In</button>

                    <div class="divider"></div>

                    </form>

                    <p class="loginfooter-text">
                    Don't have an account? <a href="register.html">Sign up</a>
                    </p>

                    <div class="form-group">
                        <button className="btn" onClick={() => onNavigate('home')}>Return to Homepage</button>
                    </div>

                </div>
            </div>

        </div>
  )
}