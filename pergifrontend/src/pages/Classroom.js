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
import { faTrash, faArrowRight } from '@fortawesome/free-solid-svg-icons';

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
  const navigate = useNavigate();
  const { toast } = useToast();

  const { user } = useAuthContext();

  const { id } = useParams(); // This is how you access the classroom ID from the URL

  const [allAssignments, setAllAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [file, setFile] = useState(null); // State to hold the selected file
  const [feedback, setFeedback] = useState('');
  const [teacherFiles, setTeacherFiles] = useState(null); // State to hold the selected files for the teacher
  const [isTeacherUploadModalOpen, setIsTeacherUploadModalOpen] = useState(false);
  const [rubricFile, setRubricFile] = useState(null);
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
  const [fileName, setFileName] = useState('');

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
      console.log(data); // Logging the response
      toast({
        title: "Files Uploaded!",
        description: "The files have been successfully uploaded.",
      });
      window.location.reload();
    } catch (error) {
      console.error("There was a problem with the file upload:", error);
    }
  };

  const handleSelectAssignment = (assignment) => {
    setSelectedAssignment(assignment);
  };

  useEffect(() => {
    fetchAssignments();
  }, [user]); // Only re-run when the user changes

  const handleCreateA = () => {
    navigate(`/createassignment/${id}`);
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
    console.log("Submit button clicked");
    if (!file) {
      console.log("No file selected for upload");
      return;
    }

    console.log("Preparing to upload file:", file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log("Sending upload request to:", `${process.env.REACT_APP_API_BACKEND}/files/upload/${assignmentId}`);
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/files/upload/${assignmentId}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        mode: 'cors',
      });

      console.log("Response received:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log("Upload successful, response data:", data);
      toast({
        title: "Congratulations!",
        description: "You submitted your PDF successfully.",
      });
      // Clear the file input after successful upload
      setFile(null);
      setFileName('');

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

  const handleNavtoRubric = () => {
    navigate(`/rubric/${selectedAssignment._id}`);
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/${id}`,
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
    <div className="flex flex-col h-screen bg-gray-300">
      <Navbar />

      <div className="flex flex-grow overflow-hidden">
        <aside className="rounded-3xl m-3 mr-0 w-1/5 bg-indigo-700 p-4 overflow-auto text-white">
          <Button className="mb-4" onClick={handleGoback}>back</Button>
          <h2 className="font-extrabold text-xl mb-4 underline">All Assignments</h2>

          <ul>
            {allAssignments.map((eachassignment) => (
              <li key={eachassignment._id} className="mb-2 text-sm font-semibold">
                <button
                  className={`p-2 rounded-lg ${selectedAssignment?._id === eachassignment._id ? ' bg-white text-indigo-600' : ''}`}
                  onClick={() => handleSelectAssignment(eachassignment)}
                >
                  {eachassignment.name}
                </button>
              </li>
            ))}
          </ul>
          {user && user.authority === "teacher" && (
            <Button className="p-2 bg-stone-600" onClick={handleCreateA}>
              + New
            </Button>
          )}
        </aside>

        <main className="w-4/5 p-10 overflow-auto bg-white rounded-3xl m-3">
          {selectedAssignment ? (
            <div>
              <div className="flex justify-between">
                <h1 className="text-2xl font-extrabold underline">{selectedAssignment.name}</h1>


                {user.authority === "teacher" && (

                  <div className="flex gap-2">

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="" className="bg-indigo-600 material-symbols-outlined">apps</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Options</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem onSelect={() => copyPublicLink()}>Public Link</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleNavtoRubric()}>Edit Rubric</DropdownMenuItem>
                          <DropdownMenuItem onSelect={handleOpenRubricModal}>Upload Rubric</DropdownMenuItem>
                          <DropdownMenuItem onSelect={handleOpenTeacherUploadModal}>Upload Files</DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="material-symbols-outlined" variant="destructive">delete</Button>
                      </DialogTrigger>
                      <DialogContent>
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

              <div className="flex flex-row w-full">
                <div className="flex-1">
                  <div>
                    <h1 className="font-bold underline text-lg">Rubric:</h1>
                    <br />
                  </div>

                  {/* Display the submitted data on the main page */}
                  {selectedAssignment && selectedAssignment.rubric && (
                    <div className="rubric-view-section">
                      <ScrollArea className="scrollable-rubric-view" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {selectedAssignment.rubric.map((rubric, index) => (
                          <RubricTable key={index} rubric={rubric} />
                        ))}
                      </ScrollArea>
                    </div>
                  )}
                </div>

                {user && (user.authority === "student" || user.authority === "teacher") && (
                  <div className="flex-1">
                    {user.authority === "student" && (
                      <div className="m-10 grid w-full items-center gap-1.5">
                        {selectedAssignment.submissions.map((submission) => (
                          <Card key={submission._id} className="max-w-sm mb-2">
                            <CardHeader>
                              <CardTitle><strong>Name:</strong> {submission.studentName}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p><strong>Email:</strong> {submission.studentEmail}</p>
                              <p><strong>Date Submitted:</strong> {new Date(submission.dateSubmitted).toLocaleDateString()}</p>
                              <p><strong>Status:</strong> {submission.status}</p>
                            </CardContent>
                            <CardFooter>
                              <a href={submission.pdfURL} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">View Submission</a>
                            </CardFooter>
                          </Card>
                        ))}
                        <div className="max-w-sm">
                          <Label htmlFor="pdf">Upload your PDF</Label>
                          <Input id="pdf" type="file" accept=".pdf" onChange={handleFileChange} />
                          <Button className="mt-8" onClick={() => handleSubmit(selectedAssignment._id)}>Submit</Button>
                          <br />
                          <br />
                          <Button className="submit-button" onClick={() => handleGrade(selectedAssignment._id)} disabled={!file}>
                            See Potential Grade
                          </Button>
                          <div className="feedback-container">
                            <h2>Feedback</h2>
                            <div className="feedback-box">
                              {feedback ? <ReactMarkdown>{feedback}</ReactMarkdown> : <p>No feedback available yet.</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {user.authority === "teacher" && (
                      <div className="ml-5 flex flex-col items-start">
                        <div className="flex w-full gap-5">
                          <Button className="bg-green-600 flex-auto" onClick={() => handleGradeAll(selectedAssignment._id)}>Grade Assignments</Button>

                          <Button className=" mb-4 flex-auto items-center justify-between" style={{ backgroundColor: '#f3722c', color: 'white' }} onClick={() => handleNavtoSubs()}>
                            All Submissions <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                          </Button>
                        </div>
                        <div className="w-full rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="font-extrabold">Name</TableHead>
                                <TableHead className="font-extrabold">Status</TableHead>
                                <TableHead className="font-extrabold">Delete</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedAssignment && selectedAssignment.submissions.map((submission, index) => (
                                <TableRow key={submission._id}>
                                  <TableCell className="font-bold">
                                    {submission.studentName.slice(0, 15)}{submission.studentName.length > 15 ? '...' : ''}
                                  </TableCell>
                                  <TableCell className="font-bold">{submission.status}</TableCell>
                                  <TableCell>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button className="bg-transparent text-red-500 material-symbols-outlined">
                                          <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Confirm Deletion</DialogTitle>
                                          <DialogDescription>
                                            Are you sure you want to delete this submission?
                                          </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                          <Button onClick={() => handleDeleteSubmission(submission.pdfKey)}>Delete</Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        <div className="flex justify-end items-center space-x-4 mt-4">
                          {isRubricModalOpen && (
                            <Dialog open={isRubricModalOpen} onOpenChange={setIsRubricModalOpen}>
                              <DialogContent className="bg-white p-4 rounded-lg shadow-lg max-w-md mx-auto">
                                <DialogHeader>
                                  <DialogTitle>Upload Rubric</DialogTitle>
                                </DialogHeader>
                                <DialogDescription>
                                  <div {...getRootProps({ className: 'dropzone' })}>
                                    <input {...getInputProps()} />
                                    <p>Click here or drag and drop to upload the rubric PDF</p>
                                  </div>
                                  {fileName && (
                                    <p>Selected File: {fileName}</p>
                                  )}
                                </DialogDescription>
                                <DialogFooter>
                                  <Button onClick={handleRubricUpload} disabled={!rubricFile}>Upload Rubric</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                          {isTeacherUploadModalOpen && (
                            <Dialog open={isTeacherUploadModalOpen} onOpenChange={setIsTeacherUploadModalOpen}>
                              <DialogContent className="bg-white p-4 rounded-lg shadow-lg max-w-md mx-auto">
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
                                      <li key={index}>
                                        {file.name}
                                        <button className="delete-btn" onClick={() => removeFile(index)}>&times;</button>
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
              <p>Select an assignment to view details</p>
            </div>
          )}
        </main>
        <Toaster />
      </div>
    </div>
  );
}

export default Classroom;
