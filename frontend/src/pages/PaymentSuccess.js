import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { usePremium } from '../hooks/usePremium';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const { updatePremiumStatus, refreshUserData, isLoading, error } = usePremium();
  const [updateStatus, setUpdateStatus] = useState('pending'); // 'pending', 'success', 'error'
  const [processingMessage, setProcessingMessage] = useState('Processing your payment...');
  
  useEffect(() => {
    // Redirect to home if no user
    if (!user) {
      navigate('/');
      return;
    }
    
    // Get session ID from URL query params or localStorage
    const queryParams = new URLSearchParams(location.search);
    let sessionId = queryParams.get('session_id');
    
    // If no session ID in URL, try to get it from localStorage
    if (!sessionId) {
      sessionId = localStorage.getItem('stripe_session_id');
      console.log('Retrieved session ID from localStorage:', sessionId);
      
      // Clear the session ID from localStorage since we're using it now
      if (sessionId) {
        localStorage.removeItem('stripe_session_id');
      }
    }
    
    if (sessionId) {
      // Try to manually update the premium status
      const updateUserStatus = async () => {
        try {
          setProcessingMessage('Activating your premium subscription...');
          console.log('Attempting to update premium status with session ID:', sessionId);
          const success = await updatePremiumStatus(sessionId);
          
          if (success) {
            setUpdateStatus('success');
            // Refresh user data
            await refreshUserData();
          } else {
            setUpdateStatus('error');
          }
        } catch (error) {
          console.error('Error updating premium status:', error);
          setUpdateStatus('error');
        }
      };
      
      updateUserStatus();
    } else {
      console.log('No session ID available, just refreshing user data');
      // No session ID available, just refresh user data
      refreshUserData();
      
      // Set a timeout to auto-redirect
      const timeout = setTimeout(() => {
        navigate('/app');
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [user, navigate, location.search, updatePremiumStatus, refreshUserData]);
  
  // Auto-redirect after success
  useEffect(() => {
    if (updateStatus === 'success') {
      const timeout = setTimeout(() => {
        navigate('/app');
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [updateStatus, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full text-center">
        {isLoading || updateStatus === 'pending' ? (
          <div className="mb-6">
            <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-indigo-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment</h2>
            <p className="text-gray-600 mb-6">
              {processingMessage}
            </p>
          </div>
        ) : updateStatus === 'error' ? (
          <div className="mb-6">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Processed</h2>
            <p className="text-gray-600 mb-6">
              Your payment was processed, but we couldn't activate your premium subscription automatically. 
              Please contact support if your premium features aren't available.
            </p>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        ) : (
          <div className="mb-6">
            <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-600 mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for subscribing to Tallyrus Premium! You now have access to all premium features.
            </p>
          </div>
        )}
        
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