import { useNavigate } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ resetTemplate }) => {
  const { logout } = useLogout();
  const { user, dispatch } = useAuthContext();
  const navigate = useNavigate();

  const handleClick = () => {
    logout();
  };

  const goToProfile = () => {
    navigate("/profile");
  };

  const goToHome = () => {
    navigate("/app");
  };

  const switchAuthority = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/auth/switchAuthority`, {
      method: 'PATCH',
      credentials: 'include',
      mode: 'cors'
    });
    const json = await response.json();

    if (response.ok) {
      dispatch({ type: "LOGIN", payload: json });
      navigate("/app");
    }
  };

  return (
    <header className="rounded-xl p-2.5 pt-5 flex justify-between items-center text-white h-12 bg-slate-950">
      {user && (
        <div className="flex items-center gap-1">
          {/* <img src="/tallyrus2white.png" alt="Tally Illustration" className="m-0.5 mr-2 w-5 h-5" /> */}
          <Button className="flex items-center bg-white hover:bg-stone-100 text-black font-bold rounded h-8 w-15 cursor-pointer mb-1.5 mt-3" onClick={goToHome}>
            <FontAwesomeIcon icon={faHome} className="mr-1 mb-1.5 mt-1" />
            <span className="">Home</span>
          </Button>
        </div>
        
      )}

      {user && (
        <div className="user-info flex gap-2 items-center">
          {/* <div className="mr-4 cursor-pointer hover:underline" onClick={goToProfile}>
            <span className="block font-bold">
            Hi, {user.name.length > 15 ? `${user.name.substring(0, 15)}...` : user.name}!
            </span>
          </div> */}
          <img onClick={goToProfile} src={'/profile.svg'} alt={user.name} className="cursor-pointer user-image invert rounded-full h-8 object-cover mr-1 mt-3 mb-1.5" />
          
          <Button
            onClick={handleClick}
            className="bg-white hover:bg-stone-100 text-black font-bold rounded h-8 w-15 mt-3 mb-1.5 mr-1"
          >
            Logout
          </Button>
          

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="flex items-center bg-white hover:bg-stone-100 text-black font-bold rounded h-8 w-15  cursor-pointer mr-1 mt-3 mb-1.5">
                <span className="text-xl material-symbols-outlined ">metabolism</span>
                <span>{user.authority}</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-900 text-gray-100 ">
              <AlertDialogHeader>
                <AlertDialogTitle>Switch to "{user.authority === "teacher" ? "student" : "teacher"}" mode?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will change your account authority, you can change back whenever you want.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700 text-white">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={switchAuthority} className="bg-green-600 hover:bg-green-700 text-white">
                  Yes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </header>
  );
};

export default Navbar;