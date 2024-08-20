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
    <header className="rounded-xl p-2.5 pt-5 flex justify-between items-center text-white h-12">
      {user && (
        <div className=" rounded-xl flex items-center gap-2 cursor-pointer ">

          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div className="hover:text-green-400 flex  gap-2 justify-between items-center">
              <span class="text-3xl material-symbols-outlined ">
                metabolism
              </span>
              <div className="">
                <span className="font-extrabold text-lg">
                  {user.authority}
                </span>
              </div>
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
          <div className="mr-4 cursor-pointer hover:underline" onClick={goToProfile}>
            <span className="block font-bold">
              Hi, {user.name.length > 15 ? `${user.name.substring(0, 15)}...` : user.name}!
            </span>
          </div>
          <img src={user.picture} alt={user.name} className="user-image rounded-full h-10 object-cover mr-1" />

          <Button
            onClick={handleClick}
            className="bg-white hover:bg-stone-100 text-black font-bold rounded h-10 w-20 "
          >
            Logout
          </Button>
        </div>
      )}
    </header>
  );
}

export default Navbar;
