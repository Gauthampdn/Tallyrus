import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthContext } from './hooks/useAuthContext';
import Joyride, { EVENTS, STATUS } from 'react-joyride';

// pages & components
import Home from './pages/Home';
import Login from './pages/Login';
import Mail from './pages/Mail';
import Classroom from 'pages/Classroom';
import CreateA from 'components/CreateA';
import Assignment from 'pages/Assignment';
import AboutTallyrus from 'pages/AboutTallyrus';
import PublicAssignment from 'pages/PublicAssignment';
import Rubric from 'pages/Rubric';
import Profile from 'pages/Profile';

const RedirectToFreeDetector = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/420b5dce52947e504f5db18e5eb418ca.html');
  }, [navigate]);

  return null;
};

const App = () => {
  const { user } = useAuthContext();
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleJoyrideCallback = useCallback((data) => {
    const { status, type, index } = data;

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      if (index === 1 && !isCreateModalOpen) {
        setIsCreateModalOpen(true);
      } else {
        setStepIndex(index + 1);
      }
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      setStepIndex(0);
      setIsCreateModalOpen(false);
    }
  }, [isCreateModalOpen]);

  const startTour = () => {
    setRunTour(true);
    setStepIndex(0);
  };

  useEffect(() => {
    if (isCreateModalOpen && stepIndex === 1) {
      const checkElement = setInterval(() => {
        if (document.querySelector('.fill-class-info')) {
          setStepIndex(stepIndex + 1);
          clearInterval(checkElement);
        }
      }, 100); // Check every 100ms
    }
  }, [isCreateModalOpen, stepIndex]);

  const steps = [
    {
      target: '.create-class-btn',
      content: 'Click here to create a new class.',
      disableBeacon: true,
    },
    {
      target: '.fill-class-info',
      content: 'Fill out the class information here.',
      disableBeacon: true,
      placement: 'top',
    },
    {
      target: '.go-to-class-btn',
      content: 'Click here to go to the class you created.',
      disableBeacon: true,
    },
    {
      target: '.create-assignment-btn',
      content: 'Click here to create a new assignment.',
      disableBeacon: true,
    },
    {
      target: '.upload-rubric-btn',
      content: 'Upload your rubric and student files here.',
      disableBeacon: true,
    },
    {
      target: '.grade-all-btn',
      content: 'Click here to grade all assignments.',
      disableBeacon: true,
    },
    {
      target: '.view-submissions-btn',
      content: 'View all submissions here.',
      disableBeacon: true,
    },
  ];

  return (
    <div className="bg-white">
      <Joyride
        steps={steps}
        run={runTour}
        stepIndex={stepIndex}
        callback={handleJoyrideCallback}
        continuous
        showProgress
        showSkipButton
      />
      <BrowserRouter>
        <div className="pages">
          <Routes>
            <Route path="/" element={<AboutTallyrus />} />
            <Route path="/app" element={user ? <Home startTour={startTour} stepIndex={stepIndex} setStepIndex={setStepIndex} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} /> : <Navigate to="/login" />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/app" />} />
            <Route path="/mail" element={<Mail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/classroom/:id" element={<Classroom />} />
            <Route path="/createassignment/:id" element={<CreateA />} />
            <Route path="/submission/:id" element={<CreateA />} />
            <Route path="/assignment/:id" element={<Assignment />} />
            <Route path="/publicassignment/:id" element={<PublicAssignment />} />
            <Route path="/rubric/:id" element={<Rubric />} />
            <Route path="/420b5dce52947e504f5db18e5eb418ca.html" element={<RedirectToFreeDetector />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
};

export default App;
