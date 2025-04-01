import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button'; // Adjust import path if needed
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faPlus, faTrash, faSave, faRedo, faSpinner, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Disclosure } from '@headlessui/react';

const RubricEditor = ({ rubric, onRubricChange, onReset, onSave }) => {
  const handleAddCriteria = () => {
    const updatedRubric = [...rubric, { name: '', Criteria: [{ point: 0, description: '' }] }];
    onRubricChange(updatedRubric);
  };

  const handleDeleteCategory = (sectionIndex) => {
    const updatedRubric = rubric.filter((_, index) => index !== sectionIndex);
    onRubricChange(updatedRubric);
    onSave();  // Save after deletion
  };

  const addCriteriaToSection = (sectionIndex) => {
    const updatedRubric = [...rubric];
    updatedRubric[sectionIndex].Criteria.push({ point: 0, description: '' });
    onRubricChange(updatedRubric);
  };

  const handleRubricChange = (sectionIndex, criteriaIndex, field, value) => {
    const updatedRubric = [...rubric];
    if (field === 'name') {
      updatedRubric[sectionIndex].name = value;
    } else {
      updatedRubric[sectionIndex].Criteria[criteriaIndex][field] = value;
    }
    onRubricChange(updatedRubric);
  };

  return (
    <div>
      {rubric.map((category, sectionIndex) => (
        <Disclosure key={sectionIndex}>
          {({ open }) => (
            <>
              <Disclosure.Button className="mb-2 w-full text-left bg-gray-800 p-2 rounded-lg hover:bg-gray-700 flex justify-between items-center">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={open ? faCaretUp : faCaretDown} className="mr-2" />
                  <span className="font-bold text-white-100">{category.name || "Category Name"}</span>
                </div>
                <Button
                  variant="danger"
                  className="ml-2"
                  onClick={() => handleDeleteCategory(sectionIndex)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </Disclosure.Button>

              <Disclosure.Panel className="bg-gray-800 text-gray-100 rounded-lg mb-4 p-4 max-h-64 overflow-y-auto">
  <Textarea
    value={category.name}
    onChange={(e) => handleRubricChange(sectionIndex, null, 'name', e.target.value)}
    className="w-full mb-4 bg-gray-700 text-white p-2 rounded-lg"
    placeholder="Category Name"
  />
  <Table>
    <TableBody>
      {category.Criteria.map((criteria, criteriaIndex) => (
        <TableRow key={criteriaIndex}>
          <TableCell className="w-1/4">
            <Textarea
              value={criteria.point}
              onChange={(e) => handleRubricChange(sectionIndex, criteriaIndex, 'point', e.target.value)}
              className="bg-gray-700 text-white p-2 rounded-lg"
              placeholder="Points"
            />
          </TableCell>
          <TableCell className="w-3/4">
            <Textarea
              value={criteria.description}
              onChange={(e) => handleRubricChange(sectionIndex, criteriaIndex, 'description', e.target.value)}
              className="bg-gray-700 text-white p-2 rounded-lg"
              placeholder="Description"
            />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
  <Button onClick={() => addCriteriaToSection(sectionIndex)} className="mt-2">
    <FontAwesomeIcon icon={faPlus} /> Add Criteria
  </Button>
</Disclosure.Panel>


            </>
          )}
        </Disclosure>
      ))}

      <div className="flex justify-between mt-4">
        <Button onClick={handleAddCriteria}>
          <FontAwesomeIcon icon={faPlus} /> Add Category
        </Button>
        <Button variant="danger" onClick={onReset}>
          <FontAwesomeIcon className="mr-2" icon={faRedo} /> Reset Rubric
        </Button>
      </div>
    </div>
  );
};

const RubricCard = ({ assignmentId }) => {
  const  id  = assignmentId; // Get the assignment ID from the URL
  const [rubric, setRubric] = useState([]);
  const [rubricFile, setRubricFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRubricUploaded, setIsRubricUploaded] = useState(false);

  console.log("inside rubric card", assignmentId)

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'application/pdf',
    multiple: false,
    disabled: isRubricUploaded, // Disable dropzone if rubric is uploaded
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setRubricFile(file);
        setFileName(file.name);
        handleUploadRubric(file); // Trigger the upload after file drop
      }
    },
  });

  // Fetch the rubric when the component mounts
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/single/${id}`, {
          credentials: 'include',
          mode: 'cors',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch assignment rubric');
        }

        const data = await response.json();

        const fetchedRubric = data.rubric.map((category) => ({
          name: category.name,
          Criteria: category.values.map((value) => ({
            point: value.point,
            description: value.description,
          })),
        }));

        if (fetchedRubric.length > 0){
        setRubric(fetchedRubric);
        setIsRubricUploaded(true);
        }
      } catch (error) {
        console.error("Error fetching rubric:", error);
      }
    };

    fetchAssignment();
  }, [id]);

  const handleUploadRubric = async (file) => {
    if (!file) {
      console.error("No rubric file selected");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/files/upload-rubric/${id}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error('Failed to upload rubric');
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
      setIsRubricUploaded(true);
      console.log("Rubric uploaded successfully");
    } catch (error) {
      console.error("Error uploading rubric:", error);
    } finally {
      setIsLoading(false);
    }
  };

  
  // Function to reset the rubric and return to the dropzone
  const handleResetRubric = () => {
    setRubric([]);
    setRubricFile(null);
    setFileName('');
    setIsRubricUploaded(false);
  };

  const handleSaveRubric = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rubric }),
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error("Failed to save rubric");
      }

      console.log("Rubric saved successfully");
    } catch (error) {
      console.error("Error saving rubric:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full">
      {!isRubricUploaded ? (
        <div
          {...getRootProps({
            className: 'dropzone flex items-center justify-center bg-gray-700 p-6 rounded-lg border-2 border-dashed border-gray-500 text-center w-full h-full',
            style: { minHeight: '300px' }, // Set minimum height
          })}
        >
          <input {...getInputProps()} />

          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <FontAwesomeIcon icon={faSpinner} spin className="text-white text-xl  mr-4" />
              <p>{`Uploading: ${fileName}...` }</p>
            </div>
          ) : (
            <p className="text-white">
              {fileName ? `Uploading: ${fileName}...` : 'Drag and drop or click to upload a rubric (PDF only)'}
            </p>
          )}
        </div>
      ) : (
        <RubricEditor rubric={rubric} onRubricChange={setRubric} onReset={handleResetRubric} onSave={handleSaveRubric} />
      )}

      <div className="flex justify-between mt-4">
        {isRubricUploaded && (
          <Button onClick={handleSaveRubric} className="mt-4 bg-green-500 hover:bg-green-600 text-white">
            {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />} Save Rubric
          </Button>
        )}
      </div>
    </div>
  );
};

export default RubricCard;
