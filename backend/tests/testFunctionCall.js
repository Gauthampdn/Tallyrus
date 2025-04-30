const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookie-jar');
require('dotenv').config();

const API_URL = 'http://localhost:4000/api/openai/function-call';

// Create a cookie jar
const cookieJar = new CookieJar();

// Create an axios instance with cookie support
const client = wrapper(axios.create({ 
    jar: cookieJar,
    withCredentials: true 
}));

async function testFunctionCall() {
    try {
        // First, let's check if we're logged in
        console.log('Checking authentication...');
        const authCheck = await client.get('http://localhost:4000/auth/googleUser', {
            headers: {
                'Origin': 'http://localhost:3000'
            }
        });
        
        if (!authCheck.data) {
            console.error('Not authenticated. Please log in first.');
            return;
        }

        console.log('User is authenticated:', authCheck.data);

        // Test creating a classroom
        console.log('\nTesting classroom creation...');
        const classroomResponse = await client.post(API_URL, {
            userInput: "Create a new classroom called 'Advanced Calculus' with the description 'A course covering advanced calculus topics'"
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:3000'
            }
        });
        console.log('Classroom created:', classroomResponse.data);

        // Test creating an assignment
        console.log('\nTesting assignment creation...');
        const assignmentResponse = await client.post(API_URL, {
            userInput: "Create an assignment called 'Integration Practice' for classroom 'Advanced Calculus' with the description 'Practice problems on integration techniques' and due date '2024-03-20'"
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:3000'
            }
        });
        console.log('Assignment created:', assignmentResponse.data);

    } catch (error) {
        if (error.response) {
            console.error('Error response:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }
    }
}

testFunctionCall(); 