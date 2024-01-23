import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import Navbar from "./Navbar";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast";




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
        <form className="bg-white rounded-lg shadow-lg p-8 mt-6 mb-6 w-full max-w-lg" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6 text-center">Create a New Classroom</h2>
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Title"
              className="w-full p-2 border border-gray-300 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Description"
              className="w-full p-2 border border-gray-300 rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition-colors" type="submit">
            Create Classroom
          </Button>
        </form>
      </div>

      <Toaster />
    </div>

  );
}

export default CreateClass;
