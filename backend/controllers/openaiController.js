const mongoose = require("mongoose");
const Classroom = require("../models/classroomModel");
const User = require("../models/userModel");
const Assignment = require("../models/assignmentModel");
// const mammoth = require("mammoth");
require("dotenv").config();
const { ChatOpenAI } = require("@langchain/openai");
const { llm, functions } = require("../utils/langsmith");
const { incrementGraded } = require("./authController");
const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const testLangSmith = async (req, res) => {
  try {
    console.log("Testing LangSmith integration with direct LLM call");
    const messages = [
      {
        role: "user",
        content: "Hello, provide a short response to test LangSmith tracing",
      },
    ];

    console.log("About to invoke LLM");
    const response = await llm.invoke(messages);
    console.log("LLM invocation complete, response received");

    res.json({ success: true, response });
  } catch (error) {
    console.error("Error testing LangSmith:", error);
    res.status(500).json({ error: error.message });
  }
};
const fetchAIScore = async (text) => {
  const url =
    "http://ec2-3-20-99-69.us-east-2.compute.amazonaws.com:5001/ai-detection"; // Flask server URL

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch AI score");
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

const gradingInstructions = `You are a Grader for essays. You will read the given essay and then based on the rubric below you will give in-depth feedback based on each criteria and then a score for each criteria.
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

async function loadPdfJsLib() {
  const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs");
  return pdfjsLib;
}

async function getTextFromPDF(pdfPath) {
  const pdfjsLib = await loadPdfJsLib();
  const loadingTask = pdfjsLib.getDocument(pdfPath);
  const pdf = await loadingTask.promise;
  let extractedText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    extractedText += textContent.items.map((item) => item.str).join(" ");
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
  let rubricString = "";

  rubrics.forEach((rubric) => {
    rubricString += `Criteria Name : ${rubric.name}\n`;

    rubric.values.forEach((value) => {
      rubricString += `  - ${value.point} points = ${value.description}\n`;
    });

    rubricString += "\n";
  });

  return rubricString;
}

function parseFeedback(gradingResponse) {
  const feedback = gradingResponse;
  const feedbackLines = feedback.split("\n");
  const parsedFeedback = [];

  let currentCriteria = null;
  let currentComments = null;
  let currentScore = null;
  let currentTotal = null;

  for (let line of feedbackLines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("**Criteria Name**:")) {
      if (currentCriteria) {
        parsedFeedback.push({
          name: currentCriteria,
          score: currentScore,
          total: currentTotal,
          comments: currentComments,
        });
      }
      currentCriteria = trimmedLine.split("**Criteria Name**:")[1].trim();
      currentComments = null;
      currentScore = null;
      currentTotal = null;
    } else if (trimmedLine.startsWith("**Score**:")) {
      const scoreText = trimmedLine
        .split("**Score**:")[1]
        .trim()
        .replace(/\*/g, "");
      const scoreParts = scoreText.split("/");
      currentScore = parseFloat(scoreParts[0]);
      currentTotal = parseInt(scoreParts[1], 10);
    } else if (trimmedLine.startsWith("**Comments/suggestions**:")) {
      currentComments = trimmedLine
        .split("**Comments/suggestions**:")[1]
        .trim();
    }
  }

  if (currentCriteria) {
    parsedFeedback.push({
      name: currentCriteria,
      score: currentScore,
      total: currentTotal,
      comments: currentComments,
    });
  }

  return parsedFeedback;
}

const parseRubricWithGPT4 = async (rubricURL) => {
  try {
    const extractedText = await getTextFromPDF(rubricURL);
    console.log(extractedText);
    const messages = [
      {
        role: "system",
        content: `

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

                `,
      },
      {
        role: "user",
        content: `Parse the following rubric text into a structured format.

                    rubric:
                        ${extractedText}`,
      },
    ];
    const gradingResponse = await llm.invoke(messages);
    if (
      gradingResponse &&
      gradingResponse.choices &&
      gradingResponse.choices.length > 0
    ) {
      console.log(gradingResponse.choices[0].message.content);
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
  console.log("Starting grading with LLM...");
  const rubricString = rubricToString(rubric);

  // Fetch old graded essays for the specific teacher
  const oldEssays = await fetchOldGradedEssays(teacherId);
  console.log("oldessays", oldEssays);
  let oldEssaysText = "";

  // Extract text from each old graded essay
  for (let oldEssay of oldEssays) {
    let extractedText = "";
    if (oldEssay.pdfURL.endsWith(".pdf")) {
      extractedText = await getTextFromPDF(oldEssay.pdfURL);
    }

    if (extractedText) {
      oldEssaysText += extractedText + "\n\n"; // Concatenate texts
    }
  }

  console.log(oldEssaysText);

  // Prepare the payload for the Python server
  const payload = {
    rubric: rubricString,
    essay: essay,
    prompt: gradingInstructions,
    old_essays: oldEssaysText,
  };

  // Send the grading request to the Python server
  try {
    const response = await fetch(
      "http://ec2-3-20-99-69.us-east-2.compute.amazonaws.com:5001/grade-essay",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to grade the essay");
    }

    const result = await response.json();
    return result; // This result contains the grading feedback and scores
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

    console.log(teacherId);

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    // Filter and return only the old graded essays
    return teacher.uploadedFiles.filter((file) => file.isOldGradedEssay);
  } catch (error) {
    console.error("Error fetching old graded essays:", error);
    return [];
  }
};

const processHandwrittenPDF = async (pdfPath) => {
  try {
    console.log("Starting handwritten PDF processing for:", pdfPath);
    
    // Get the full URL for the PDF
    const pdfUrl = `${process.env.REACT_APP_API_BACKEND}/${pdfPath}`;
    console.log("PDF URL:", pdfUrl);

    console.log("Sending request to OpenAI Vision API...");
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Please extract and transcribe all the text from this handwritten document. Preserve the structure and formatting as much as possible." },
            {
              type: "image_url",
              image_url: {
                url: pdfUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
    });

    console.log("Full Vision API Response:", {
      model: response.model,
      id: response.id,
      choices: response.choices.map(choice => ({
        message: {
          role: choice.message.role,
          content: choice.message.content,
          contentLength: choice.message.content?.length
        },
        finish_reason: choice.finish_reason
      })),
      usage: response.usage,
      created: response.created
    });

    const extractedText = response.choices[0].message.content;
    console.log("Extracted Text Preview:", {
      length: extractedText.length,
      first100Chars: extractedText.substring(0, 100),
      last100Chars: extractedText.substring(extractedText.length - 100)
    });

    return extractedText;
  } catch (error) {
    console.error("Error in processHandwrittenPDF:", {
      error: error.message,
      stack: error.stack,
      pdfPath,
      errorDetails: error.response?.data || error.response || error
    });
    throw error;
  }
};

const gradeHandwriting = async (req, res) => {
  try {
    console.log("Starting gradeHandwriting process");
    const { assignmentId } = req.params;
    const { pdfPath, isHandwriting } = req.body;

    console.log("Request details:", {
      assignmentId,
      pdfPath,
      isHandwriting,
      hasFile: !!req.file
    });

    if (!pdfPath) {
      console.log("No PDF path provided");
      return res.status(400).json({ error: "No PDF provided" });
    }

    const assignment = await Assignment.findById(assignmentId);
    console.log("Found assignment:", {
      id: assignment?._id,
      name: assignment?.name,
      hasRubric: !!assignment?.rubric
    });

    if (!assignment) {
      console.log("Assignment not found:", assignmentId);
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Find the specific submission
    const submission = assignment.submissions.find(
      (sub) => sub.studentId === req.user._id
    );

    console.log("Found submission:", {
      submissionId: submission?._id,
      studentName: submission?.studentName,
      status: submission?.status
    });

    if (!submission) {
      console.log("Submission not found for user:", req.user._id);
      return res.status(404).json({ error: "Submission not found" });
    }

    // Set the submission status to 'grading'
    submission.status = "grading";
    await assignment.save();
    console.log("Updated submission status to grading");

    // Process the handwritten PDF using Vision API
    console.log("Starting Vision API processing");
    const extractedText = await processHandwrittenPDF(pdfPath);
    console.log("Text extraction complete:", {
      textLength: extractedText.length,
      preview: extractedText.substring(0, 100)
    });

    const rubricString = rubricToString(assignment.rubric);
    console.log("Rubric string generated, length:", rubricString.length);

    // Add handwriting context to the grading instructions
    const handwritingInstructions = `${gradingInstructions}
    Note: This submission is handwritten. Please be more lenient with formatting and structure, 
    focusing on the content and ideas rather than perfect formatting. Consider the challenges 
    of handwriting when evaluating the work.`;

    console.log("Preparing messages for LLM");
    const messages = [
      { role: "user", content: isHandwriting ? handwritingInstructions : gradingInstructions },
      { role: "user", content: rubricString },
      { role: "user", content: extractedText },
    ];

    console.log("Sending to LLM for grading");
    const gradingResponse = await llm.invoke(messages);
    console.log("Received LLM response:", {
      hasResponse: !!gradingResponse,
      hasChoices: !!gradingResponse?.choices,
      choicesLength: gradingResponse?.choices?.length
    });

    if (!gradingResponse || !gradingResponse.choices || gradingResponse.choices.length === 0) {
      console.log("Failed to get valid response from LLM");
      return res.status(500).json({ error: "Failed to grade submission" });
    }

    const feedback = gradingResponse.choices[0].message.content;
    console.log("Generated feedback:", {
      feedbackLength: feedback.length,
      preview: feedback.substring(0, 100)
    });

    // Set the submission status to 'graded' and save the feedback
    submission.status = "graded";
    submission.feedback = parseFeedback(feedback);
    submission.isHandwriting = isHandwriting;
    await assignment.save();
    console.log("Saved graded submission");

    res.json({ feedback, extractedText });
  } catch (error) {
    console.error("Error in gradeHandwriting:", {
      error: error.message,
      stack: error.stack,
      assignmentId: req.params.assignmentId
    });
    res.status(500).send("Error grading submission");
  }
};

const gradeall = async (req, res) => {
  const assignmentId = req.params.id;
  console.log("Starting gradeall process for assignment:", assignmentId);

  if (req.user.authority !== "teacher") {
    console.log("Unauthorized grading attempt by non-teacher user");
    return res
      .status(403)
      .json({ error: "Only teachers can grade assignments" });
  }

  try {
    const assignment = await Assignment.findById(assignmentId);
    console.log("Found assignment:", {
      id: assignment._id,
      name: assignment.name,
      submissionsCount: assignment.submissions.length,
    });

    if (!assignment) {
      console.log("Assignment not found:", assignmentId);
      return res.status(404).json({ error: "Assignment not found" });
    }

    for (let submission of assignment.submissions) {
      if (submission.status !== "graded") {
        console.log("Marking submission for grading:", {
          submissionId: submission._id,
          studentName: submission.studentName,
          previousStatus: submission.status,
        });
        submission.status = "grading";
      }
    }
    await assignment.save();
    console.log("Updated all submission statuses to grading");

    const gradingPromises = assignment.submissions.map(async (submission) => {
      if (submission.status === "grading") {
        console.log("Processing submission:", {
          submissionId: submission._id,
          studentName: submission.studentName,
          pdfURL: submission.pdfURL,
          isHandwriting: submission.isHandwriting
        });

        try {
          let extractedText = "";
          if (submission.pdfURL.endsWith(".pdf")) {
            console.log(
              "Attempting to extract text from PDF:",
              submission.pdfURL
            );
            
            // Use Vision API for handwritten submissions
            if (submission.isHandwriting) {
              extractedText = await processHandwrittenPDF(submission.pdfURL);
            } else {
              extractedText = await getTextFromPDF(submission.pdfURL);
            }
            
            console.log("PDF text extraction result:", {
              success: !!extractedText,
              textLength: extractedText ? extractedText.length : 0,
              first100Chars: extractedText
                ? extractedText.substring(0, 100)
                : null,
            });
          } else {
            console.log("Unsupported file format:", submission.pdfURL);
            submission.status = "error";
            submission.feedback = [
              {
                name: "Error",
                score: 0,
                total: 0,
                comments: "Unsupported file format",
              },
            ];
            return submission;
          }

          if (!extractedText) {
            console.log("Failed to extract text from file");
            submission.status = "error";
            submission.feedback = [
              {
                name: "Error",
                score: 0,
                total: 0,
                comments: "Failed to extract text from file",
              },
            ];
            return submission;
          }

          console.log("Preparing to grade submission with rubric");
          const rubricString = rubricToString(assignment.rubric);
          
          // Add handwriting context to the grading instructions if needed
          const gradingInstructionsWithContext = submission.isHandwriting 
            ? `${gradingInstructions}
               Note: This submission is handwritten. Please be more lenient with formatting and structure, 
               focusing on the content and ideas rather than perfect formatting. Consider the challenges 
               of handwriting when evaluating the work.`
            : gradingInstructions;

          const messages = [
            { role: "user", content: gradingInstructionsWithContext },
            { role: "user", content: rubricString },
            { role: "user", content: extractedText },
          ];

          console.log("Sending to LLM for grading");
          const gradingResponse = await llm.invoke(messages);
          console.log("Received grading response:", {
            success: !!gradingResponse,
            hasContent: !!gradingResponse?.content,
          });

          if (!gradingResponse) {
            console.log("Failed to get grading response from LLM");
            submission.status = "error";
            submission.feedback = [
              {
                name: "Error",
                score: 0,
                total: 0,
                comments: "Failed to grade the submission",
              },
            ];
          } else {
            console.log("Successfully graded submission");
            const feedback = gradingResponse.content;
            submission.feedback = parseFeedback(feedback);
            submission.status = "graded";
          }

          // Use _id instead of id for MongoDB query
          const user = await User.findById(req.user._id);
          if (user.numGraded === undefined) {
            user.numGraded = 0;
          }
          user.numGraded++;
          await user.save();
          console.log("Updated user grading count:", user.numGraded);

          return submission;
        } catch (error) {
          console.error("Error grading submission:", {
            submissionId: submission._id,
            error: error.message,
            stack: error.stack,
          });
          submission.status = "error";
          submission.feedback = [
            {
              name: "Error",
              score: 0,
              total: 0,
              comments: "An error occurred while grading",
            },
          ];
          return submission;
        }
      }
      return submission;
    });

    console.log("Waiting for all grading promises to complete");
    const gradedSubmissions = await Promise.all(gradingPromises);
    console.log("All submissions processed:", {
      total: gradedSubmissions.length,
      graded: gradedSubmissions.filter((s) => s.status === "graded").length,
      errors: gradedSubmissions.filter((s) => s.status === "error").length,
    });

    for (let submission of gradedSubmissions) {
      await assignment.save();
    }

    res.json({ message: "All submissions graded successfully" });
  } catch (error) {
    console.error("Error in gradeall:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).send("Error grading assignments");
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
    const submission = assignment.submissions.find(
      (sub) => sub.studentId === req.user._id
    );

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Set the submission status to 'grading'
    submission.status = "grading";
    await assignment.save();

    const rubricString = rubricToString(assignment.rubric);

    const messages = [
      { role: "user", content: gradingInstructions },
      { role: "user", content: rubricString },
      { role: "user", content: text },
    ];
    const gradingResponse = await llm.invoke(messages);
    if (
      !gradingResponse ||
      !gradingResponse.choices ||
      gradingResponse.choices.length === 0
    ) {
      return res.status(500).json({ error: "Failed to grade submission" });
    }

    const feedback = gradingResponse.choices[0].message.content;

    // Set the submission status to 'graded' and save the feedback
    submission.status = "graded";
    submission.feedback = parseFeedback(feedback);
    await assignment.save();

    res.json({ feedback });
  } catch (error) {
    console.error("Error grading submission:", error);
    res.status(500).send("Error grading submission");
  }
};

const extractText = async (req, res) => {
  try {
    const result = await getTextFromPDF("https://example.com/sample.pdf");
    const messages = [
      {
        role: "assistant",
        content: `You are a Grader for essays.You will read given essay and then based on the rubric below you will give in depth feedback based on each criteria and then a score for each criteria.You will then give the total score. 

                    This is how each grading rubric should be formatted:

                """
            ** Criteria Name **:
                    ** Comments / suggestions **:
                    ** Score **: ** (score) / subtotal **
        """
                    
                    Also give the total scores at the end in this format:
                    
                    *** TOTALSCORE ***:

            Grade for a middle school level, and do not grade too harshly.Try to make scores fall between 100 to 70, closer to 100.

                `,
      },
      {
        role: "assistant",
        content: `
        Rubric: \n
                Content and Depth of Analysis(25 points), \n
                Structure and Organization(25 points), \n
                Argument Strength and Persuasiveness(25 points), \n
                Clarity and Language Use(15 points), \n
                Originality and Insight(10 points) \n`,
      },
      { role: "user", content: result },
    ];
    const response = await llm.invoke(messages);
    res.json(response);
  } catch (error) {
    console.error("Error with OpenAI request:", error);
    res.status(500).send("Error with OpenAI request");
  }
};

const completion = async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await llm.invoke(prompt);

    res.json(response);
  } catch (error) {
    res.status(500).send("Error with OpenAI request");
  }
};

const test = async (req, res) => {};

function generateJoinCode(length = 6) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Handles function calls from the chatbot interface.
 * This function processes user input, determines the appropriate action (create classroom or assignment),
 * and executes the corresponding operation.
 *
 * @param {Object} req - Express request object containing user input and authentication
 * @param {Object} res - Express response object for sending back results
 * @returns {Promise<void>} - Handles the response asynchronously
 */
const handleFunctionCall = async (req, res) => {
  // Extract user input and ID from the request
  const { userInput } = req.body;
  const user_id = req.user.id;

  console.log("Received function call request:", { userInput, user_id });

  // Validate that user input was provided
  if (!userInput) {
    return res.status(400).json({ error: "No user input provided" });
  }

  try {
    // Define the available functions that the AI can call
    const tools = [
      {
        name: "createClassroom",
        description: "Create a new classroom with a title and description",
        parameters: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The title of the classroom",
            },
            description: {
              type: "string",
              description: "A description of the classroom",
            },
          },
          required: ["title"],
        },
      },
      {
        name: "createAssignment",
        description: "Create a new assignment in an existing classroom",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the assignment",
            },
            description: {
              type: "string",
              description: "A description of the assignment",
            },
            classroomName: {
              type: "string",
              description: "The name of the classroom to add the assignment to",
            },
            dueDate: {
              type: "string",
              description:
                'The due date for the assignment. Can be a specific date (YYYY-MM-DD), relative date (e.g., "next week"), or natural language date (e.g., "March 20, 2024")',
            },
          },
          required: ["name", "classroomName"],
        },
      },
      {
        name: "createClassroomWithAssignment",
        description:
          "Create a new classroom and add an assignment to it in one step",
        parameters: {
          type: "object",
          properties: {
            classroomTitle: {
              type: "string",
              description: "The title of the classroom",
            },
            classroomDescription: {
              type: "string",
              description: "A description of the classroom",
            },
            assignmentName: {
              type: "string",
              description: "The name of the assignment",
            },
            assignmentDescription: {
              type: "string",
              description: "A description of the assignment",
            },
            dueDate: {
              type: "string",
              description:
                'The due date for the assignment. Can be a specific date (YYYY-MM-DD), relative date (e.g., "next week"), or natural language date (e.g., "March 20, 2024")',
            },
          },
          required: ["classroomTitle", "assignmentName"],
        },
      },
    ];

    // Prepare the messages for the AI model
    const messages = [
      {
        role: "system",
        content: `You are a helpful teaching assistant that helps teachers manage their classrooms and assignments. You can:
                1. Create classrooms and assignments using the provided functions
                2. Have general conversations about teaching, education, and classroom management
                3. Answer questions about how to use the platform

                Guidelines for conversation:
                - Keep responses professional and education-focused
                - Be concise but friendly
                - If the user asks about creating a classroom or assignment, use the appropriate function
                - For general questions or conversation, respond naturally without using functions
                - Avoid discussing topics unrelated to education or classroom management
                - Don't provide specific teaching advice or curriculum content
                - If unsure about a request, ask for clarification
                
                When using functions:
                - IMPORTANT: If the user wants to create both a classroom AND an assignment in the same request, ALWAYS use createClassroomWithAssignment
                - ONLY use createClassroom if the user ONLY wants to create a classroom
                - ONLY use createAssignment if the user wants to add an assignment to an EXISTING classroom
                - Never use createClassroom and createAssignment separately when the user wants to create both
                - Always try to generate descriptive and helpful descriptions
                - When creating an assignment, make sure to extract both the assignment name and the classroom name from the input
                - For dates, convert relative dates (e.g., "next week", "tomorrow") to specific dates in YYYY-MM-DD format`,
      },
      {
        role: "user",
        content: userInput,
      },
    ];

    console.log("Sending request to LLM with messages:", messages);

    // Call the language model with the prepared messages and tools
    const response = await llm.invoke(messages, {
      functions: tools,
    });

    console.log("Raw LLM response:", response);

    // Extract the function call details from the response
    const functionCall = response.additional_kwargs?.function_call;
    console.log("Function call details:", functionCall);

    let result = null;
    let chatResponse = null;

    // If there's a function call, handle it
    if (functionCall && functionCall.arguments) {
      // Parse the function arguments from the response
      const args = JSON.parse(functionCall.arguments);
      console.log("Parsed function arguments:", args);

      // Handle different types of function calls
      if (functionCall.name === "createClassroom") {
        // Extract parameters for classroom creation
        const { title, description } = args;
        const joincode = generateJoinCode();

        console.log("Creating classroom with:", {
          title,
          description,
          user_id,
          joincode,
        });

        // Create the new classroom in the database
        result = await Classroom.create({
          title,
          description,
          teachers: [user_id],
          students: [],
          assignments: [],
          joincode,
        });

        console.log("Classroom created successfully:", result);
        chatResponse = `I've created a new classroom called "${title}" for you. The join code is ${joincode}. You can share this code with your students so they can join the classroom.`;
      } else if (functionCall.name === "createAssignment") {
        // Extract parameters for assignment creation
        const { name, description, classroomName, dueDate } = args;

        console.log("Looking for classroom:", classroomName);

        // Find the classroom where the user is a teacher
        const classroom = await Classroom.findOne({
          title: { $regex: new RegExp("^" + classroomName + "$", "i") },
          teachers: user_id,
        });

        // Validate that the classroom exists and user has permission
        if (!classroom) {
          console.log(
            "Available classrooms for user:",
            await Classroom.find({ teachers: user_id }).select("title")
          );
          return res.status(404).json({
            error: `No classroom found with name "${classroomName}" where you are a teacher`,
            chatResponse: `I couldn't find a classroom called "${classroomName}" where you're a teacher. Could you please check the classroom name and try again?`,
          });
        }

        // Parse and validate the due date
        let parsedDueDate = null;
        if (dueDate) {
          try {
            const date = new Date(dueDate);

            if (isNaN(date.getTime())) {
              const now = new Date();
              const lowerCaseDate = dueDate.toLowerCase();

              if (lowerCaseDate.includes("next week")) {
                date.setDate(now.getDate() + 7);
              } else if (lowerCaseDate.includes("tomorrow")) {
                date.setDate(now.getDate() + 1);
              } else if (lowerCaseDate.includes("in ")) {
                const daysMatch = lowerCaseDate.match(/in (\d+) days?/);
                if (daysMatch) {
                  date.setDate(now.getDate() + parseInt(daysMatch[1]));
                }
              } else if (lowerCaseDate.includes("next month")) {
                date.setMonth(now.getMonth() + 1);
              }

              if (isNaN(date.getTime())) {
                throw new Error("Could not parse the date");
              }
            }

            parsedDueDate = date.toISOString().split("T")[0];
            console.log("Parsed due date:", parsedDueDate);
          } catch (error) {
            console.error("Error parsing date:", error);
            return res.status(400).json({
              error:
                'Could not understand the date format. Please try using a specific date (e.g., "2024-03-20") or a relative date (e.g., "next week", "tomorrow", "in 3 days")',
              chatResponse:
                "I'm having trouble understanding the due date format. Could you please provide it in a format like '2024-03-20', or use phrases like 'next week', 'tomorrow', or 'in 3 days'?",
            });
          }
        }

        console.log("Creating assignment with:", {
          name,
          description,
          classroomName,
          dueDate: parsedDueDate,
        });

        // Create the new assignment in the database
        const assignmentDescription = description || "No description provided";
        result = await Assignment.create({
          name,
          description: assignmentDescription,
          classId: classroom.id,
          dueDate: parsedDueDate ? new Date(parsedDueDate) : null,
          rubric: [],
          submissions: [],
        });

        // Update the classroom with the new assignment
        classroom.assignments.push(result._id);
        await classroom.save();

        console.log("Assignment created successfully:", result);
        chatResponse = `I've created a new assignment called "${name}" in the "${classroomName}" classroom${
          parsedDueDate ? ` with a due date of ${parsedDueDate}` : ""
        }. Students can now view and submit their work for this assignment.`;
      } else if (functionCall.name === "createClassroomWithAssignment") {
        // Extract parameters for combined creation
        const {
          classroomTitle,
          classroomDescription,
          assignmentName,
          assignmentDescription,
          dueDate,
        } = args;
        const joincode = generateJoinCode();

        // First create the classroom
        const classroom = await Classroom.create({
          title: classroomTitle,
          description: classroomDescription || "No description provided",
          teachers: [user_id],
          students: [],
          assignments: [],
          joincode,
        });

        // Parse and validate the due date
        let parsedDueDate = null;
        if (dueDate) {
          try {
            const date = new Date(dueDate);

            if (isNaN(date.getTime())) {
              const now = new Date();
              const lowerCaseDate = dueDate.toLowerCase();

              if (lowerCaseDate.includes("next week")) {
                date.setDate(now.getDate() + 7);
              } else if (lowerCaseDate.includes("tomorrow")) {
                date.setDate(now.getDate() + 1);
              } else if (lowerCaseDate.includes("in ")) {
                const daysMatch = lowerCaseDate.match(/in (\d+) days?/);
                if (daysMatch) {
                  date.setDate(now.getDate() + parseInt(daysMatch[1]));
                }
              } else if (lowerCaseDate.includes("next month")) {
                date.setMonth(now.getMonth() + 1);
              }

              if (isNaN(date.getTime())) {
                throw new Error("Could not parse the date");
              }
            }

            parsedDueDate = date.toISOString().split("T")[0];
          } catch (error) {
            console.error("Error parsing date:", error);
            return res.status(400).json({
              error: "Could not understand the date format",
              chatResponse:
                "I'm having trouble understanding the due date format. Could you please provide it in a format like '2024-03-20', or use phrases like 'next week', 'tomorrow', or 'in 3 days'?",
            });
          }
        }

        // Then create the assignment
        const assignment = await Assignment.create({
          name: assignmentName,
          description: assignmentDescription || "No description provided",
          classId: classroom.id,
          dueDate: parsedDueDate ? new Date(parsedDueDate) : null,
          rubric: [],
          submissions: [],
        });

        // Update the classroom with the new assignment
        classroom.assignments.push(assignment._id);
        await classroom.save();

        result = { classroom, assignment };
        chatResponse = `I've created a new classroom called "${classroomTitle}" with the join code ${joincode} and added an assignment called "${assignmentName}"${
          parsedDueDate ? ` due on ${parsedDueDate}` : ""
        }. You can share the join code with your students so they can join the classroom and access the assignment.`;
      }
    } else {
      // If no function call, use the response content as a chat response
      chatResponse = response.content;
    }

    // Return success response with the created resource and chat response
    res.status(201).json({
      success: true,
      result,
      chatResponse: chatResponse || "I've completed your request successfully.",
    });
  } catch (error) {
    // Handle errors during function execution
    console.error("Error in handleFunctionCall:", error);
    if (error.message.includes("JSON")) {
      console.error("Invalid JSON in function arguments:", error);
      return res.status(400).json({
        error: "Invalid function arguments received from AI",
        chatResponse:
          "I'm sorry, but I encountered an error processing your request. Could you please try rephrasing it?",
      });
    }
    res.status(500).json({
      error: error.message,
      chatResponse:
        "I apologize, but something went wrong while processing your request. Please try again or contact support if the problem persists.",
    });
  }
};

const potential = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Use the existing grade function with the assignment's rubric and essay
    const result = await grade(
      assignment.rubric,
      assignment.essay,
      gradingInstructions
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in potential grading:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  completion,
  test,
  extractText,
  gradeall,
  gradeSubmission,
  parseRubricWithGPT4,
  testLangSmith,
  handleFunctionCall,
  potential,
  gradeHandwriting,
};
