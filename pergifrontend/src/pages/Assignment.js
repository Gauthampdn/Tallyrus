import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect, createRef } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import ReactMarkdown from 'react-markdown';
import Navbar from "components/Navbar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './assignments.css';
import { marked } from 'marked';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import { Input } from "@/components/ui/input";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

const Assignment = () => {
  const contentRef = createRef();

  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthContext();

  const [assignment, setAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [open, setOpen] = useState(false);
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState('');

  const [searchText, setSearchText] = useState("");

  const calculateTotalScore = (submission) => {
    console.log('Submission:', submission); // Log the submission object
    if (!submission || !submission.feedback) {
      return 0; // Return 0 if submission or feedback is undefined
    }
    const returnstatement = submission.feedback.reduce((total, criteria) => total + criteria.score, 0);
    console.log(returnstatement);
    return returnstatement;
  };

  const formatFeedback = (submission) => {
    const feedback = submission.feedback;
    const formattedFeedback = feedback.map(criteria => (
      `**${criteria.name}**: ${criteria.score}/${criteria.total} points\n\n${criteria.comments}\n\n`
    )).join('');

    // Calculate the overall total score
    const overallTotal = feedback.reduce((sum, criteria) => sum + criteria.total, 0);

    // Append the overall total score to the formatted feedback
    const feedbackWithOverallTotal = formattedFeedback + `****Overall Total****: ${calculateTotalScore(submission)}/${overallTotal} points\n\n`;

    return feedbackWithOverallTotal;
  };

  const handleEditName = async (submissionId, name) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/${assignment._id}/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Include authentication headers if needed
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ studentName: name })
      });

      if (!response.ok) {
        throw new Error('Failed to update submission name');
      }

      const updatedAssignment = await response.json();
      setAssignment(updatedAssignment);
      setSelectedSubmission(updatedAssignment.submissions.find(sub => sub._id === submissionId));
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleMarkForRegrade = async (submissionId) => {
    console.log(submissionId)
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/${assignment._id}/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ status: 'regrade' })
      });

      if (!response.ok) {
        throw new Error('Failed to mark submission for regrade');
      }

      const updatedAssignment = await response.json();
      setAssignment(updatedAssignment);
      setSelectedSubmission(updatedAssignment.submissions.find(sub => sub._id === submissionId));
    } catch (error) {
      console.error(error.message);
    }
  };

  const printAll = async () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>All Submissions - Writing Feedback</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              position: relative;
            }
            .header {
              text-align: center;
              padding: 10px 0;
              margin-bottom: 20px;
            }
            .submission {
              margin-bottom: 40px;
              page-break-after: always;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div id="content"></div>
        </body>
      </html>
    `);

    const contentElement = printWindow.document.getElementById('content');

    assignment.submissions.forEach(submission => {
      const formattedFeedback = formatFeedback(submission);
      const submissionContent = `
        <div class="submission">
          <p><strong>Name:</strong> ${submission.studentName}</p>
          <p><strong>Email:</strong> ${submission.studentEmail}</p>
          <p><strong>Date Submitted:</strong> ${new Date(submission.dateSubmitted).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${submission.status}</p>
          <hr />
          <div>${marked(formattedFeedback)}</div>
        </div>
      `;
      contentElement.innerHTML += submissionContent;
    });

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };



  const handlePrint = async () => {
    const content = contentRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedSubmission.studentName} - Writing Feedback</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              position: relative;
            }
            .header {
              text-align: center;
              padding: 10px 0;
              margin-bottom: 20px;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Writing Feedback</h1>
          </div>
          <div>${content}</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };




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

      if (data.submissions && data.submissions.length > 0) {
        setSelectedSubmission(data.submissions[0]);
      }

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
      navigate('/app'); // or any other fallback route you prefer
    }
  };



  // Function to handle selection change
  const handleSelectSubmission = (selectedId) => {
    const selected = assignment.submissions.find(sub => sub._id === selectedId);
    setSelectedSubmission(selected);
    setOpen(false);
  };

  const getSubmissionLabel = (submission) => {
    return `${submission.studentName} - ${submission.studentEmail}`;
  };

  const filteredSubmissions = assignment ? assignment.submissions.filter(submission =>
    getSubmissionLabel(submission).toLowerCase().includes(searchText.toLowerCase())
  ) : [];

  const rawMarkup = selectedSubmission ? formatFeedback(selectedSubmission) : '';

  const navigateToPreviousSubmission = () => {
    const currentIndex = assignment.submissions.findIndex(sub => sub._id === selectedSubmission._id);
    if (currentIndex > 0) { // Check if not the first submission
      const previousIndex = currentIndex - 1;
      setSelectedSubmission(assignment.submissions[previousIndex]);
    }
  };

  const navigateToNextSubmission = () => {
    const currentIndex = assignment.submissions.findIndex(sub => sub._id === selectedSubmission._id);
    if (currentIndex < assignment.submissions.length - 1) { // Check if not the last submission
      const nextIndex = currentIndex + 1;
      setSelectedSubmission(assignment.submissions[nextIndex]);
    }
  };


  return (
    <div>
      <Navbar />
      <div className="m-1 flex justify-between">
        <h1 className="text-2xl font-extrabold p-4 underline">{assignment?.name}</h1>
        <Button className="m-4" onClick={handleGoback}>Go Back</Button>

      </div>

      {assignment ? (
        <div className="m-4" >


          <div className="flex mb-2">

            {/* Left (Previous) Button */}
            <Button
              onClick={navigateToPreviousSubmission}
              disabled={selectedSubmission && assignment.submissions.findIndex(sub => sub._id === selectedSubmission._id) === 0}
              className="p-4 mr-2"
              aria-label="Previous Submission"
            >
              &#8592;
            </Button>

            {/* Right (Next) Button */}
            <Button
              onClick={navigateToNextSubmission}
              disabled={selectedSubmission && assignment.submissions.findIndex(sub => sub._id === selectedSubmission._id) === assignment.submissions.length - 1}
              className="p-4 mr-2"
              aria-label="Next Submission"
            >
              &#8594;
            </Button>

            <Popover open={open} onOpenChange={setOpen} >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="command-item-text p-4 mb-4"

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

            <DropdownMenu >
              <DropdownMenuTrigger asChild >
                <Button variant="" className="material-symbols-outlined ml-2">apps</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={handlePrint}>
                    🖨️ Print
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={printAll}>
                    🖨️ Print All
                  </DropdownMenuItem>

                  <DropdownMenuItem onSelect={() => setEditName(true)}>
                    Edit File Name
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button className="ml-2 bg-red-500"  onClick={() => handleMarkForRegrade(selectedSubmission._id)}>
              Mark for Regrade
            </Button>

          </div>

          <hr className="mb-5"/>


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
              <div ref={contentRef} className="md:flex-1 p-4">
                <p><strong>Name:</strong> {selectedSubmission.studentName}</p>
                <p><strong>Email:</strong> {selectedSubmission.studentEmail}</p>
                <p><strong>Date Submitted:</strong> {new Date(selectedSubmission.dateSubmitted).toLocaleDateString()}</p>
                <p className="pb-2"><strong>Status:</strong> {selectedSubmission.status}</p>
                <hr />
                <p className="pb-2"></p>
                <ReactMarkdown >{rawMarkup}</ReactMarkdown>
              </div>

              <AlertDialog open={editName}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Change File name</AlertDialogTitle>
                    <AlertDialogDescription>
                      Update the file name to better organize and reflect your records.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div>
                    <Input
                      type="text"
                      placeholder="Enter new name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setEditName(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => { handleEditName(selectedSubmission._id, name); setEditName(false); }}>Change</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
