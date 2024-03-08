const OpenAI = require('openai');
const mongoose = require("mongoose");
const Classroom = require("../models/classroomModel");
const User = require("../models/userModel");
const Assignment = require("../models/assignmentModel");


require("dotenv").config();


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

// const trialtextex = async (req, res) => {
// // Check if req.files is undefined or req.files.file is not present

//     const options = {
//         normalizeWhitespace: true,
//         disableCombineTextItems: true
//     };

//     pdfParse("https://aigradertestbucket.s3.us-west-1.amazonaws.com/2024-01-05T02-13-20.145Z-CHI%2010%20rough%20draft%20%283%29.pdf", options).then(result => {
//         res.send(result.text);
//     });
// };




const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


/*
do it like this:
parse thru each  submission on the front end and then  

*/
function rubricToString(rubrics) {
    let rubricString = '';

    rubrics.forEach(rubric => {
        rubricString += `Topic and Total points: ${rubric.name}\n`;

        rubric.values.forEach(value => {
            rubricString += `  - ${value.point} points = ${value.description}\n`;
        });

        rubricString += '\n'; // Adding a newline for separation between rubrics
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
            // Start of a new criteria
            if (currentCriteria) {
                // Save the previous criteria
                parsedFeedback.push({
                    name: currentCriteria,
                    score: currentScore,
                    total: currentTotal,
                    comments: currentComments,
                });
            }
            // Parse the new criteria
            currentCriteria = trimmedLine.split('**Criteria Name**:')[1].trim();
            currentComments = null;
            currentScore = null;
            currentTotal = null;
        } else if (trimmedLine.startsWith('**Score**:')) {
            // Parse the score
            const scoreText = trimmedLine.split('**Score**:')[1].trim().replace(/\*/g, ''); // Remove asterisks
            const scoreParts = scoreText.split('/');
            console.log(scoreParts[0])
            currentScore = parseInt(scoreParts[0], 10); // Parse the achieved score as an integer
            currentTotal = parseInt(scoreParts[1], 10);

        } else if (trimmedLine.startsWith('**Comments/suggestions**:')) {
            // Parse the comments
            currentComments = trimmedLine.split('**Comments/suggestions**:')[1].trim();
        }
    }

    // Add the last criteria
    if (currentCriteria) {
        parsedFeedback.push({
            name: currentCriteria,
            score: currentScore,
            total: currentTotal,
            comments: currentComments
        });
    }
    console.log("inside parsedFeedback", parsedFeedback);

    return parsedFeedback;
}



const gradeall = async (req, res) => {
    const assignmentId = req.params.id;

    if (req.user.authority !== "teacher") {
        return res.status(403).json({ error: "Only teachers can grade assignments" });
    }

    try {
        // Fetch the assignment by ID
        const assignment = await Assignment.findById(assignmentId);

        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        console.log('assignment found')

        // Iterate through each submission
        console.log(assignment.submissions);
        for (let submission of assignment.submissions) {
            console.log('GRADING AN ASSIGNMENT NOW')

            // Check if the submission is not already graded
            if (submission.status !== 'graded') {
                console.log("submission name", submission.pdfKey);
                // Extract and grade the text from the submission's PDF
                const extractedText = await getTextFromPDF(submission.pdfURL);

                if (!extractedText) {
                    console.log("POOP")
                    submission.status = 'error';
                    submission.feedback = 'Failed to extract text from PDF';
                    await assignment.save();
                    continue; // Skip this submission and continue with the next one
                }

                console.log(extractedText);
                console.log(assignment.rubric);

                const newrubric = rubricToString(assignment.rubric);

                console.log("This is the rubic: ", newrubric);
                const gradingResponse = await openai.chat.completions.create({
                    model: "gpt-4-0125-preview",
                    max_tokens: 1500,
                    messages: [{
                        "role": "user", "content": `You are a Grader for essays. You will read given essay and then based on the rubric below you will give in depth feedback based on each criteria and then a score for each criteria. You will then give the total score. 
                        Give extremely indepth paragraphs of feedback, comments and suggestions on each criteria on what was done well, what could be improved and suggestions and tips on how to improve. And use examples on how it can be better and/or how it can be rewritten/rephrased.

                        Now this is how each grading rubric should be formatted:
                        
                        """
                        **Criteria Name**: **Name of the Criteria**

                        **Score**: **(score)/subtotal**

                        **Comments/suggestions**: The Comments and Suggestions you have based on the rubric and how the writing is.
                        """
                        
                        Also give the total scores at the end in this format:
                        
                        ***TOTALSCORE***: ***(score)/total***
                        
                        Do not grade too harshly. Try to make scores fall between 100 to 80, closer to 100. Also you can give scores between 2  levels of achievement, for instance if only 20 points and 10 points are specified you should give points between this range if deserved.
                        
                        Here is an examples:


                        **Criteria Name**: **Clarity of Thesis**

                        **Score**: **23/25**

                        **Comments/suggestions**: The thesis statement in your essay is exceptionally clear, concise, and well-defined. It effectively introduces the topic of the challenging life of young Mexican American men in "Always Running" and highlights the key factors influencing gang involvement, such as the role of a racist police force and the positive impact of mentorship, particularly Chente Ramírez. The thesis sets a strong foundation for the rest of the essay, providing a clear roadmap for the subsequent analysis.

                        **Criteria Name**: **Analysis**

                        **Score**: **24/25**

                        **Comments/suggestions**: Your analysis in the essay is thorough, insightful, and well-supported by evidence from the text. You delve deep into Rodriguez's portrayal of the police force as oppressors, examining specific examples from the book to illustrate the systemic issues of racism and brutality within law enforcement. Furthermore, your analysis of the psychological factors driving gang involvement, the impact of mentorship, and the contrasting approaches to power and strength presented by Rodriguez and Chente Ramírez is well-developed and thought-provoking. Your essay effectively connects these analyses to the broader societal structures and challenges the reader to rethink their perceptions.

                        ***TOTALSCORE***: ***47/50***

                        `

                    },
                    { "role": "user", "content": newrubric },
                    { "role": "user", "content": extractedText }
                    ]
                });

                if (!gradingResponse) {
                    return res.status(400).json({ error: "couldn't grade text" });
                }
                const gradedfeedback = gradingResponse.choices[0].message.content;
                submission.feedback = await parseFeedback(gradedfeedback); // Assuming gradingResponse contains the feedback
                console.log(gradedfeedback)
                console.log("FEEDBACK", submission.feedback);
                console.log(assignment.rubric);
                console.log("submission name", submission.pdfKey);
                submission.status = 'graded';
            }
            await assignment.save();
        }
        console.log('GRADING DONE')


        res.json({ message: "All submissions graded successfully" });
    } catch (error) {
        console.error("Error grading assignments:", error);
        res.status(500).send('Error grading assignments');
    }
};

const gradeSubmission = async (req, res) => {
    const { assignmentId } = req.params;
    const { text } = req.body; // Extracted text from the PDF sent from the frontend

    if (!text) {
        return res.status(400).json({ error: "No text provided" });
    }

    try {
        const assignment = await Assignment.findById(assignmentId);

        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        // Assuming you have a function or method to convert the assignment rubric to a string format
        const rubricString = rubricToString(assignment.rubric);

        console.log(rubricString)

        const gradingResponse = await openai.chat.completions.create({
            model: "gpt-4-0125-preview",
            max_tokens: 1500,
            messages: [
                {
                    "role": "user",
                    "content": `You are a Grader for essays. You will read given essay and then based on the rubric below you will give in depth feedback based on each criteria and then a score for each criteria. You will then give the total score. 
                    Give extremely indepth paragraphs of feedback, comments and suggestions on each criteria on what was done well, what could be improved and suggestions and tips on how to improve. And use examples on how it can be better and/or how it can be rewritten/rephrased.

                    Now this is how each grading rubric should be formatted:
                    
                    """
                    **Criteria Name**: **Name of the Criteria**

                    **Score**: **(score)/subtotal**

                    **Comments/suggestions**: The Comments and Suggestions you have based on the rubric and how the writing is.
                    """
                    
                    Also give the total scores at the end in this format:
                    
                    ***TOTALSCORE***: ***(score)/total***
                    
                    Do not grade too harshly. Try to make scores fall between 100 to 80, closer to 100. Also you can give scores between 2  levels of achievement, for instance if only 20 points and 10 points are specified you should give points between this range if deserved.
                    
                    Here is an examples:


                    **Criteria Name**: **Clarity of Thesis**

                    **Score**: **23/25**

                    **Comments/suggestions**: The thesis statement in your essay is exceptionally clear, concise, and well-defined. It effectively introduces the topic of the challenging life of young Mexican American men in "Always Running" and highlights the key factors influencing gang involvement, such as the role of a racist police force and the positive impact of mentorship, particularly Chente Ramírez. The thesis sets a strong foundation for the rest of the essay, providing a clear roadmap for the subsequent analysis.

                    **Criteria Name**: **Analysis**

                    **Score**: **24/25**

                    **Comments/suggestions**: Your analysis in the essay is thorough, insightful, and well-supported by evidence from the text. You delve deep into Rodriguez's portrayal of the police force as oppressors, examining specific examples from the book to illustrate the systemic issues of racism and brutality within law enforcement. Furthermore, your analysis of the psychological factors driving gang involvement, the impact of mentorship, and the contrasting approaches to power and strength presented by Rodriguez and Chente Ramírez is well-developed and thought-provoking. Your essay effectively connects these analyses to the broader societal structures and challenges the reader to rethink their perceptions.

                    ***TOTALSCORE***: ***47/50***

                    `

                },
                {
                    "role": "user",
                    "content": rubricString
                },
                {
                    "role": "user",
                    "content": text // The actual text extracted from the PDF
                }
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
        // Check if req.files is undefined or req.files.file is not present
        // Proceed with file processing

        const result = await getTextFromPDF("https://aigradertestbucket.s3.us-west-1.amazonaws.com/2024-01-05T07-31-34.283Z-CHI+10+rough+draft+(3).pdf");
        console.log(result)
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            max_tokens: 1000,
            messages: [
                {
                    "role": "assistant", "content": `You are a Grader for essays. You will read given essay and then based on the rubric below you will give in depth feedback based on each criteria and then a score for each criteria. You will then give the total score. 

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
                {
                    "role": "assistant", "content": `
                Rubric:\n
                Content and Depth of Analysis (25 points),\n
                Structure and Organization (25 points),\n
                Argument Strength and Persuasiveness (25 points),\n
                Clarity and Language Use (15 points),\n
                Originality and Insight (10 points)\n` },
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

        console.log("prompt is " + prompt)

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: prompt
        });


        res.json(response);
    } catch (error) {
        res.status(500).send('Error with OpenAI request');
    }
};



const test = async (req, res) => {

};


module.exports = {
    completion,
    test,
    extractText,
    gradeall,
    gradeSubmission
}