import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; 
import Navbar from './Navbar';

const CreateA = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

  const handleGoBack = () => {
    if (id) {
      navigate(`/classroom/${id}`);
    } else {
      navigate('/app');
    }
  };

  const [formData, setFormData] = useState({
    rubric: [],
    name: '',
    description: '',
    dueDate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = { ...formData, classId: id };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/make`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      console.log('Assignment created:', await response.json());
      toast("Assignment has been created.");
      navigate(`/classroom/${id}`);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Creating Assignment",
        description: "There was an error creating the assignment. Make sure you fill in all areas.",
      });
      console.error('There was an issue submitting the form:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="relative flex justify-center items-center min-h-screen bg-zinc-900 text-white">
        <Button 
          className="absolute top-4 left-4 w-max bg-gray-600 hover:bg-gray-700 text-white" 
          onClick={handleGoBack}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back
        </Button>
        
        <Card className="min-w-full sm:min-w-0 sm:w-1/2 bg-gray-800 text-gray-100">
          <CardHeader>
            <CardTitle>Create New Assignment</CardTitle>
            <CardDescription>Fill in the details for the new assignment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col space-y-4">
                <div>
                  <Label htmlFor="name">Assignment Name:</Label>
                  <Textarea 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    placeholder="Assignment Name" 
                    className="focus:ring-2 focus:ring-blue-500 bg-gray-700 text-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description:</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    required 
                    placeholder="Brief Description" 
                    className="focus:ring-2 focus:ring-blue-500 bg-gray-700 text-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date:</Label>
                  <Input 
                    type="date" 
                    id="dueDate" 
                    name="dueDate" 
                    value={formData.dueDate} 
                    onChange={handleChange} 
                    required 
                    className="focus:ring-2 focus:ring-blue-500 bg-gray-700 text-gray-100"
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              type="submit" 
              onClick={handleSubmit} 
              className="create-assignment-btn bg-blue-500 hover:bg-blue-600 text-white flex items-center"
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              Create Assignment
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Toaster />
    </div>
  );
};

export default CreateA;
