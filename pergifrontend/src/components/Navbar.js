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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";

const Navbar = ({ resetTemplate }) => {
  const { logout } = useLogout();
  const { user, dispatch } = useAuthContext();
  const navigate = useNavigate();

  const handleClick = () => {
    logout();
  }

  const goToProfile = () => {
    navigate("/profile");
  }

  const switchAuthority = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/auth/switchAuthority`, {
      method: 'PATCH',
      credentials: 'include',
      mode: 'cors'
    });
    const json = await response.json();

    if (response.ok) {
      dispatch({ type: "LOGIN", payload: json });
      navigate("/app")
    }
  }

  return (
    <header className="m-1 mb-0 mt-1 rounded-xl p-4 flex justify-between items-center bg-zinc-700 text-white h-12">
      {user && (
        <div className="p-1 rounded-xl flex items-center gap-4 cursor-pointer ">

          
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <span class="text-2xl material-symbols-outlined hover:text-blue-500">
                metabolism
              </span>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Switch to "{user.authority === "teacher" ? "student" : "teacher"}" mode?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will change your account authority, you can change back whenever you want.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={switchAuthority}>Yes</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="">
                <span className="block font-medium">
                  {user.authority}
                </span>
              </div>

        </div>

      )}

      {user && (
        <div className="user-info flex gap-2 items-center">
          <img src={user.picture} alt={user.name} className="user-image rounded-full h-4 w-4 object-cover mr-3" />
          <div className="mr-4 cursor-pointer hover:underline" onClick={goToProfile}>
            <span className="block font-bold">
              {user.name.length > 15 ? `${user.name.substring(0, 15)}...` : user.name}
            </span>
          </div>
          <button
            onClick={handleClick}
            className="bg-white hover:bg-stone-100 text-black font-bold rounded h-5 w-20 text-xs"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

export default Navbar;
