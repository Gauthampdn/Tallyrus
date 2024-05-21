import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button'; // Ensure this path is correct
import Navbar from 'components/Navbar'; // Adjust the import path as necessary
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster"

import { Textarea } from "@/components/ui/textarea"

import PremadeRubrics from 'components/PremadeRubrics';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const criterionSchema = z.object({
  point: z.number(),
  description: z.string(),
});

const valuesSchema = z.object({
  name: z.string(),
  Criteria: z.array(criterionSchema),
});

const rubricSchema = z.object({
  Template: z.string(),
  values: z.array(valuesSchema),
});

const premadeRubrics = PremadeRubrics;


const Rubric = () => {
  const { toast } = useToast();

  const { id } = useParams(); // This is how you access the PublicAssignment ID from the URL
  const [classId, setclassId] = useState();

  const navigate = useNavigate();

  const { control, register, handleSubmit, setValue, getValues, reset, formState: { errors } } = useForm({
    resolver: zodResolver(rubricSchema),
    defaultValues: {
      Template: '',
      values: [] // This will be populated with fetched data
    },
  });

  // Setup useFieldArray for dynamic form fields
  const { fields, append, prepend, remove, update } = useFieldArray({
    control,
    name: 'values', // Matches the key in defaultValues
  });


  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/single/${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        setclassId(data.classId)

        // Convert fetched rubric to form defaultValues format
        const formValues = data.rubric.map(category => ({
          name: category.name,
          Criteria: category.values.map(value => ({
            point: value.point,
            description: value.description
          }))
        }));

        // Use reset to initialize form with fetched data
        reset({ values: formValues });
      } catch (error) {
        console.error("Failed to fetch assignment:", error);
      }
    };

    fetchAssignment();
  }, [id, reset]);




  const onSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    const formData = getValues();  // Get form values using getValues
    const rubrics = formData.values.map(category => ({
      name: category.name,
      values: category.Criteria.map(criterion => ({
        point: criterion.point,
        description: criterion.description
      }))
    }));

    console.log("Transformed data for backend:", rubrics);

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
          title: "Error Editting Rubric",
          description: "There was an error editting the rubric, remember no letters in the point values",
        });
        throw new Error('Network response was not ok');
      }

      console.log("Rubric updated successfully!");
      navigate(`/classroom/${classId}`); // Navigate after successful update
    } catch (error) {
      console.error("Failed to save rubric:", error);
    }
  };



  const loadTemplate = template => {
    reset(template);
  };

const handleAddCriteria = () => {
  append({ name: '', Criteria: [{ point: 0, description: '' }] });
};


  const handleRemoveCriteriaSection = (sectionIndex) => {
    remove(sectionIndex);
  };


  const addCriteriaToSection = (sectionIndex) => {
    const criteriaName = `values[${sectionIndex}].Criteria`;
    const currentValues = getValues(criteriaName);
    console.log(criteriaName)
    const updatedCriteria = [...currentValues, { point: 0, description: '' }];
    console.log(updatedCriteria)
    // Ensure re-render
    update(sectionIndex, { ...fields[sectionIndex], Criteria: updatedCriteria });
  };

  const deleteCriterion = (sectionIndex, criteriaIndex) => {
    const criteriaName = `values[${sectionIndex}].Criteria`;
    let currentCriteria = getValues(criteriaName);
    currentCriteria = currentCriteria.filter((_, index) => index !== criteriaIndex);
    setValue(criteriaName, currentCriteria);
    // Ensure re-render
    update(sectionIndex, { ...fields[sectionIndex], Criteria: currentCriteria });
  };

  const adjustTextareaHeight = (element) => {
    element.style.height = 'auto';
    element.style.height = (element.scrollHeight) + 'px';
  }
  return (
    <div className="flex flex-col h-screen bg-gray-300">
      <Navbar />
      <form className="bg-white rounded-3xl m-3 flex overflow-auto flex-grow" onSubmit={onSubmit}>

        <div className="flex-[1] p-4 ">
          <div className='rounded-3xl bg-green-700 text-white p-4'>
            <h1 className="p-2 text-2xl font-extrabold underline" >Select a Template</h1>
            {premadeRubrics.map((template, index) => (
              <div key={index} className="cursor-pointer p-2 hover:bg-gray-200" onClick={() => loadTemplate(template)}>
                <strong>{template.Template}</strong>
              </div>
            ))}
          </div>

        </div>

        <div className="flex-[3] p-4 overflow-auto ">
          <div>
            <Button type="submit" className="m-2">Save Rubric</Button>
            <Button type="button" className="m-2" onClick={() => handleAddCriteria()}>+</Button>
            <Table>
              <TableBody>
                {fields.map((category, sectionIndex) => (
                  <React.Fragment key={category.id}>
                    <TableRow >
                      <TableCell className="font-bold">
                        <input
                          {...register(`values[${sectionIndex}].name`)}
                          className="border p-1"
                          defaultValue={category.name}
                        />
                      </TableCell>
                      <div>
                        <span className="cursor-pointer hover:text-green-500 material-symbols-outlined" onClick={() => addCriteriaToSection(sectionIndex)}>
                          add
                        </span>
                        <span className="cursor-pointer hover:text-red-500 material-symbols-outlined" onClick={() => handleRemoveCriteriaSection(sectionIndex)}>
                          delete
                        </span>
                      </div>



                    </TableRow>

                    {category.Criteria.map((criteria, criteriaIndex) => (
                      <TableRow key={criteria.id}>
                        <TableCell className="w-1/12">
                          <Textarea
                            placeholder="Number of points"
                            {...register(`values[${sectionIndex}].Criteria[${criteriaIndex}].point`)}
                            className="border p-1 resize-none"
                            defaultValue={criteria.point}
                          />
                        </TableCell>
                        <TableCell className="w-11/12">
                          <Textarea
                            placeholder="Type your rubric description here"
                            {...register(`values[${sectionIndex}].Criteria[${criteriaIndex}].description`)}
                            className="border p-1 w-full resize-none overflow-hidden"
                            defaultValue={criteria.description}
                            onChange={(e) => adjustTextareaHeight(e.target)}
                          />
                        </TableCell>
                        <TableCell>
                          <span type="button" onClick={() => deleteCriterion(sectionIndex, criteriaIndex)}><span className="material-symbols-outlined">delete</span></span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

      </form>
      <Toaster />

    </div>
  );


};

export default Rubric;
