import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock authentication
        onLogin({
            name: formData.name || 'User Name',
            email: formData.email
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="login-container">
            <div className="login-card glass-panel">
                <div className="login-header">
                    <div className="login-logo">🤖</div>
                    <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
                    <p>{isSignUp ? 'Join the future of AI conversation' : 'Login to continue your journey'}</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    {isSignUp && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="login-submit-btn">
                        {isSignUp ? 'Sign Up' : 'Continue'}
                    </button>
                </form>

                <div className="login-divider">
                    <span>OR</span>
                </div>

                <div className="social-login">
                    <button className="social-btn google">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>
                    <button className="social-btn github">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M12 1.27a11 11 0 00-3.48 21.46c.55.09.73-.24.73-.53v-1.84c-3.03.66-3.67-1.46-3.67-1.46-.5-1.24-1.21-1.58-1.21-1.58-.98-.67.08-.66.08-.66 1.08.08 1.65 1.11 1.65 1.11.97 1.65 2.55 1.17 3.17.9a2.4 2.4 0 01.7-1.5c-2.4-.28-4.93-1.2-4.93-5.35 0-1.18.42-2.15 1.1-2.92-.11-.28-.48-1.38.1-2.88 0 0 .9-.29 2.94 1.1a10.2 10.2 0 015.4 0c2.04-1.39 2.93-1.1 2.93-1.1.58 1.5.21 2.6.1 2.88.68.77 1.1 1.74 1.1 2.92 0 4.17-2.54 5.07-4.95 5.34.38.33.73.98.73 1.97v2.93c0 .3.18.63.74.53A11 11 0 0012 1.27z" />
                        </svg>
                        GitHub
                    </button>
                </div>

                <div className="login-footer">
                    <span>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button onClick={() => setIsSignUp(!isSignUp)}>
                            {isSignUp ? 'Login' : 'Sign Up'}
                        </button>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Login;
