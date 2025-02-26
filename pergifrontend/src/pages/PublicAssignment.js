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
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import * as pdfjsLib from 'pdfjs-dist';

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

  const { id } = useParams(); // This is how you access the PublicAssignment ID from the URL

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [file, setFile] = useState(null); // State to hold the selected file
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/single/${id}`);
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


  async function loadPdfJsLib() {
    GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    return pdfjsLib;
  }

  async function getTextFromPdf(file) {
    try {
        console.log("Starting PDF text extraction...");
        const pdfData = await file.arrayBuffer();
        const pdfjsLib = await loadPdfJsLib();
        console.log("PDF.js library loaded, worker configured");
        
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;
        console.log(`PDF loaded successfully. Number of pages: ${pdf.numPages}`);
        
        let extractedText = '';
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            console.log(`Processing page ${pageNum}/${pdf.numPages}`);
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            extractedText += textContent.items.map(item => item.str).join(' ') + '\n';
        }

        console.log("Text extraction completed");
        return extractedText;
    } catch (error) {
        console.error("Error fetching or processing PDF:", error.message);
        return null;
    }
  }

  const handleGrade = async (assignmentId) => {
    if (!file) {
        console.log("No file selected");
        return;
    }
    console.log("Starting potential grade process...");
    console.log("File selected:", file.name);

    toast({
        title: "Getting Potential Grade",
        description: "Our systems are analyzing your submission...",
    });

    try {
        console.log("Beginning text extraction from PDF...");
        const text = await getTextFromPdf(file);
        console.log("Text extracted successfully, length:", text.length);
        console.log("First 100 characters of extracted text:", text.substring(0, 100));

        console.log("Sending request to backend for grading...");
        const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/openai/potential/${assignmentId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
            credentials: 'include',
        });

        if (!response.ok) {
            console.error("Backend response not OK:", response.status, response.statusText);
            toast({
                variant: "destructive",
                title: "Error In Getting Potential Grade",
                description: "Please try again later.",
            });
            throw new Error('Network response was not ok');
        }

        console.log("Response received from backend");
        const data = await response.json();
        console.log("Feedback received:", data.feedback);
        setFeedback(data.feedback);
    } catch (error) {
        console.error("Error in grading process:", error);
    }
  };


  const handleNavtoSubs = () => {
    navigate(`/assignment/${selectedAssignment._id}`);
  };


  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      <div className="flex flex-grow overflow-hidden">
        <main className="w-full p-6 overflow-auto bg-gray-900 rounded-3xl m-3">
          {selectedAssignment && (
            <>
              <h1 className="text-2xl font-extrabold underline mb-4">
                {selectedAssignment.name}
              </h1>
              <p className="mb-6 font-semibold text-sm text-gray-400">
                {selectedAssignment.description}
              </p>
            </>
          )}
          
          <div className="grid grid-cols-2 gap-6">
            {/* Left side - Rubric */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h1 className="font-bold underline text-lg mb-4">Rubric:</h1>
              {selectedAssignment && selectedAssignment.rubric && (
                <div className="rubric-view-section">
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    {selectedAssignment.rubric.map((rubric, index) => (
                      <RubricTable key={index} rubric={rubric} />
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>

            {/* Right side - Upload and Feedback */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="mb-6">
                <Label htmlFor="pdf" className="text-lg font-bold block mb-2">Upload your PDF</Label>
                <Input
                  id="pdf"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="bg-gray-700 text-white border-gray-600 mb-4"
                />
                <Button 
                  onClick={() => handleGrade(id)} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!file}
                >
                  See Potential Grade
                </Button>
              </div>

              <div className="feedback-container">
                <h2 className="text-lg font-bold mb-4">Feedback</h2>
                <ScrollArea className="h-[calc(100vh-500px)]">
                  <div className="feedback-box bg-gray-700 p-4 rounded-md">
                    {feedback ? (
                      <ReactMarkdown>{feedback}</ReactMarkdown>
                    ) : (
                      <p className="text-gray-400">No feedback available yet. Upload a PDF and click "See Potential Grade" to get feedback.</p>
                    )}
                  </div>
                </ScrollArea>
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