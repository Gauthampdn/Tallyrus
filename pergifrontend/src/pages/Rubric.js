import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Ensure this path is correct
import Navbar from 'components/Navbar'; // Adjust the import path as necessary
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { faArrowLeft, faSave, faUpload, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDropzone } from 'react-dropzone';
import { Textarea } from "@/components/ui/textarea";
import PremadeRubrics from 'components/PremadeRubrics'; // Ensure the path is correct
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';


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

import { Disclosure } from '@headlessui/react';

const Rubric = () => {
  const { toast } = useToast();
  const { id } = useParams();
  const [classId, setClassId] = useState();
  const [rubric, setRubric] = useState([]);
  const [currentRubric, setCurrentRubric] = useState([]);
  const [rubricFile, setRubricFile] = useState(null);
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { state } = useLocation(); // Get the state passed from the navigation

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

    setIsLoading(true);  // Set loading to true when the upload starts
    console.log(id);

    const formData = new FormData();
    formData.append('file', rubricFile);

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

      const uploadedRubric = data.rubric.map(category => ({
        name: category.name,
        Criteria: category.values.map(value => ({
          point: value.point,
          description: value.description
        }))
      }));

      setRubric(uploadedRubric);
      setCurrentRubric(uploadedRubric);

      toast({
        title: "Rubric Uploaded!",
        description: "The rubric has been successfully uploaded and parsed.",
      });

      handleCloseRubricModal();
    } catch (error) {
      console.error("There was a problem with the rubric upload:", error);
    } finally {
      setIsLoading(false);  // Set loading to false once the upload is complete
    }
  };

  const handleDeleteCategory = (sectionIndex) => {
    const updatedRubric = rubric.filter((_, index) => index !== sectionIndex);
    setRubric(updatedRubric);
  };

  useEffect(() => {
    // Automatically open the specific section based on the passed state
    if (state && state.sectionIndex !== undefined) {
      console.log('here');
      document.getElementById(`disclosure-${state.sectionIndex}`)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="flex flex-grow overflow-hidden justify-center">
        <div className="flex flex-col w-1/5">
          <aside className="rounded-xl m-3 mr-0 p-6 overflow-auto text-white border border-gray-600 flex flex-col bg-gray-800">
            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-2">
                <Button className="w-1/4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" onClick={() => navigate(`/classroom/${classId}`)}>
                  <FontAwesomeIcon icon={faArrowLeft} className="ml-2 mr-2" />
                </Button>
                <Button onClick={handleOpenRubricModal} className="w-3/4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  <FontAwesomeIcon icon={faUpload} className="ml-2 mr-2" /> Upload Rubric
                </Button>
              </div>
            </div>
            <hr className='mt-5 mb-5 border-gray-600' />
            <h1 className="font-extrabold text-xl mb-4 underline">Select a Rubric</h1>
            <div className="cursor-pointer p-2 hover:bg-gray-700 text-gray-300 rounded-xl border-2 border-gray-600" onClick={() => setRubric(currentRubric)}>
              <strong>Current Rubric</strong>
            </div>
            {PremadeRubrics.map((template, index) => (
              <div key={index} className="cursor-pointer p-2 hover:bg-gray-700 text-gray-300 rounded-xl" onClick={() => setRubric(template.values)}>
                <strong>{template.Template}</strong>
              </div>
            ))}
          </aside>
        </div>

        <form className="flex-[3] pr-4 overflow-auto m-3" onSubmit={handleSubmit}>
          <div className="flex flex-row gap-2 w-full mb-6">
            <Button type="submit" className="w-1/4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-lg shadow-md flex items-center justify-center">
              <FontAwesomeIcon icon={faSave} className="ml-2 mr-2" /> Save Rubric
            </Button>
            <Button type="button" className="w-3/4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-5 rounded-lg shadow-md flex items-center justify-center" onClick={handleAddCriteria}>
              <FontAwesomeIcon icon={faPlus} className="ml-2 mr-2" /> Add Criteria
            </Button>
          </div>
          <div>
            {rubric.map((category, sectionIndex) => (
              <Disclosure key={sectionIndex} defaultOpen={state?.sectionIndex === sectionIndex}>
                {({ open }) => (
                  <>
                    <Disclosure.Button id={`disclosure-${sectionIndex}`} className="mb-2 w-full text-left bg-gray-800 p-2 rounded-lg hover:bg-gray-700 flex justify-start items-center">
                      <FontAwesomeIcon icon={open ? faCaretUp : faCaretDown} className="mr-2" />
                      <span className="font-bold">{category.name || "Category Name"}</span>
                    </Disclosure.Button>


                    <Disclosure.Panel className="bg-gray-800 text-gray-100 rounded-lg mb-4 p-4">
                      <div className="flex justify-between items-center">
                        <Textarea
                          value={category.name}
                          onChange={(e) => handleChange(sectionIndex, null, 'name', e.target.value)}
                          className="border p-1 w-full bg-gray-700 text-gray-200 mb-4"
                          placeholder="Category Name"
                        />
                      </div>
                      <Table>
                        <TableBody>
                          {category.Criteria.map((criteria, criteriaIndex) => (
                            <TableRow key={criteriaIndex} className="hover:bg-gray-700">
                              <TableCell className="w-2/12">
                                <Textarea
                                  value={criteria.point}
                                  onChange={(e) => handleChange(sectionIndex, criteriaIndex, 'point', e.target.value)}
                                  className="border p-1 resize-none bg-gray-700 text-gray-200"
                                  placeholder="Number of points"
                                />
                              </TableCell>
                              <TableCell className="w-10/12">
                                <Textarea
                                  value={criteria.description}
                                  onChange={(e) => handleChange(sectionIndex, criteriaIndex, 'description', e.target.value)}
                                  className="border p-1 w-full resize-none overflow-hidden min-h-[2em] bg-gray-700 text-gray-200"
                                  placeholder="Type your rubric description here"
                                  ref={(el) => {
                                    if (el) adjustTextareaHeight(el);
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <span
                                  type="button"
                                  className=" cursor-pointer"
                                  onClick={() => deleteCriterion(sectionIndex, criteriaIndex)}>
                                  <span className="material-symbols-outlined text-gray-200 hover:text-red-500">delete</span>
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <div className='flex justify-between items-center gap-2'>
                          <Button
                            type="button"
                            onClick={() => addCriteriaToSection(sectionIndex)}>
                            <FontAwesomeIcon icon={faPlus} className="ml-2 mr-2" />Add
                          </Button>
                          <Button
                            type="button"
                            className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md flex items-center justify-center "
                            onClick={() => handleDeleteCategory(sectionIndex)}
                          >
                            <FontAwesomeIcon icon={faTrash} className="ml-2 mr-2" />Delete
                          </Button>
                        </div>
                      </Table>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </div>
        </form>
      </div>
      <Toaster />
      <div className="flex justify-end items-center space-x-4 mt-4">
        {isRubricModalOpen && (
          <Dialog open={isRubricModalOpen} onOpenChange={setIsRubricModalOpen}>
            <DialogContent className="bg-gray-800 text-gray-100 p-4 rounded-lg shadow-lg max-w-md mx-auto">
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
                {isLoading ? (
                  <div className="flex justify-center items-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"></path>
                    </svg>
                    <span className="ml-2">Processing...</span>
                  </div>
                ) : (
                  <Button onClick={handleRubricUpload} disabled={!rubricFile}>
                    <FontAwesomeIcon icon={faUpload} className="ml-2 mr-2" /> Upload Rubric
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Rubric;
