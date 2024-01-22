import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import ReactMarkdown from 'react-markdown';
import Navbar from "components/Navbar";

const Assignemnt = () => {

  const navigate = useNavigate();
  const { id } = useParams(); // This is how you access the classroom ID from the URL

  const { user } = useAuthContext();


  const [allAssignments, setAllAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
 

  const fetchAssignments = async () => {

    try {
      const response = await fetch(`http://localhost:4000/assignments/${id}`,
        {
          credentials: 'include',
          mode: 'cors'
        }
      );


      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setAllAssignments(data);
      console.log(data)
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
    <div>
            <Navbar />

      <h2>Assignment ID: {id}</h2>
      {selectedAssignment ? (
        <div className="flex flex-col md:flex-row">
          {/* PDF Viewer Column */}
          <div className="md:flex-1">
            {selectedAssignment.submissions.map(submission => (
              submission.pdfURL ? (
                <iframe
                  key={submission._id}
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(submission.pdfURL)}&embedded=true`}
                  width="100%"
                  height="600px"
                  style={{ border: 'none' }}
                ></iframe>
              ) : (
                <p key={submission._id}>No file selected</p>
              )
            ))}
          </div>
  
          {/* Student Details Column */}
          <div className="md:flex-1 p-4">
            {selectedAssignment.submissions.map(submission => (
              <div key={submission._id} className="mb-4">
                <p><strong>Name:</strong> {submission.studentName}</p>
                <p><strong>Email:</strong> {submission.studentEmail}</p>
                <p><strong>Date Submitted:</strong> {new Date(submission.dateSubmitted).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {submission.status}</p>
                <ReactMarkdown>{submission.feedback}</ReactMarkdown>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Select an assignment to view details</p>
      )}
    </div>
  );
  
}

 
export default Assignemnt;