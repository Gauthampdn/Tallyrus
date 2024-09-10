import React, { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { Link } from "react-router-dom"
import { RocketIcon } from "@radix-ui/react-icons"
import { helix } from 'ldrs'
import { useNavigate } from "react-router-dom";




import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

import { Calendar } from "@/components/ui/calendar"

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
import { Button } from "@/components/ui/button"

const Login = () => {
  const { user, dispatch } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  helix.register()

  const navigateAbout = () => {
      navigate(`/about`);
  };

  const handleButtonClick = () => {
    window.location.href = `${process.env.REACT_APP_API_BACKEND}/auth`;
  };

  useEffect(() => {
    // Loading effect for 1 second
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    // Clean up the timer
    return () => clearTimeout(timer);


  }, [user]);


  if (loading) {
    return (
      <div class="flex items-center justify-center h-screen">
        <l-helix
          size="45"
          speed="2.5"
          color="blue"
        ></l-helix>
      </div>

    );
  }


  return (
    <div className="flex flex-row min-h-screen bg-zinc-900">
      <div className="basis-1/2 flex flex-col justify-between p-10">
        <div className="flex justify-between items-center">
          <img src="/tallyrus2white.png" alt="Tallyrus Logo" className="h-10" />
          <Button onClick={navigateAbout} className="bg-blue-500 hover:bg-blue-600 text-white">About Tallyrus!</Button>
        </div>
        <div className="mb-10">
          <blockquote className="italic text-gray-300">
            “I feel as though Tallyrus was made just for me as I 
            used to spend countless hours grading assignments before
            and now I'm able to give students their papers graded back within hours”
          </blockquote>
          <p className="mt-4 text-gray-400">- Mrs. M - Grade 6 English Teacher</p>
        </div>
      </div>

      <div className="basis-1/2 flex flex-col justify-center items-center p-10 bg-zinc-800">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-extrabold text-center text-white mb-6">Welcome to Tallyrus!</h2>
          <p className="text-sm text-center text-gray-300 mb-6">Log in or automatically sign up using your Google account</p>

          <div className="my-4 flex items-center justify-center">
            <span className="bg-gray-600 h-px flex-grow"></span>
            <span className="flex-none uppercase px-4 text-sm text-gray-400">continue with</span>
            <span className="bg-gray-600 h-px flex-grow"></span>
          </div>
          <div className="flex justify-center">
            <button onClick={handleButtonClick} aria-label="Sign in with Google"
              className="p-2 transition duration-100 ease-in-out transform hover:scale-105"
            >
              <img src="/glog.png" alt="Google" className="h-10" />
            </button>
          </div>
          <p className="text-xs text-center mt-4 text-gray-400">
            By signing in, you agree to our{" "}
            <a href="/terms" className="underline text-gray-400 hover:text-gray-200">Terms of Service and Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );



}

export default Login;
