import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IoApps, IoAdd } from "react-icons/io5";
import { BsBoxArrowRight } from "react-icons/bs";

const API_URL = 'http://localhost:4000/api';

const DesignCard = ({ design, onSelectDesign }) => (
  <div className="design-card" onClick={() => onSelectDesign(design._id)}>
    <img 
      src={design.thumbnailUrl || "https://placehold.co/400x300/e2e8f0/64748b?text=No+Preview"} 
      alt={design.title} 
      className="card-thumb" 
    />
    <div className="card-body">
      <h3 className="card-title">{design.title}</h3>
      <p className="card-date">
        Edited: {new Date(design.createdAt).toLocaleDateString()}
      </p>
    </div>
  </div>
);

const Dashboard = ({ user, onSelectDesign, onBackToEditor, onLogout }) => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const token = user?.token;
        if (!token) {
          setError('Authentication error. Please log in again.');
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_URL}/designs/my-designs`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        setDesigns(res.data);
      } catch (err) {
        setError('Failed to load designs. Is the server running?');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, [user]);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="app-logo"><IoApps size={20} /></div>
          <h1 style={{ fontWeight: 700, fontSize: '18px' }}>Matty Dashboard</h1>
        </div>
        <div className="header-right">
           <span style={{ fontSize: '14px', color: '#64748b' }}>Welcome, {user.user.username}</span>
           <div className="divider"></div>
           <button onClick={onLogout} className="icon-btn btn-danger" title="Logout">
             <BsBoxArrowRight size={20} />
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="dashboard-title" style={{ marginBottom: 0 }}>My Designs</h2>
          <button onClick={onBackToEditor} className="btn-primary">
            <IoAdd size={18} /> Create New Design
          </button>
        </div>

        {loading && <p style={{ color: '#64748b' }}>Loading your masterpieces...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}
        
        {!loading && !error && designs.length === 0 && (
          <div className="empty-state">
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No designs yet</h3>
            <p>Create your first design to see it appear here!</p>
            <button onClick={onBackToEditor} className="btn-primary" style={{ marginTop: '20px', display: 'inline-flex' }}>
              Start Designing
            </button>
          </div>
        )}

        {!loading && !error && designs.length > 0 && (
          <div className="design-grid">
            {designs.map(design => (
              <DesignCard key={design._id} design={design} onSelectDesign={onSelectDesign} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;