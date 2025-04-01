import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTrash, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from '@/components/ui/use-toast';

const AssignmentSubmission = ({ assignmentId }) => {
  const [files, setFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState([]); // Track files being uploaded
  const [uploadedFiles, setUploadedFiles] = useState([]); // Track files that have been uploaded successfully
  const [gradedFiles, setGradedFiles] = useState([]); // Track files that have been graded
  const { toast } = useToast();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    onDrop: (acceptedFiles) => {
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
      handleUploadAll(acceptedFiles); // Automatically upload all files
    },
  });

  const dropzoneStyles = {
    maxWidth: '100%', // Limit width to the parent container's width
    maxHeight: '100%', // Limit height to the parent container's height
    overflow: 'none', // Add scrolling if the content exceeds the modal
  };

  useEffect(() => {
    if (uploadedFiles.length > 0) {
      // Remove each uploaded file after 5 seconds
      const timers = uploadedFiles.map((fileName) =>
        setTimeout(() => {
          handleRemoveFile(fileName);
        }, 5000)
      );
      
      // Cleanup the timers if the component unmounts
      return () => {
        timers.forEach(clearTimeout);
      };
    }
  }, [uploadedFiles]);

  const handleGradeAll = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/openai/gradeall/${assignmentId}`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Error in Grading",
          description: "Try grading later.",
        });
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      toast({
        title: "Grading Complete!",
        description: "All files have been successfully graded.",
      });

      setGradedFiles(files.map(file => file.name));
    } catch (error) {
      console.error("There was a problem with grading:", error);
    }
  };

  const handleUploadAll = async (filesToUpload) => {
    setUploadingFiles(filesToUpload.map(file => file.name)); // Mark files as uploading

    const uploadPromises = filesToUpload.map(async (file) => {
      const formData = new FormData();
      formData.append('files', file);

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
          title: "File Uploaded!",
          description: `${file.name} has been successfully uploaded.`,
        });

        setUploadedFiles((prevUploadedFiles) => [...prevUploadedFiles, file.name]); // Track the uploaded file

        return true; // Upload success
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        return false; // Upload failed
      }
    });

    const results = await Promise.all(uploadPromises);

    setUploadingFiles([]); // Reset uploading state

    if (results.every(result => result)) {
      await handleGradeAll();
    } else {
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "Some files failed to upload. Try again.",
      });
    }
  };

  const handleRemoveFile = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
    setGradedFiles((prevGradedFiles) => prevGradedFiles.filter((gradedFile) => gradedFile !== fileName));
    setUploadedFiles((prevUploadedFiles) => prevUploadedFiles.filter((uploadedFile) => uploadedFile !== fileName)); // Remove from uploaded files
  };

  return (
    <div className="p-4 flex justify-center max-w-full"> {/* Added flex and justify-center to center the card */}
      <Card 
  {...getRootProps({
    className:
      'dropzone bg-gray-50 p-1 border-dashed border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-all max-w-full', // Use 'w-full' for full width
    style: { maxWidth: '100%', maxHeight: '400px', overflowY: 'auto' }, // Prevent overflow beyond parent
  })}
>
  <input {...getInputProps()} />
  <CardHeader>
    <CardTitle>Upload Submission Files</CardTitle>
    <CardDescription>
      Drag and drop files directly onto this card or click to upload.
      Accepted formats: PDF, DOC, DOCX, XLSX
    </CardDescription>
  </CardHeader>

  {files.length > 0 ? (
    <CardContent>
      <ul className="list-disc list-inside space-y-3">
        {files.map((file) => (
          <li
            key={file.name}
            className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm border"
          >
            <span className="font-medium text-gray-700">{file.name}</span>
            <div className="flex items-center space-x-1">
              {uploadingFiles.includes(file.name) && (
                <span className="flex items-center text-blue-500">
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />
                  Uploading...
                </span>
              )}
              {uploadedFiles.includes(file.name) && (
                <span className="text-green-500">
                  <FontAwesomeIcon icon={faCheck} className="mr-1" />
                  Uploaded
                </span>
              )}
              {gradedFiles.includes(file.name) && (
                <span className="text-green-500">
                  <FontAwesomeIcon icon={faCheck} className="mr-1" />
                  Graded
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(file.name)}
              >
                <FontAwesomeIcon
                  icon={faTrash}
                  className="text-red-500"
                />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </CardContent>
  ) : (
    <div className="text-center text-gray-500 mt-4">
      <FontAwesomeIcon icon={faUpload} className="text-4xl" />
      <p>No files uploaded yet. Drop or click to upload.</p>
    </div>
  )}
</Card>

    </div>
  );
  
};

export default AssignmentSubmission;
