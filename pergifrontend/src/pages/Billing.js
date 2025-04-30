import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../hooks/useAuthContext';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const Billing = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  // Valores por defecto
  const [billingData, setBillingData] = useState({
    plan: 'Standard',
    nextPaymentDate: 'NaN',
  });

  const [loading, setLoading] = useState(true);

  const getNextPaymentDate = (lastPaymentDate, isPremium) => {
    let plan = isPremium ? 'Premium' : 'Standard';
    let nextPayment;

    try {
      const lastPayment = new Date(lastPaymentDate);
      lastPayment.setMonth(lastPayment.getMonth() + 1);
    } catch {
      nextPayment = 'NaN';
    }

    return { plan, nextPayment };
  };

  useEffect(() => {
    const fetchBillingData = async () => {
      if (user && user.lastPaymentDate && user.isPremium !== undefined) {
        try {
          const { plan, nextPayment } = getNextPaymentDate(user.lastPaymentDate, user.isPremium);
          setBillingData({
            plan,
            nextPaymentDate: nextPayment,
          });
        } catch (error) {
          console.error('Error trying to obtain billing data:', error);
        }
      } else {
        console.log('User data is not available or incomplete. Using default billing values.');
      }

      setLoading(false);
    };

    fetchBillingData();
  }, [user]);

  if (loading) {
    return <div className="text-white bg-black w-screen h-screen left-4">Loading billing information...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="p-6 mt-20 mx-8">
        <h1 className="text-4xl font-bold mb-4">Billing Information</h1>
        <div className="space-y-4 mt-20">
          <p><strong>Subscription Plan:</strong> {billingData.plan}</p>
          <p><strong>Next Payment Date:</strong> {billingData.nextPaymentDate}</p>

          <div className="mt-6">
            <Button onClick={() => navigate('/Payment')} className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-500 transition">
              Get Premium
            </Button>
          </div>

          <div className="mt-6">
            <button className="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-500 transition">
              Cancel Subscription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
