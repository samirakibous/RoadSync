import React from 'react';
import Sidebare from '../components/sidebare';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebare />

      {/* Contenu principal */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      </div>
    </div>
  );
}
