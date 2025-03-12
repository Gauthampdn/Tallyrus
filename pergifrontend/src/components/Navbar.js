import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useCancelSubscription } from "../hooks/useCancelSubscription";
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
  const { user, dispatch } = useAuthContext();
  const { cancelSubscription } = useCancelSubscription();
  const navigate = useNavigate();

  const goToHome = () => {
    navigate("/app");
  };

  const goToProfile = () => {
    navigate("/profile");
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
    <header className="rounded-xl p-2.5 pt-5 flex justify-between items-center text-white h-12 bg-zinc-900">
      {user && (
        <div className="flex items-center gap-2">
          <Button
            className="flex items-center bg-white hover:bg-stone-100 text-black font-bold rounded h-8 px-3 cursor-pointer"
            onClick={goToHome}
          >
            <FontAwesomeIcon icon={faHome} className="mr-2" />
            <span className="">Home</span>
          </Button>
          {/* Cancel Subscription Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-black border border-white text-white h-8 px-3 rounded cursor-pointer">
                Cancel Subscription
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-900 text-gray-100">
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel your subscription? This will log you out and return you to the landing page.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700 text-white">
                  Back
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={cancelSubscription}
                  className="bg-black border border-white text-white hover:bg-gray-800"
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {user && (
        <div className="user-info flex gap-2 items-center">
          <img
            onClick={goToProfile}
            src={user.picture}
            alt={user.name}
            className="user-image rounded-full h-10 object-cover mr-1"
          />
          <Button
            onClick={() => navigate(`${process.env.REACT_APP_API_BACKEND}/auth/logout`)}
            className="bg-white hover:bg-stone-100 text-black font-bold rounded h-8 w-15"
          >
            Logout
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="flex items-center bg-white hover:bg-stone-100 text-black font-bold rounded h-8 w-15 cursor-pointer">
                <span className="text-xl material-symbols-outlined">metabolism</span>
                <span>{user.authority}</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-900 text-gray-100">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Switch to "{user.authority === "teacher" ? "student" : "teacher"}" mode?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will change your account authority; you can change back whenever you want.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700 text-white">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={switchAuthority}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
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
