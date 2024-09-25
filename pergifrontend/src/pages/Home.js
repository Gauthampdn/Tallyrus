import React, { useState, useEffect } from 'react';
import { useAuthContext } from "../hooks/useAuthContext";
import { Link, useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faTrash, faArrowRight, faSave } from '@fortawesome/free-solid-svg-icons';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 


import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
} from "@/components/ui/dropdown-menu";

const joinFormSchema = z.object({
  joinCode: z.string().min(1, "Please enter a join code"),
});

const createClassSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

const Home = ({ startTour, stepIndex, setStepIndex, isCreateModalOpen, setIsCreateModalOpen }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isCreateAssignmentModalOpen, setIsCreateAssignmentModalOpen] = useState(false);
  const { user } = useAuthContext();
  
  const [assignmentData, setAssignmentData] = useState({
    name: '',
    description: '',
    dueDate: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAssignmentData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchAssignments = async () => {
      console.log('inside fetch assignments', `${process.env.REACT_APP_API_BACKEND}/assignments/${user._id}`);
      if (user) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/${user._id}`, {
            credentials: 'include',
          });
          if (response.ok) {
            console.log('inside response ok');
            const data = await response.json();
            setAssignments(data);
            console.log("personal assignments", data);
          } else {
            throw new Error('Failed to fetch assignments');
          }
        } catch (error) {
          console.error('Error fetching assignments:', error);
        }
      }
    };

    fetchAssignments();
  }, [user]);


  const fetchAssignments = async () => {
    console.log('inside fetch assignments', `${process.env.REACT_APP_API_BACKEND}/assignments/${user._id}`);
    if (user) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/${user._id}`, {
          credentials: 'include',
        });
        if (response.ok) {
          console.log('inside response ok');
          const data = await response.json();
          setAssignments(data);
          console.log("personal assignments", data);
        } else {
          throw new Error('Failed to fetch assignments');
        }
      } catch (error) {
        console.error('Error fetching assignments:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/make`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(assignmentData)
      });
  
      if (!response.ok) throw new Error('Failed to create assignment');
  
      toast({ title: "Assignment Created", description: "New assignment has been created successfully." });
      setIsCreateAssignmentModalOpen(false);
  
      // Refetch assignments after successful creation
      await fetchAssignments();
  
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create assignment." });
      console.error('Error creating assignment:', error);
    }
  };
  
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

  
  const [currClassrooms, setCurrClassrooms] = useState([]);

  const handleGoToClass = (classroomId, assignmentId = null) => {
    const path = assignmentId ? `/classroom/${classroomId}/${assignmentId}` : `/classroom/${classroomId}`;
    navigate(path);
  };
  const handleNavigateToCreate = () => {
    navigate('/create');
  };

  useEffect(() => {
    const fetchClassrooms = async () => {
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

  const handleEditClassroom = (classroom) => {
    setSelectedClassroom(classroom);
    setIsEditModalOpen(true);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/${assignmentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete assignment');
      }
  
      // Filter out the deleted assignment from the state
      setAssignments(assignments.filter(assignment => assignment._id !== assignmentId));
  
      toast({
        variant: "positive",
        title: "Assignment Deleted",
        description: "The assignment was successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        variant: "destructive",
        title: "Error Deleting Assignment",
        description: "There was an error deleting the assignment. Please try again.",
      });
    }
  };
  

  const handleDeleteClassroom = async (classroomId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/classroom/${classroomId}`, {
        method: 'DELETE',
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error('Failed to delete classroom');
      }

      setCurrClassrooms(currClassrooms.filter(classroom => classroom._id !== classroomId));
      toast({
        variant: "positive",
        title: "Classroom Deleted",
        description: "The classroom was successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting classroom:', error);
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

      window.location.reload();
    } catch (error) {
      console.error("There was a problem with the POST operation:", error);
      toast({
        variant: "destructive",
        title: "Error Creating Classroom",
        description: "There was an error creating the classroom. Please try again.",
      });
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/classroom/${selectedClassroom._id}`, {
        method: 'PATCH',
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
        title: "Class Updated",
        description: "The class was successfully updated.",
      });

      window.location.reload();
    } catch (error) {
      console.error("There was a problem with the PATCH operation:", error);
      toast({
        variant: "destructive",
        title: "Error Updating Classroom",
        description: "There was an error updating the classroom. Please try again.",
      });
    }
  };

  const handleStripeCheckout = () => {
    window.location.href = "https://buy.stripe.com/dR617Q1sRbK2fVC7st";
  };


  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <Navbar />
      <div className="flex justify-between items-center m-8 ">
        <h1 className='text-4xl font-bold'>Your Classrooms</h1>
        <div className="flex space-x-4">
          {user && user.authority === "teacher" && (
            <AlertDialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <AlertDialogTrigger asChild>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-800 text-gray-100">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-bold">Create Class</AlertDialogTitle>
                </AlertDialogHeader>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-8 fill-class-info">
                    <FormField
                      control={createForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter class title" {...field} className="bg-gray-700 text-gray-100" />
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
                            <Input placeholder="Enter class description" {...field} className="bg-gray-700 text-gray-100" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel className="text-gray-800">Cancel</AlertDialogCancel>
                      <Button type="submit" className="flex gap-2 justify-between items-center bg-indigo-600 ">
                        <FontAwesomeIcon icon={faPlus} className="" />
                        Create
                      </Button>
                    </AlertDialogFooter>
                  </form>
                </Form>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {user && user.authority === "student" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className='text-md font-bold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'>
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  JOIN CLASS +
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="transition ease-in-out duration-500 transform hover:-translate-y-1 hover:scale-105 bg-gray-800 text-gray-100">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-bold text-indigo-400">Join Class</AlertDialogTitle>
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
                            <Input placeholder="Enter class join code" {...field} className="bg-gray-700 text-gray-100" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel className="text-gray-400">Cancel</AlertDialogCancel>
                      <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Join
                      </Button>
                    </AlertDialogFooter>
                  </form>
                </Form>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      

      <div className="flex space-x-4 p-4">
    
    {/* Classrooms section - Takes 2/3 of the screen */}
    <div className="">
      <h2 className="text-2xl font-bold">Classrooms</h2>
      <div className="flex flex-wrap m-4">
      {user && user.authority === "teacher" && (
        <Card 
          className={`min-w-1/4 w-1/4 m-4 border-2 border-dotted border-indigo-600 bg-gray-200 bg-opacity-80 text-indigo-600 cursor-pointer transition-transform transform hover:scale-105 h-[300px]`}>
          <CardContent className="flex items-center justify-center h-full flex-col w-full">
            <div className="flex flex-col items-center justify-between h-full w-full">
              <Button 
                className="w-[99%] h-[45%] bg-blue-500 hover:bg-blue-600 text-white mt-4 transition-all"  // First button with blue color
                onClick={() => setIsCreateModalOpen(true)} 
              >
                Create Class
              </Button>
              <Button 
                className="w-[99%] h-[45%] bg-yellow-500 hover:bg-yellow-600 text-white transition-all" // Second button with yellow color
                onClick={() => setIsCreateAssignmentModalOpen(true)} 
              >
                New Assignment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
        {currClassrooms && currClassrooms.map((classroom) => (
          classroom.title !== 'Personal Classroom' && (
            <Card
              key={classroom._id}
              className="min-w-1/4 w-1/4 h-[300px] m-4 text-black cursor-pointer hover:bg-slate-200"
              onClick={() => handleGoToClass(classroom._id)}
            >
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle className="text-xl font-bold">{classroom.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="" className="material-symbols-outlined ml-2 bg-indigo-600">apps</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-gray-700 text-gray-100">
                      <DropdownMenuLabel>Options</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-600" />
                      <DropdownMenuGroup>
                        <DropdownMenuItem onSelect={() => handleEditClassroom(classroom)} className="hover:bg-gray-600">
                          <FontAwesomeIcon icon={faPen} className="mr-2" />
                          Edit Classroom
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDeleteClassroom(classroom._id)} className="hover:bg-gray-600">
                          <FontAwesomeIcon icon={faTrash} className="mr-2" />
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
              </CardFooter>
            </Card>
          )
        ))}
        
        {assignments && assignments.map((assignment) => (
  <Card
    key={assignment._id}
    className="min-w-1/4 w-1/4 h-[300px] m-4 text-black cursor-pointer hover:bg-purple-600 bg-purple-500"
  >
    <CardHeader className="flex justify-between items-center">
      <CardTitle className="text-xl font-bold">{assignment.name}</CardTitle>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="ml-2">
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => handleDeleteAssignment(assignment._id)}>
            <FontAwesomeIcon icon={faTrash} className="mr-2" />
            Delete Assignment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardHeader>
    <CardContent>
      <p>{assignment.description}</p>
      <p>Due: {assignment.dueDate}</p>
    </CardContent>
  </Card>
))}



      </div>
    </div>

</div>




      <AlertDialog open={isCreateAssignmentModalOpen} onOpenChange={setIsCreateAssignmentModalOpen}>
        <AlertDialogTrigger asChild>
          <div />
        </AlertDialogTrigger>
        
        <AlertDialogContent className="bg-gray-800 text-gray-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Assignment</AlertDialogTitle>
          </AlertDialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name">Assignment Title:</label>
                <Input 
                  id="name" 
                  name="name" 
                  value={assignmentData.name} 
                  onChange={handleChange} 
                  placeholder="Enter assignment title" 
                  required 
                  className="bg-gray-700 text-gray-100"
                />
              </div>
              <div>
                <label htmlFor="description">Description:</label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={assignmentData.description} 
                  onChange={handleChange} 
                  placeholder="Enter description" 
                  required 
                  className="bg-gray-700 text-gray-100"
                />
              </div>
              <div>
                <label htmlFor="dueDate">Due Date:</label>
                <Input 
                  type="date" 
                  id="dueDate" 
                  name="dueDate" 
                  value={assignmentData.dueDate} 
                  onChange={handleChange} 
                  required 
                  className="bg-gray-700 text-gray-100"
                />
              </div>
            </div>
            <AlertDialogFooter className="flex justify-end mt-4">
            <AlertDialogCancel className="text-gray-800">Cancel</AlertDialogCancel>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Create Assignment
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Class Modal */}
      <AlertDialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <AlertDialogContent className="bg-gray-800 text-gray-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Edit Class</AlertDialogTitle>
          </AlertDialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(handleEditSubmit)}
              className="space-y-8 fill-class-info"
            >
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={selectedClassroom?.title}
                        {...field}
                        className="bg-gray-700 text-gray-100"
                      />
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
                      <Input
                        placeholder={selectedClassroom?.description}
                        {...field}
                        className="bg-gray-700 text-gray-100"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <AlertDialogFooter>
                <AlertDialogCancel className="text-gray-800">Cancel</AlertDialogCancel>
                <Button type="submit" className="flex gap-2 justify-between items-center bg-indigo-600 ">
                  <FontAwesomeIcon icon={faPen} className="" />
                  Update
                </Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}

export default Home;