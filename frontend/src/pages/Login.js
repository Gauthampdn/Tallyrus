import React, { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { Link } from "react-router-dom"

const Login = () => {
  const { dispatch } = useAuthContext();
  const [loading, setLoading] = useState(true);

  const handleButtonClick = () => {
    window.location.href = `${process.env.REACT_APP_API_BACKEND}/auth`;
  };

  useEffect(() => {
    // Loading effect for 1 second
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    // Fetch user
    const fetchUser = async () => {
      console.log("fetching user");
      const response = await fetch("https://bcknd.pergi.app/auth/googleUser", {
        credentials: 'include',
        mode: 'cors'
      });
      console.log("fetched user:");
      const json = await response.json();
      console.log(json);

      if (response.ok) {
        dispatch({ type: "LOGIN", payload: json });
      }
    };

    fetchUser();

    // Clean up the timer
    return () => clearTimeout(timer);
  }, [dispatch]);

  if (loading) {
    return (
      <div className="loading-container">
        Loading...
      </div>
    );
  }

  return (
    <div className="login">
      <div className="login-image">
      <img src="/landscape.png" alt="background" />
      </div>
      <div className="login-content">
        <h1>WELCOME TO PERGI!</h1>
        <Link to="/about">
          <h1 className="login-gohome">Check out our home page ↗</h1>
        </Link>
        <img onClick={handleButtonClick} src="/glog.png" alt="google login" className="hoverable-image" />
      </div>
    </div>
  );
}

export default Login;
