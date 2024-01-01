// pages/Classroom.js

import Navbar from "components/Navbar";
import { useAuthContext } from "../hooks/useAuthContext";
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import CreateA from "components/CreateA";


const Classroom = () => {
  const navigate = useNavigate();

  const { id } = useParams(); // This is how you access the classroom ID from the URL
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const { user, dispatch } = useAuthContext();
  const [showCreateForm, setShowCreateForm] = useState(false);


  const handleGoback = () => {
    navigate("/");
  };

  const fetchAssignments = async () => {

    try {
      const response = await fetch(`http://localhost:4000/assignments/${id}`,
        {
          credentials: 'include',
          mode: 'cors'
        });


      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setAssignments(data);
      if (data.length > 0) {
        setSelectedAssignment(data[0]); // Select the first assignment by default
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }

  };

  useEffect(() => {
    fetchAssignments();

  }, [user]); // This effect should run when the component mounts and whenever the ID changes.

  return (
    <div className="flex flex-col h-screen bg-gray-300"> {/* Use flex-col to stack navbar and content */}
      <Navbar />

      <div className="flex flex-grow overflow-hidden"> {/* Use flex-grow to fill the remaining height */}
        <aside className="w-1/5 bg-gray-300 p-4 overflow-auto">
          <Button className="mb-4" onClick={handleGoback}>Go to Classrooms</Button>
          <h2 className="font-bold text-2xl mb-4">ASSIGNMENTS</h2>
          <ul>
            {assignments.map((assignment) => (
              <li key={assignment._id} className="mb-2 text-sm font-semibold">
                <button
                  className={` p-2 rounded-lg ${selectedAssignment?._id === assignment._id ? 'shadow-[0_0_0_2px] shadow-slate-700 bg-slate-700 text-white' : ''}`}
                  onClick={() => setSelectedAssignment(assignment)}
                >
                  {assignment.name}
                </button>
              </li>
            ))}
          </ul>
          <Button className="p-2 bg-slate-600" onClick={() => setShowCreateForm(true)}>Add Assignment</Button>
        </aside>
        <main className="w-4/5 p-10 overflow-auto bg-white rounded-3xl m-5">
          {showCreateForm ? (
            <CreateA classId={id} closeForm={() => setShowCreateForm(false)} />
          ) : selectedAssignment ? (
            <>
              <div className="flex justify-between">
                <h1 className="text-2xl font-bold ">{selectedAssignment.name}</h1>
                <span className="font-bold text-sm">Due: {new Date(selectedAssignment.dueDate).toLocaleDateString()}</span>
              </div>
              <p className="my-4 font-semibold text-sm w-[600px]">{selectedAssignment.description}</p>
              <h2 className="font-bold text-lg">Rubric:</h2>
              <p className="text-sm">{selectedAssignment.rubric}</p>
            </>
          ) : (
            <div className="mt-80 grid w-full max-w-sm items-center gap-1.5">
              {/* Assuming Label and Input are your custom components and correctly imported */}
              <Label htmlFor="picture">Picture</Label>
              <Input className="bg-slate-100 transition duration-100 ease-in-out hover:bg-slate-200" id="picture" type="file" />
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default Classroom