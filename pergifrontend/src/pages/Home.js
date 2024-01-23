import React, { useState, useEffect } from 'react';
import { useAuthContext } from "../hooks/useAuthContext";
import { Link, useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

//import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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

import { Toaster } from '@/components/ui/toaster';
import { useToast } from "@/components/ui/use-toast";

import { toast } from "sonner"

const joinFormSchema = z.object({
  joinCode: z.string().min(1, {
    message: "Please enter a join code: ",
  }),
});



const Home = () => {
  const { toast } = useToast();

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const form = useForm({
    resolver: zodResolver(joinFormSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/classroom/join`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Include authentication headers if needed
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ joinCode: data.joinCode })
      });

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Can't Join",
          description: "Please make sure that you put in the right code.",
        });
        throw new Error('Failed to join classroom');
      }

      const result = await response.json();
      console.log(result);
      window.location.reload();
    } catch (error) {
      console.error('Error joining classroom:', error);
    }
  };
  const { user } = useAuthContext();
  const [currClassrooms, setCurrClassrooms] = useState([]); // Renamed to plural

  const handleGoToClass = (classroomId) => {
    navigate(`/classroom/${classroomId}`);
  };

  const handleNavigateToCreate = () => {
    navigate('/create');
  };

  const handleNavigateToJoin = () => {

    setIsModalOpen(true);
  };
  const handleJoinClassContinue = () => {
    navigate('/join'); // Navigate after confirming
  };

  const handleJoinClassCancel = () => {
    setIsModalOpen(false); // Close the modal
  };

  useEffect(() => {
    const fetchClassrooms = async () => {
      console.log("fetching classrooms");
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/classroom`, {
        credentials: 'include'
      });

      if (response.ok) {
        const json = await response.json();
        setCurrClassrooms(json);
        console.log("all classrooms:", json);
      }
    };

    if (user) {
      fetchClassrooms();
    }
  }, [user]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex justify-between items-center m-8">
        <h1 className='text-3xl font-bold'>Here are your Classrooms!</h1>
        {user && user.authority === "teacher" && (
          <Button className='text-md font-bold bg-slate-600' onClick={handleNavigateToCreate}>CREATE CLASS +</Button>
        )}
        {user && user.authority === "student" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className='text-md font-bold bg-slate-600'>JOIN CLASS +</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Join Class</AlertDialogTitle>
              </AlertDialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="joinCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Join Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter class join code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button type="submit">Join</Button>
                  </AlertDialogFooter>
                </form>
              </Form>
            </AlertDialogContent>
          </AlertDialog>
        )}


      </div>


      <div className='flex m-4'>
        {currClassrooms.map((classroom) => (
          <Card key={classroom._id} className="w-[350px] bg-slate-100 m-4 text-slate-700">
            <CardHeader>
              <CardTitle className="text-xl font-bold ">{classroom.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{classroom.description}</CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between">
              <span className="text-sm font-bold ">Class Code: {classroom.joincode}</span>
              <Button onClick={() => handleGoToClass(classroom._id)}>Go to Class</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Toaster />
    </div>
  );
}

export default Home;
