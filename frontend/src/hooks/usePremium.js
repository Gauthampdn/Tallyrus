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
      console.log('Starting subscription process for user:', user.email);
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/stripe/create-checkout-session`, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors'
      });

      const json = await response.json();

      if (!response.ok) {
        console.error('Failed to create checkout session:', json.error || 'Unknown error');
        setError(json.error || 'Failed to create checkout session');
        return null;
      }

      console.log('Subscription checkout created successfully with session ID:', json.sessionId);
      return { url: json.url, sessionId: json.sessionId }; // Return both URL and session ID
    } catch (err) {
      console.error('Network error when creating checkout session:', err);
      setError('Network error when creating checkout session');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Manually update premium status
  const updatePremiumStatus = async (sessionId) => {
    if (!user) {
      console.error('Cannot update premium status: User not logged in');
      return false;
    }
    
    if (!sessionId) {
      console.error('Cannot update premium status: No session ID provided');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending update premium status request with session ID:', sessionId);
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/stripe/update-premium-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
        credentials: 'include',
        mode: 'cors'
      });

      const json = await response.json();

      if (!response.ok) {
        console.error('Failed to update premium status:', json.error || 'Unknown error');
        setError(json.error || 'Failed to update premium status');
        return false;
      }

      console.log('Premium status updated successfully:', json);
      // Refresh user data with updated premium status
      await refreshUserData();
      return true;
    } catch (err) {
      console.error('Error updating premium status:', err);
      setError('Network error when updating premium status');
      return false;
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
    updatePremiumStatus,
    refreshUserData,
    isLoading, 
    error 
  };
}; 