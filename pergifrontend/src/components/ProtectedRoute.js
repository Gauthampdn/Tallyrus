// ProtectedRoute.js
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuthContext();
  const [subscriptionExists, setSubscriptionExists] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only check subscription status if the user is logged in
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/stripe/check-subscription`, {
          credentials: "include",
        });
        const data = await response.json();
        setSubscriptionExists(data.subscriptionExists);
      } catch (error) {
        console.error("Error checking subscription:", error);
        setSubscriptionExists(false);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSubscriptionStatus();
    } else {
      // No user logged in, so no need to check subscription status
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user exists but they don't have a subscription, redirect to payment
  if (!subscriptionExists) {
    return <Navigate to="/payment" replace />;
  }

  return children;
};

export default ProtectedRoute;
