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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const joinFormSchema = z.object({
  joinCode: z.string().min(1, "Please enter a join code"),
});

// Schema for create class
const createClassSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

const Home = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false); // For join class
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // For create class
  const joinForm = useForm({
    resolver: zodResolver(joinFormSchema),
  });
  const createForm = useForm({
    resolver: zodResolver(createClassSchema),
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

  const handleEditClassroom = async () => {
    // Handle edit classroom functionality here
  }

  const handleDeleteClassroom = async (classroomId) => {
    try {
      // Make a DELETE request to the backend API to delete the specified classroom
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/classroom/${classroomId}`, {
        method: 'DELETE',
        credentials: 'include', // Make sure cookies are sent with the request if needed for authentication
        mode: 'cors', // Ensure CORS policy is handled correctly
      });

      if (!response.ok) {
        // Handle non-OK responses here
        throw new Error('Failed to delete classroom');
      }

      // Successfully deleted the classroom
      console.log('Classroom deleted successfully:', classroomId);

      // Optionally, show a success message to the user
      toast({
        variant: "positive",
        title: "Classroom Deleted",
        description: "The classroom was successfully deleted.",
      });

      // Refresh the classroom list or remove the deleted classroom from the state
      // to reflect the changes in the UI without reloading the page
      setCurrClassrooms(currClassrooms.filter(classroom => classroom._id !== classroomId));
    } catch (error) {
      console.error('Error deleting classroom:', error);
      // Optionally, show an error message to the user
      toast({
        variant: "destructive",
        title: "Error Deleting Classroom",
        description: "There was an error deleting the classroom. Please try again.",
      });
    }
  };

  const handleCreateSubmit = async (data) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/classroom/createclass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      toast({
        title: "Class Created",
        description: "The class is created",
      });

      window.location.reload(); // Reload to show the new class
    } catch (error) {
      console.error("There was a problem with the POST operation:", error);
      toast({
        variant: "destructive",
        title: "Error Creating Classroom",
        description: "There was an error creating the classroom. Please try again.",
      });
    }
  };

  const handleStripeCheckout = () => {
    window.location.href = "https://buy.stripe.com/dR617Q1sRbK2fVC7st";
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex justify-between items-center m-8">
        <h1 className='text-3xl font-bold'>Here are your Classrooms!</h1>
        <div className="flex space-x-4">
          {user && user.authority === "teacher" && (
            <AlertDialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <AlertDialogTrigger asChild>
                <Button className='text-md font-bold bg-stone-600'>CREATE CLASS +</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Create Class</AlertDialogTitle>
                </AlertDialogHeader>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-8">
                    <FormField
                      control={createForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter class title" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter class description" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <Button type="submit">Create</Button>
                    </AlertDialogFooter>
                  </form>
                </Form>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button className='text-md font-bold bg-blue-600' onClick={handleStripeCheckout}>Buy More Credits</Button>
        </div>
        {user && user.authority === "student" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className='text-md font-bold bg-stone-600'>JOIN CLASS +</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Join Class</AlertDialogTitle>
              </AlertDialogHeader>
              <Form {...joinForm}>
                <form onSubmit={joinForm.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={joinForm.control}
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

      <div className='flex flex-wrap m-4'>
        {currClassrooms.map((classroom) => (
          <Card key={classroom._id} className="min-w-1/4 w-1/4 h-[300px] bg-stone-100 m-4 text-slate-700">
            <CardHeader>
              <div className='flex justify-between'>
                <CardTitle className="text-xl font-bold">{classroom.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="material-symbols-outlined">apps</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onSelect={() => handleEditClassroom(classroom._id)}>
                        Edit Classroom
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleDeleteClassroom(classroom._id)}>
                        Delete Classroom
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{classroom.description}</CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between">
              <span className="text-sm font-bold">Class Code: {classroom.joincode}</span>
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
