// pages/Classroom.js

import Navbar from "components/Navbar";
import { useAuthContext } from "../hooks/useAuthContext";
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import CreateA from "components/CreateA";
import { useAssignmentsContext } from "hooks/useAssignmentsContext";
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

  const { templates, dispatch } = useAssignmentsContext();
  const { user } = useAuthContext();

  const { id } = useParams(); // This is how you access the classroom ID from the URL

  const [allAssignments, setAllAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [file, setFile] = useState(null); // State to hold the selected file
  const [rubricButtonText, setRubricButtonText] = useState("Add Rubric");


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
        const response = await fetch(`http://localhost:4000/assignments/${selectedAssignment._id}`, {
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

    try {
      const response = await fetch(`http://localhost:4000/openai/gradeall/${assignmentId}`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data); // Logging the response
      toast({
        title: "Grading Now!",
        description: "Our systems are grading all assignments check back in a bit.",
      });

    } catch (error) {
      console.error("There was a problem with the file upload:", error);
    }

  }


  const handleSubmit = async (assignmentId) => {
    if (!file) {
      console.log("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`http://localhost:4000/files/upload/${assignmentId}`, {
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

  const deleteAssignment = async (assignmentId) => {
    try {
      const response = await fetch(`http://localhost:4000/assignments/${assignmentId}`, {
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

  useEffect(() => {
    fetchAssignments();

  }, [user]); // This effect should run when the component mounts and whenever the ID changes.



  return (
    <div className="flex flex-col h-screen bg-gray-300">
      <Navbar />

      <div className="flex flex-grow overflow-hidden">
        <aside className=" rounded-3xl m-3 mr-0 w-1/5 bg-green-700 p-4 overflow-auto text-white">
          <Button className="mb-4" onClick={handleGoback}>back</Button>
          <h2 className="font-bold text-2xl mb-4">ASSIGNMENTS</h2>




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
                <h1 className="text-2xl font-bold underline">{selectedAssignment.name}</h1>


                <div>
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
                      <ScrollArea className="scrollable-rubric-view" style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
                                    <p> {submission.studentName}</p>
                                    <Separator orientation="vertical" />

                                    <p> {submission.status}</p>
                                    <Separator orientation="vertical" />

                                    <a href={submission.pdfURL} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">Submission</a>
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