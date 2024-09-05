import React, { useState } from 'react';
import { useAuthContext } from "../hooks/useAuthContext";
import Navbar from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { Toaster } from '@/components/ui/toaster';
import { useToast } from "@/components/ui/use-toast";
import { useDropzone } from 'react-dropzone';

const UploadOldEssays = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState([]);

  const onDrop = (acceptedFiles) => {
    setSelectedFiles([...selectedFiles, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleRemoveFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "No files selected",
        description: "Please select at least one file to upload."
      });
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append("files", file);
    });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/files/teacher/upload-old-essays`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      const result = await response.json();
      toast({
        variant: "positive",
        title: "Files Uploaded",
        description: `${result.files.length} files were uploaded successfully.`
      });
      setSelectedFiles([]); // Reset the file input after successful upload
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "An error occurred while uploading the files. Please try again."
      });
      console.error('Error uploading files:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Navbar />
      <div className="flex flex-grow mt-8">
        {/* Left side with Dropzone */}
        <div className = "h-full w-1/2 flex">
        <div
          {...getRootProps()}
          className={`mt-4 bg-gray-800 p-12 rounded-lg shadow-lg w-full h-full flex flex-col items-center justify-center border-4 border-dashed ${
            isDragActive ? 'border-indigo-600' : 'border-gray-600'
          }`}
        >
          <input {...getInputProps()} />
          <h2 className="text-4xl font-bold mb-8 text-white text-center h-full">
            {isDragActive ? "Drop the files here..." : "Drag & drop old graded essays here or click to select files"}
          </h2>
        </div>
        </div>

        {/* Right side split */}
        <div className="flex flex-col w-1/2 p-4">
          {/* Top half: List of files */}
          <div className="flex-1 bg-gray-800 p-4 rounded-lg shadow-lg overflow-auto">
            <h3 className="text-2xl font-semibold mb-4">Selected Essays:</h3>
            {selectedFiles.length > 0 ? (
              <ul className="list-none">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="text-lg flex justify-between items-center bg-gray-700 p-2 rounded-lg mb-2">
                    <span className="truncate">{file.name}</span>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleRemoveFile(index)}
                      className="ml-4 text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <span className="m-1">X</span>
                      
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lg">No files selected.</p>
            )}
          </div>

          {/* Bottom half: Upload button */}
          <div className="flex justify-center items-center mt-4">
            <Button
              onClick={handleUpload}
              className="w-full py-4 text-xl bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Upload Files
            </Button>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default UploadOldEssays;
