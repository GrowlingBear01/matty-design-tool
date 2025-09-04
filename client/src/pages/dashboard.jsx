import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

// This component represents a single design card in the gallery
const DesignCard = ({ design, onSelectDesign }) => (
  <div 
    className="border rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
    onClick={() => onSelectDesign(design._id)}
  >
    <img src={design.thumbnailUrl} alt={design.title} className="w-full h-48 object-cover" />
    <div className="p-4">
      <h3 className="font-bold text-lg truncate">{design.title}</h3>
      <p className="text-sm text-gray-500">
        Created on: {new Date(design.createdAt).toLocaleDateString()}
      </p>
    </div>
  </div>
);

const Dashboard = ({ user, onSelectDesign, onBackToEditor, onLogout }) => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch the user's designs when the component loads
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
        setError('Failed to load designs. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md h-16 flex items-center justify-between px-6">
        <h1 className="text-xl font-bold">My Designs</h1>
        <div className="flex items-center space-x-4">
           <span className="text-sm">Welcome, {user.user.username}!</span>
           <button onClick={onBackToEditor} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
              Back to Editor
           </button>
           <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
              Logout
           </button>
        </div>
      </header>

      <main className="p-8">
        {loading && <p>Loading your designs...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {!loading && !error && designs.length === 0 && (
          <p>You haven't saved any designs yet. Go to the editor to create your first one!</p>
        )}

        {!loading && !error && designs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
