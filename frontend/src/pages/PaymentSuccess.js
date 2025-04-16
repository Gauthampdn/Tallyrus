import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { user, dispatch } = useAuthContext();

  useEffect(() => {
    // Redirect to home if no user
    if (!user) {
      navigate('/');
      return;
    }

    // Refresh the user data to get updated premium status
    const refreshUser = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/auth/googleUser`, {
          credentials: 'include',
          mode: 'cors'
        });
        const json = await response.json();

        if (response.ok) {
          dispatch({ type: "LOGIN", payload: json });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    refreshUser();

    // Auto-redirect after 5 seconds
    const timeout = setTimeout(() => {
      navigate('/app');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [user, navigate, dispatch]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for subscribing to Tallyrus Premium! You now have access to all premium features.
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            You will be redirected to the dashboard automatically in a few seconds...
          </p>
          <button
            onClick={() => navigate('/app')}
            className="w-full py-2 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md transition duration-200"
          >
            Go to Dashboard Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 