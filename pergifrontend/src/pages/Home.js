import React, { useState, useEffect } from 'react';
import { useAuthContext } from "../hooks/useAuthContext";
import { Link, useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Toaster } from '@/components/ui/sonner';
import { toast } from "sonner"



const Home = () => {
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex justify-between items-center m-8">
        <h1 className='text-3xl font-bold'>Here are your Classrooms!</h1>
        <Button className='text-md font-bold bg-slate-600' onClick={handleNavigateToCreate}>CREATE CLASS +</Button>
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
      <Toaster/>
    </div>
  );
}

export default Home;
