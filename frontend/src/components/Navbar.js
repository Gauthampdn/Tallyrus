import { useNavigate } from "react-router-dom"
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";


const Navbar = ({ resetTemplate }) => {

  const { logout } = useLogout()
  const { user } = useAuthContext()


  const navigate = useNavigate();

  const handleCreateClick = () => {
    navigate('/create');
  };

  const handleClick = () => {
    logout()
  }

  return (

    <header>
      <div className="navbar">
        <nav>
          {user && (
            <div className="user-info">
              <img src={user.picture} alt={user.name} className="user-image" />
              <div className="user-details">
                <span>Welcome,</span>
                <span>{user.name.length > 15 ? `${user.name.substring(0, 15)}...` : user.name}</span>
              </div>
            </div>
          )}
          {user && (
            <div className="buttons-container">
              <button onClick={handleClick}>Logout</button>
              <button onClick={handleCreateClick}>Create</button>
              <button onClick={resetTemplate}>Chat</button>

            </div>
          )}
          {!user && (
            <div>
              {/* Possibly content for non-logged-in users */}
            </div>
          )}
        </nav>
      </div>
    </header>


  );
}

export default Navbar;