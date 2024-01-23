import React, { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { Link } from "react-router-dom"
import { RocketIcon } from "@radix-ui/react-icons"
import { helix } from 'ldrs'



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
  helix.register()



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
    <div className="flex flex-row min-h-screen bg-slate-600  ">

      <div className="basis-1/2 flex flex-col justify-between p-10">
        <div>
          <h1 className="text-3xl font-bold  text-white">Tallyrus</h1>
        </div>
        <div className="mb-10">
          <blockquote className="italic text-white">
            “I used to spend countless hours grading assignments before
            and now I'm able to give students their papers graded back within hours”
          </blockquote>
          <p className="mt-4  text-white">- Nig</p>
        </div>
      </div>

      <div className="basis-1/2 flex flex-col justify-center items-center p-10 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-extrabold text-center mb-6">Welcome to Tallyrus!</h2>
          <p className="text-sm text-center mb-6">Log in or automatically sign up using your Google account</p>

          <div className="my-4 flex items-center justify-center">
            <span className="bg-gray-300 h-px flex-grow t-2 relative top-2"></span>
            <span className="flex-none uppercase px-4 text-sm text-gray-400">continue with</span>
            <span className="bg-gray-300 h-px flex-grow t-2 relative top-2"></span>
          </div>
          <div className="flex justify-center">
            <button onClick={handleButtonClick} aria-label="Sign in with Google"
              className="p-2 transition duration-100 ease-in-out transform hover:scale-105"
            >
              <img src="/glog.png" alt="Google" className="h-10" />
            </button>
          </div>
          <p className="text-xs text-center mt-4">
            By signing in, you agree to our{" "}
            <a href="/terms" className="underline">Terms of Service</a>{" "}
            and <a href="/privacy" className="underline">Privacy Policy</a>.
          </p>

          {/* <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Terms of Service</Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Pergi Terms of Service
                </AlertDialogTitle>
                <AlertDialogDescription>
                  1. Introduction
                  Welcome to Pergi! By using our services, you agree to these Terms of Service. Pergi offers AI-based educational tools designed to enhance learning and teaching experiences.

                </AlertDialogDescription>
                <AlertDialogDescription>
                  2. User Accounts
                  You must provide accurate information when creating an account. You are responsible for all activities under your account. Pergi reserves the right to terminate accounts according to our policies.
                </AlertDialogDescription>

                <AlertDialogDescription>
                  3. Use of Service
                  You agree to use Pergi's services for lawful, intended purposes. Prohibited conduct includes any form of harassment, infringement of intellectual property, and disruption of service.
                </AlertDialogDescription>

                <AlertDialogDescription>
                  4. Intellectual Property Rights
                  All materials provided by Pergi are our property or are used with permission. Users grant Pergi a license to use content created within our service.
                </AlertDialogDescription>

                <AlertDialogDescription>
                  5. Fees and Payments
                  Certain aspects of Pergi may require payment. We will clearly outline fees and billing practices. Refunds and cancellations are governed by our refund policy.
                </AlertDialogDescription>

                <AlertDialogDescription>
                  6. Privacy and Security
                  Your privacy is important to us. Please refer to our Privacy Policy for details on how we protect your information.
                </AlertDialogDescription>

                <AlertDialogDescription>
                  7. Warranties and Disclaimers
                  Pergi is provided "as is". We disclaim all warranties and limit our liability to the extent permitted by law.
                </AlertDialogDescription>

                <AlertDialogDescription>
                  8. Indemnification
                  Users agree to indemnify Pergi against all liabilities, damages, losses, and costs related to their use of the service.
                </AlertDialogDescription>

                <AlertDialogDescription>
                  9. Modification of Terms
                  Pergi reserves the right to modify these terms. Users will be notified of significant changes.
                </AlertDialogDescription>

                <AlertDialogDescription>
                  10. Governing Law and Jurisdiction
                  These terms are governed by certain laws. Disputes will be resolved through arbitration or in courts.
                </AlertDialogDescription>

              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog> */}
        </div>
      </div>

    </div>
  );



}

export default Login;
