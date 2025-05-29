const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

console.log("Initializing SNS client with config:", {
  region: process.env.AWS_REGION,
  hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
  hasTopicArn: !!process.env.SNS_TOPIC_ARN,
});

const snsClient = new SNSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const sendGradingNotification = async (
  instructorEmail,
  studentName,
  assignmentName,
  grade
) => {
  try {
    console.log("Sending SNS notification with params:", {
      instructorEmail,
      studentName,
      assignmentName,
      grade,
      region: process.env.AWS_REGION,
      topicArn: process.env.SNS_TOPIC_ARN,
    });

    if (!process.env.AWS_REGION) {
      throw new Error("AWS_REGION is not set in environment variables");
    }
    if (!process.env.SNS_TOPIC_ARN) {
      throw new Error("SNS_TOPIC_ARN is not set in environment variables");
    }
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error("AWS credentials are not set in environment variables");
    }

    const message = {
      default: `Grading completed for ${studentName}`,
      email: `Grading completed for ${studentName}\nAssignment: ${assignmentName}\nGrade: ${grade}\n\nThis is an automated notification from Tallyrus.`,
    };

    const params = {
      TopicArn: process.env.SNS_TOPIC_ARN,
      Message: JSON.stringify(message),
      MessageStructure: "json",
      Subject: `Grading Completed: ${assignmentName}`,
      MessageAttributes: {
        "instructor.email": {
          DataType: "String",
          StringValue: instructorEmail,
        },
      },
    };

    console.log("SNS params:", params);
    const command = new PublishCommand(params);
    console.log("Sending SNS command...");
    const result = await snsClient.send(command);
    console.log("SNS send result:", result);

    console.log("Notification sent successfully");
  } catch (error) {
    console.error("Error sending notification:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      requestId: error.$metadata?.requestId,
      stack: error.stack,
    });
    throw error;
  }
};

module.exports = {
  sendGradingNotification,
};
