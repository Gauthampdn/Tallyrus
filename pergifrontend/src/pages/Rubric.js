import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button'; // Ensure this path is correct
import Navbar from 'components/Navbar'; // Adjust the import path as necessary

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

const premadeRubrics = [
  {
    Template: 'Template 1',
    values: [
      {
        name: "Analysis",
        Criteria: [
          { point: 5, description: 'Criterion 1 for Template 1' },
          { point: 10, description: 'Criterion 2 for Template 1' },
        ],
      },
      {
        name: "Grammar",
        Criteria: [
          { point: 5, description: 'Criterion 1 for Template 1' },
          { point: 10, description: 'Criterion 2 for Template 1' },
        ],
      },
    ],
  },
  // Additional templates can be added here
];


const Rubric = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const { control, register, handleSubmit, setValue, getValues, reset, formState: { errors } } = useForm({
    resolver: zodResolver(rubricSchema),
    defaultValues: { Template: '', values: [] },
  });

  // Correctly setup useFieldArray for managing 'values'
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'values', // Name should match the key in your form's defaultValues
  });

  useEffect(() => {
    if (assignmentId) {
      // Fetch rubric data based on the assignmentId and then:
      // reset(fetchedData);
    } else {
      // For demonstration, load a template as default values dynamically
      // Choose one of the premadeRubrics to set as default for demonstration
      reset(premadeRubrics[0]); // This would dynamically load one of your premade rubrics as an example
    }
  }, [assignmentId, reset]);

  const onSubmit = data => {
    console.log(data);
    navigate('/classroom');
  };

  const loadTemplate = template => {
    reset(template);
  };

  const handleAddCriteria = () => {
    append({ name: '', Criteria: [{ point: 0, description: '' }] })
  };

  const addCriteriaToSection = (sectionIndex) => {
    const criteriaName = `values[${sectionIndex}].Criteria`;
    const currentValues = getValues(criteriaName);
    console.log(criteriaName)
    const updatedCriteria = [...currentValues, { point: 0, description: '' }];
    console.log(updatedCriteria)
    setValue(criteriaName, updatedCriteria);
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

  return (
    <div className="flex flex-col h-screen bg-gray-300">
      <Navbar />
      <div className="bg-white rounded-3xl m-3 flex overflow-auto flex-grow">
        <div className="flex-1 p-4 overflow-auto ">
          <Button type="button" onClick={() => handleAddCriteria()}>+</Button>
          <Button type="submit">Save Rubric</Button>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Table>
              <TableHead className="bg-slate-200">
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Point</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((item, sectionIndex) => (
                  <React.Fragment key={item.id}>
                    <TableRow className="bg-slate-100">
                      <TableCell colSpan={3}>{item.name}</TableCell>
                      <TableCell>
                        <Button type="button" onClick={() => addCriteriaToSection(sectionIndex)}>++</Button>
                      </TableCell>
                    </TableRow>
                    {item.Criteria.map((criteria, criteriaIndex) => (
                      <React.Fragment key={criteriaIndex}>
                        <TableRow className="bg-gray-100">
                          <TableCell></TableCell>
                          <TableCell>
                            <input
                              {...register(`values[${sectionIndex}].Criteria[${criteriaIndex}].point`)}
                              type="number"
                              className="border p-1"
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              {...register(`values[${sectionIndex}].Criteria[${criteriaIndex}].description`)}
                              className="border p-1"
                            />
                          </TableCell>
                          <TableCell>
                            <Button type="button" onClick={() => deleteCriterion(sectionIndex, criteriaIndex)}>Delete</Button>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}

                  </React.Fragment>
                ))}
              </TableBody>
            </Table>

          </form>
        </div>
        <div className="flex-1 p-4">
          <h2>Select a Template</h2>
          {premadeRubrics.map((template, index) => (
            <div key={index} className="cursor-pointer p-2 hover:bg-gray-200" onClick={() => loadTemplate(template)}>
              <strong>{template.Template}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );


};

export default Rubric;
