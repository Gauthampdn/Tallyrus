// components/CreateA.js

import React, { useState } from 'react';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"


const CreateA = ({ classId, closeForm }) => {

  const [formData, setFormData] = useState({
    rubric: '',
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
    const body = { ...formData, classId };

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

      // Handle successful submission
      console.log('Assignment created:', await response.json());
      toast("Assignment has been created.");
      closeForm();

    } catch (error) {
      // Handle errors
      console.error('There was an issue submitting the form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg min-w-full sm:min-w-0 sm:w-1/2">
    <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Assignment</h2>
    
    <div className="mb-4">
      <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Assignment Name:</label>
      <textarea id="name" name="name" value={formData.name} onChange={handleChange} required
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
    </div>
    
    <div className="mb-4">
      <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
      <textarea id="description" name="description" value={formData.description} onChange={handleChange} required
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
    </div>
    
    <div className="mb-4">
      <label htmlFor="rubric" className="block text-gray-700 text-sm font-bold mb-2">Rubric:</label>
      <textarea id="rubric" name="rubric" value={formData.rubric} onChange={handleChange} required
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
    </div>
    
    <div className="mb-4">
      <label htmlFor="dueDate" className="block text-gray-700 text-sm font-bold mb-2">Due Date:</label>
      <input type="date" id="dueDate" name="dueDate" value={formData.dueDate} onChange={handleChange} required
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
    </div>
    
    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
      Create Assignment
    </button>
  </form>
  );
};

export default CreateA;



