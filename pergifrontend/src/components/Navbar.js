import { useNavigate } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";



const Navbar = ({ resetTemplate }) => {
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const handleClick = () => {
    logout();
  }

  return (
    <header className="m-3 mb-0 rounded-3xl p-4 flex justify-between items-center bg-zinc-700 text-white">
      
      {user && (<div>
        <span className="block font-bold">
          Account Type:
        </span>
        <span className="block font-medium">
          {user.authority}
        </span>
      </div>
      )}



      {user && (
        <div className="user-info flex items-center">
          <img src={user.picture} alt={user.name} className="user-image rounded-full h-10 w-10 object-cover mr-3" />
          <div className="mr-4">
            <span className="block text-sm">Welcome,</span>
            <span className="block font-bold">
              {user.name.length > 15 ? `${user.name.substring(0, 15)}...` : user.name}
            </span>
          </div>

          <button
            onClick={handleClick}
            className="bg-white hover:bg-stone-100 text-black font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      )}

    </header>
  );
}

export default Navbar;
