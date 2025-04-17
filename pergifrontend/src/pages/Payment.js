import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/* global process */

// Initialize Stripe.js
const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
);

// Core payment form
const PaymentPage = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  // UI state
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [zip, setZip] = useState("");

  // Back button
  const goingBack = () => (
    <div className="absolute top-10 left-20">
      <Button
        className="bg-black hover:bg-blue-400 text-white px-4 py-2 rounded-md text-xl"
        onClick={() => navigate('/AboutTallyrus')}
      >
        Back
      </Button>
    </div>
  );

  const redirectHome = () => {
    setTimeout(() => { navigate("/app"); }, 2000);
  };

  //const response = await fetch("http://localhost:4000/api/stripe/create-subscription", …);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("Processing payment...");
    setMessageColor("text-blue-500");

    if (!stripe || !elements) {
      setMessage("Stripe has not loaded yet");
      setMessageColor("text-red-500");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: { name: `${firstName} ${lastName}`, address: { postal_code: zip } },
    });

    if (pmError) {
      console.error("Error creating PaymentMethod:", pmError);
      setMessage(`Error: ${pmError.message}`);
      setMessageColor("text-red-500");
      return;
    }

    try {
      // Create subscription on backend
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/stripe/create-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          priceId: process.env.REACT_APP_TEST_PRICE_ID,
        }),
      });

      const data = await response.json();
      console.log("Backend response:", data);

      // Handle PaymentIntent
      const pi = data.latest_invoice?.payment_intent;
      if (!pi?.client_secret) throw new Error("No client secret from backend");

      if (pi.status === "succeeded") {
        setMessage("Payment made successfully");
        setMessageColor("text-green-500");
        redirectHome();
      } else {
        const { error: confirmError } = await stripe.confirmCardPayment(pi.client_secret, {
          payment_method: { card: cardElement, billing_details: { name: `${firstName} ${lastName}` } },
        });
        if (confirmError) throw confirmError;
        setMessage("Payment made successfully");
        setMessageColor("text-green-500");
        redirectHome();
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      setMessage("Payment failed. Please try again.");
      setMessageColor("text-red-500");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      {goingBack()}
      <div className="bg-black p-10 rounded-lg shadow-lg w-full max-w-md text-white">
        <h2 className="text-center text-3xl font-bold mb-4">Secure Payment</h2>
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg mb-6">Total: $5/month</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">First Name</label>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-2 border rounded bg-gray-800 text-white"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Last Name</label>
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-2 border rounded bg-gray-800 text-white"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Zip</label>
              <input
                type="text"
                placeholder="Zip"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full p-2 border rounded bg-gray-800 text-white"
                required
              />
            </div>
          </div>
          <div className="p-4 border rounded mt-6 bg-gray-800">
            <CardElement options={{ hidePostalCode: true, style: { base: { color: "#fff", "::placeholder": { color: "#ccc" } } } }} />
          </div>
          <Button type="submit" className="w-full bg-green-600 text-white py-3 mt-6 rounded hover:bg-green-500 transition">
            Make Payment
          </Button>
        </form>
        <p className={`text-center mt-4 font-bold ${messageColor}`}>{message}</p>
      </div>
    </div>
  );
};

// Wrap in Elements provider
export default function WrappedPaymentPage() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentPage />
    </Elements>
  );
}
