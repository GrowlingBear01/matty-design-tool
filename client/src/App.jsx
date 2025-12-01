import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Editor from './editor/Editor.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/dashboard.jsx';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login'); 
  const [selectedDesignId, setSelectedDesignId] = useState(null); 

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setPage('dashboard'); // Default to dashboard on load
    }
  }, []);

  // --- 2. AUTH INTERCEPTOR ---
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) handleLogout();
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // --- 3. NAVIGATION FUNCTIONS ---
  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setSelectedDesignId(null);
    setPage('login');
  };

  // This is the specific function "Create New Design" needs!
  const handleBackToEditor = () => {
    console.log("Creating new design..."); 
    setSelectedDesignId(null); // Null ID = Blank Canvas
    setPage('editor');         // Switch view
  };

  const handleSelectDesign = (designId) => {
    console.log("Loading design:", designId);
    setSelectedDesignId(designId); // Set ID = Load existing
    setPage('editor');
  };

  // --- 4. RENDER PAGE ---
  const renderPage = () => {
    if (!user) {
      return page === 'register' ? 
        <Register setPage={setPage} /> : 
        <Login setPage={setPage} onLogin={handleLogin} />;
    }

    switch (page) {
      case 'dashboard':
        return <Dashboard 
                  user={user} 
                  onSelectDesign={handleSelectDesign} 
                  onBackToEditor={handleBackToEditor} // <--- MUST BE HERE
                  onLogout={handleLogout} 
                />;
      case 'editor':
        return <Editor 
                  user={user} 
                  onLogout={handleLogout} 
                  setPage={setPage} 
                  designId={selectedDesignId} 
                />;
      default:
        return <Dashboard 
                  user={user} 
                  onSelectDesign={handleSelectDesign} 
                  onBackToEditor={handleBackToEditor} 
                  onLogout={handleLogout} 
                />;
    }
  };

  return <div className="app-container">{renderPage()}</div>;
}

export default App;