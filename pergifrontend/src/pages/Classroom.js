// pages/Classroom.js

import Navbar from "components/Navbar";
import { useAuthContext } from "../hooks/useAuthContext";
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import CreateA from "components/CreateA";
import { Toaster } from "@/components/ui/toaster"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import ReactMarkdown from 'react-markdown';
import { useToast } from "@/components/ui/use-toast";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faMinusCircle, faSave } from '@fortawesome/free-solid-svg-icons'; // Import specific icons
import { flexRender } from "@tanstack/react-table";
import { useDropzone } from 'react-dropzone';
import { faTrash, faArrowRight, faFlag, faArrowLeft, faUpload, faEdit, faLink, faFileUpload, faCheckCircle, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'; // Added icons

import './Classroom.css';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
} from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox"; // Make sure to import the Checkbox component

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
} from "@/components/ui/dropdown-menu"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const RubricTable = ({ rubric }) => {
  const columns = React.useMemo(
    () => [
      {
        accessorKey: 'point',
        header: 'Point',
      },
      {
        accessorKey: 'description',
        header: 'Description',
      },
    ],
    []
  );

  const table = useReactTable({
    data: rubric.values,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mb-5">
      <h3 className="font-bold text-md">{rubric.name}</h3>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const Classroom = () => {

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
      `**${criteria.name.replace(/\*/g, '')}**: ${criteria.score}/${criteria.total} points\n\n${criteria.comments}\n\n`
    )).join('');

    // Calculate the overall total score
    const overallTotal = feedback.reduce((sum, criteria) => sum + criteria.total, 0);

    // Append the overall total score to the formatted feedback
    const feedbackWithOverallTotal = formattedFeedback + `****Overall Total****: ${calculateTotalScore(submission)}/${overallTotal} points\n\n`;

    return feedbackWithOverallTotal;
  };
  const navigate = useNavigate();
  const { toast } = useToast();

  const { user } = useAuthContext();


  const [allAssignments, setAllAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [file, setFile] = useState(null); // State to hold the selected file
  const [feedback, setFeedback] = useState('');
  const [teacherFiles, setTeacherFiles] = useState(null); // State to hold the selected files for the teacher
  const [isTeacherUploadModalOpen, setIsTeacherUploadModalOpen] = useState(false);
  const [rubricFile, setRubricFile] = useState(null);
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshIntervalId, setRefreshIntervalId] = useState(null);
  const { classroomId, assignmentId } = useParams();


  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': []
    },
    onDrop: (acceptedFiles) => {
      if (isRubricModalOpen && acceptedFiles.length > 0) {
        setRubricFile(acceptedFiles[0]);
        setFileName(acceptedFiles[0].name);
      } else if (isTeacherUploadModalOpen && acceptedFiles.length > 0) {
        setTeacherFiles(acceptedFiles);
      }
    },
  });

  const handleOpenRubricModal = () => {
    console.log("Opening rubric upload modal new");
    setIsRubricModalOpen(true);
    setRubricFile(null);
    setFileName('');
  };


  const handleCloseRubricModal = () => {
    setIsRubricModalOpen(false);
    setRubricFile(null);
    setFileName('');
  };


  const handleRubricUpload = async () => {
    if (!rubricFile) {
      console.log("No rubric file selected");
      return;
    }

    setLoading(true); // Set loading to true when starting the upload


    const formData = new FormData();
    formData.append('file', rubricFile);
    console.log(rubricFile);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/files/upload-rubric/${selectedAssignment._id}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log(data);
      toast({
        title: "Rubric Uploaded!",
        description: "The rubric has been successfully uploaded and parsed.",
      });
      handleCloseRubricModal();
      fetchAssignments(); // Refresh the assignments to show the updated rubric
    } catch (error) {
      console.error("There was a problem with the rubric upload:", error);
    } finally {
      setLoading(false); // Set loading to false when the upload is complete
    }
  };

  // Function to open the modal
  const handleOpenTeacherUploadModal = () => {
    setIsTeacherUploadModalOpen(true);
    setTeacherFiles(null);
  };


  // Function to close the modal
  const handleCloseTeacherUploadModal = () => {
    setIsTeacherUploadModalOpen(false);
    setTeacherFiles(null);
  };


  const handleDeleteSubmission = async (filename) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/files/delete/${filename}`, {
        method: 'DELETE',
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      toast({
        title: "File Deleted",
        description: "The file has been successfully deleted.",
      });

      // Refresh the submissions list to reflect the deletion
      fetchAssignments();
    } catch (error) {
      console.error("There was a problem with the file deletion:", error);
    }
  };

  // Function to remove a file from the list
  const removeFile = (index) => {
    setTeacherFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleTeacherFilesUpload = async (assignmentId) => {
    if (!teacherFiles || teacherFiles.length === 0) {
      console.log("No files selected");
      return;
    }

    const formData = new FormData();
    Array.from(teacherFiles).forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/files/upload-teacher/${assignmentId}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      toast({
        title: "Files Uploaded!",
        description: "The files have been successfully uploaded.",
      });
      fetchSubmissions();
      // Automatically trigger grading for all assignments
      await handleGradeAll(assignmentId);
      fetchSubmissions();


    } catch (error) {
      console.error("There was a problem with the file upload:", error);
    }
  };






  // Fetch assignments when component mounts or user changes
  useEffect(() => {
    console.log('refresh');
    fetchAssignments();
  }, [classroomId, assignmentId]);

  // Fetch all assignments
  const fetchAssignments = async () => {
    console.log('inside fetch assignments classroom', `${process.env.REACT_APP_API_BACKEND}/assignments/${classroomId}`);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/${classroomId}`, {
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) throw new Error("Failed to fetch assignments");

      const data = await response.json();

      // Only update the state if assignments have actually changed
      if (JSON.stringify(allAssignments) !== JSON.stringify(data)) {
        setAllAssignments(data);
      }

      // Set the selected assignment if it's not already set
      if (!selectedAssignment || !assignmentId) {
        const defaultAssignment = assignmentId
          ? data.find((assignment) => assignment._id === assignmentId)
          : data[0];
        setSelectedAssignment(defaultAssignment);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };


  const fetchSubmissions = async () => {
    if (!selectedAssignment) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/submissions/${selectedAssignment._id}`, {
        credentials: "include",
        mode: "cors",
      });

      if (!response.ok) throw new Error("Failed to fetch submissions");

      const data = await response.json();

      // Check if the submissions have changed before updating the state
      if (JSON.stringify(selectedAssignment.submissions) !== JSON.stringify(data)) {
        setSelectedAssignment((prevAssignment) => ({
          ...prevAssignment,
          submissions: data.submissions,
        }));
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };


  useEffect(() => {
    if (selectedAssignment) {
      // Fetch immediately when assignment is selected

      // Set a longer interval for refreshing the submission status
      const intervalId = setInterval(() => {
        console.log('Fetching submissions...');
        // fetchSubmissions();
      }, 10000); // Refresh every 60 seconds

      // Cleanup the interval when component unmounts or assignment changes
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [selectedAssignment]);

  // Handle assignment selection (and update URL)
  const handleSelectAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    // Update the URL to include the selected assignment's ID
    navigate(`/classroom/${classroomId}/${assignment._id}`);
  };


  const handleCreateA = () => {
    navigate(`/createassignment/${classroomId}`);
  };

  const doToast = () => {
    toast({
      variant: "destructive",
      title: "Invalid file type",
      description: "Please select a PDF file.",
    });
  }

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    console.log("File selection event triggered"); // Add this line
    if (selectedFile) {
      console.log("File selected:", selectedFile.name, "Type:", selectedFile.type);
      const allowedTypes = ["application/pdf"];
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        console.log("File state updated:", selectedFile.name);
        // Add a state to display the file name
        setFileName(selectedFile.name);
      } else {
        console.log("Invalid file type:", selectedFile.type);
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select a PDF file.",
        });
        event.target.value = null;
      }
    } else {
      console.log("No file selected");
    }
  };


  const handleGradeAll = async (assignmentId) => {
    toast({
      title: "Grading Now!",
      description: "Our systems are grading all assignments - check back in a bit!",
    });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/openai/gradeall/${assignmentId}`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Error In Grading All",
          description: "Try grading all later.",
        });

        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data); // Logging the response
    } catch (error) {
      console.error("There was a problem trying to grade", error);
    }
  }



  async function getTextFromPdf(file) {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js');
    const pdfjsWorker = await import('pdfjs-dist/legacy/build/pdf.worker.entry.js');

    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
      fileReader.onload = async (event) => {
        const typedArray = new Uint8Array(event.target.result);
        try {
          const pdfDoc = await pdfjsLib.getDocument({ data: typedArray }).promise;
          let text = '';
          for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            text += textContent.items.map(item => item.str).join(' ');
          }
          resolve(text);
        } catch (error) {
          reject(error);
        }
      };
      fileReader.readAsArrayBuffer(file);
    });
  }

  const handleGrade = async (assignmentId) => {
    if (!file) {
      console.log("No file selected");
      return;
    }

    try {
      const text = await getTextFromPdf(file);
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/openai/gradesubmission/${assignmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data.feedback); // Assuming the backend sends back a JSON with 'feedback'
      setFeedback(data.feedback);
    } catch (error) {
      console.error("There was a problem with extracting or sending the text:", error);
    }
  };

  const handleSubmit = async (assignmentId) => {
    if (!file) {
      console.log("No file selected for upload");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/files/upload/${assignmentId}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      toast({
        title: "Congratulations!",
        description: "You submitted your PDF successfully.",
      });

      // Automatically trigger grading for all assignments
      await handleGradeAll(assignmentId);

      setFile(null);  // Clear the file input
    } catch (error) {
      console.error("Error during file upload:", error);
    }
  };



  const handleGoback = () => {
    navigate("/app");
  };

  const handleNavtoSubs = () => {
    navigate(`/assignment/${selectedAssignment._id}`);

  };

  const handleNavtoSub = (assignmentId, submissionId) => {
    if (!assignmentId || !submissionId) {
      console.error("Assignment ID and Submission ID are required");
      return;
    }
    navigate(`/assignment/${assignmentId}?submissionId=${submissionId}`);
  };



  const handleNavtoRubric = (sectionIndex) => {
    navigate(`/rubric/${selectedAssignment._id}`, { state: { sectionIndex } });
  };




  const deleteAssignment = async (assignmentId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/${assignmentId}`, {
        method: 'DELETE',
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Remove the deleted assignment from the state
      setAllAssignments(allAssignments.filter(assignment => assignment._id !== assignmentId));
      toast("Assignment has been deleted.");

      // Optionally, deselect the assignment if it was the one being viewed
      if (selectedAssignment && selectedAssignment._id === assignmentId) {
        setSelectedAssignment(null);
      }
    } catch (error) {
      console.error("There was a problem with the delete operation:", error);
    }
  };

  const copyPublicLink = () => {
    const url = `https://tallyrus.com/publicassignment/${selectedAssignment._id}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        console.log('Link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy the link: ', err);
      });

    toast({
      title: "Copied Link",
      description: "We copied the Public Link to this assignment to your clipboard, so you can share it!",
    });
  };


  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white">
      <Navbar />
      <div className="flex flex-grow overflow-hidden justify-center">
        <div className="flex flex-col w-1/5">
          <aside className="rounded-3xl m-3 mr-0 p-6 overflow-auto text-gray-200 flex flex-col h-full bg-zinc-900">
            <div className="flex w-full justify-between mb-3 gap-2">
              <Button className="w-1/4 bg-gray-600 text-white hover:bg-gray-700" onClick={handleGoback}>
                <FontAwesomeIcon icon={faArrowLeft} className="ml-2 mr-2" />
              </Button>
              <Button className="w-3/4 bg-emerald-500 text-white hover:bg-emerald-600" onClick={handleCreateA}>
                <FontAwesomeIcon icon={faPlusCircle} className="ml-2 mr-2" />
                Create Assignment
              </Button>
            </div>
            <h2 className="font-extrabold text-2xl text-center mb-4 text-gray-100 underline">All Assignments</h2>
            <ul>
              {allAssignments.map((eachAssignment) => (
                <li key={eachAssignment._id} className="mb-2 text-sm font-semibold">
                  <button
                    className={`p-2 rounded-lg ${selectedAssignment?._id === eachAssignment._id ? 'bg-gray-700 text-amber-600' : 'text-gray-300 hover:bg-gray-700'}`}
                    onClick={() => handleSelectAssignment(eachAssignment)}
                  >
                    {eachAssignment.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <main className="w-4/5 p-10 overflow-auto bg-zinc-800 text-gray-100 rounded-3xl rounded-tr-md rounded-br-md m-3">
          {selectedAssignment ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-extrabold underline">{selectedAssignment.name}</h1>
                {user.authority === "teacher" && (
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="" className="bg-indigo-600 material-symbols-outlined">apps</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 bg-gray-700 text-gray-100">
                        <DropdownMenuLabel>Options</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-600" />
                        <DropdownMenuGroup>
                          <DropdownMenuItem onSelect={() => copyPublicLink()} className="hover:bg-gray-600">
                            <FontAwesomeIcon icon={faLink} className="mr-2" />
                            Public Link
                          </DropdownMenuItem>
                          {!selectedAssignment.rubric || selectedAssignment.rubric.length === 0 ? (
                            <>
                              <DropdownMenuItem onSelect={handleOpenRubricModal} className="hover:bg-gray-600">
                                <FontAwesomeIcon icon={faUpload} className="mr-2" />
                                Upload Rubric
                              </DropdownMenuItem>

                              <DropdownMenuItem onSelect={() => handleNavtoRubric(0)} className="hover:bg-gray-600">
                                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                Edit Rubric
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <>
                              <DropdownMenuItem onSelect={handleOpenRubricModal} className="hover:bg-gray-600">
                                <FontAwesomeIcon icon={faUpload} className="mr-2" />
                                Upload Rubric
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleNavtoRubric(0)} className="hover:bg-gray-600">
                                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                Edit Rubric
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="material-symbols-outlined bg-red-600" variant="destructive">delete</Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 text-gray-100">
                        <DialogHeader>
                          <DialogTitle>Are you absolutely sure?</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently delete the assignment as well as all submissions.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button className="bg-red-500" onClick={() => deleteAssignment(selectedAssignment._id)}>Continue</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
              <p className="my-4 font-semibold text-sm">{selectedAssignment.description}</p>
              <hr className="mb-4 border-gray-600" />

              <div className="flex flex-row w-full">
                <div className="flex-1">
                  <div>
                    <h1 className="font-bold underline text-lg">Rubric:</h1>
                    <br />
                  </div>

                  {selectedAssignment && selectedAssignment.rubric && selectedAssignment.rubric.length > 0 ? (
                    <div className="rubric-view-section hover:bg-zinc-700 cursor-pointer rounded-md p-2">
                      <ScrollArea className="scrollable-rubric-view">
                        {selectedAssignment.rubric.map((rubric, index) => (
                          <div key={index} onClick={() => handleNavtoRubric(index)}>
                            <RubricTable rubric={rubric} />
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <Button onClick={() => handleOpenRubricModal()} className="bg-blue-500 mr-2">
                        <FontAwesomeIcon icon={faUpload} className="mr-2" />
                        Upload Rubric
                      </Button>
                      <Button onClick={() => handleNavtoRubric(0)} className="bg-green-500">
                        <FontAwesomeIcon icon={faEdit} className="mr-2" />
                        Create Rubric
                      </Button>
                    </div>
                  )}

                </div>

                {user && (user.authority === "student" || user.authority === "teacher") && (
                  <div className="flex-1">
                    {user.authority === "student" && (
                      <div className="m-10 grid w-full items-center gap-1.5">
                        {selectedAssignment.submissions.map((submission) => (
                          <Card key={submission._id} className="max-w-sm mb-2 bg-gray-800 text-gray-100">
                            <CardHeader>
                              <CardTitle><strong>Name:</strong> {submission.studentName}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p><strong>Email:</strong> {submission.studentEmail}</p>
                              <p><strong>Date Submitted:</strong> {new Date(submission.dateSubmitted).toLocaleDateString()}</p>
                              <p><strong>Status:</strong> {submission.status} {submission.status === 'regrade' && <FontAwesomeIcon icon={faFlag} className="ml-2 text-red-500" />}</p>
                              <p><strong>Grade:</strong> {submission.feedback ? `${calculateTotalScore(submission)}/${submission.feedback.reduce((total, criteria) => total + criteria.total, 0)}` : 'Not Graded'}</p>
                            </CardContent>
                            <CardFooter>
                              <a href={submission.pdfURL} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">View Submission</a>
                            </CardFooter>
                          </Card>
                        ))}
                        <div className="max-w-sm">
                          <Label htmlFor="pdf">Upload your PDF</Label>
                          <Input id="pdf" type="file" accept=".pdf" onChange={handleFileChange} className="bg-gray-700 text-gray-100" />
                          <Button className="mt-8 bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSubmit(selectedAssignment._id)}>Submit</Button>
                          <br />
                          <br />
                          <Button className="bg-teal-500 hover:bg-teal-600" onClick={() => handleGrade(selectedAssignment._id)} disabled={!file}>
                            See Potential Grade
                          </Button>
                          <div className="feedback-container">
                            <h2>Feedback</h2>
                            <div className="feedback-box bg-gray-800 text-gray-200 p-4 rounded-lg">
                              {feedback ? <ReactMarkdown>{feedback}</ReactMarkdown> : <p>No feedback available yet.</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {user.authority === "teacher" && (
                      <div className="ml-5 flex flex-col items-start">
                        {selectedAssignment.submissions.length ? (
                          <div className="flex w-full gap-4">
                            <Button className="bg-blue-700 flex-auto grade-all-btn" onClick={() => handleOpenTeacherUploadModal()}>
                              <FontAwesomeIcon icon={faFileUpload} className="mr-2" />
                              Upload Assignments
                            </Button>
                            <Button className="mb-4 flex-auto items-center justify-between view-submissions-btn bg-green-500 text-white" onClick={() => handleNavtoSubs()}>
                              All Submissions <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex w-full gap-4">
                            <Button className="bg-teal-500 flex-auto grade-all-btn" onClick={() => handleOpenTeacherUploadModal()}>
                              <FontAwesomeIcon icon={faFileUpload} className="mr-2" />
                              Upload Assignments
                            </Button>
                          </div>
                        )}
                        <div className="w-full rounded-md">
                          {selectedAssignment.submissions.length ? (
                            <div className="border rounded-md bg-gray-800 text-gray-100">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="font-extrabold text-gray-300">Name</TableHead>
                                    <TableHead className="font-extrabold text-gray-300">Status</TableHead>
                                    <TableHead className="font-extrabold text-gray-300">Score</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {selectedAssignment.submissions.map((submission) => (
                                    <TableRow key={submission._id} onClick={() => handleNavtoSub(selectedAssignment._id, submission._id)} className="cursor-pointer hover:bg-gray-700">
                                      <TableCell className="font-bold">
                                        {submission.studentName.slice(0, 15)}{submission.studentName.length > 15 ? '...' : ''}
                                      </TableCell>
                                      <TableCell className="font-bold">
                                        {submission.status === 'grading' && (
                                          <FontAwesomeIcon icon={faSpinner} spin className="mr-2 text-orange-500" />
                                        )}
                                        {submission.status === 'graded' && (
                                          <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" />
                                        )}
                                        {submission.status === 'regrade' && (
                                          <FontAwesomeIcon icon={faFlag} className="mr-2 text-red-500" />
                                        )}
                                        {submission.status === 'error' && (
                                          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-red-500" />
                                        )}
                                        {submission.status}
                                      </TableCell>
                                      <TableCell className="font-bold">
                                        {submission.feedback ? `${calculateTotalScore(submission)}/${submission.feedback.reduce((total, criteria) => total + criteria.total, 0)}` : 'Not Graded'}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center border-0 mt-4">
                              <p className="border-0">No Assignments Yet!</p>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end items-center space-x-4 mt-4">
                          {isRubricModalOpen && (
                            <Dialog open={isRubricModalOpen} onOpenChange={setIsRubricModalOpen}>
                              <DialogContent className="bg-gray-800 text-gray-100 p-4 rounded-lg shadow-lg max-w-md mx-auto">
                                <DialogHeader>
                                  <DialogTitle>Upload Rubric</DialogTitle>
                                </DialogHeader>
                                <DialogDescription>
                                  <div {...getRootProps({ className: 'dropzone bg-gray-700 p-6 rounded-lg border-2 border-dashed border-gray-500 text-center' })}>
                                    <input {...getInputProps()} />
                                    <p className="text-gray-300">
                                      Drag & drop your rubric file here, or click to select a file (PDF only)
                                    </p>
                                  </div>
                                  {fileName && (
                                    <p className="text-gray-400 mt-4">Selected File: {fileName}</p>
                                  )}
                                </DialogDescription>
                                <DialogFooter>
                                  <Button
                                    onClick={handleRubricUpload}
                                    disabled={!rubricFile || loading}
                                    className={`${loading ? 'bg-gray-500' : 'bg-blue-500'}`}
                                  >
                                    {loading ? (
                                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                    ) : (
                                      <FontAwesomeIcon icon={faUpload} className="mr-2" />
                                    )}
                                    {loading ? 'Processing...' : 'Upload Rubric'}
                                  </Button>
                                  <Button
                                    onClick={handleCloseRubricModal}
                                    className="bg-red-500 ml-2"
                                  >
                                    Cancel
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                          {isTeacherUploadModalOpen && (
                            <Dialog open={isTeacherUploadModalOpen} onOpenChange={setIsTeacherUploadModalOpen}>
                              <DialogContent className="bg-gray-800 text-gray-100 p-4 rounded-lg shadow-lg max-w-md mx-auto">
                                <DialogHeader>
                                  <DialogTitle>Upload PDFs</DialogTitle>
                                </DialogHeader>
                                <DialogDescription>
                                  <div {...getRootProps({ className: 'dropzone' })}>
                                    <input {...getInputProps()} />
                                    <p>Click here to upload your students' essay PDFs</p>
                                  </div>
                                  <ul className="file-list">
                                    {teacherFiles && teacherFiles.map((file, index) => (
                                      <li key={index} className="text-gray-200 flex items-center justify-between">
                                        {file.name}
                                        <button
                                          className="delete-btn bg-transparent text-red-500 hover:text-red-700 font-bold ml-2 p-1 rounded-full focus:outline-none"
                                          onClick={() => removeFile(index)}
                                          style={{ backgroundColor: 'transparent', border: 'none' }}>
                                          &times;
                                        </button>
                                      </li>
                                    ))}
                                  </ul>


                                </DialogDescription>
                                <DialogFooter>
                                  <Button
                                    onClick={() => {
                                      handleTeacherFilesUpload(selectedAssignment._id);
                                      handleCloseTeacherUploadModal();
                                    }}
                                    disabled={!teacherFiles || teacherFiles.length === 0}
                                  >
                                    Submit Files
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-400">Select an assignment to view details</p>
            </div>
          )}
        </main>
        <Toaster />
      </div>
    </div>
  );
}

export default Classroom;