// SubscriptionChecker.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./useAuthContext";

const SubscriptionChecker = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/stripe/check-subscription`, {
          credentials: "include",
        });
        const data = await response.json();
        if (!data.subscriptionExists) {
          // If no active subscription, navigate to payment page
          navigate("/payment");
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };

    if (user) {
      checkSubscription();
    }
  }, [user, navigate]);

  return null; // This component does not render any UI
};

export default SubscriptionChecker;
