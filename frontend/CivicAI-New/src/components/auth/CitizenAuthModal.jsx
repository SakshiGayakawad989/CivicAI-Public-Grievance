import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  X,
  User,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  UserRound
} from 'lucide-react';

import { useCivicData } from '../../context/CivicDataContext';

const API_BASE_URL = 'http://localhost:8080/api';

export function CitizenAuthModal({
  isOpen,
  onClose,
  targetRoute = '/citizen/submit'
}) {
  const navigate = useNavigate();

  const {
    setRole,
    updateCitizenProfile,
    saveLoggedInUser,
    loadComplaints,
    setStoredUser,
    showToast
  } = useCivicData();

  const [mode, setMode] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setError('');
    setShowPassword(false);
  };

  const handleClose = () => {
    if (isLoading) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleSuccessfulAuth = async (user) => {
    if (!user) {
      throw new Error(
        'User information was not returned by the server.'
      );
    }

    saveLoggedInUser(user);

    const userRole =
      user.role?.toUpperCase();

    /* AUTHORITY */
    if (userRole === 'AUTHORITY') {
      setRole('authority');

      await loadComplaints(
        null,
        'AUTHORITY'
      );

      onClose();

      navigate(
        '/authority/dashboard'
      );

      return;
    }

    /* CITIZEN */
    setRole('citizen');

    updateCitizenProfile({
      id: user.id,
      userId: user.id,

      name:
        user.name ||
        name ||
        'Citizen',

      title:
        'Registered Resident',

      email:
        user.email ||
        email ||
        '',

      phone:
        user.phone ||
        phone ||
        'N/A',

      ward:
        user.ward ||
        'Ward 8 (Campus Sector)',

      address:
        user.address || '',

      city:
        user.city || '',

      aadhaarVerified: true
    });

    if (user.id != null) {
      await loadComplaints(
        user.id,
        'CITIZEN'
      );
    }

    onClose();

    navigate(
      targetRoute ||
        '/citizen/submit'
    );
  };

  /* LOGIN */
  const handleLogin = async (event) => {
    event.preventDefault();

    setError('');

    if (!email.trim()) {
      setError(
        'Please enter your email.'
      );
      return;
    }

    if (!password.trim()) {
      setError(
        'Please enter your password.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/login`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            email: email.trim(),
            password
          })
        }
      );

      const responseText =
        await response.text();

      let data = null;

      try {
        data = responseText
          ? JSON.parse(responseText)
          : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            responseText ||
            'Invalid email or password.'
        );
      }

      const user =
        data?.user || data;

      await handleSuccessfulAuth(
        user
      );

      showToast(
        'Login successful!',
        'success'
      );
    } catch (err) {
      console.error(
        'Login failed:',
        err
      );

      setError(
        err.message ||
          'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* REGISTER */
  const handleRegister = async (event) => {
    event.preventDefault();

    setError('');

    if (!name.trim()) {
      setError(
        'Please enter your name.'
      );
      return;
    }

    if (!email.trim()) {
      setError(
        'Please enter your email.'
      );
      return;
    }

    if (!phone.trim()) {
      setError(
        'Please enter your phone number.'
      );
      return;
    }

    if (!password.trim()) {
      setError(
        'Please enter a password.'
      );
      return;
    }

    if (password.length < 6) {
      setError(
        'Password must contain at least 6 characters.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/register`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password,
            role: 'CITIZEN'
          })
        }
      );

      const responseText =
        await response.text();

      let data = null;

      try {
        data = responseText
          ? JSON.parse(responseText)
          : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            responseText ||
            'Registration failed.'
        );
      }

      const user =
        data?.user || data;

      await handleSuccessfulAuth(
        user
      );

      showToast(
        'Registration successful!',
        'success'
      );
    } catch (err) {
      console.error(
        'Registration failed:',
        err
      );

      setError(
        err.message ||
          'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* GUEST */
  const handleContinueAsGuest = () => {
    localStorage.removeItem(
      'civicai_user'
    );

    localStorage.removeItem(
      'civicaiUser'
    );

    localStorage.removeItem(
      'civicai_userId'
    );

    localStorage.removeItem(
      'civicai_citizen_profile'
    );

    setStoredUser(null);

    setRole('guest');

    showToast(
      'Continuing as Guest Resident.',
      'info'
    );

    onClose();

    navigate(
      '/guest/complaint'
    );
  };

  const switchMode = (
    newMode
  ) => {
    setMode(newMode);
    setError('');
    setPassword('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background:
          'rgba(15,23,42,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '470px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#fff',
          borderRadius: '20px',
          boxShadow:
            '0 25px 60px rgba(0,0,0,0.25)',
          position: 'relative'
        }}
      >
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: 'none',
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div
          style={{
            padding:
              '30px 30px 20px',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '58px',
              height: '58px',
              margin:
                '0 auto 14px',
              borderRadius: '16px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShieldCheck
              size={30}
            />
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 700,
              color: '#0f172a'
            }}
          >
            Citizen Access
          </h2>

          <p
            style={{
              margin:
                '8px 0 0',
              color: '#64748b',
              fontSize: '14px'
            }}
          >
            Login or create an account
            to access the citizen portal.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            margin: '0 30px',
            borderBottom:
              '1px solid #e2e8f0'
          }}
        >
          <button
            type="button"
            onClick={() =>
              switchMode('login')
            }
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              background: 'transparent',
              borderBottom:
                mode === 'login'
                  ? '2px solid #2563eb'
                  : '2px solid transparent',
              color:
                mode === 'login'
                  ? '#2563eb'
                  : '#64748b',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() =>
              switchMode('register')
            }
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              background: 'transparent',
              borderBottom:
                mode === 'register'
                  ? '2px solid #2563eb'
                  : '2px solid transparent',
              color:
                mode === 'register'
                  ? '#2563eb'
                  : '#64748b',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Register
          </button>
        </div>

        <form
          onSubmit={
            mode === 'login'
              ? handleLogin
              : handleRegister
          }
          style={{
            padding:
              '24px 30px 30px'
          }}
        >
          {mode === 'register' && (
            <>
              <label style={labelStyle}>
                Full Name
              </label>

              <div style={inputWrapperStyle}>
                <User
                  size={18}
                  color="#64748b"
                />

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="Enter your name"
                  style={inputStyle}
                />
              </div>

              <label style={labelStyle}>
                Phone Number
              </label>

              <div style={inputWrapperStyle}>
                <Phone
                  size={18}
                  color="#64748b"
                />

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                    )
                  }
                  placeholder="Enter phone number"
                  style={inputStyle}
                />
              </div>
            </>
          )}

          <label style={labelStyle}>
            Email
          </label>

          <div style={inputWrapperStyle}>
            <Mail
              size={18}
              color="#64748b"
            />

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="Enter your email"
              style={inputStyle}
            />
          </div>

          <label style={labelStyle}>
            Password
          </label>

          <div style={inputWrapperStyle}>
            <Lock
              size={18}
              color="#64748b"
            />

            <input
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="Enter your password"
              style={inputStyle}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              style={{
                border: 'none',
                background:
                  'transparent',
                cursor: 'pointer'
              }}
            >
              {showPassword ? (
                <EyeOff
                  size={18}
                  color="#64748b"
                />
              ) : (
                <Eye
                  size={18}
                  color="#64748b"
                />
              )}
            </button>
          </div>

          {error && (
            <div
              style={{
                marginTop: '14px',
                padding: '11px 12px',
                borderRadius: '10px',
                background: '#fef2f2',
                color: '#dc2626',
                fontSize: '13px'
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              marginTop: '20px',
              padding: '13px 16px',
              border: 'none',
              borderRadius: '10px',
              background:
                isLoading
                  ? '#94a3b8'
                  : '#2563eb',
              color: '#fff',
              fontWeight: 600,
              cursor: isLoading
                ? 'not-allowed'
                : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isLoading
              ? 'Please wait...'
              : mode === 'login'
                ? 'Login'
                : 'Create Account'}

            {!isLoading && (
              <ArrowRight size={18} />
            )}
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin:
                '22px 0 16px'
            }}
          >
            <div
              style={{
                flex: 1,
                height: '1px',
                background:
                  '#e2e8f0'
              }}
            />

            <span
              style={{
                fontSize: '12px',
                color: '#94a3b8'
              }}
            >
              OR
            </span>

            <div
              style={{
                flex: 1,
                height: '1px',
                background:
                  '#e2e8f0'
              }}
            />
          </div>

          <button
            type="button"
            onClick={
              handleContinueAsGuest
            }
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '13px 16px',
              border:
                '1px solid #cbd5e1',
              borderRadius: '10px',
              background: '#fff',
              color: '#334155',
              fontWeight: 600,
              cursor: isLoading
                ? 'not-allowed'
                : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <UserRound size={18} />

            Continue as Guest
          </button>

          <p
            style={{
              textAlign: 'center',
              margin:
                '12px 0 0',
              fontSize: '12px',
              color: '#94a3b8'
            }}
          >
            Guest users can submit a
            complaint without creating an
            account.
          </p>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  margin:
    '14px 0 7px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#334155'
};

const inputWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '9px',
  padding:
    '11px 12px',
  border:
    '1px solid #cbd5e1',
  borderRadius: '10px',
  background: '#fff'
};

const inputStyle = {
  flex: 1,
  border: 'none',
  outline: 'none',
  fontSize: '14px',
  color: '#0f172a',
  background:
    'transparent'
};

export default CitizenAuthModal;