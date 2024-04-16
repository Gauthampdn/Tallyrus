const PremadeRubrics = [
  {
    Template: 'First Template',
    values: [
      {
        name: "Analysis",
        Criteria: [
          { point: 5, description: 'Criterion 1 for Template 1' },
          { point: 10, description: 'Criterion 2 for Template 1' },
        ],
      },
      {
        name: "Grammar",
        Criteria: [
          { point: 5, description: 'Criterion 1 for Template 1' },
          { point: 10, description: 'Criterion 2 for Template 1' },
        ],
      },
    ],
  },
  {
    "Template": "Informative Text Rubric",
    "values": [
      {
        "name": "Focus",
        "Criteria": [
          { "point": 5, "description": "The text clearly focuses on a compelling topic that informs the reader with ideas, concepts, information, etc." },
          { "point": 4, "description": "The text focuses on an interesting topic that informs the reader with ideas, concepts, information, etc." },
          { "point": 3, "description": "The text focuses on a topic to inform a reader with ideas, concepts, information, etc." },
          { "point": 2, "description": "The text has an unclear topic with some ideas, concepts, information, etc." },
          { "point": 1, "description": "The text has an unidentifiable topic with minimal ideas, concepts, information, etc." }
        ]
      },
      {
        "name": "Development",
        "Criteria": [
          { "point": 5, "description": "The text provides significant facts, definitions, concrete details, and quotations that fully develop and explain the topic. The conclusion provides insight to the implications, explains the significance of the topic, and projects to the future, etc." },
          { "point": 4, "description": "The text provides effective facts, definitions, concrete details, quotations, and examples that sufficiently develop and explain the topic. The conclusion provides the implications, significance of and future relevance of the topic, etc." },
          { "point": 3, "description": "The text provides relevant facts, definitions, concrete details, quotations, and examples that develop and explain the topic. The conclusion ties to and supports the information/explanation." },
          { "point": 2, "description": "The text provides facts, definitions, details, quotations, and examples that attempt to develop and explain the topic. The conclusion merely restates the development." },
          { "point": 1, "description": "The text contains limited facts and examples related to the topic. The text may fail to offer a conclusion." }
        ]
      },
      {
        "name": "Audience",
        "Criteria": [
          { "point": 5, "description": "The author anticipates the audience's background knowledge of the topic. The text consistently addresses and acknowledges level and concerns about the topic. The text addresses the specific needs of the audience." },
          { "point": 4, "description": "The text anticipates the audience's knowledge level and concerns about the topic. The text addresses the specific needs of the audience." },
          { "point": 3, "description": "The text considers the audience's knowledge level and concerns about the claim. The text addresses the needs of the audience." },
          { "point": 2, "description": "The text illustrates an inconsistent awareness of the audience's knowledge level and needs." },
          { "point": 1, "description": "The text lacks an awareness of the audience's knowledge level and needs." }
        ]
      },
      {
        "name": "Cohesion",
        "Criteria": [
          { "point": 5, "description": "The text strategically uses words, phrases, and clauses to link the major sections of text. The text explains the relationships between the topic and the examples and/or facts." },
          { "point": 4, "description": "The text skillfully uses words, phrases, and clauses to link the major sections of the text. The text identifies the relationship between the topic and the examples and/or facts." },
          { "point": 3, "description": "The text uses words, phrases, and clauses to link the major sections of the text. The text connects the topic and the examples and/or facts." },
          { "point": 2, "description": "The text contains limited words, phrases, and clauses to link the major sections of the text. The text attempts to connect the topic and the examples and/or facts." },
          { "point": 1, "description": "The text contains few, if any, words, phrases, and clauses to link the major sections of the text. The text does not connect the topic and the examples and/or facts." }
        ]
      },
      {
        "name": "Language and Style",
        "Criteria": [
          { "point": 5, "description": "The text presents an engaging, formal, and objective tone and uses sophisticated language and topic-specific vocabulary to manage the complexity of the topic." },
          { "point": 4, "description": "The text presents an appropriate formal, objective tone and uses relevant language and topic-specific vocabulary to manage the complexity of the topic." },
          { "point": 3, "description": "The text presents a formal, objective tone and uses precise language and topic-specific vocabulary to manage the complexity of the topic." },
          { "point": 2, "description": "The text illustrates a limited awareness of formal tone and awareness of topic-specific vocabulary." },
          { "point": 1, "description": "The text illustrates a limited or inconsistent tone and awareness of topic-specific vocabulary." }
        ]
      },
      {
        "name": "Conventions",
        "Criteria": [
          { "point": 5, "description": "The text intentionally uses standard English conventions of usage and mechanics along with discipline-specific requirements (i.e. MLA, APA, etc.)." },
          { "point": 4, "description": "The text uses standard English conventions of usage and mechanics along with discipline-specific requirements (i.e. MLA, APA, etc.)." },
          { "point": 3, "description": "The text demonstrates standard English conventions of usage and mechanics along with discipline-specific requirements (i.e. MLA, APA, etc.)." },
          { "point": 2, "description": "The text demonstrates some accuracy in standard English conventions of usage and mechanics." },
          { "point": 1, "description": "The text contains multiple inaccuracies in Standard English conventions of usage and mechanics." }
        ]
      }
    ]
  },
  {
    "Template": "Narrative Text Rubric",
    "values": [
      {
        "name": "Exposition",
        "Criteria": [
          { "point": 5, "description": "The text creatively engages the reader by setting out a well-developed conflict, situation, or observation. It establishes multiple points of view and introduces complex characters." },
          { "point": 4, "description": "The text engages and orients the reader by setting out a conflict, situation, or observation. It establishes one or multiple points of view and well-developed characters." },
          { "point": 3, "description": "The text orients the reader by setting out a conflict, situation, or observation. It establishes one point of view and introduces developed characters." },
          { "point": 2, "description": "The text provides a setting with a vague conflict, situation, or observation. It introduces a narrator and/or underdeveloped characters." },
          { "point": 1, "description": "The text provides a setting that is unclear with a vague conflict, situation, or observation. It has an unclear point of view and underdeveloped narrator and/or characters." }
        ]
      },
      {
        "name": "Narrative Techniques and Development",
        "Criteria": [
          { "point": 5, "description": "The text demonstrates sophisticated narrative techniques such as engaging dialogue, artistic pacing, vivid description, complex reflection, and multiple plot lines to develop characters and events." },
          { "point": 4, "description": "The text demonstrates deliberate use of narrative techniques such as dialogue, pacing, description, reflection, and multiple plot lines to develop characters and events." },
          { "point": 3, "description": "The text uses narrative techniques such as dialogue, description, and reflection to show events and characters." },
          { "point": 2, "description": "The text uses some narrative techniques such as dialogue or description and merely retells events and experiences." },
          { "point": 1, "description": "The text lacks narrative techniques and merely retells events and experiences." }
        ]
      },
      {
        "name": "Organization and Cohesion",
        "Criteria": [
          { "point": 5, "description": "The text creates a seamless progression of experiences or events using multiple techniques such as chronology, flashback, foreshadowing, to build on one another to a coherent whole." },
          { "point": 4, "description": "The text creates a smooth progression of experiences or events using a variety of techniques such as chronology, flashback, foreshadowing, to build one on another to a clear tone and outcome." },
          { "point": 3, "description": "The text creates a logical progression of experiences or events using techniques such as chronology, flashback, to sequence events to build another to a coherent whole." },
          { "point": 2, "description": "The text creates a sequence or progression of experiences or events." },
          { "point": 1, "description": "The text lacks a sequence or progression of experiences or events or presents an illogical sequence of events." }
        ]
      },
      {
        "name": "Style and Conventions",
        "Criteria": [
          { "point": 5, "description": "The text uses eloquent words and phrases, showing details and rich sensory language and mood to convey a realistic picture of the experiences, events, setting, and characters." },
          { "point": 4, "description": "The text uses precise words and phrases, showing details and controlled sensory language and mood to convey a realistic picture of the experiences, events, setting, and characters." },
          { "point": 3, "description": "The text uses words and phrases, telling details and sensory language to convey a vivid picture of the experiences, events, setting, and characters." },
          { "point": 2, "description": "The text uses words and phrases and telling details to convey experiences, events, setting, and characters." },
          { "point": 1, "description": "The text merely tells about experiences, events, settings, and characters." }
        ]
      },
      {
        "name": "Conclusion",
        "Criteria": [
          { "point": 5, "description": "The text moves to a conclusion that artfully follows from and thoughtfully reflects on what is experienced, observed, or resolved over the course of the narrative." },
          { "point": 4, "description": "The text builds to a conclusion that logically follows from and reflects on what is experienced, observed, or resolved over the course of the narrative." },
          { "point": 3, "description": "The text provides a conclusion that follows from and reflects on what is experienced, observed, or resolved over the course of the narrative." },
          { "point": 2, "description": "The text provides a conclusion that follows from what is experienced, observed, or resolved over the course of the narrative." },
          { "point": 1, "description": "The text may provide a conclusion to the events of the narrative." }
        ]
      }
    ]
  },  
  {
    "Template": "Argument Text Rubric",
    "values": [
      {
        "name": "Claim",
        "Criteria": [
          { "point": 5, "description": "The text introduces a compelling claim that is clearly arguable and takes a purposeful position on an issue. The text has a structure and organization that is carefully crafted to support the claim." },
          { "point": 4, "description": "The text introduces a precise claim that is clearly arguable and takes an identifiable position on an issue. The text has an effective structure and organization that is aligned with the claim." },
          { "point": 3, "description": "The text introduces a claim that is arguable and takes a position. The text has a structure and organization that is aligned with the claim." },
          { "point": 2, "description": "The text contains an unclear or emerging claim that suggests a vague position. The text attempts a structure and organization to support the position." },
          { "point": 1, "description": "The text contains an unidentifiable claim or vague position. The text has limited structure and organization." }
        ]
      },
      {
        "name": "Development",
        "Criteria": [
          { "point": 5, "description": "The text provides convincing and relevant data and evidence to back up the claim and effectively addresses counterclaims. The conclusion strengthens the claim and evidence." },
          { "point": 4, "description": "The text provides sufficient and relevant data and evidence to back up the claim and addresses counterclaims fairly. The conclusion effectively reinforces the claim and evidence." },
          { "point": 3, "description": "The text provides sufficient data and evidence to back up the claim and addresses counterclaims. The conclusion ties to the claim and evidence." },
          { "point": 2, "description": "The text provides data and evidence that attempts to back up the claim and unclearly addresses counterclaims or lacks counterclaims. The conclusion merely restates the position." },
          { "point": 1, "description": "The text contains limited data and evidence related to the claim and counterclaims or lacks counterclaims. The text may fail to conclude the argument or position." }
        ]
      },
      {
        "name": "Audience",
        "Criteria": [
          { "point": 5, "description": "The text consistently addresses the audience's knowledge level and concerns about the claim. The text addresses the specific needs of the audience." },
          { "point": 4, "description": "The text anticipates the audience's knowledge level and concerns about the claim. The text addresses the specific needs of the audience." },
          { "point": 3, "description": "The text considers the audience's knowledge level and concerns about the claim. The text addresses the needs of the audience." },
          { "point": 2, "description": "The text illustrates an inconsistent awareness of the audience's knowledge level and needs." },
          { "point": 1, "description": "The text lacks an awareness of the audience's knowledge level and needs." }
        ]
      },
      {
        "name": "Cohesion",
        "Criteria": [
          { "point": 5, "description": "The text strategically uses words, phrases, and clauses to link the major sections of the text. The text explains the relationships between the claim and reasons as well as between evidence and reasons, and between claims and counterclaims." },
          { "point": 4, "description": "The text skillfully uses words, phrases, and clauses to link the major sections of the text. The text identifies the relationship between the claim and reasons as well as the evidence. The text effectively links the counterclaims to the claim." },
          { "point": 3, "description": "The text uses words, phrases, and clauses to link the major sections of the text. The text connects the claim and reasons. The text links the counterclaims to the claim." },
          { "point": 2, "description": "The text contains limited words, phrases, and clauses to link the major sections of the text. The text does not connect the claims and reasons." },
          { "point": 1, "description": "The text contains few, if any, words, phrases, and clauses to link the major sections of the text. The text does not connect the claims and reasons." }
        ]
      },
      {
        "name": "Style and Conventions",
        "Criteria": [
          { "point": 5, "description": "The text presents an engaging, formal and objective tone. The text intentionally uses standard English conventions of usage and mechanics along with discipline-specific requirements (i.e., MLA, APA, etc.)." },
          { "point": 4, "description": "The text presents an appropriate and formal, objective tone. The text demonstrates standard English conventions of usage and mechanics along with discipline-specific requirements (i.e., MLA, APA, etc.)." },
          { "point": 3, "description": "The text presents a formal, objective tone. The text demonstrates standard English conventions of usage and mechanics along with discipline-specific requirements (i.e., MLA, APA, etc.)." },
          { "point": 2, "description": "The text illustrates a limited awareness of formal tone. The text demonstrates accuracy in standard English conventions of usage and mechanics." },
          { "point": 1, "description": "The text illustrates a limited awareness or inconsistent tone. The text illustrates inaccuracies in standard English conventions of usage and mechanics." }
        ]
      }
    ]
  }
  

  // Additional templates can be added here
];

export default PremadeRubrics;
