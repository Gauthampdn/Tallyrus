import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import ReactMarkdown from 'react-markdown';
import Navbar from "components/Navbar";
import { Button } from "@/components/ui/button"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const Assignment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthContext();

  const [assignment, setAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`http://localhost:4000/assignments/submissions/${id}`, {
        credentials: 'include',
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setAssignment(data);
      console.log(data);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const handleGoback = () => {
    navigate("/");
  };


  // Function to handle selection change
  const handleSelectionChange = (selectedId) => {
    const selected = assignment.submissions.find(sub => sub._id === selectedId);
    setSelectedSubmission(selected);
  };

  return (
    <div>
      <Navbar />
      <h1 className="text-2xl font-bold p-4">{assignment?.name}</h1>
      <Button className="mb-4" onClick={handleGoback}>Go to Classrooms</Button>
      {assignment ? (
        <div style={{ width: '90%' }} className="mx-auto">
          {/* Dropdown Select for Submissions */}
          <Select onValueChange={handleSelectionChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Submission" />
            </SelectTrigger>
            <SelectContent>
              {assignment.submissions.map(submission => (
                <SelectItem
                  key={submission._id}
                  value={submission._id}
                >
                  {submission.studentName} - {submission.studentEmail}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Display selected submission details */}
          {selectedSubmission && (
            <div className="flex flex-col md:flex-row">
              {/* PDF Viewer Column */}
              <div className="md:flex-1">
                {selectedSubmission.pdfURL ? (
                  <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedSubmission.pdfURL)}&embedded=true`}
                    width="100%"
                    height="800px"
                    style={{ border: 'none' }}
                  ></iframe>
                ) : (
                  <p>No file selected</p>
                )}
              </div>

              {/* Student Details Column */}
              <div className="md:flex-1 p-4">
                <p><strong>Name:</strong> {selectedSubmission.studentName}</p>
                <p><strong>Email:</strong> {selectedSubmission.studentEmail}</p>
                <p><strong>Date Submitted:</strong> {new Date(selectedSubmission.dateSubmitted).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {selectedSubmission.status}</p>
                <ReactMarkdown>{selectedSubmission.feedback}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>Select an assignment to view details</p>
      )}
      
    </div>
  );
}

export default Assignment;
