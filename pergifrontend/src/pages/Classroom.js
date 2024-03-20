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
import { faTrash } from '@fortawesome/free-solid-svg-icons';



import './Classroom.css';

import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
//import { Form } from '@/components/ui';


import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"



const rubricValueSchema = z.object({
  point: z.number(),
  description: z.string(),
});

const rubricSchema = z.object({
  rubrics: z.array(z.object({
    name: z.string(),
    values: z.array(rubricValueSchema)
  }))
});


const RubricField = ({ control, register, rubricIndex, rubricField, removeRubric }) => {

  const { fields, append, remove } = useFieldArray({
    control,
    name: `rubrics.${rubricIndex}.values`,
  });
  const adjustTextareaHeight = (element) => {
    if (element) {
      element.style.height = "auto"; // Reset height to ensure accurate scrollHeight measurement
      element.style.height = `${element.scrollHeight}px`; // Adjust height based on content
    }
  };

  // Adjust all textareas on initial render and when fields change
  useEffect(() => {
    fields.forEach((field, index) => {
      // Adjust both point and description textareas
      adjustTextareaHeight(document.getElementById(`point-${rubricIndex}-${index}`));
      adjustTextareaHeight(document.getElementById(`description-${rubricIndex}-${index}`));
    });
  }, [fields]);



  return (
    <div key={rubricField.id} className="rubric-card">
      <div className="rubric-header flex items-center">
        <Button type="button" onClick={() => append({ point: 0, description: '' })} className="plus-button">
          <FontAwesomeIcon icon={faPlusCircle} />
        </Button>
        {/* Replace textarea with input for topic */}
        <input
          {...register(`rubrics.${rubricIndex}.name`)}
          placeholder="Topic"
          className="topic-input"
        />
        <Button type="button" onClick={() => removeRubric(rubricIndex)} className="minus-button">
          <FontAwesomeIcon icon={faMinusCircle} />
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center justify-between my-field rubric-item">
          <Button type="button" onClick={() => remove(index)} className="my-minus-button rubric-button">
            <FontAwesomeIcon icon={faMinusCircle} />
          </Button>
          <div className="input-wrapper">
            <input
              {...register(`rubrics.${rubricIndex}.values.${index}.point`)}
              type="number"
              placeholder="0"
              className="point-input rubric-input flex-grow"
            />
          </div>
          <textarea
            {...register(`rubrics.${rubricIndex}.values.${index}.description`)}
            placeholder="Description"
            className="description-input rubric-input flex-grow"
            style={{ resize: 'none', height: 'auto' }}
          // Remove the style for resizing and height adjustment
          />
        </div>
      ))}
    </div>
  );


};


const RubricTable = ({ rubric }) => {
  // Removed TypeScript type annotation
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
  const [rubricButtonText, setRubricButtonText] = useState("Add Rubric");
  const [feedback, setFeedback] = useState('');
  const [teacherFiles, setTeacherFiles] = useState(null); // State to hold the selected files for the teacher
  const [isTeacherUploadModalOpen, setIsTeacherUploadModalOpen] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: '.pdf',
    onDrop: (acceptedFiles) => {
      setTeacherFiles(acceptedFiles);
    },
  });

  // Function to open the modal
  const handleOpenTeacherUploadModal = () => {
    setIsTeacherUploadModalOpen(true);
  };

  // Function to close the modal
  const handleCloseTeacherUploadModal = () => {
    setIsTeacherUploadModalOpen(false);
    setTeacherFiles(null); // Clear the selected files when closing the modal
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




  const { control, register, getValues, reset } = useForm({
    resolver: zodResolver(rubricSchema),
    defaultValues: {
      rubrics: [{ name: '', values: [{ point: 0, description: '' }] }]
    }
  });


  const { fields: rubricFields, append: appendRubric, remove: removeRubric } = useFieldArray({
    control,
    name: "rubrics",
  });

  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [submittedData, setSubmittedData] = useState(null); // State to store submitted data

  const handleRubricSubmission = () => {
    const formData = getValues(); // This will get all form values
    setSubmittedData(formData);
    console.log(formData);
    console.log(submittedData);
    setIsModalOpen(false); // Close the modal
    // Call the function to update the rubric in the backend
    handleRubricFormSubmit(formData);
  };

  const handleTeacherFilesChange = (event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setTeacherFiles(prevFiles => [...prevFiles, ...selectedFiles]);
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





  // Function to open the modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


  const handleRubricFormSubmit = async (formData) => {
    console.log('backend', selectedAssignment, formData);
    if (selectedAssignment && formData) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/${selectedAssignment._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rubric: formData.rubrics }),
          credentials: 'include',
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const updatedAssignment = await response.json();
        console.log(updatedAssignment); // Logging the updated assignment
        setSelectedAssignment({ ...selectedAssignment, rubric: formData.rubrics }); // Update the state with the new rubric
        toast({
          title: "Rubric Updated",
          description: "The rubric has been successfully updated.",
        });
      } catch (error) {
        console.error("There was a problem with the update:", error);
      }
    }
    else {
      console.log('invalid');
    }
  };

  const onSubmit = data => {
    const formData = getValues(); // This assumes you have a function to get form data
    setSubmittedData(formData);
    console.log(formData);
    setIsModalOpen(false); // Close the modal
  };

  const handleSelectAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    if (assignment && assignment.rubric) {
      setRubricButtonText("Edit Rubric");
      reset({ rubrics: assignment.rubric }); // Load existing rubric data into the form
    } else {
      setRubricButtonText("Add Rubric");
      reset({ rubrics: [{ name: '', values: [{ point: 0, description: '' }] }] });
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user]); // Only re-run when the user changes

  useEffect(() => {
    // If there's a selected assignment, check for rubric
    if (selectedAssignment) {
      if (selectedAssignment.rubric) {
        setRubricButtonText("Edit Rubric");
        reset({ rubrics: selectedAssignment.rubric });
      } else {
        setRubricButtonText("Add Rubric");
        reset({ rubrics: [{ name: '', values: [{ point: 0, description: '' }] }] });
      }
    }
  }, [selectedAssignment, reset]);


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
    if (selectedFile) {
      // Check if the selected file is a PDF
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile); // Update the state with the selected file
      } else {
        // Show toast notification
        doToast();
        // Clear the input field
        event.target.value = null;
      }
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
      console.error("There was a problem with the file upload:", error);
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
          // Include any other headers your backend requires
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
      console.log("No file selected");
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
      console.log(data); // Logging the response
      toast({
        title: "Congratulations!",
        description: "You submitted your PDF successfully.",
      });

    } catch (error) {
      console.error("There was a problem with the file upload:", error);
    }
  };

  const handleGoback = () => {
    navigate("/");
  };

  const handleNavtoSubs = () => {
    navigate(`/assignment/${selectedAssignment._id}`);
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

  // Define the function outside of your return statement but inside your component
const copyPublicLink = () => {
  const url = `https://tallyrus.com/publicassignment/${selectedAssignment._id}`;
  navigator.clipboard.writeText(url)
    .then(() => {
      console.log('Link copied to clipboard!');
    })
    .catch(err => {
      console.error('Failed to copy the link: ', err);
    });
};


// In your JSX
{user && user.authority === "teacher" && (
  <Button 
    className="p-2 bg-slate-700" 
    onClick={copyPublicLink} // Use the function reference here
  >
    Public Link
  </Button>
)}


  return (
    <div className="flex flex-col h-screen bg-gray-300">
      <Navbar />

      <div className="flex flex-grow overflow-hidden">
        <aside className=" rounded-3xl m-3 mr-0 w-1/5 bg-green-700 p-4 overflow-auto text-white">
          <Button className="mb-4" onClick={handleGoback}>back</Button>
          <h2 className="font-extrabold text-xl mb-4 underline">All Assignments</h2>




          <ul>
            {allAssignments.map((eachassignment) => (
              <li key={eachassignment._id} className="mb-2 text-sm font-semibold">
                <button
                  className={`p-2 rounded-lg ${selectedAssignment?._id === eachassignment._id ? ' bg-white text-green-600' : ''}`}
                  onClick={() => handleSelectAssignment(eachassignment)}
                >
                  {eachassignment.name}
                </button>
              </li>
            ))}
          </ul>
          {user && user.authority === "teacher" && (
            <Button className="p-2 bg-slate-600" onClick={handleCreateA}>
              + New
            </Button>
          )}
        </aside>

        <main className="w-4/5 p-10 overflow-auto bg-white rounded-3xl m-3">
          {selectedAssignment ? (


            <div>
              <div className="flex justify-between">
                <h1 className="text-2xl font-extrabold underline">{selectedAssignment.name}</h1>


                <div>
                  {user && user.authority === "teacher" && (
                    <Button onClick={() => copyPublicLink()} className="p-2 bg-slate-700">
                          Public Link

                    </Button>
                  )}
                  {user && user.authority === "teacher" && (
                    <Button onClick={() => setIsModalOpen(true)} className="my-plus-button-big">
                      {rubricButtonText}
                    </Button>
                  )}
                  <Button onClick={handleNavtoSubs} className="p-2 bg-slate-700">All Submissions</Button>
                </div>

              </div>
              <p className="my-4 font-semibold text-sm">{selectedAssignment.description}</p>


              <div className="flex flex-row w-full">



                <div className="flex-1">

                  <div>
                    <h1 className="font-bold underline text-lg">Rubric:</h1>
                    <br></br>
                  </div>

                  {/* Modal for the form */}
                  {isModalOpen && (
                    <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <AlertDialogContent className="max-h-[80vh] max-w-[60vw] overflow-hidden overflow-hidden bg-white p-4 rounded-lg shadow-lg">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Enter Rubric:</AlertDialogTitle>
                          <ScrollArea className="max-h-[60vh] overflow-auto my-4">
                            <form className="space-y-8 max-w-[56vw]">
                              {rubricFields.map((rubricField, rubricIndex) => (
                                <RubricField
                                  key={rubricField.id}
                                  control={control}
                                  register={register}
                                  rubricIndex={rubricIndex}
                                  rubricField={rubricField}
                                  removeRubric={removeRubric}
                                />
                              ))}
                              <div className="flex justify-end items-center space-x-4">
                                <Button type="button" onClick={() => appendRubric({ name: '', values: [{ point: 0, description: '' }] })} className="my-plus-button-big">
                                  Add New Topic
                                </Button>
                                <Button type="button" onClick={handleRubricSubmission} className="my-save-button-big">
                                  Save Rubric
                                </Button>
                                <Button onClick={handleCloseModal} style={{ margin: "2em" }} variant="destructive">Cancel</Button>

                              </div>
                            </form>
                          </ScrollArea>
                        </AlertDialogHeader>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

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
                              <CardTitle> <strong> Name: </strong> {submission.studentName}</CardTitle>
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
                          <Button className="mt-8 " onClick={() => handleSubmit(selectedAssignment._id)}>Submit</Button>
                          <br></br>
                          <br></br>
                          <Button
                            className="submit-button"
                            onClick={() => handleGrade(selectedAssignment._id)}
                            disabled={!file} // Disable the button if no file is selected
                          >
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


                      <>
                        <ScrollArea className="ml-20 h-[400px] w-full overflow-auto">
                          <div className="p-4">
                            <div className="flex h-5 items-center space-x-8 text-sm">
                              <p className="text-lg font-bold">Name</p>
                              <Separator orientation="vertical" />

                              <p className="text-lg font-bold">Status</p>
                              <Separator orientation="vertical" />

                              <p className="text-lg font-bold"> Link</p>
                            </div>
                          </div>
                          <div className="p-4">
                            {selectedAssignment.submissions.map((submission, index) => (
                              <React.Fragment key={submission._id}>
                                <div className="mb-2">
                                  <div className="flex h-5 items-center space-x-8 text-sm">
                                    <p>{submission.studentName.slice(0, 15)}{submission.studentName.length > 15 ? '...' : ''}</p>
                                    <Separator orientation="vertical" />

                                    <p>{submission.status}</p>
                                    <Separator orientation="vertical" />

                                    <a href={submission.pdfURL} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">Submission</a>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="delete-button ml-4">
                                          <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete this submission?
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteSubmission(submission.pdfKey)}>
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </React.Fragment>
                            ))}

                          </div>
                        </ScrollArea>
                        <div className="flex justify-end items-center space-x-4 mt-4">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive">Delete Assignment</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the assignment as well as all submissions.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteAssignment(selectedAssignment._id)}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button onClick={() => handleGradeAll(selectedAssignment._id)}>Grade all</Button>
                          {isTeacherUploadModalOpen && (
                            <AlertDialog open={isTeacherUploadModalOpen} onOpenChange={setIsTeacherUploadModalOpen}>
                              <AlertDialogContent className="bg-white p-4 rounded-lg shadow-lg max-w-md mx-auto">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Upload Files</AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogDescription>
                                  <div {...getRootProps({ className: 'dropzone' })}>
                                    <input {...getInputProps()} />
                                    <p>Drag and drop some files here, or click to select files</p>
                                  </div>
                                  <ul className="file-list">
                                    {teacherFiles && teacherFiles.map((file, index) => (
                                      <li key={index}>
                                        {file.name}
                                        <button className="delete-btn" onClick={() => removeFile(index)}>&times;</button>
                                      </li>
                                    ))}
                                  </ul>
                                </AlertDialogDescription>
                                <AlertDialogFooter>
                                  <Button onClick={handleCloseTeacherUploadModal}>Cancel</Button>
                                  <Button
                                    onClick={() => {
                                      handleTeacherFilesUpload(selectedAssignment._id);
                                      handleCloseTeacherUploadModal();
                                    }}
                                    disabled={!teacherFiles || teacherFiles.length === 0}
                                  >
                                    Submit Files
                                  </Button>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          <Button onClick={handleOpenTeacherUploadModal}>
                            Upload Files
                          </Button>
                        </div>
                      </>
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