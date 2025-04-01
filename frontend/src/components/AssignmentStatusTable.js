import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const AssignmentStatusTable = ({ assignmentId }) => {
  const navigate = useNavigate();
  const [submissionsData, setSubmissionsData] = useState([]);
  
  // Function to fetch submissions for the specific assignment
  const fetchSubmissions = async (assignmentId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/submissions/${assignmentId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSubmissionsData(data.submissions);
      } else {
        console.error('Failed to fetch submissions for assignment:', assignmentId);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  useEffect(() => {
    if (assignmentId) {
      // Fetch submissions initially
      fetchSubmissions(assignmentId);

      // Set up auto-refresh every 30 seconds (30000 milliseconds)
      const intervalId = setInterval(() => {
        fetchSubmissions(assignmentId);
      }, 5000); // Auto-refresh interval

      // Clean up the interval when the component is unmounted
      return () => clearInterval(intervalId);
    }
  }, [assignmentId]);

  const handleNavigateToSubmission = (submissionId) => {
    navigate(`/assignment/${assignmentId}?submissionId=${submissionId}`);
  };

  // Function to get the status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'graded':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case 'grading':
        return <FontAwesomeIcon icon={faSpinner} className="text-orange-500" spin />;
      case 'error':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />;
      default:
        return 'Not Graded';
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4"></h3>
      {/* Scrollable Table Wrapper */}
      <div className="max-h-80 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissionsData.length > 0 ? (
              submissionsData.map((submission) => (
                <TableRow key={submission._id}>
                  <TableCell>{submission.studentName}</TableCell>
                  <TableCell>{new Date(submission.dateSubmitted).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusIcon(submission.status)}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleNavigateToSubmission(submission._id)}
                      className="bg-blue-500 text-white hover:bg-blue-600"
                    >
                      View Submission
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>No submissions yet</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AssignmentStatusTable;
