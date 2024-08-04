import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect, createRef } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import ReactMarkdown from 'react-markdown';
import Navbar from "components/Navbar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFlag, faPenToSquare, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './assignments.css';
import { marked } from 'marked';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuShortcut,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const Assignment = () => {
  const tailwindColors = [
    'bg-red-100', 'bg-yellow-100', 'bg-green-100', 'bg-blue-100',
    'bg-indigo-100', 'bg-purple-100', 'bg-pink-100', 'bg-orange-100',
    'bg-teal-100', 'bg-lime-100', 'bg-amber-100', 'bg-emerald-100',
    'bg-cyan-100', 'bg-sky-100', 'bg-violet-100', 'bg-fuchsia-100',
    'bg-rose-100'
  ];
  
  const getRandomColor = () => {
    return tailwindColors[Math.floor(Math.random() * tailwindColors.length)];
  };
  
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
  const [editFeedbackModal, setEditFeedbackModal] = useState(false);
  const [currentCriteria, setCurrentCriteria] = useState(null);
  const [currentComments, setCurrentComments] = useState('');
  const [currentScore, setCurrentScore] = useState(0); // State for the text box score

  const calculateTotalScore = (submission) => {
    if (!submission || !submission.feedback) {
      return 0;
    }
    return submission.feedback.reduce((total, criteria) => total + criteria.score, 0);
  };

  const formatFeedback = (submission) => {
    const feedback = submission.feedback;
    const formattedFeedback = feedback.map(criteria => (
      `**${criteria.name.replace(/\*/g, '')}**: ${criteria.score}/${criteria.total} points\n\n${criteria.comments}\n\n`
    )).join('');

    const overallTotal = feedback.reduce((sum, criteria) => sum + criteria.total, 0);
    const feedbackWithOverallTotal = formattedFeedback + `****Overall Total****: ${calculateTotalScore(submission)}/${overallTotal} points\n\n`;

    return feedbackWithOverallTotal;
  };

  const handleEditName = async (submissionId, name) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/${assignment._id}/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
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

  const handleScoreChange = async (criteriaId, newScore) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/${assignment._id}/submissions/${selectedSubmission._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
          feedback: selectedSubmission.feedback.map(criteria =>
            criteria._id === criteriaId ? { ...criteria, score: newScore } : criteria
          )
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to update score');
      }
  
      const updatedAssignment = await response.json();
      setAssignment(updatedAssignment);
      setSelectedSubmission(updatedAssignment.submissions.find(sub => sub._id === selectedSubmission._id));
    } catch (error) {
      console.error(error.message);
    }
  };
  

  const handleCommentsChange = async (criteriaId, newComments) => {
    try {
      const updatedFeedback = selectedSubmission.feedback.map(criteria =>
        criteria._id === criteriaId ? { ...criteria, comments: newComments } : criteria
      );
  
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/${assignment._id}/submissions/${selectedSubmission._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ feedback: updatedFeedback })
      });
  
      if (!response.ok) {
        throw new Error('Failed to update comments');
      }
  
      const updatedAssignment = await response.json();
      setAssignment(updatedAssignment);
      setSelectedSubmission(updatedAssignment.submissions.find(sub => sub._id === selectedSubmission._id));
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
      navigate('/app');
    }
  };

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

  const navigateToPreviousSubmission = () => {
    const currentIndex = assignment.submissions.findIndex(sub => sub._id === selectedSubmission._id);
    if (currentIndex > 0) {
      const previousIndex = currentIndex - 1;
      setSelectedSubmission(assignment.submissions[previousIndex]);
    }
  };

  const navigateToNextSubmission = () => {
    const currentIndex = assignment.submissions.findIndex(sub => sub._id === selectedSubmission._id);
    if (currentIndex < assignment.submissions.length - 1) {
      const nextIndex = currentIndex + 1;
      setSelectedSubmission(assignment.submissions[nextIndex]);
    }
  };

  const handleSliderChange = (criteriaId, value) => {
    setCurrentScore(value); // Update the text box value
    const updatedSubmissions = { ...selectedSubmission };
    const criteria = updatedSubmissions.feedback.find(criteria => criteria._id === criteriaId);
    criteria.score = value;
    setSelectedSubmission(updatedSubmissions);
    handleScoreChange(criteriaId, criteria.score);
  };

  const handleTextBoxChange = (criteriaId, value) => {
    const parsedValue = Number(value);
    if (!isNaN(parsedValue)) {
      setCurrentScore(parsedValue);
      handleSliderChange(criteriaId, parsedValue);
    }
  };

  const getRubricValues = (criteriaName) => {
    const rubric = assignment.rubric.find(rubric => rubric.name === criteriaName);
    return rubric ? rubric.values : [];
  };

  const autoResizeTextarea = (event) => {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const openEditFeedbackModal = (criteria) => {
    setCurrentCriteria(criteria);
    setCurrentComments(criteria.comments); // set current comments when opening the modal
    setCurrentScore(criteria.score); // Set the initial score when opening the modal
    setEditFeedbackModal(true);
  };

  const closeEditFeedbackModal = async () => {
    console.log('closing modal');
    if (currentCriteria) {
      await handleScoreChange(currentCriteria._id, currentCriteria.score);
      console.log(currentComments);
      await handleCommentsChange(currentCriteria._id, currentComments);
    }
    setEditFeedbackModal(false);
  };

  return (
    <div>
      <Navbar />
      <div className="m-1 flex justify-start">
      </div>

      {assignment ? (
        <div className="m-4" >
          <div className="flex mb-2 align-middle justify-between">
            <div className="w-1/5">
              <Button className="mr-2 w-max bg-stone-600" onClick={handleGoback}>
                <FontAwesomeIcon icon={faArrowLeft} className="ml-2 mr-2" />
              </Button>
            </div>
            <div className="flex">
              <Button
                onClick={navigateToPreviousSubmission}
                disabled={selectedSubmission && assignment.submissions.findIndex(sub => sub._id === selectedSubmission._id) === 0}
                className="p-4 mr-2 bg-green-600"
                aria-label="Previous Submission"
              >
                &#8592;
              </Button>

              <Popover open={open} onOpenChange={setOpen} >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="command-item-text p-4 mb-4 w-[400px] flex justify-between items-center"
                  >
                    {selectedSubmission
                      ? getSubmissionLabel(selectedSubmission)
                      : "Select Submission..."}
                    <CaretSortIcon className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[400px] p-0">
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
                          color: '#aaa',
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
                          paddingLeft: '40px',
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
                          className="command-item"
                        >
                          <div className="command-item-text" title={getSubmissionLabel(submission)}>
                            {getSubmissionLabel(submission)}
                          </div>
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              selectedSubmission && submission._id === selectedSubmission._id ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button
                onClick={navigateToNextSubmission}
                disabled={selectedSubmission && assignment.submissions.findIndex(sub => sub._id === selectedSubmission._id) === assignment.submissions.length - 1}
                className="p-4 ml-2 mr-2 bg-green-600"
                aria-label="Next Submission"
              >
                &#8594;
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="" className="material-symbols-outlined ml-2 bg-indigo-600">apps</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={handlePrint}>
                      🖨️ Print
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={printAll}>
                      📠 Print All
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setEditName(true)}>
                      <FontAwesomeIcon icon={faPenToSquare} className="mr-2" />
                      Edit File Name
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button className="ml-2 bg-red-500" onClick={() => handleMarkForRegrade(selectedSubmission._id)}>
                <FontAwesomeIcon icon={faFlag} className="ml-2 mr-2" />
                Mark for Regrade
              </Button>
            </div>
          </div>

          <hr className="mb-5" />

          {selectedSubmission && (
            <div className="flex flex-col md:flex-row">
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

              <div className="md:flex-1 p-4">
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="mb-1 text-2xl">{assignment?.name}</CardTitle>
                  </CardHeader>
                  <CardDescription className="ml-8 text-base">
                    <p><strong>Name:</strong> {selectedSubmission.studentName}</p>
                    <p><strong>Email:</strong> {selectedSubmission.studentEmail}</p>
                    <p><strong>Date Submitted:</strong> {new Date(selectedSubmission.dateSubmitted).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {selectedSubmission.status} {selectedSubmission.status === 'regrade' && <FontAwesomeIcon icon={faFlag} className="ml-2 text-red-500" />}</p>
                    <p className="pb-3 text-black"><strong>Total Score:</strong> {calculateTotalScore(selectedSubmission)}/{selectedSubmission.feedback.reduce((sum, criteria) => sum + criteria.total, 0)} points</p>
                  </CardDescription>
                </Card>
                <div className="overflow-y-auto">
                  {selectedSubmission.feedback.map((criteria, index) => (
                    <Card key={index} className={`mb-2`}>
                      <CardHeader>
                        <div className="flex justify-between">
                        <CardTitle>{criteria.name.replace(/\*/g, '')}</CardTitle>
                        <Button onClick={() => openEditFeedbackModal(criteria)} className="ml-2 bg-white text-black border-2 shadow-none  hover:text-white">                      
                        <FontAwesomeIcon icon={faPenToSquare} className="mr-2" />
                        Edit </Button>
                        </div>
                        <CardDescription>{criteria.score}/{criteria.total} points</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ReactMarkdown>{criteria.comments}</ReactMarkdown>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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

              <Dialog  open={editFeedbackModal} onOpenChange={setEditFeedbackModal} onClose={closeEditFeedbackModal}>
                <DialogContent className="w-full max-w-2xl p-6 h-1/2 mb-4">
                  <DialogTitle>Edit Feedback</DialogTitle>
                  <DialogDescription>
                    <div className="flex flex-row justify-between items-center mb-2">
                      <Input
                        type="number"
                        value={currentScore}
                        onChange={(e) => handleTextBoxChange(currentCriteria._id, e.target.value)}
                        className="w-1/4 mr-1"
                      />
                      <span className="mr-2">/{currentCriteria ? currentCriteria.total : 0}</span>
                    <input
                      type="range"
                      min="0"
                      max={currentCriteria ? currentCriteria.total : 0}
                      step="0.5"
                      value={currentScore}
                      onChange={(e) => handleSliderChange(currentCriteria._id, Number(e.target.value))}
                      className="w-full"
                      list={`tickmarks-${currentCriteria ? currentCriteria._id : ''}`}
                    />
                    <datalist id={`tickmarks-${currentCriteria ? currentCriteria._id : ''}`}>
                      {currentCriteria ? getRubricValues(currentCriteria.name).map((value, idx) => (
                        <option key={idx} value={value.point} label={value.point.toString()}></option>
                      )) : null}
                    </datalist>
                    </div>
                    <div className="h-full mb-4">
                    <Textarea
                      value={currentComments} // bind to currentComments state
                      onChange={(e) => setCurrentComments(e.target.value)} // update currentComments state
                      className="w-full mt-2 p-2 border border-gray-300 rounded overflow-auto h-full mb-2"
                      rows="auto"
                      style={{ overflow: 'scroll' }}
                      onInput={autoResizeTextarea}
                    />
                    </div>
                  </DialogDescription>
                  <DialogFooter className="mt-8">
                  <Button onClick={closeEditFeedbackModal}>Close</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
