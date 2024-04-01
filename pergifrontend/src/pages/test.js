import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import Navbar from 'components/Navbar';
import { Table, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table'; // Correct the import paths as necessary

// Assuming these schemas are defined elsewhere and imported
const rubricValueSchema = z.object({
  point: z.number(),
  description: z.string(),
});

const rubricSchema = z.object({
  name: z.string(),
  values: z.array(rubricValueSchema),
});

const premadeRubrics = [
  // Premade templates
];

const Rubric = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  
  // Placeholder for fetching or defining the initial rubric
  const initialRubric = { name: '', values: [{ point: 0, description: '' }] };

  const { control, register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(rubricSchema),
    defaultValues: { rubrics: [initialRubric] },
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rubrics[0].values',
  });

  useEffect(() => {
    if (assignmentId) {
      // Placeholder for fetching rubric data
    }
  }, [assignmentId]);

  const onSubmit = data => {
    console.log(data);
    navigate('/classroom'); // Adjust as necessary
  };

  const loadTemplate = template => {
    reset({ rubrics: [{ ...template }] });
    // Update form values for react-hook-form based on the selected template
    template.values.forEach((value, index) => {
      setValue(`rubrics[0].values.${index}.point`, value.point);
      setValue(`rubrics[0].values.${index}.description`, value.description);
    });
  };

  return (
    <div className='h-screen bg-gray-300'>
      <Navbar />
      <div className="flex">
        <div className="flex-1 p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Point</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <input {...register(`rubrics[0].values.${index}.point`)} type="number" />
                    </TableCell>
                    <TableCell>
                      <input {...register(`rubrics[0].values.${index}.description`)} />
                    </TableCell>
                    <TableCell>
                      <Button type="button" onClick={() => remove(index)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button type="button" onClick={() => append({ point: 0, description: '' })}>Add Criterion</Button>
            <Button type="submit">Save Rubric</Button>
          </form>
        </div>
        <div className="flex-1 p-4">
          <h2>Select a Template</h2>
          {premadeRubrics.map((template, index) => (
            <div key={index} onClick={() => loadTemplate(template)} className="cursor-pointer p-2 hover:bg-gray-200">
              <strong>{template.name}</strong>
            </div>
          ))}
        </div>
      </div>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );
};

export default Rubric;
