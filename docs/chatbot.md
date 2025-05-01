# Tallyrus Chatbot Documentation

## Overview

The Tallyrus Chatbot is an AI-powered assistant integrated into the Tallyrus platform that helps teachers manage their classrooms and assignments through natural language commands. The chatbot appears as a floating interface in the bottom-right corner of the application, providing an intuitive way to interact with the system.

## Features

### Natural Language Interface

-   Accepts natural language commands for classroom and assignment management
-   Understands context and intent from user input
-   Provides immediate feedback through toast notifications

### Supported Commands

The chatbot supports the following main functions:

1. **Classroom Creation**

    - Create new classrooms with titles and descriptions
    - Example: "Create a new classroom called English 101"

2. **Assignment Management**
    - Create assignments within existing classrooms
    - Set due dates and descriptions
    - Example: "Add a new essay assignment to English 101 due next week"
    - **Important**: When specifying dates, use one of these formats:
        - "YYYY-MM-DD" (e.g., "2024-03-20")
        - "next week", "tomorrow", "in 2 days" (relative dates)
        - "March 20, 2024" (full date format)

### User Interface

-   Floating chat interface in the bottom-right corner
-   Clean, modern design with smooth animations
-   Responsive input field with focus states
-   Animated send button with hover effects

## Technical Implementation

### Frontend Components

```javascript
// Floating API Input Component
<div className="fixed bottom-8 right-8 z-50">
    <form
        onSubmit={handleApiSubmit}
        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
    >
        <Input
            type="text"
            value={apiInput}
            onChange={(e) => setApiInput(e.target.value)}
            placeholder="Enter your command..."
            className="w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
        />
        <Button
            type="submit"
            size="icon"
            className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 hover:scale-110 hover:shadow-lg"
        >
            <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
        </Button>
    </form>
</div>
```

### Backend Integration

-   Uses OpenAI's GPT model for natural language processing
-   Implements function calling for structured responses
-   Handles classroom and assignment creation through API endpoints

## Usage Guide

### Basic Usage

1. Click on the floating chat interface in the bottom-right corner
2. Type your command in natural language
3. Press Enter or click the send button
4. Wait for the system to process your request
5. Receive feedback through toast notifications

### Best Practices

-   Be specific in your commands
-   Include classroom names when creating assignments
-   Use clear, concise language
-   Check toast notifications for operation status

### Example Commands

```
"Create a new classroom called History 101"
"Add a research paper assignment to History 101 due next Friday"
"Create a classroom for Math 202 with description 'Advanced Calculus'"
```

## Error Handling

-   Invalid commands will trigger error notifications
-   Missing required information will prompt for clarification
-   Network errors will show appropriate error messages

## Security

-   All requests require authentication
-   User permissions are checked before executing commands
-   Sensitive operations are logged for audit purposes

## Troubleshooting

### Common Issues

1. **Command Not Recognized**

    - Try rephrasing your command
    - Check for typos
    - Ensure you're using supported command formats

2. **Operation Failed**
    - Check your internet connection
    - Verify you have the necessary permissions
    - Look for error messages in toast notifications

### Support

For additional support:

-   Contact the Tallyrus support team
-   Check the system logs for detailed error information
-   Refer to the API documentation for technical details

## Future Enhancements

-   Support for more complex commands
-   Integration with additional classroom management features
-   Enhanced natural language understanding
-   Custom command templates
-   Multi-language support

### Date Handling

The chatbot uses natural language processing to understand date references, but for best results:

-   Use specific dates when possible
-   For relative dates (e.g., "next week"), the system will calculate the exact date
-   All dates are converted to ISO format (YYYY-MM-DD) internally
-   Timezone is set to the user's local timezone
