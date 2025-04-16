import React from 'react';
import Navbar from '../components/Navbar';

const Support = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Support</h1>
        <p>If you need help, please contact our support team here.</p>
      </div>
    </div>
  );
};

export default Support;
