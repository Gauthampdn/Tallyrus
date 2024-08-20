import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Ensure this path is correct
import Navbar from 'components/Navbar'; // Adjust the import path as necessary
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { faArrowLeft, faSave, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDropzone } from 'react-dropzone';
import { Textarea } from "@/components/ui/textarea";
import PremadeRubrics from 'components/PremadeRubrics'; // Ensure the path is correct

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Rubric = () => {
  const { toast } = useToast();
  const { id } = useParams();
  const [classId, setClassId] = useState();
  const [rubric, setRubric] = useState([]);
  const [currentRubric, setCurrentRubric] = useState([]);
  const [rubricFile, setRubricFile] = useState(null);
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const navigate = useNavigate();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': []
    },
    onDrop: (acceptedFiles) => {
      if (isRubricModalOpen && acceptedFiles.length > 0) {
        setRubricFile(acceptedFiles[0]);
        setFileName(acceptedFiles[0].name);
      }
    },
  });

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/single/${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        setClassId(data.classId);

        const formValues = data.rubric.map(category => ({
          name: category.name,
          Criteria: category.values.map(value => ({
            point: value.point,
            description: value.description
          }))
        }));

        setRubric(formValues);
        setCurrentRubric(formValues); // Set the currentRubric state
      } catch (error) {
        console.error("Failed to fetch assignment:", error);
      }
    };

    fetchAssignment();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const rubrics = rubric.map(category => ({
      name: category.name,
      values: category.Criteria.map(criterion => ({
        point: criterion.point,
        description: criterion.description
      }))
    }));

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rubric: rubrics }),
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Error Editing Rubric",
          description: "There was an error editing the rubric, remember no letters in the point values",
        });
        throw new Error('Network response was not ok');
      }

      toast({
        variant: "success",
        title: "Rubric Updated",
        description: "Rubric has been updated successfully",
      });

      navigate(`/classroom/${classId}`);
    } catch (error) {
      console.error("Failed to save rubric:", error);
    }
  };

  const handleChange = (sectionIndex, criteriaIndex, field, value) => {
    const updatedRubric = [...rubric];
    if (field === 'name') {
      updatedRubric[sectionIndex].name = value;
    } else {
      updatedRubric[sectionIndex].Criteria[criteriaIndex][field] = value;
    }
    setRubric(updatedRubric);
  };

  const handleAddCriteria = () => {
    setRubric([...rubric, { name: '', Criteria: [{ point: 0, description: '' }] }]);
  };

  const handleRemoveCriteriaSection = (sectionIndex) => {
    const updatedRubric = rubric.filter((_, index) => index !== sectionIndex);
    setRubric(updatedRubric);
  };

  const addCriteriaToSection = (sectionIndex) => {
    const updatedRubric = [...rubric];
    updatedRubric[sectionIndex].Criteria.push({ point: 0, description: '' });
    setRubric(updatedRubric);
  };

  const deleteCriterion = (sectionIndex, criteriaIndex) => {
    const updatedRubric = [...rubric];
    updatedRubric[sectionIndex].Criteria.splice(criteriaIndex, 1);
    setRubric(updatedRubric);
  };

  const adjustTextareaHeight = (element) => {
    element.style.height = 'auto';
    element.style.height = (element.scrollHeight) + 'px';
  };

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
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/files/upload-rubric/${id}`, {
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

      // Assuming the uploaded rubric data is returned in the response
      const uploadedRubric = data.rubric.map(category => ({
        name: category.name,
        Criteria: category.values.map(value => ({
          point: value.point,
          description: value.description
        }))
      }));

      setRubric(uploadedRubric); // Update the rubric state
      setCurrentRubric(uploadedRubric); // Update the currentRubric state

      toast({
        title: "Rubric Uploaded!",
        description: "The rubric has been successfully uploaded and parsed.",
      });
      handleCloseRubricModal();
    } catch (error) {
      console.error("There was a problem with the rubric upload:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-grow overflow-hidden justify-center">
        <div className="flex flex-col w-1/5">
          <aside className="rounded-xl m-3 mr-0 p-6 overflow-auto text-white border border-white flex flex-col">
            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-2">
                <Button className=" w-1/4 bg-stone-600 text-white font-bold py-2 px-4 rounded" onClick={() => navigate(`/classroom/${classId}`)}>
                  <FontAwesomeIcon icon={faArrowLeft} className="ml-2 mr-2" />
                </Button>
                <Button onClick={handleOpenRubricModal} className="w-3/4 bg-blue-600 text-white font-bold py-2 px-4 rounded">
                  <FontAwesomeIcon icon={faUpload} className="ml-2 mr-2" /> Upload Rubric
                </Button>
              </div>
              <div className="flex flex-row gap-2 w-full">
                <Button type="submit" className="w-1/4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                  <FontAwesomeIcon icon={faSave} className="ml-2 mr-2" />
                </Button>
                <Button type="button" className=" w-3/4 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded" onClick={handleAddCriteria}>
                  Add Criteria+
                </Button>
              </div>
            </div>
            <hr className='mt-5 mb-5'/>
            <h1 className="font-extrabold text-xl mb-4 underline">Select a Rubric</h1>
            <div className="cursor-pointer p-2 hover:bg-gray-200 hover:text-indigo-700 rounded-xl border-2" onClick={() => setRubric(currentRubric)}>
              <strong>Current Rubric</strong>
            </div>
            {PremadeRubrics.map((template, index) => (
              <div key={index} className="cursor-pointer p-2 hover:bg-gray-200 hover:text-indigo-700 rounded-xl" onClick={() => setRubric(template.values)}>
                <strong>{template.Template}</strong>
              </div>
            ))}
          </aside>
        </div>
        <form className="flex-[3] pr-4 overflow-auto m-3" onSubmit={handleSubmit}>
          <div className='flex items-center'>
          </div>
          <div>
            {rubric.map((category, sectionIndex) => (
              <Card key={sectionIndex} className="mb-4">
                <CardHeader>
                  <CardTitle>
                    <Textarea
                      value={category.name}
                      onChange={(e) => handleChange(sectionIndex, null, 'name', e.target.value)}
                      className="border p-1 w-full"
                      placeholder="Category Name"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableBody>
                      {category.Criteria.map((criteria, criteriaIndex) => (
                        <TableRow key={criteriaIndex}>
                          <TableCell className="w-2/12">
                            <Textarea
                              value={criteria.point}
                              onChange={(e) => handleChange(sectionIndex, criteriaIndex, 'point', e.target.value)}
                              className="border p-1 resize-none"
                              placeholder="Number of points"
                            />
                          </TableCell>
                          <TableCell className="w-10/12">
                            <Textarea
                              value={criteria.description}
                              onChange={(e) => handleChange(sectionIndex, criteriaIndex, 'description', e.target.value)}
                              className="border p-1 w-full resize-none overflow-hidden min-h-[2em]"
                              placeholder="Type your rubric description here"
                              ref={(el) => {
                                if (el) adjustTextareaHeight(el);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <span type="button" onClick={() => deleteCriterion(sectionIndex, criteriaIndex)}><span className="material-symbols-outlined">delete</span></span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1 px-2 rounded" onClick={() => addCriteriaToSection(sectionIndex)}>
                    Add points +
                  </Button>
                  <Button type="button" className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded" onClick={() => handleRemoveCriteriaSection(sectionIndex)}>
                    Delete Category
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </form>
      </div>
      <Toaster />
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
                <Button onClick={handleRubricUpload} disabled={!rubricFile}>
                  <FontAwesomeIcon icon={faUpload} className="ml-2 mr-2" /> Upload Rubric
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Rubric;
