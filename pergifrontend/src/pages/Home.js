import React, { useState, useEffect } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Chatbot from '../components/Chatbot'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faPlus,
    faPen,
    faTrash,
    faArrowRight,
    faPaperPlane,
} from '@fortawesome/free-solid-svg-icons'

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

import { Input } from '@/components/ui/input'

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/components/ui/use-toast'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const joinFormSchema = z.object({
    joinCode: z.string().min(1, 'Please enter a join code'),
})

const createClassSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
})

const Home = ({
    startTour,
    stepIndex,
    setStepIndex,
    isCreateModalOpen,
    setIsCreateModalOpen,
}) => {
    const { toast } = useToast()
    const navigate = useNavigate()
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedClassroom, setSelectedClassroom] = useState(null)
    const joinForm = useForm({
        resolver: zodResolver(joinFormSchema),
    })
    const createForm = useForm({
        resolver: zodResolver(createClassSchema),
    })
    const [apiInput, setApiInput] = useState('')

    const onSubmit = async (data) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_BACKEND}/classroom/join`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    mode: 'cors',
                    body: JSON.stringify({ joinCode: data.joinCode }),
                }
            )

            if (!response.ok) {
                toast({
                    variant: 'destructive',
                    title: "Can't Join",
                    description:
                        'Please make sure that you put in the right code.',
                })
                throw new Error('Failed to join classroom')
            }

            const result = await response.json()
            console.log(result)
            window.location.reload()
        } catch (error) {
            console.error('Error joining classroom:', error)
        }
    }

    const { user } = useAuthContext()
    const [currClassrooms, setCurrClassrooms] = useState([])

    const handleGoToClass = (classroomId, assignmentId = null) => {
        const path = assignmentId
            ? `/classroom/${classroomId}/${assignmentId}`
            : `/classroom/${classroomId}`
        navigate(path)
    }
    const handleNavigateToCreate = () => {
        navigate('/create')
    }

    useEffect(() => {
        const fetchClassrooms = async () => {
            console.log('Fetching classrooms in useEffect...')
            const response = await fetch(
                `${process.env.REACT_APP_API_BACKEND}/classroom`,
                {
                    credentials: 'include',
                }
            )

            if (response.ok) {
                const json = await response.json()
                console.log('Fetched classrooms in useEffect:', json)
                setCurrClassrooms(json)
            } else {
                console.error(
                    'Failed to fetch classrooms in useEffect:',
                    await response.text()
                )
            }
        }

        if (user) {
            fetchClassrooms()
        }
    }, [user])

    // Add logging when currClassrooms changes
    useEffect(() => {
        console.log('currClassrooms updated:', currClassrooms)
    }, [currClassrooms])

    const handleEditClassroom = (classroom) => {
        setSelectedClassroom(classroom)
        setIsEditModalOpen(true)
    }

    const handleDeleteClassroom = async (classroomId) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_BACKEND}/classroom/${classroomId}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                    mode: 'cors',
                }
            )

            if (!response.ok) {
                throw new Error('Failed to delete classroom')
            }

            setCurrClassrooms(
                currClassrooms.filter(
                    (classroom) => classroom._id !== classroomId
                )
            )
            toast({
                variant: 'positive',
                title: 'Classroom Deleted',
                description: 'The classroom was successfully deleted.',
            })
        } catch (error) {
            console.error('Error deleting classroom:', error)
            toast({
                variant: 'destructive',
                title: 'Error Deleting Classroom',
                description:
                    'There was an error deleting the classroom. Please try again.',
            })
        }
    }

    const handleCreateSubmit = async (data) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_BACKEND}/classroom/createclass`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    mode: 'cors',
                    body: JSON.stringify(data),
                }
            )

            if (!response.ok) {
                throw new Error('Network response was not ok')
            }

            toast({
                title: 'Class Created',
                description: 'The class is created',
            })

            window.location.reload()
        } catch (error) {
            console.error('There was a problem with the POST operation:', error)
            toast({
                variant: 'destructive',
                title: 'Error Creating Classroom',
                description:
                    'There was an error creating the classroom. Please try again.',
            })
        }
    }

    const handleEditSubmit = async (data) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_BACKEND}/classroom/${selectedClassroom._id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    mode: 'cors',
                    body: JSON.stringify(data),
                }
            )

            if (!response.ok) {
                throw new Error('Network response was not ok')
            }

            toast({
                title: 'Class Updated',
                description: 'The class was successfully updated.',
            })

            window.location.reload()
        } catch (error) {
            console.error(
                'There was a problem with the PATCH operation:',
                error
            )
            toast({
                variant: 'destructive',
                title: 'Error Updating Classroom',
                description:
                    'There was an error updating the classroom. Please try again.',
            })
        }
    }

    const handleStripeCheckout = () => {
        window.location.href = 'https://buy.stripe.com/dR617Q1sRbK2fVC7st'
    }

    const handleApiSubmit = async (e) => {
        e.preventDefault()
        try {
            console.log('Submitting API request with input:', apiInput)
            const response = await fetch(
                `${process.env.REACT_APP_API_BACKEND}/openai/function-call`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    mode: 'cors',
                    body: JSON.stringify({ userInput: apiInput }),
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to send input')
            }

            const data = await response.json()
            console.log('Function call response:', data)

            // Refresh the classroom list after successful creation
            // Refresh the classroom list after successful creation
            console.log('Fetching updated classroom list...')
            const classroomsResponse = await fetch(
                `${process.env.REACT_APP_API_BACKEND}/classroom`,
                {
                    credentials: 'include',
                }
            )

            if (classroomsResponse.ok) {
                const classrooms = await classroomsResponse.json()
                console.log('Received updated classrooms:', classrooms)
                setCurrClassrooms(classrooms)
            } else {
                console.error(
                    'Failed to fetch classrooms:',
                    await classroomsResponse.text()
                )
            }

            toast({
                title: 'Success',
                description:
                    data.message || 'Your input was processed successfully',
            })
            setApiInput('')
        } catch (error) {
            console.error('Error in handleApiSubmit:', error)
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            })
        }
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-white">
            <Navbar />
            <div className="flex justify-between items-center m-8 ">
                <h1 className="text-4xl font-bold">Your Classrooms</h1>
                <div className="flex space-x-4">
                    {user && user.authority === 'teacher' && (
                        <AlertDialog
                            open={isCreateModalOpen}
                            onOpenChange={setIsCreateModalOpen}
                        >
                            <AlertDialogTrigger asChild></AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-800 text-gray-100">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl font-bold">
                                        Create Class
                                    </AlertDialogTitle>
                                </AlertDialogHeader>
                                <Form {...createForm}>
                                    <form
                                        onSubmit={createForm.handleSubmit(
                                            handleCreateSubmit
                                        )}
                                        className="space-y-8 fill-class-info"
                                    >
                                        <FormField
                                            control={createForm.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Title</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter class title"
                                                            {...field}
                                                            className="bg-gray-700 text-gray-100"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={createForm.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Description
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter class description"
                                                            {...field}
                                                            className="bg-gray-700 text-gray-100"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="text-gray-800">
                                                Cancel
                                            </AlertDialogCancel>
                                            <Button
                                                type="submit"
                                                className="flex gap-2 justify-between items-center bg-indigo-600 "
                                            >
                                                <FontAwesomeIcon
                                                    icon={faPlus}
                                                    className=""
                                                />
                                                Create
                                            </Button>
                                        </AlertDialogFooter>
                                    </form>
                                </Form>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    {user && user.authority === 'student' && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="text-md font-bold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                                    <FontAwesomeIcon
                                        icon={faPlus}
                                        className="mr-2"
                                    />
                                    JOIN CLASS +
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="transition ease-in-out duration-500 transform hover:-translate-y-1 hover:scale-105 bg-gray-800 text-gray-100">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl font-bold text-indigo-400">
                                        Join Class
                                    </AlertDialogTitle>
                                </AlertDialogHeader>
                                <Form {...joinForm}>
                                    <form
                                        onSubmit={joinForm.handleSubmit(
                                            onSubmit
                                        )}
                                        className="space-y-8"
                                    >
                                        <FormField
                                            control={joinForm.control}
                                            name="joinCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Join Code
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter class join code"
                                                            {...field}
                                                            className="bg-gray-700 text-gray-100"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="text-gray-400">
                                                Cancel
                                            </AlertDialogCancel>
                                            <Button
                                                type="submit"
                                                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faPlus}
                                                    className="mr-2"
                                                />
                                                Join
                                            </Button>
                                        </AlertDialogFooter>
                                    </form>
                                </Form>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap m-4">
                {console.log('Rendering classrooms:', currClassrooms)}
                {user && user.authority === 'teacher' && (
                    <Card
                        className="min-w-1/4 w-1/4 min-h-[200px] m-4 border-2 border-white text-white-600 bg-zinc-900 cursor-pointer hover:bg-zinc-700 transition-all"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <CardContent className="flex items-center justify-center h-full">
                            <div className="flex flex-col items-center">
                                <FontAwesomeIcon
                                    icon={faPlus}
                                    size="3x"
                                    className="mb-2"
                                />
                                <span className="text-lg font-bold">
                                    New Class
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                )}
                {currClassrooms &&
                    currClassrooms.map((classroom) => (
                        <Card
                            key={classroom._id}
                            className={`min-w-1/4 w-1/4 min-h-[200px] m-4 text-black cursor-pointer`}
                        >
                            <CardHeader>
                                <div className="flex justify-between">
                                    <CardTitle className="text-xl font-bold">
                                        {classroom.title}
                                    </CardTitle>
                                    <div className="flex gap-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant=""
                                                    className="material-symbols-outlined ml-2 bg-indigo-600"
                                                >
                                                    apps
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56 bg-gray-700 text-gray-100">
                                                <DropdownMenuLabel>
                                                    Options
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator className="bg-gray-600" />
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem
                                                        onSelect={() =>
                                                            handleEditClassroom(
                                                                classroom
                                                            )
                                                        }
                                                        className="hover:bg-gray-600"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faPen}
                                                            className="mr-2"
                                                        />
                                                        Edit Classroom
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onSelect={() =>
                                                            handleDeleteClassroom(
                                                                classroom._id
                                                            )
                                                        }
                                                        className="hover:bg-gray-600"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faTrash}
                                                            className="mr-2"
                                                        />
                                                        Delete Classroom
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button
                                            onClick={() =>
                                                handleGoToClass(classroom._id)
                                            }
                                            className="bg-green-600"
                                        >
                                            {' '}
                                            Enter Class
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    {classroom.description}
                                </CardDescription>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <span className="text-sm font-bold">
                                    Class Code: {classroom.joincode}
                                </span>
                            </CardFooter>
                        </Card>
                    ))}
            </div>

            {/* Edit Class Modal */}
            <AlertDialog
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
            >
                <AlertDialogContent className="bg-gray-800 text-gray-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold">
                            Edit Class
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <Form {...createForm}>
                        <form
                            onSubmit={createForm.handleSubmit(handleEditSubmit)}
                            className="space-y-8 fill-class-info"
                        >
                            <FormField
                                control={createForm.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={
                                                    selectedClassroom?.title
                                                }
                                                {...field}
                                                className="bg-gray-700 text-gray-100"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={createForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={
                                                    selectedClassroom?.description
                                                }
                                                {...field}
                                                className="bg-gray-700 text-gray-100"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <AlertDialogFooter>
                                <AlertDialogCancel className="text-gray-800">
                                    Cancel
                                </AlertDialogCancel>
                                <Button
                                    type="submit"
                                    className="flex gap-2 justify-between items-center bg-indigo-600 "
                                >
                                    <FontAwesomeIcon
                                        icon={faPen}
                                        className=""
                                    />
                                    Update
                                </Button>
                            </AlertDialogFooter>
                        </form>
                    </Form>
                </AlertDialogContent>
            </AlertDialog>

            {/* Floating API Input */}
            <Chatbot />

            <Toaster />
        </div>
    )
}

export default Home
