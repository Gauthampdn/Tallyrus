import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AssignmentsContextProvider } from './context/AssignmentsContext';
import { AuthContextProvider } from './context/AuthContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AuthContextProvider>
      <AssignmentsContextProvider>
        <App />
      </AssignmentsContextProvider>
    </AuthContextProvider>
)