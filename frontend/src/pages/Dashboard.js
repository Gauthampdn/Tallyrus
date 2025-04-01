// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const Dashboard = () => {
  const { user } = useAuthContext();
  const [usersData, setUsersData] = useState([]);

  // Get allowed emails from environment variables and split them into an array
  const allowedEmails = process.env.REACT_APP_ALLOWED_EMAILS?.split(',').map(email => email.trim().toLowerCase());

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/auth/getallusers`, {
            method: 'GET',
            credentials: 'include',
            mode: 'cors',
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json();
          setUsersData(data); // Set the data to state
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }
  }, [user]);

  if (!user) {
    return <div className='text-white'>You do not have access to this</div>;
  }

  if (!allowedEmails.includes(user.email.toLowerCase().trim())) {
    return <Navigate to="/app" />;
  }

  // Calculate stats for the cards
  const totalGraded = usersData.reduce((acc, user) => acc + (user.numGraded || 0), 0);
  const totalUsers = usersData.length;
  const usersWithGrades = usersData.filter(user => user.numGraded > 0).length;

  return (
    <div className='text-white p-6 min-h-screen'>
      <h1 className='mx-2 mb-4 text-3xl font-extrabold'>
        This is the dashboard
      </h1>
      <h1 className='mx-2 mb-4 text-xl font-bold'>
        Use this to track all the usage
      </h1>
      <div className=' text-white flex justify-between mb-8'>

        <Card className='text-white bg-zinc-800 p-4 flex-1 mx-2'>
          <CardHeader>
            <CardTitle>Total Graded</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{totalGraded}</p>
          </CardContent>
        </Card>
        <Card className='text-white bg-zinc-800 p-4 flex-1 mx-2'>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{totalUsers}</p>
          </CardContent>
        </Card>
        <Card className='text-white bg-zinc-800 p-4 flex-1 mx-2'>
          <CardHeader>
            <CardTitle>Users with Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{usersWithGrades}</p>
          </CardContent>
        </Card>
      </div>
      <Card className='text-white bg-zinc-800 mx-2'>
        <CardHeader>
          <CardTitle>Users Data</CardTitle>
          <CardDescription>Details of users and their graded numbers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table className='min-w-full'>
            <TableHeader>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Number Graded</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.numGraded || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
