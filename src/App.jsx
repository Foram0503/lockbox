import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AddPassword from './components/AddPassword';
import ForgotPassword from './components/ForgotPassword';
import { authService } from './services/api';

// Create a wrapper component to use hooks
const AppRoutes = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check session on component mount
    const checkSession = async () => {
      try {
        const sessionResult = await authService.checkSession();
        if (sessionResult.valid) {
          setUser(sessionResult.user);
          setIsAuthenticated(true);
        } else {
          // Clear any stale user data
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Session check error:', error);
        // Clear any stale user data
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2ecc71]"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login 
              onLogin={handleLogin} 
              onForgotPassword={() => navigate('/forgot-password')}
              onShowRegister={() => navigate('/register')}
            />
          )
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login 
              onLogin={handleLogin} 
              onForgotPassword={() => navigate('/forgot-password')}
              onShowRegister={() => navigate('/register')}
            />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Register onBack={() => navigate('/login')} />
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <ForgotPassword onBack={() => navigate('/login')} />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <Dashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/add-password"
        element={
          isAuthenticated ? (
            <AddPassword
              isOpen={true}
              onClose={() => window.history.back()}
              onAdd={() => window.history.back()}
              user={user}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <Toaster position="top-right" />
      <AppRoutes />
    </Router>
  );
};

export default App; 