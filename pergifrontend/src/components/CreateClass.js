import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import Navbar from "./Navbar";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


const CreateClass = () => {
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [responseContent, setResponseContent] = useState(''); // State to store the response content

  const navigate = useNavigate(); // Define the navigate function

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Add form validation if needed

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/classroom/createclass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      navigate('/');
      toast({
        title: "Class Created",
        description: "The class is created",
      })

    } catch (error) {
      console.error("There was a problem with the POST operation:", error);
      // Optionally, handle the error state in the UI, e.g., showing an error message
    }
  };


  const handleGoback = () => {
    navigate("/");
  };


  return (
    <div className="min-h-screen bg-gray-100">
      <Button className="mb-4" onClick={handleGoback}>Go to Classrooms</Button>

      <div className="flex justify-center items-center pt-10 pb-10">


      <Card className="max-w-lg mx-auto mt-6 mb-6">
      <CardHeader>
        <CardTitle>Create a New Classroom</CardTitle>
        <CardDescription>Fill out the form to create a new classroom.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition-colors" type="submit" onClick={handleSubmit}>
          Create Classroom
        </Button>
      </CardFooter>
    </Card>


      </div>

      <Toaster />
    </div>

  );
}

export default CreateClass;
