const OpenAI = require('openai');
const mongoose = require("mongoose");
const Classroom = require("../models/classroomModel");
const User = require("../models/userModel");
const Assignment = require("../models/assignmentModel");
// const mammoth = require("mammoth");
require("dotenv").config();

const { incrementGraded } = require('./authController');

const fetchAIScore = async (text) => {
    const url = "http://ec2-3-20-99-69.us-east-2.compute.amazonaws.com:5001/ai-detection";  // Flask server URL

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch AI score');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error fetching AI score:", error);
        return null; // Handle the error appropriately in your application
    }
};

const formatAIScore = (aiScore, decimalPoints = 2) => {
    return (aiScore * 100).toFixed(decimalPoints);
};









const gradingInstructions =
    `You are a Grader for essays. You will read the given essay and then based on the rubric below you will give in-depth feedback based on each criteria and then a score for each criteria.
        Give extremely in-depth paragraphs of feedback, comments, and suggestions on each criteria on what was done well, what could be improved, and suggestions. Use examples on how it can be better and/or how it can be rewritten/rephrased.
        Grade leniently at an elementary school writing level, aiming to give scores mostly in the top two ranges (e.g., 4/5 or 5/5). You can also give partial scores (e.g., 4.5) if you feel the writing quality is between 2 levels of achievement.

        Now this is strictly how each criteria should be formatted:
                            
        """
        **Criteria Name**: **Name of the Criteria**

        **Score**: **(score)/subtotal**

        **Comments/suggestions**: The Comments and Suggestions you have based on the rubric and how the writing is.
        """

        Here is an examples:

        """

        **Criteria Name**: **Evaluating Sources and Using Evidence:**

        **Score**: **4.5/5**

        **Comments/suggestions**: The essay effectively develops both claims and counterclaims, presenting the argument that farming is more important than trading while acknowledging the benefits of trading. The strengths and limitations of both are well articulated. For example, the essay points out that farming boosts the economy and provides a steady food supply but also recognizes that climate change can affect crops.

        **Criteria Name**: **Language**

        **Score**: **5/5**

        **Comments/suggestions**: The essay demonstrates a strong command of standard English capitalization, punctuation, and spelling, contributing to clear and formal writing. There are minimal errors, which do not distract from the overall readability of the essay.

        """
        

        You must do every single criteria in the rubric provided no matter how many there are, giving every single rubric criteria specifically and the score and comments/suggestions respectively.
        `;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function loadPdfJsLib() {
    const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
    return pdfjsLib;
}

async function getTextFromPDF(pdfPath) {
    const pdfjsLib = await loadPdfJsLib();
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    const pdf = await loadingTask.promise;
    let extractedText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        extractedText += textContent.items.map(item => item.str).join(' ');
    }

    return extractedText;
}

// async function getTextFromDOCX(url) {
//     try {
//         const response = await fetch(url);
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const arrayBuffer = await response.arrayBuffer();
//         const { value: extractedText, messages } = await mammoth.extractRawText({ arrayBuffer });
//         messages.forEach(message => console.log("Message:", message));
//         return extractedText;
//     } catch (error) {
//         console.error("Error fetching or converting document:", error);
//         return null;
//     }
// }

// async function getTextFromImage(imagePath) {
//     try {
//         const response = await openai.images.generate({
//             image: imagePath,
//             request_text: true,
//             prompt: 'Extract the text from this image',
//         });
//         return response.data.text;
//     } catch (error) {
//         console.error("Error extracting text from image:", error);
//         return null;
//     }
// }

function rubricToString(rubrics) {
    let rubricString = '';

    rubrics.forEach(rubric => {
        rubricString += `Criteria Name : ${rubric.name}\n`;

        rubric.values.forEach(value => {
            rubricString += `  - ${value.point} points = ${value.description}\n`;
        });

        rubricString += '\n';
    });

    return rubricString;
}

function parseFeedback(gradingResponse) {
    const feedback = gradingResponse;
    const feedbackLines = feedback.split('\n');
    const parsedFeedback = [];

    let currentCriteria = null;
    let currentComments = null;
    let currentScore = null;
    let currentTotal = null;

    for (let line of feedbackLines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('**Criteria Name**:')) {
            if (currentCriteria) {
                parsedFeedback.push({
                    name: currentCriteria,
                    score: currentScore,
                    total: currentTotal,
                    comments: currentComments,
                });
            }
            currentCriteria = trimmedLine.split('**Criteria Name**:')[1].trim();
            currentComments = null;
            currentScore = null;
            currentTotal = null;
        } else if (trimmedLine.startsWith('**Score**:')) {
            const scoreText = trimmedLine.split('**Score**:')[1].trim().replace(/\*/g, '');
            const scoreParts = scoreText.split('/');
            currentScore = parseFloat(scoreParts[0]);
            currentTotal = parseInt(scoreParts[1], 10);
        } else if (trimmedLine.startsWith('**Comments/suggestions**:')) {
            currentComments = trimmedLine.split('**Comments/suggestions**:')[1].trim();
        }
    }

    if (currentCriteria) {
        parsedFeedback.push({
            name: currentCriteria,
            score: currentScore,
            total: currentTotal,
            comments: currentComments
        });
    }

    return parsedFeedback;
}

const parseRubricWithGPT4 = async (rubricURL) => {
    try {
        const extractedText = await getTextFromPDF(rubricURL);
        console.log(extractedText);
        const gradingResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            max_tokens: 3000,
            messages: [
                {
                    role: "system", content: `

                    You are a JSON rubric formatting expert. I need you to convert any rubric provided to you into a specific JSON array format
                    
                    The rubric will have categories, each with different levels of achievement and corresponding descriptions. Here's the required JSON structure:
                    [
                        {
                            "name": "Category Name",
                            "values": [
                                {
                                    "point": Achievement Level,
                                    "description": "Description of the achievement level."
                                },
                                {
                                    "point": Achievement Level,
                                    "description": "Description of the achievement level."
                                },
                                ...
                            ]
                        },
                        ...
                    ]


                    Steps to follow:
                    Identify the categories: Each category in the rubric should be represented as a separate object in the JSON array.
                    Extract achievement levels: For each category, list all the achievement levels and their descriptions.
                    Format the JSON: Ensure the JSON is correctly formatted with the following keys:
                    "name": The name of the category.
                    "values": An array of objects, each representing an achievement level with:
                    "point": The point or level of achievement (as in integer) give in decreasing order
                    "description": A description of what that level entails.

                    Below is an example output:

                    [
                        {
                            "name": "Title",
                            "values": [
                                {
                                    "point": 2,
                                    "description": "Has a clear title. Title is engaging and relevant to the essay."
                                },
                                {
                                    "point": 1,
                                    "description": "Has a title, but it is irrelevant to the essay or lacks creativity."
                                },
                                {
                                    "point": 0,
                                    "description": "Title is missing."
                                }
                            ]
                        },
                        {
                            "name": "Format",
                            "values": [
                                {
                                    "point": 4,
                                    "description": "Complete name, teacher's name, subject/period, and date is listed in the top left corner like MLA format. The student's last name and page number is in the top right corner of each page."
                                },
                                {
                                    "point": 3,
                                    "description": "Matches MLA format for a score of 4 for the most part, but may be missing one detail."
                                },
                                {
                                    "point": 2,
                                    "description": "Missing a majority of the details from score 4, but has a couple."
                                },
                                {
                                    "point": 1,
                                    "description": "MLA format for score 4 is missing or lacking the proper format for the most part."
                                }
                            ]
                        }
                    ]

                ` },
                {
                    role: "user", content: `Parse the following rubric text into a structured format.

                    rubric:
                        ${extractedText}`
                }
            ]
        });

        if (gradingResponse && gradingResponse.choices && gradingResponse.choices.length > 0) {
            console.log(gradingResponse.choices[0].message.content)
            return convertToRubricSchema(gradingResponse.choices[0].message.content);
        } else {
            throw new Error("Failed to get a valid response from GPT-4");
        }
    } catch (error) {
        console.error("Error parsing rubric:", error);
        throw new Error("Failed to parse rubric");
    }
};

function convertToRubricSchema(gptOutput) {
    if (!gptOutput) return [];

    // Extract the JSON part from the output using regex
    const jsonMatch = gptOutput.match(/```(?:json)?([\s\S]*?)```/);
    if (!jsonMatch || jsonMatch.length < 2) return [];

    const jsonContent = jsonMatch[1].trim();

    // Parse the JSON content
    const rubrics = JSON.parse(jsonContent);

    return rubrics;
}


const grade = async (rubric, essay, gradingPrompt, teacherId) => {
    // Convert rubric to a string format suitable for grading
    const rubricString = rubricToString(rubric);

    // Fetch old graded essays for the specific teacher
    const oldEssays = await fetchOldGradedEssays(teacherId);
    console.log("oldessays", oldEssays);
    let oldEssaysText = '';

    // Extract text from each old graded essay
    for (let oldEssay of oldEssays) {
        let extractedText = '';
        if (oldEssay.pdfURL.endsWith('.pdf')) {
            extractedText = await getTextFromPDF(oldEssay.pdfURL);
        }

        if (extractedText) {
            oldEssaysText += extractedText + '\n\n'; // Concatenate texts
        }
    }

    console.log(oldEssaysText);


    // Prepare the payload for the Python server
    const payload = {
        rubric: rubricString,
        essay: essay,
        prompt: gradingInstructions,
        old_essays: oldEssaysText
    };

    // Send the grading request to the Python server
    try {
        const response = await fetch("http://ec2-3-20-99-69.us-east-2.compute.amazonaws.com:5001/grade-essay", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Failed to grade the essay');
        }

        const result = await response.json();
        return result;  // This result contains the grading feedback and scores
    } catch (error) {
        console.error("Error grading essay:", error);
        return null;
    }
};

// Helper function to fetch old graded essays for a specific teacher
const fetchOldGradedEssays = async (teacherId) => {

    try {
        // Find the teacher by their ID
        const teacher = await User.findOne({ id: teacherId });

        console.log(teacherId)

        if (!teacher) {
            throw new Error("Teacher not found");
        }

        // Filter and return only the old graded essays
        return teacher.uploadedFiles.filter(file => file.isOldGradedEssay);
    } catch (error) {
        console.error("Error fetching old graded essays:", error);
        return [];
    }
};

const gradeall = async (req, res) => {
    const assignmentId = req.params.id;

    if (req.user.authority !== "teacher") {
        return res.status(403).json({ error: "Only teachers can grade assignments" });
    }

    try {
        const assignment = await Assignment.findById(assignmentId);

        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        for (let submission of assignment.submissions) {
            if (submission.status !== 'graded') {
                submission.status = 'grading';
            }
        }
        await assignment.save(); 

        const gradingPromises = assignment.submissions.map(async (submission) => {
            if (submission.status === 'grading') {
                let extractedText = '';
                if (submission.pdfURL.endsWith('.pdf')) {
                    extractedText = await getTextFromPDF(submission.pdfURL);
                } else {
                    submission.status = 'error';
                    submission.feedback = 'Unsupported file format';
                    return submission;
                }

                if (!extractedText) {
                    submission.status = 'error';
                    submission.feedback = 'Failed to extract text from file';
                    return submission;
                }

                const aiScore = await fetchAIScore(extractedText);
                if (!aiScore) {
                    submission.status = 'error';
                    submission.feedback = 'Failed to fetch AI detection score';
                    return submission;
                }

                submission.aiScore = formatAIScore(aiScore.Fake);  // Save formatted AI score
                
                const gradingResult = await grade(assignment.rubric, extractedText, gradingInstructions, req.user.id);
                console.log("Grading Result:", gradingResult);

                if (gradingResult && gradingResult.feedback) {
                    // Use the grading result from the Python server
                    submission.feedback = parseFeedback(gradingResult.feedback);
                    submission.status = 'graded';
                } else {
                    // If gradingResult is not available, fallback to the OpenAI-based grading
                    const rubricString = rubricToString(assignment.rubric);
                    const gradingResponse = await openai.chat.completions.create({
                        model: "gpt-4o",
                        max_tokens: 3000,
                        messages: [
                            { role: "user", content: gradingInstructions },
                            { role: "user", content: rubricString },
                            { role: "user", content: extractedText }
                        ]
                    });

                    if (!gradingResponse || !gradingResponse.choices || gradingResponse.choices.length === 0) {
                        submission.status = 'error';
                        submission.feedback = 'Failed to grade the submission';
                    } else {
                        const feedback = gradingResponse.choices[0].message.content;
                        submission.feedback = parseFeedback(feedback);
                        submission.status = 'graded';
                    }
                }


                const user = await User.findById(req.user._id);

                if (user.numGraded === undefined) {
                    user.numGraded = 0;
                }
                user.numGraded++;
                await user.save();

                return submission;
            }
        });

        const gradedSubmissions = await Promise.all(gradingPromises);

        for (let submission of gradedSubmissions) {
            await assignment.save(); 
        }

        res.json({ message: "All submissions graded successfully" });
    } catch (error) {
        console.error("Error grading assignments:", error);
        res.status(500).send('Error grading assignments');
    }
};





const gradeSubmission = async (req, res) => {
    const { assignmentId } = req.params;
    const { text } = req.body;
    const aiDetectionToken = process.env.AIDETECT; // Replace with your actual token

    if (!text) {
        return res.status(400).json({ error: "No text provided" });
    }

    try {
        const assignment = await Assignment.findById(assignmentId);

        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        // Find the specific submission
        const submission = assignment.submissions.find(sub => sub.studentId === req.user._id);

        if (!submission) {
            return res.status(404).json({ error: "Submission not found" });
        }

        // Set the submission status to 'grading'
        submission.status = 'grading';
        await assignment.save();

        const rubricString = rubricToString(assignment.rubric);

        const gradingResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            max_tokens: 3000,
            messages: [
                { role: "user", content: gradingInstructions },
                { role: "user", content: rubricString },
                { role: "user", content: text }
            ]
        });

        if (!gradingResponse || !gradingResponse.choices || gradingResponse.choices.length === 0) {
            return res.status(500).json({ error: "Failed to grade submission" });
        }

        const feedback = gradingResponse.choices[0].message.content;

        // Set the submission status to 'graded' and save the feedback
        submission.status = 'graded';
        submission.feedback = parseFeedback(feedback);
        await assignment.save();

        res.json({ feedback });
    } catch (error) {
        console.error("Error grading submission:", error);
        res.status(500).send('Error grading submission');
    }
};


const extractText = async (req, res) => {
    try {
        const result = await getTextFromPDF("https://example.com/sample.pdf");
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            max_tokens: 1000,
            messages: [
                {
                    "role": "assistant", "content": `You are a Grader for essays.You will read given essay and then based on the rubric below you will give in depth feedback based on each criteria and then a score for each criteria.You will then give the total score. 

                    This is how each grading rubric should be formatted:

                """
            ** Criteria Name **:
                    ** Comments / suggestions **:
                    ** Score **: ** (score) / subtotal **
        """
                    
                    Also give the total scores at the end in this format:
                    
                    *** TOTALSCORE ***:

            Grade for a middle school level, and do not grade too harshly.Try to make scores fall between 100 to 70, closer to 100.

                `

                },
                {
                    "role": "assistant", "content": `
        Rubric: \n
                Content and Depth of Analysis(25 points), \n
                Structure and Organization(25 points), \n
                Argument Strength and Persuasiveness(25 points), \n
                Clarity and Language Use(15 points), \n
                Originality and Insight(10 points) \n` },
                { "role": "user", "content": result }
            ]
        });

        res.json(response);
    } catch (error) {
        console.error("Error with OpenAI request:", error);
        res.status(500).send('Error with OpenAI request');
    }
};

const completion = async (req, res) => {
    try {
        const prompt = req.body.prompt;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: prompt
        });

        res.json(response);
    } catch (error) {
        res.status(500).send('Error with OpenAI request');
    }
};

const test = async (req, res) => { };

module.exports = {
    completion,
    test,
    extractText,
    gradeall,
    gradeSubmission,
    parseRubricWithGPT4
};
