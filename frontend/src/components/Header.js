import React from 'react';
import { useNavigate } from "react-router-dom";
import { HashLink as Link } from 'react-router-hash-link';

const Header = () => {


  const handleLogClick = () => {
    navigate('/login');
  };

  const navigate = useNavigate();
  return (
    <header className="header">
      <div className="header-icon">
        <img src="/Pergilogonoback.png" alt="Logo" /> {/* Replace with your icon path */}
      </div>
      <div className="header-links">
        <Link smooth to="#home">Home</Link>
        <Link smooth to="#more">About Us</Link>
        <a href="https://www.instagram.com/pergi.app/" target='blank'>Instagram ↗</a> {/* Replace with your actual Instagram link */}
      </div>
      <div className="header-button">
        <button className="header-button-text" onClick={handleLogClick}>LOG IN/GO TO APP</button>
      </div>
    </header>
  );
};

export default Header;
