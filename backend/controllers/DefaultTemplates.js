const defaultTemplates = [
  {
    title: "Pergi Tutorial",
    description: "This is how to use Pergi",
    image: "",
    icon: "",
    public: false,
    template: [
      {
        type: "header",
        context: "These are headers where whatever you want to type and have preset",
      },
      {
        type: "textbox",
        context: "Textboxes are where you have the text you would rewrite",
      },
      {
        type: "selector",
        context: ["easy", "medium", "hard"],
      },
      {
        type: "header",
        context: "Lastly click submit to send the full message to the AI",
      }
    ],
  },
  {
    title: "Professional Email Editing",
    description: "Edit your professional emails with ease.",
    image: "",
    icon: "",
    public: false,
    template: [
      {
        type: "header",
        context: "Subject Line",
      },
      {
        type: "textbox",
        context: "Compose your email here...",
      },
      {
        type: "textbox",
        context: "Additional notes or instructions...",
      },
      {
        type: "header",
        context: "Review and Send",
      },
    ],
  },
  {
    title: "Cover Letter Editing",
    description: "Edit your cover letter professionally.",
    image: "",
    icon: "",
    public: false,
    template: [
      {
        type: "header",
        context: "Job Title and Company",
      },
      {
        type: "textbox",
        context: "Compose your cover letter here...",
      },
      {
        type: "textbox",
        context: "Additional notes or instructions...",
      },
      {
        type: "header",
        context: "Review and Finalize",
      },
    ],
  },
  {
    title: "Recipe Maker",
    description: "Create your own recipes with ingredients.",
    image: "",
    icon: "",
    public: false,
    template: [
      {
        type: "header",
        context: "Recipe Title",
      },
      {
        type: "textbox",
        context: "List of ingredients (separated by commas)",
      },
      {
        type: "textbox",
        context: "Step-by-step instructions...",
      },
      {
        type: "header",
        context: "Cooking Tips",
      },
    ],
  },
  {
    title: "Explain Code Template",
    description: "Describe code functionality and usage.",
    image: "",
    icon: "",
    public: false,
    template: [
      {
        type: "header",
        context: "Code Title",
      },
      {
        type: "textbox",
        context: "Insert your code here...",
      },
      {
        type: "textbox",
        context: "Additional notes or instructions...",
      },
      {
        type: "header",
        context: "Explanation and Usage",
      },
    ],
  },
];

module.exports = defaultTemplates;
