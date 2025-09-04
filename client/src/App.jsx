import React, { useState, useEffect } from 'react';
import Editor from './editor/Editor.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/dashboard.jsx'; // Import the new dashboard
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login'); // Can be 'login', 'register', 'editor', or 'dashboard'
  const [selectedDesignId, setSelectedDesignId] = useState(null); // To load a specific design into the editor

  // On initial load, check for a user session in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setPage('editor'); // Start in the editor if already logged in
    }
  }, []);

  // Handle successful login
  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setPage('editor');
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setSelectedDesignId(null);
    setPage('login');
  };

  // Called when a user clicks a design in the dashboard
  const handleSelectDesign = (designId) => {
    setSelectedDesignId(designId);
    setPage('editor'); // Switch to the editor to load it
  };
  
  // Called from the dashboard to go back to a blank editor
  const handleBackToEditor = () => {
    setSelectedDesignId(null); // Clear any selected design ID
    setPage('editor');
  }

  // This function acts as a simple router
  const renderPage = () => {
    // If the user is not logged in, show login or register pages
    if (!user) {
      if (page === 'register') {
        return <Register setPage={setPage} />;
      }
      return <Login setPage={setPage} onLogin={handleLogin} />;
    }

    // If the user is logged in
    switch (page) {
      case 'dashboard':
        return <Dashboard 
                  user={user} 
                  onSelectDesign={handleSelectDesign} 
                  onBackToEditor={handleBackToEditor} 
                  onLogout={handleLogout} 
                />;
      case 'editor':
      default:
        return <Editor 
                  user={user} 
                  onLogout={handleLogout} 
                  setPage={setPage} 
                  designId={selectedDesignId} 
                />;
    }
  };

  return (
    <div className="app-container">
      {renderPage()}
    </div>
  );
}

export default App;