import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./useAuthContext";

export const useCancelSubscription = () => {
  const navigate = useNavigate();
  const { dispatch } = useAuthContext();

  const cancelSubscription = async () => {
    try {
      // Cancel the subscription (backend looks it up using stripeCustomerId)
      const res = await fetch(`${process.env.REACT_APP_API_BACKEND}/stripe/cancel-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subscriptionId: "" }),
      });
      if (!res.ok) {
        throw new Error("Failed to cancel subscription");
      }
      // Call the logout endpoint
      const logoutRes = await fetch(`${process.env.REACT_APP_API_BACKEND}/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
      if (!logoutRes.ok) {
        throw new Error("Failed to log out");
      }
      // Clear auth context
      dispatch({ type: "LOGOUT" });
      // Force a redirect to the landing page
      window.location.href = "/";
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    }
  };

  return { cancelSubscription };
};
