import { useParams, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, createRef } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import ReactMarkdown from 'react-markdown';
import Navbar from "components/Navbar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFlag, faPenToSquare, faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';
import './assignments.css';
import { marked } from 'marked';
import { useToast } from "@/components/ui/use-toast";

import html2canvas from 'html2canvas';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuShortcut,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const Assignment = () => {
  const tailwindColors = [
    'bg-red-100', 'bg-yellow-100', 'bg-green-100', 'bg-blue-100',
    'bg-indigo-100', 'bg-purple-100', 'bg-pink-100', 'bg-orange-100',
    'bg-teal-100', 'bg-lime-100', 'bg-amber-100', 'bg-emerald-100',
    'bg-cyan-100', 'bg-sky-100', 'bg-violet-100', 'bg-fuchsia-100',
    'bg-rose-100'
  ];
  
  const getRandomColor = () => {
    return tailwindColors[Math.floor(Math.random() * tailwindColors.length)];
  };
  
  const { toast } = useToast();

  const contentRef = createRef();

  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthContext();

  const [assignment, setAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [open, setOpen] = useState(false);
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState('');
  const [searchText, setSearchText] = useState("");
  const [editFeedbackModal, setEditFeedbackModal] = useState(false);
  const [currentCriteria, setCurrentCriteria] = useState(null);
  const [currentComments, setCurrentComments] = useState('');
  const [currentScore, setCurrentScore] = useState(0); // State for the text box score
  const [isSaving, setIsSaving] = useState(false);
  const [commentText, setCommentText] = useState('');

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const submissionId = queryParams.get('submissionId');
  
  useEffect(() => {
    if (assignment && submissionId) {
      const selected = assignment.submissions.find(sub => sub._id === submissionId);
      if (selected) {
        setSelectedSubmission(selected);
      } else if (assignment.submissions.length > 0) {
        // Fallback to the first submission if the ID is not found
        setSelectedSubmission(assignment.submissions[0]);
        navigate(`?submissionId=${assignment.submissions[0]._id}`, { replace: true });
      }
    }
  }, [assignment, submissionId]);
  

  useEffect(() => {
    console.log('Assignment updated:', assignment);
  }, [assignment]);
  
  useEffect(() => {
    console.log('Selected Submission updated:', selectedSubmission);
  }, [selectedSubmission]);
  

  const calculateTotalScore = (submission) => {
    if (!submission || !submission.feedback) {
      return 0;
    }
    return submission.feedback.reduce((total, criteria) => total + criteria.score, 0);
  };

  const formatFeedback = (submission) => {
    const feedback = submission.feedback;
    const formattedFeedback = feedback.map(criteria => (
      `**${criteria.name.replace(/\*/g, '')}**: ${criteria.score}/${criteria.total} points\n\n${criteria.comments}\n\n`
    )).join('');

    const overallTotal = feedback.reduce((sum, criteria) => sum + criteria.total, 0);
    const feedbackWithOverallTotal = formattedFeedback + `****Overall Total****: ${calculateTotalScore(submission)}/${overallTotal} points\n\n`;

    return feedbackWithOverallTotal;
  };

  const handleEditName = async (submissionId, name) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/${assignment._id}/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ studentName: name })
      });

      if (!response.ok) {
        throw new Error('Failed to update submission name');
      }
      const updatedAssignment = await response.json();

      console.log("submission changed", updatedAssignment)

      setAssignment(updatedAssignment);
      setSelectedSubmission(updatedAssignment.submissions.find(sub => sub._id === submissionId));
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleGradeAll = async (assignmentId) => {
    console.log("grading all")
    toast({
      title: "Grading Now!",
      description: "Our systems are grading all assignments - check back in a bit!",
    });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/openai/gradeall/${assignmentId}`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Error In Grading All",
          description: "Try grading all later.",
        });

        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data); // Logging the response
    } catch (error) {
      console.error("There was a problem trying to grade", error);
    }
  }

  const handleMarkForRegrade = async (submissionId) => {
    console.log('Marking for regrade...');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/${assignment._id}/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ status: 'regrade' })
      });
  
      if (!response.ok) {
        throw new Error('Failed to mark submission for regrade');
      }
  
      const updatedAssignment = await response.json();
      const updatedSubmission = updatedAssignment.submissions.find(sub => sub._id === submissionId);
  
      setAssignment(updatedAssignment);
      setSelectedSubmission(updatedSubmission);

      handleGradeAll(assignment._id);
  
      // Ensure the URL reflects the current submission
      navigate(`?submissionId=${submissionId}`, { replace: true });
  
    } catch (error) {
      console.error('Error:', error.message);
    }
  };
  

  

  const handleScoreChange = async (criteriaId, newScore) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/${assignment._id}/submissions/${selectedSubmission._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
          feedback: selectedSubmission.feedback.map(criteria =>
            criteria._id === criteriaId ? { ...criteria, score: newScore } : criteria
          )
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to update score');
      }
  
      const updatedAssignment = await response.json();
      setAssignment(updatedAssignment);
      setSelectedSubmission(updatedAssignment.submissions.find(sub => sub._id === selectedSubmission._id));
    } catch (error) {
      console.error(error.message);
    }
  };
  

  const handleCommentsChange = async (criteriaId, newComments) => {
    try {
      const updatedFeedback = selectedSubmission.feedback.map(criteria =>
        criteria._id === criteriaId ? { ...criteria, comments: newComments } : criteria
      );
  
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/${assignment._id}/submissions/${selectedSubmission._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ feedback: updatedFeedback })
      });
  
      if (!response.ok) {
        throw new Error('Failed to update comments');
      }
  
      const updatedAssignment = await response.json();
      setAssignment(updatedAssignment);
      setSelectedSubmission(updatedAssignment.submissions.find(sub => sub._id === selectedSubmission._id));
    } catch (error) {
      console.error(error.message);
    }
  };
  
  
  const printAll = async () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>All Submissions - Writing Feedback</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            :root {
              --primary-color: #6366f1;
              --border-color: #e5e7eb;
              --text-primary: #111827;
              --text-secondary: #4b5563;
              --background-light: #f9fafb;
              --highlight: #eef2ff;
            }
            
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              line-height: 1.6;
              color: var(--text-primary);
              background-color: white;
              margin: 0;
              padding: 20px;
              position: relative;
            }
            
            .logo {
              max-width: 120px;
              margin-bottom: 10px;
            }
            
            .header {
              text-align: center;
              padding: 20px 0;
              margin-bottom: 30px;
              border-bottom: 2px solid var(--primary-color);
            }
            
            .header h1 {
              font-size: 28px;
              font-weight: 700;
              color: var(--primary-color);
              margin-bottom: 5px;
            }
            
            .submission {
              margin-bottom: 50px;
              page-break-after: always;
              background-color: white;
              border-radius: 10px;
              border: 1px solid var(--border-color);
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            
            .submission-header {
              background-color: var(--highlight);
              padding: 16px 20px;
              border-bottom: 1px solid var(--border-color);
            }
            
            .submission-header h2 {
              font-size: 22px;
              font-weight: 600;
              margin-bottom: 5px;
              color: var(--primary-color);
            }
            
            .submission-details {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 10px;
              font-size: 14px;
            }
            
            .detail-item {
              margin-bottom: 5px;
            }
            
            .label {
              font-weight: 600;
              color: var(--text-secondary);
              display: inline-block;
              margin-right: 5px;
            }
            
            .submission-content {
              padding: 20px;
            }
            
            .criteria-section {
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 1px solid var(--border-color);
            }
            
            .criteria-section:last-child {
              border-bottom: none;
            }
            
            .criteria-header {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 8px;
              color: var(--primary-color);
            }
            
            .criteria-score {
              font-weight: 500;
              color: var(--text-secondary);
              margin-bottom: 10px;
            }
            
            .criteria-comments {
              line-height: 1.6;
              white-space: pre-wrap;
            }
            
            .total-score {
              font-size: 18px;
              font-weight: 700;
              margin-top: 25px;
              padding-top: 15px;
              border-top: 2px solid var(--primary-color);
              text-align: right;
            }
            
            p {
              margin-bottom: 10px;
            }
            
            strong {
              font-weight: 600;
            }
            
            hr {
              border: 0;
              height: 1px;
              background-color: var(--border-color);
              margin: 20px 0;
            }
            
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .submission {
                break-inside: avoid;
                page-break-after: always;
                border: none;
                box-shadow: none;
              }
              
              .header {
                position: running(header);
              }
              
              @page {
                margin: 0.5in;
                @top-center {
                  content: element(header);
                }
                @bottom-center {
                  content: "Page " counter(page) " of " counter(pages);
                  font-size: 12px;
                  color: var(--text-secondary);
                }
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/tallyrus2white.png" alt="Tallyrus Logo" class="logo" />
            <h1>Writing Feedback</h1>
            <p>Assignment: ${assignment.name}</p>
          </div>
          <div id="content"></div>
        </body>
      </html>
    `);

    const contentElement = printWindow.document.getElementById('content');

    assignment.submissions.forEach(submission => {
      const formattedFeedback = formatFeedback(submission);
      
      // Process the feedback to create structured content instead of just using marked
      let structuredFeedback = '';
      if (submission.feedback) {
        submission.feedback.forEach(criteria => {
          structuredFeedback += `
            <div class="criteria-section">
              <div class="criteria-header">${criteria.name.replace(/\*/g, '')}</div>
              <div class="criteria-score">${criteria.score}/${criteria.total} points</div>
              <div class="criteria-comments">${criteria.comments}</div>
            </div>
          `;
        });
      }
      
      // Calculate overall score
      const totalScore = calculateTotalScore(submission);
      const maxScore = submission.feedback ? submission.feedback.reduce((sum, criteria) => sum + criteria.total, 0) : 0;
      
      const submissionContent = `
        <div class="submission">
          <div class="submission-header">
            <h2>${submission.studentName}</h2>
            <div class="submission-details">
              <div class="detail-item">
                <span class="label">Email:</span>
                ${submission.studentEmail}
              </div>
              <div class="detail-item">
                <span class="label">Submitted:</span>
                ${new Date(submission.dateSubmitted).toLocaleDateString()}
              </div>
              <div class="detail-item">
                <span class="label">Status:</span>
                ${submission.status}
              </div>
            </div>
          </div>
          <div class="submission-content">
            ${structuredFeedback}
            <div class="total-score">
              Overall Total: ${totalScore}/${maxScore} points
            </div>
          </div>
        </div>
      `;
      contentElement.innerHTML += submissionContent;
    });

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handlePrint = async () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedSubmission.studentName} - Writing Feedback</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            :root {
              --primary-color: #6366f1;
              --border-color: #e5e7eb;
              --text-primary: #111827;
              --text-secondary: #4b5563;
              --background-light: #f9fafb;
              --highlight: #eef2ff;
            }
            
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              line-height: 1.6;
              color: var(--text-primary);
              background-color: white;
              margin: 0;
              padding: 20px;
            }
            
            .logo {
              max-width: 120px;
              margin-bottom: 10px;
            }
            
            .header {
              text-align: center;
              padding: 20px 0;
              margin-bottom: 30px;
              border-bottom: 2px solid var(--primary-color);
            }
            
            .header h1 {
              font-size: 28px;
              font-weight: 700;
              color: var(--primary-color);
              margin-bottom: 5px;
            }
            
            .header h2 {
              font-size: 20px;
              font-weight: 500;
              color: var(--text-secondary);
            }
            
            .student-info {
              background-color: var(--highlight);
              border-radius: 8px;
              padding: 16px 20px;
              margin-bottom: 25px;
              border: 1px solid var(--border-color);
            }
            
            .student-info h3 {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 10px;
              color: var(--primary-color);
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 10px;
            }
            
            .info-item {
              margin-bottom: 5px;
            }
            
            .label {
              font-weight: 600;
              color: var(--text-secondary);
              display: inline-block;
              margin-right: 5px;
            }
            
            .feedback-section {
              margin-bottom: 25px;
            }
            
            .criteria {
              background-color: white;
              border-radius: 8px;
              border: 1px solid var(--border-color);
              overflow: hidden;
              margin-bottom: 20px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            
            .criteria-header {
              background-color: var(--highlight);
              padding: 12px 16px;
              border-bottom: 1px solid var(--border-color);
            }
            
            .criteria-title {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 4px;
              color: var(--primary-color);
            }
            
            .criteria-score {
              font-size: 14px;
              color: var(--text-secondary);
            }
            
            .criteria-body {
              padding: 16px;
              line-height: 1.6;
            }
            
            .total-score {
              font-size: 18px;
              font-weight: 700;
              margin-top: 30px;
              padding: 15px;
              background-color: var(--highlight);
              border-radius: 8px;
              text-align: center;
              border: 1px solid var(--border-color);
            }
            
            .footer {
              margin-top: 40px;
              font-size: 12px;
              text-align: center;
              color: var(--text-secondary);
            }
            
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              @page {
                margin: 0.5in;
                @bottom-center {
                  content: "Page " counter(page) " of " counter(pages);
                  font-size: 12px;
                  color: var(--text-secondary);
                }
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/tallyrus2white.png" alt="Tallyrus Logo" class="logo" />
            <h1>Writing Feedback</h1>
            <h2>${assignment.name}</h2>
          </div>
          
          <div class="student-info">
            <h3>${selectedSubmission.studentName}</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Email:</span>
                ${selectedSubmission.studentEmail}
              </div>
              <div class="info-item">
                <span class="label">Submitted:</span>
                ${new Date(selectedSubmission.dateSubmitted).toLocaleDateString()}
              </div>
              <div class="info-item">
                <span class="label">Status:</span>
                ${selectedSubmission.status}
              </div>
              <div class="info-item">
                <span class="label">AI Score:</span>
                ${selectedSubmission.aiScore || 'N/A'}%
              </div>
            </div>
          </div>
          
          <div class="feedback-section">
            ${selectedSubmission.feedback.map(criteria => `
              <div class="criteria">
                <div class="criteria-header">
                  <div class="criteria-title">${criteria.name.replace(/\*/g, '')}</div>
                  <div class="criteria-score">${criteria.score}/${criteria.total} points</div>
                </div>
                <div class="criteria-body">
                  ${criteria.comments}
                </div>
              </div>
            `).join('')}
            
            <div class="total-score">
              Overall Total: ${calculateTotalScore(selectedSubmission)}/${selectedSubmission.feedback.reduce((sum, criteria) => sum + criteria.total, 0)} points
            </div>
          </div>
          
          <div class="footer">
            Generated by Tallyrus | ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const fetchAssignments = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/assignments/submissions/${id}`, {
            credentials: 'include',
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setAssignment(data);

        if (data.submissions && data.submissions.length > 0) {
            const selected = data.submissions.find(sub => sub._id === submissionId);
            setSelectedSubmission(selected || data.submissions[0]);
        }

    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
    }
};

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const handleGoback = () => {
    if (assignment && assignment.classId) {
      navigate(`/classroom/${assignment.classId}`);
    } else {
      navigate('/app');
    }
  };

  const handleSelectSubmission = (selectedId) => {
    const selected = assignment.submissions.find(sub => sub._id === selectedId);
    setSelectedSubmission(selected);
  
    // Update the URL with the selected submission's ID
    navigate(`?submissionId=${selectedId}`, { replace: true });
  
    setOpen(false);
  };
  

  const getSubmissionLabel = (submission) => {
    return `${submission.studentName} - ${submission.studentEmail}`;
  };

  const filteredSubmissions = assignment ? assignment.submissions.filter(submission =>
    getSubmissionLabel(submission).toLowerCase().includes(searchText.toLowerCase())
  ) : [];

  const navigateToPreviousSubmission = () => {
    const currentIndex = assignment.submissions.findIndex(sub => sub._id === selectedSubmission._id);
    if (currentIndex > 0) {
      const previousIndex = currentIndex - 1;
      const previousSubmission = assignment.submissions[previousIndex];
      setSelectedSubmission(previousSubmission);
  
      // Update the URL with the previous submission's ID
      navigate(`?submissionId=${previousSubmission._id}`, { replace: true });
    }
  };
  
  const navigateToNextSubmission = () => {
    const currentIndex = assignment.submissions.findIndex(sub => sub._id === selectedSubmission._id);
    if (currentIndex < assignment.submissions.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextSubmission = assignment.submissions[nextIndex];
      setSelectedSubmission(nextSubmission);
  
      // Update the URL with the next submission's ID
      navigate(`?submissionId=${nextSubmission._id}`, { replace: true });
    }
  };
  

  const handleSliderChange = (criteriaId, value) => {
    setCurrentScore(value); // Update the text box value
    const updatedSubmissions = { ...selectedSubmission };
    const criteria = updatedSubmissions.feedback.find(criteria => criteria._id === criteriaId);
    criteria.score = value;
    setSelectedSubmission(updatedSubmissions);
    handleScoreChange(criteriaId, criteria.score);
  };

  const handleTextBoxChange = (criteriaId, value) => {
    const parsedValue = Number(value);
    if (!isNaN(parsedValue)) {
      setCurrentScore(parsedValue);
      handleSliderChange(criteriaId, parsedValue);
    }
  };

  const getRubricValues = (criteriaName) => {
    const rubric = assignment.rubric.find(rubric => rubric.name === criteriaName);
    return rubric ? rubric.values : [];
  };

  const autoResizeTextarea = (event) => {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const openEditFeedbackModal = (criteria) => {
    setCurrentCriteria(criteria);
    setCurrentComments(criteria.comments); // set current comments when opening the modal
    setCurrentScore(criteria.score); // Set the initial score when opening the modal
    setEditFeedbackModal(true);
  };

  const closeEditFeedbackModal = async (shouldSave = false) => {
    if (currentCriteria && shouldSave) {
      setIsSaving(true);
      try {
        await handleScoreChange(currentCriteria._id, currentCriteria.score);
        await handleCommentsChange(currentCriteria._id, currentComments);
      } catch (error) {
        console.error('Error saving feedback:', error);
      } finally {
        setIsSaving(false);
        setEditFeedbackModal(false);
      }
    } else {
      setEditFeedbackModal(false);
    }
  };
  
  const handleAddComment = async () => {
    if (!commentText.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Comment cannot be empty",
      });
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BACKEND}/assignments/${assignment._id}/submissions/${selectedSubmission._id}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          mode: 'cors',
          body: JSON.stringify({ text: commentText })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const updatedAssignment = await response.json();
      setAssignment(updatedAssignment);
      setSelectedSubmission(updatedAssignment.submissions.find(sub => sub._id === selectedSubmission._id));
      setCommentText(''); // Clear the comment input

      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment",
      });
    }
  };

  return (
    <div className="bg-zinc-900 text-white min-h-screen">
      <Navbar />
      {assignment ? (
        <div className="p-4">
          <div className="flex mb-2 align-middle justify-between">
            <div className="w-1/5">
              <Button className="mr-2 w-max bg-gray-700 text-white hover:bg-gray-800" onClick={handleGoback}>
                <FontAwesomeIcon icon={faArrowLeft} className="ml-2 mr-2" />
              </Button>
            </div>
            <div className="flex">
              <Button
                onClick={navigateToPreviousSubmission}
                disabled={selectedSubmission && assignment.submissions.findIndex(sub => sub._id === selectedSubmission._id) === 0}
                className="p-4 mr-2 bg-green-600 hover:bg-green-700 text-white"
                aria-label="Previous Submission"
              >
                &#8592;
              </Button>

              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="p-4 mb-4 w-[400px] flex justify-between items-center bg-gray-800 text-white hover:bg-gray-700 truncate"
                  >
                    {selectedSubmission
                      ? getSubmissionLabel(selectedSubmission)
                      : "Select Submission..."}
                    <CaretSortIcon className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[400px] p-0 bg-gray-800 text-white truncate">
                  <Command className  = "bg-gray-800 truncate">
                    <div style={{ position: 'relative', width: '100%' }}>
                      <FontAwesomeIcon
                        icon={faSearch}
                        style={{
                          position: 'absolute',
                          left: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 10,
                          pointerEvents: 'none',
                          fontSize: '14px',
                          color: '#aaa',
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Search submission..."
                        className="h-9 bg-gray-800 text-white pl-10 pr-2 w-full box-border"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                    </div>
                    {filteredSubmissions.length === 0 && <CommandEmpty>No submission found.</CommandEmpty>}
                    <CommandGroup>
                      {filteredSubmissions.map((submission) => (
                        <CommandItem
                          key={submission._id}
                          value={submission._id}
                          onSelect={() => handleSelectSubmission(submission._id)}
                          className="command-item bg-gray-800 hover:bg-gray-700 text-white truncate"
                        >
                          <div className="command-item-text text-sm truncate" title={getSubmissionLabel(submission)}>
                            {getSubmissionLabel(submission)}
                          </div>
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              selectedSubmission && submission._id === selectedSubmission._id ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              <Button
                onClick={navigateToNextSubmission}
                disabled={selectedSubmission && assignment.submissions.findIndex(sub => sub._id === selectedSubmission._id) === assignment.submissions.length - 1}
                className="p-4 ml-2 mr-2 bg-green-600 hover:bg-green-700 text-white"
                aria-label="Next Submission"
              >
                &#8594;
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="" className="material-symbols-outlined ml-2 bg-indigo-600 hover:bg-indigo-700">apps</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-800 text-white">
                  <DropdownMenuLabel>Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={handlePrint}>
                      🖨️ Print
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={printAll}>
                      📠 Print All
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setEditName(true)}>
                      <FontAwesomeIcon icon={faPenToSquare} className="mr-2" />
                      Edit File Name
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button className="ml-2 bg-red-500 hover:bg-red-600" onClick={() => handleMarkForRegrade(selectedSubmission._id)}>
                <FontAwesomeIcon icon={faFlag} className="ml-2 mr-2" />
                Mark for Regrade
              </Button>
            </div>
          </div>

          <hr className="mb-5 border-gray-700" />

          {selectedSubmission && (
            <div className="flex flex-col md:flex-row gap-3">
              <div className="md:flex-1">
                {selectedSubmission.pdfURL ? (
                  <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedSubmission.pdfURL)}&embedded=true`}
                    width="100%"
                    height="800px"
                    style={{ border: 'none', backgroundColor: '#1a202c' }}
                  ></iframe>
                ) : (
                  <p>No file selected</p>
                )}
                                <Card className="mt-6 bg-white text-neutral-900">
                  <CardHeader>
                    <CardTitle>Comments</CardTitle>
                    <CardDescription>Add comments to this submission</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Existing comments */}
                      {selectedSubmission.comments && selectedSubmission.comments.map((comment, index) => (
                        <div key={index} className="p-3 rounded-lg bg-black text-white">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold">{comment.author}</span>
                            <span className="text-sm text-gray-400">
                              {new Date(comment.createdAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true,
                                timeZone: 'America/Los_Angeles'
                              })}
                            </span>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      ))}

                      {/* New comment input */}
                      <div className="flex gap-2">
                        <Textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleAddComment}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          Add Comment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:flex-1 p-4">
                <div className="m-6 text-white">
                  <h1 className="mb-1 font-extrabold text-2xl">{assignment?.name}</h1>
                  <p><strong>Name:</strong> {selectedSubmission.studentName}</p>
                  <p><strong>Email:</strong> {selectedSubmission.studentEmail}</p>
                  <p><strong>Date Submitted:</strong> {new Date(selectedSubmission.dateSubmitted).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> {selectedSubmission.status} {selectedSubmission.status === 'regrade' && <FontAwesomeIcon icon={faFlag} className="ml-2 text-red-500" />}</p>
                  <p><strong>AI Score:</strong> {selectedSubmission.aiScore}%</p> {/* Display AI score here */}
                  <p><strong>Total Score:</strong> {calculateTotalScore(selectedSubmission)}/{selectedSubmission.feedback.reduce((sum, criteria) => sum + criteria.total, 0)} points</p>
                </div>
                <hr className="m-6 border-gray-700" />

                <div className="overflow-y-auto">
                  {selectedSubmission.feedback.map((criteria, index) => (
                    <Card key={index} className="mb-3 bg-white text-neutral-900">
                      <CardHeader>
                        <div className="flex justify-between">
                          <CardTitle className="font-bold">{criteria.name.replace(/\*/g, '')}</CardTitle>
                          <Button onClick={() => openEditFeedbackModal(criteria)} className="ml-2 bg-gray-700 text-white border-2 border-gray-600 shadow-none hover:bg-gray-600">
                            <FontAwesomeIcon icon={faPenToSquare} className="mr-2" />
                            Edit
                          </Button>
                        </div>
                        <CardDescription>{criteria.score}/{criteria.total} points</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ReactMarkdown className="text-sm">{criteria.comments}</ReactMarkdown>
                      </CardContent>
                    </Card>
                  ))}
                </div>


              </div>

              <AlertDialog open={editName}>
                <AlertDialogContent className="bg-gray-800 text-white border border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Change File name</AlertDialogTitle>
                    <AlertDialogDescription>
                      Update the file name to better organize and reflect your records.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div>
                    <Input
                      type="text"
                      placeholder="Enter new name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-gray-700 text-white border-gray-600"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-red-500 text-white hover:bg-red-600">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => { handleEditName(selectedSubmission._id, name); setEditName(false); }} className="bg-green-500 text-white hover:bg-green-600">Change</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Dialog open={editFeedbackModal} onOpenChange={setEditFeedbackModal} onClose={closeEditFeedbackModal}>
                <DialogContent className="w-full max-w-2xl p-6 h-auto mb-4 bg-gray-800 text-white">
                  <DialogTitle>Edit Feedback</DialogTitle>
                  <DialogDescription>
                    <div className="flex flex-row justify-between items-center mb-2">
                      <Input
                        type="number"
                        value={currentScore}
                        onChange={(e) => handleTextBoxChange(currentCriteria._id, e.target.value)}
                        className="w-1/4 mr-1 bg-gray-700 text-white"
                      />
                      <span className="mr-2">/{currentCriteria ? currentCriteria.total : 0}</span>
                      <input
                        type="range"
                        min="0"
                        max={currentCriteria ? currentCriteria.total : 0}
                        step="0.5"
                        value={currentScore}
                        onChange={(e) => handleSliderChange(currentCriteria._id, Number(e.target.value))}
                        className="w-full bg-gray-700 text-white"
                        list={`tickmarks-${currentCriteria ? currentCriteria._id : ''}`}
                      />
                      <datalist id={`tickmarks-${currentCriteria ? currentCriteria._id : ''}`}>
                        {currentCriteria ? getRubricValues(currentCriteria.name).map((value, idx) => (
                          <option key={idx} value={value.point} label={value.point.toString()}></option>
                        )) : null}
                      </datalist>
                    </div>
                    <div className="h-auto mb-4">
                      <Textarea
                        value={currentComments}
                        onChange={(e) => setCurrentComments(e.target.value)}
                        className="w-full mt-2 p-2 bg-gray-700 text-white border border-gray-600 rounded overflow-scroll mb-2"
                        rows="8"
                        style={{ overflow: 'scroll' }}
                        onInput={autoResizeTextarea} 
                      />
                    </div>
                  </DialogDescription>
                  <DialogFooter className="mt-8 flex justify-end space-x-4">
                    <Button 
                      onClick={() => closeEditFeedbackModal(false)}
                      className="bg-red-500 text-white hover:bg-red-600 focus:ring-4 focus:ring-red-300 rounded-lg py-3 px-6 transition-all duration-200 ease-in-out"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => closeEditFeedbackModal(true)}
                      disabled={isSaving}
                      className={`bg-green-500 text-white hover:bg-green-600 focus:ring-4 focus:ring-green-300 rounded-lg py-3 px-6 transition-all duration-200 ease-in-out ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <FontAwesomeIcon icon={faSave} className="mr-2 text-lg" />
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-400">Select an assignment to view details</p>
      )}
    </div>
  );
}

export default Assignment;
