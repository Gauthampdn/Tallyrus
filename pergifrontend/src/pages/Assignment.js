import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import ReactMarkdown from 'react-markdown';
import Navbar from "components/Navbar";
import { Button } from "@/components/ui/button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './assignments.css';



import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

const Assignment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthContext();

  const [assignment, setAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/submissions/${id}`, {
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
    if (assignment && assignment.classId) {
      navigate(`/classroom/${assignment.classId}`);
    } else {
      // Handle the case where assignment or classId is not available
      navigate('/'); // or any other fallback route you prefer
    }
  };
  


  // Function to handle selection change
  const handleSelectSubmission = (selectedId) => {
    const selected = assignment.submissions.find(sub => sub._id === selectedId);
    setSelectedSubmission(selected);
    setOpen(false);
  };

  const getSubmissionLabel = (submission) => {
    return `${submission.studentName} - ${new Date(submission.dateSubmitted).toLocaleDateString()} - ${submission.studentEmail}`;
  };

  const filteredSubmissions = assignment ? assignment.submissions.filter(submission =>
    getSubmissionLabel(submission).toLowerCase().includes(searchText.toLowerCase())
  ) : [];

  return (
    <div>
      <Navbar />
      <div className="m-1 flex justify-between">
        <h1 className="text-2xl font-extrabold p-4 underline">{assignment?.name}</h1>
        <Button className="m-4" onClick={handleGoback}>Go Back</Button>

      </div>

      {assignment ? (
        <div style={{ width: '97%' }} className="mx-auto">
          {/* Dropdown Select for Submissions */}
          <Popover open={open} onOpenChange={setOpen}  >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="command-item-text mb-4"

              >
                {selectedSubmission
                  ? getSubmissionLabel(selectedSubmission)
                  : "Select Submission..."}
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <div style={{ position: 'relative', width: '100%' }}>
                  <FontAwesomeIcon
                    icon={faSearch}
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 10,
                      pointerEvents: 'none',
                      fontSize: '14px',
                      color: '#aaa', // Lighter font color
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search submission..."
                    className="h-9"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{
                      padding: '10px 20px',
                      width: '100%',
                      boxSizing: 'border-box',
                      outline: 'none',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.075)',
                      fontSize: '16px',
                      paddingLeft: '40px', // Adjust to avoid overlapping with the icon
                    }}
                  />
                </div>
                {filteredSubmissions.length === 0 && <CommandEmpty>No submission found.</CommandEmpty>}
                <CommandGroup>
                  {filteredSubmissions.map((submission) => (
                    <CommandItem
                      key={submission._id}
                      value={submission._id}
                      onSelect={() => handleSelectSubmission(submission._id)}
                      className="command-item" // This is for any styling specific to the entire item
                    >
                      <div className="command-item-text" title={getSubmissionLabel(submission)}>
                        {getSubmissionLabel(submission)}
                      </div>
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedSubmission && submission._id === selectedSubmission._id ? "opacity-100" : "opacity-``0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

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
                <p className="pb-2"><strong>Status:</strong> {selectedSubmission.status}</p>
                <hr />
                <p className="pb-2"></p>
                <ReactMarkdown className="markdownstyling">{selectedSubmission.feedback}</ReactMarkdown>
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
