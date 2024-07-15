const OpenAI = require('openai');
const mongoose = require("mongoose");
const Classroom = require("../models/classroomModel");
const User = require("../models/userModel");
const Assignment = require("../models/assignmentModel");
const mammoth = require("mammoth");
require("dotenv").config();

const gradingInstructions = `Your grading instructions here`;

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

async function getTextFromDOCX(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const { value: extractedText, messages } = await mammoth.extractRawText({ arrayBuffer });
        messages.forEach(message => console.log("Message:", message));
        return extractedText;
    } catch (error) {
        console.error("Error fetching or converting document:", error);
        return null;
    }
}

async function getTextFromImage(imagePath) {
    try {
        const response = await openai.images.generate({
            image: imagePath,
            request_text: true,
            prompt: 'Extract the text from this image',
        });
        return response.data.text;
    } catch (error) {
        console.error("Error extracting text from image:", error);
        return null;
    }
}

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
                let extractedText = ' ';
                if (submission.pdfURL.endsWith('.pdf')) {
                    extractedText = await getTextFromPDF(submission.pdfURL);
                } else if (submission.pdfURL.endsWith('.docx')) {
                    extractedText = await getTextFromDOCX(submission.pdfURL);
                } else if (['.png', '.jpg', '.jpeg'].some(ext => submission.pdfURL.endsWith(ext))) {
                    extractedText = await getTextFromImage(submission.pdfURL);
                } else {
                    submission.status = 'error';
                    submission.feedback = 'Unsupported file format';
                    await assignment.save();
                    continue;
                }

                if (!extractedText) {
                    submission.status = 'error';
                    submission.feedback = 'Failed to extract text from file';
                    await assignment.save();
                    continue;
                }

                const newrubric = rubricToString(assignment.rubric);
                const gradingResponse = await openai.chat.completions.create({
                    model: "gpt-4o",
                    max_tokens: 3000,
                    messages: [
                        { role: "user", content: gradingInstructions },
                        { role: "user", content: newrubric },
                        { role: "user", content: extractedText }
                    ]
                });

                if (!gradingResponse) {
                    return res.status(400).json({ error: "couldn't grade text" });
                }
                const gradedfeedback = gradingResponse.choices[0].message.content;
                submission.feedback = parseFeedback(gradedfeedback);
                submission.status = 'graded';
            }
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

    if (!text) {
        return res.status(400).json({ error: "No text provided" });
    }

    try {
        const assignment = await Assignment.findById(assignmentId);

        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

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

        const feedback = gradingResponse.choices[0].message.content;

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
                    role: "assistant", content: `You are a Grader for essays. You will read given essay and then based on the rubric below you will give in depth feedback based on each criteria and then a score for each criteria. You will then give the total score.

                    This is how each grading rubric should be formatted:

                    """
                    **Criteria Name**:
                    **Comments/suggestions**:
                    **Score**: **(score)/subtotal**
                    """

                    Also give the total scores at the end in this format:

                    ***TOTALSCORE***:

                    Grade for a middle school level, and do not grade too harshly. Try to make scores fall between 100 to 70, closer to 100.
                    `
                },
                { role: "assistant", content: `Rubric:\nContent and Depth of Analysis (25 points),\nStructure and Organization (25 points),\nArgument Strength and Persuasiveness (25 points),\nClarity and Language Use (15 points),\nOriginality and Insight (10 points)\n` },
                { role: "user", content: result }
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

const test = async (req, res) => {};

module.exports = {
    completion,
    test,
    extractText,
    gradeall,
    gradeSubmission,
};
