# Tallyrus Developer Guide

![Tallyrus Logo](Tallyrus/frontend/public/tallyrus2.png)

## Overview

**Tallyrus** is an AI-powered essay grading platform designed to revolutionize the educational experience by automating the time-intensive task of essay assessment. The application leverages cutting-edge AI technology to provide quick, accurate, and unbiased grading while delivering personalized feedback to students.

### Key Features

- **AI-Powered Grading**: Utilizes advanced AI to assess student essays based on custom rubrics
- **Personalized Feedback**: Provides detailed, constructive feedback tailored to each student
- **Classroom Management**: Comprehensive tools for managing assignments, students, and submissions
- **Bias-Free Assessment**: Ensures fair evaluation through objective AI analysis
- **Real-time Processing**: Quick turnaround times for essay grading and feedback

## Architecture

Tallyrus follows a modern full-stack architecture:

- **Frontend**: React.js application with Tailwind CSS and Radix UI components
- **Backend**: Node.js/Express.js REST API server
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: OpenAI API for essay analysis and grading
- **Authentication**: Google OAuth2 integration with Passport.js
- **File Processing**: Support for PDF, DOCX, and text file uploads
- **Python Services**: Additional Python server for specialized processing

## Project Structure

# Tallyrus Codebase Setup

MAKE SURE U HAVE A GITIGNORE

To set up the Tallyrus codebase, follow these steps:

1. **Clone the GitHub repository:**

   - Download the codebase from GitHub.

2. **Create `.env` files:**

   - Navigate to the `backend` and `pergifrontend` folders.
   - Create a `.env` file in each folder.

3. **Add environment variables:**

   - Populate the `.env` files with the necessary environment variables.

4. **Install dependencies:**

   - Run `npm install` in both the `backend` and `pergifrontend` folders.

5. **Start the development servers:**
   - For the backend, run `npm run dev`.
   - For the frontend:
     - On Windows, run `npm start`.
     - On macOS, run `npm startmac`.

You're all set!

#mcp test
