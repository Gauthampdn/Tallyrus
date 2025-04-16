import { useNavigate } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";
import { usePremium } from "../hooks/usePremium";
import { useState } from "react";
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
import { faHome, faCrown } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ resetTemplate }) => {
  const { logout } = useLogout();
  const { user, dispatch, isLoading } = useAuthContext();
  const { startSubscription, isLoading: isPremiumLoading, error: premiumError } = usePremium();
  const [showPremiumError, setShowPremiumError] = useState(false);
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

  const handleSubscribe = async () => {
    const checkoutUrl = await startSubscription();
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      setShowPremiumError(true);
      setTimeout(() => setShowPremiumError(false), 3000);
    }
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

  // If still loading, return a simple placeholder
  if (isLoading) {
    return (
      <header className="rounded-xl p-2.5 pt-5 flex justify-between items-center text-white h-12 bg-zinc-900">
        <div className="flex items-center gap-1">
          {/* Placeholder for logo */}
        </div>
        <div className="user-info flex gap-2 items-center">
          {/* Placeholder for user controls */}
        </div>
      </header>
    );
  }

  return (
    <header className="rounded-xl p-2.5 pt-5 flex justify-between items-center text-white h-12 bg-zinc-900">
      {user && (
        <div className="flex items-center gap-1">
          {/* <img src="/tallyrus2white.png" alt="Tally Illustration" className="m-0.5 mr-2 w-5 h-5" /> */}
          <Button className="flex items-center bg-white hover:bg-stone-100 text-black font-bold rounded h-8 w-15 cursor-pointer mb-1.5" onClick={goToHome}>
            <FontAwesomeIcon icon={faHome} className="mr-2" />
            <span className="">Home</span>
          </Button>
        </div>
        
      )}

      {user && (
        <div className="user-info flex gap-2 items-center">
          {/* Premium badge if user is premium */}
          {user.isPremium && (
            <div className="flex items-center bg-amber-700 px-3 py-1 rounded-full text-sm mr-2">
              <FontAwesomeIcon icon={faCrown} className="text-yellow-400 mr-1" />
              <span>Premium</span>
            </div>
          )}
          
          {/* Premium subscription button */}
          {!user.isPremium && (
            <Button
              onClick={handleSubscribe}
              disabled={isPremiumLoading}
              className="flex items-center bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-bold rounded h-8 cursor-pointer mr-2"
            >
              <FontAwesomeIcon icon={faCrown} className="text-yellow-400 mr-2" />
              <span>{isPremiumLoading ? 'Loading...' : 'Go Premium'}</span>
            </Button>
          )}
          
          {/* Premium error message */}
          {showPremiumError && (
            <div className="absolute top-16 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50">
              {premiumError || 'Error processing subscription. Please try again.'}
            </div>
          )}
          
          <img onClick={goToProfile} src={user.picture} alt={user.name} className="user-image rounded-full h-10 object-cover mr-1" />

          <Button
            onClick={handleClick}
            className="bg-white hover:bg-stone-100 text-black font-bold rounded h-8 w-15"
          >
            Logout
          </Button>
          
          {user.authority && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="flex items-center bg-white hover:bg-stone-100 text-black font-bold rounded h-8 w-15  cursor-pointer">
                  <span className="text-xl material-symbols-outlined ">metabolism</span>
                  <span>{user.authority}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-900 text-gray-100">
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
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;