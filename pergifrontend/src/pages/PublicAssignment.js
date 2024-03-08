
import Navbar from "components/Navbar";
import { useAuthContext } from "../hooks/useAuthContext";
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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


const PublicAssignment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { user } = useAuthContext();

  const { id } = useParams(); // This is how you access the PublicAssignment ID from the URL

  const [allAssignments, setAllAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [file, setFile] = useState(null); // State to hold the selected file
  const [rubricButtonText, setRubricButtonText] = useState("Add Rubric");
  const [feedback, setFeedback] = useState('');
  const [teacherFiles, setTeacherFiles] = useState(null); // State to hold the selected files for the teacher
  const [isTeacherUploadModalOpen, setIsTeacherUploadModalOpen] = useState(false);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await fetch(`http://localhost:4000/assignments/single/${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setSelectedAssignment(data);
      } catch (error) {
        console.error("Failed to fetch assignment:", error);
      }
    };

    fetchAssignment();
  }, []); // This useEffect depends on `id`, it will rerun when `id` changes





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

    
    toast({
      title: "Grading Now!",
      description: "Our systems are grading all assignments - check back in a bit!",
    });


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

        toast({
          variant: "destructive",
          title: "Error In Grading All",
          description: "Try grading all later.",
        });

        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data.feedback); // Assuming the backend sends back a JSON with 'feedback'
      setFeedback(data.feedback);
    } catch (error) {
      console.error("There was a problem with extracting or sending the text:", error);
    }
  };


  const handleNavtoSubs = () => {
    navigate(`/assignment/${selectedAssignment._id}`);
  };


  return (
    <div className="flex flex-col h-screen bg-gray-300">
      <div className="flex flex-grow overflow-hidden">
        <main className="w-full p-10 overflow-auto bg-white rounded-3xl m-3">
          <div>
            {selectedAssignment && (
              <h1 className="text-2xl font-extrabold underline">
                {selectedAssignment.name}
              </h1>
            )}
            {selectedAssignment && (
              <p className="my-4 font-semibold text-sm">
                {selectedAssignment.description}
              </p>
            )}
            {/* Flex container for two columns */}
            <div className="flex flex-row w-full">
              {/* First Column for Rubric */}
              <div className="flex-1">
                <div>
                  <h1 className="font-bold underline text-lg">Rubric:</h1>
                  <br />
                </div>
                {selectedAssignment && selectedAssignment.rubric && (
                  <div className="rubric-view-section">
                    <ScrollArea
                      className="scrollable-rubric-view"
                      style={{ maxHeight: "500px", overflowY: "auto" }}
                    >
                      {selectedAssignment.rubric.map((rubric, index) => (
                        <RubricTable key={index} rubric={rubric} />
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </div>
              {/* Second Column for Upload and Feedback */}
              <div className="flex-1 p-10">
                <Label htmlFor="pdf">Upload your PDF</Label>
                <Input
                  id="pdf"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                <Button onClick={() => handleGrade(id)} className="mt-4">
                  See Potential Grade
                </Button>
                <div className="feedback-container mt-4">
                  <h2>Feedback</h2>
                  <div className="feedback-box">
                    {feedback ? (
                      <ReactMarkdown>{feedback}</ReactMarkdown>
                    ) : (
                      <p>No feedback available yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Toaster />
      </div>
    </div>

  );

}
export default PublicAssignment;