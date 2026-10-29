import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Admin: React.FC = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // In a real app, we would have admin-protected routes
        // For this demo, we're just fetching general stats
        const [matchesResponse, stadiumsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/matches`),
          axios.get(`${import.meta.env.VITE_API_URL}/stadiums`)
        ]);

        setStats({
          matches: matchesResponse.data.length,
          stadiums: stadiumsResponse.data.length
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load admin stats');
        setLoading(false);
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full border-4 border-stadium-accent border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-red-500 mb-4">Error Loading Admin Panel</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b bg-stadium-accent text-white">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>

          <div className="px-6 py-8">
            <h2 className="text-xl font-bold text-stadium-dark mb-6">System Overview</h2>

            {stats ? (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <h3 className="text-2xl font-bold text-stadium-accent">{stats.matches}</h3>
                  <p className="text-gray-600">Upcoming Matches</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <h3 className="text-2xl font-bold text-stadium-accent">{stats.stadiums}</h3>
                  <p className="text-gray-600">Stadiums Configured</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <h3 className="text-2xl font-bold text-stadium-accent">Coming Soon</h3>
                  <p className="text-gray-600">Active Bookings</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Loading statistics...</p>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50">
            <h2 className="text-xl font-bold text-stadium-dark mb-4">Admin Features</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-medium text-stadium-dark mb-3">Stadium Management</h3>
                <p className="text-gray-600">
                  Configure stadiums, sections, and seating arrangements
                </p>
                <button className="mt-3 btn btn-outline">
                  Manage Stadiums →
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-medium text-stadium-dark mb-3">Match Scheduling</h3>
                <p className="text-gray-600">
                  Schedule upcoming cricket matches and set ticket prices
                </p>
                <button className="mt-3 btn btn-outline">
                  Schedule Matches →
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-medium text-stadium-dark mb-3">Booking Management</h3>
                <p className="text-gray-600">
                  View and manage all bookings, issue refunds, etc.
                </p>
                <button className="mt-3 btn btn-outline">
                  Manage Bookings →
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-medium text-stadium-dark mb-3">Reports & Analytics</h3>
                <p className="text-gray-600">
                  Generate reports on ticket sales, revenue, and attendance
                </p>
                <button className="mt-3 btn btn-outline">
                  View Reports →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;