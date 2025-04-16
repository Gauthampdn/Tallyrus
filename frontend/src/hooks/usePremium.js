import { useState } from 'react';
import { useAuthContext } from './useAuthContext';

export const usePremium = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, dispatch } = useAuthContext();

  // Check premium status
  const checkPremiumStatus = async () => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/stripe/premium-status`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors'
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error || 'Failed to check premium status');
        return false;
      }

      return json.isPremium;
    } catch (err) {
      setError('Network error when checking premium status');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Start subscription process
  const startSubscription = async () => {
    if (!user) {
      setError('You must be logged in to subscribe');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/stripe/create-checkout-session`, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors'
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error || 'Failed to create checkout session');
        return null;
      }

      return json.url; // Return the checkout URL
    } catch (err) {
      setError('Network error when creating checkout session');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel subscription
  const cancelSubscription = async () => {
    if (!user) {
      setError('You must be logged in to cancel your subscription');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/stripe/cancel-subscription`, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors'
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error || 'Failed to cancel subscription');
        return false;
      }

      // Refresh user data to get updated premium status
      await refreshUserData();
      return true;
    } catch (err) {
      setError('Network error when canceling subscription');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to refresh user data
  const refreshUserData = async () => {
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
      console.error("Error refreshing user data:", error);
    }
  };

  return { 
    startSubscription, 
    cancelSubscription, 
    checkPremiumStatus, 
    refreshUserData,
    isLoading, 
    error 
  };
}; 