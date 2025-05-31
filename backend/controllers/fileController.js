const uploadTeacherFiles = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const files = req.files;
    const isHandwriting = req.body.isHandwriting === 'true'; // Convert string to boolean

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Process each file
    for (const file of files) {
      const submission = {
        studentName: file.originalname.split('.')[0], // Use filename as student name
        studentEmail: "teacher_upload@example.com", // Placeholder email
        pdfURL: file.path,
        dateSubmitted: new Date(),
        status: "grading",
        isHandwriting: isHandwriting // Store handwriting status
      };

      assignment.submissions.push(submission);
    }

    await assignment.save();

    res.json({ message: "Files uploaded successfully", submissions: assignment.submissions });
  } catch (error) {
    console.error("Error uploading teacher files:", error);
    res.status(500).json({ error: "Error uploading files" });
  }
}; 