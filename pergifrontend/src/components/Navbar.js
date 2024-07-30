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
    <header className="m-3 mb-0 rounded-3xl p-4 flex justify-between items-center bg-zinc-700 text-white">
      {user && (
        <div className="p-1 rounded-xl flex items-center gap-4 cursor-pointer hover:text-blue-600 hover:bg-white">

          <span class="text-5xl material-symbols-outlined ">
            metabolism
          </span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div className="hover:underline">
                <span className="block font-bold">
                  Account Type:
                </span>
                <span className="block font-medium">
                  {user.authority}
                </span>
              </div>
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

        </div>

      )}

      {user && (
        <div className="user-info flex gap-2 items-center">
          <img src={user.picture} alt={user.name} className="user-image rounded-full h-10 w-10 object-cover mr-3" />
          <div className="mr-4 cursor-pointer hover:underline" onClick={goToProfile}>
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
