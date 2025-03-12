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
  },
  {
    Template: "Kindergarten Standards Rubric",
    values: [
      {
        name: "Language Conventions",
        Criteria: [
          { point: 5, description: "Demonstrates command of English grammar and usage when writing or speaking." },
          { point: 4, description: "Recognizes and uses proper capitalization, punctuation, and spelling." },
          { point: 3, description: "Forms regular plural nouns and uses question words correctly." },
          { point: 2, description: "Shows some understanding of English grammar and punctuation." },
          { point: 1, description: "Struggles with basic grammar, punctuation, and spelling rules." }
        ]
      },
      {
        name: "Reading Foundational Skills",
        Criteria: [
          { point: 5, description: "Demonstrates understanding of print concepts and phonological awareness." },
          { point: 4, description: "Recognizes spoken words represented in written language." },
          { point: 3, description: "Understands that words are separated by spaces in print." },
          { point: 2, description: "Can recognize some letters and sounds but needs support." },
          { point: 1, description: "Has difficulty recognizing letters, sounds, and words." }
        ]
      },
      {
        name: "Reading Comprehension",
        Criteria: [
          { point: 5, description: "Actively engages in group reading activities with understanding." },
          { point: 4, description: "Identifies key details and main ideas in texts with support." },
          { point: 3, description: "Understands simple texts with prompting." },
          { point: 2, description: "Can answer some questions about texts but needs support." },
          { point: 1, description: "Struggles with comprehension and engagement in reading activities." }
        ]
      },
      {
        name: "Writing Skills",
        Criteria: [
          { point: 5, description: "Uses drawing, dictating, and writing to compose stories and opinion pieces." },
          { point: 4, description: "Writes simple sentences and sequences events in a story." },
          { point: 3, description: "Can express ideas through pictures and simple words." },
          { point: 2, description: "Attempts to write but needs guidance and support." },
          { point: 1, description: "Struggles with writing and expressing ideas clearly." }
        ]
      },
      {
        name: "Speaking and Listening",
        Criteria: [
          { point: 5, description: "Participates in conversations and follows discussion rules." },
          { point: 4, description: "Can ask and answer questions about key details in a text." },
          { point: 3, description: "Uses drawings or other visual displays to enhance understanding." },
          { point: 2, description: "Can follow simple instructions but struggles with complex discussions." },
          { point: 1, description: "Has difficulty expressing thoughts and listening attentively." }
        ]
      }
    ]
  },
  {
    Template: "First Grade Standards Rubric",
    values: [
      {
        name: "Language Conventions",
        Criteria: [
          { point: 5, description: "Prints all upper- and lowercase letters and uses proper nouns correctly." },
          { point: 4, description: "Uses singular and plural nouns with matching verbs in sentences." },
          { point: 3, description: "Can use pronouns, adjectives, and simple conjunctions." },
          { point: 2, description: "Recognizes grammar rules but struggles with application." },
          { point: 1, description: "Needs significant support in grammar, punctuation, and spelling." }
        ]
      },
      {
        name: "Reading Comprehension",
        Criteria: [
          { point: 5, description: "Asks and answers questions about key details in a text." },
          { point: 4, description: "Retells stories and identifies the central message." },
          { point: 3, description: "Describes characters, settings, and major events in a story." },
          { point: 2, description: "Shows some understanding of texts but needs prompting." },
          { point: 1, description: "Struggles with understanding and engaging with texts." }
        ]
      },
      {
        name: "Writing Skills",
        Criteria: [
          { point: 5, description: "Writes opinion, informative, and narrative texts with clear structure." },
          { point: 4, description: "Includes supporting details and a logical sequence in writing." },
          { point: 3, description: "Uses simple sentences and basic organization in writing." },
          { point: 2, description: "Writes simple ideas but lacks structure and clarity." },
          { point: 1, description: "Struggles to organize thoughts into written form." }
        ]
      },
      {
        name: "Speaking and Listening",
        Criteria: [
          { point: 5, description: "Engages in discussions, listens actively, and follows conversation rules." },
          { point: 4, description: "Can describe events and express ideas clearly." },
          { point: 3, description: "Follows instructions and contributes to discussions with support." },
          { point: 2, description: "Participates but struggles with expression and comprehension." },
          { point: 1, description: "Has difficulty listening and responding in discussions." }
        ]
      }
    ]
  },
  {
    Template: "Second Grade Standards Rubric",
    values: [
      {
        name: "Language Conventions",
        Criteria: [
          { point: 5, description: "Uses proper grammar, punctuation, and capitalization consistently." },
          { point: 4, description: "Demonstrates understanding of irregular plural nouns and reflexive pronouns." },
          { point: 3, description: "Uses adjectives and adverbs to modify nouns and verbs correctly." },
          { point: 2, description: "Recognizes basic grammar rules but struggles with application." },
          { point: 1, description: "Has difficulty using grammar, punctuation, and spelling correctly." }
        ]
      },
      {
        name: "Reading Comprehension",
        Criteria: [
          { point: 5, description: "Identifies main ideas and key details in a text independently." },
          { point: 4, description: "Uses illustrations and context clues to make predictions." },
          { point: 3, description: "Compares and contrasts key details across texts." },
          { point: 2, description: "Shows some understanding but needs prompting and support." },
          { point: 1, description: "Struggles to comprehend and analyze texts." }
        ]
      },
      {
        name: "Writing Skills",
        Criteria: [
          { point: 5, description: "Writes detailed opinion, informative, and narrative texts with a clear structure." },
          { point: 4, description: "Provides supporting details and organizes writing logically." },
          { point: 3, description: "Uses correct sentence structure but needs improvement in organization." },
          { point: 2, description: "Writes simple sentences with minimal structure." },
          { point: 1, description: "Has difficulty expressing thoughts in written form." }
        ]
      }
    ]
  },
  {
    Template: "Third Grade Standards Rubric",
    values: [
      {
        name: "Language Conventions",
        Criteria: [
          { point: 5, description: "Demonstrates command of grammar, including possessive nouns and verb tense consistency." },
          { point: 4, description: "Uses comparative and superlative adjectives correctly." },
          { point: 3, description: "Recognizes subject-verb agreement and correct punctuation usage." },
          { point: 2, description: "Shows understanding but struggles with consistent application." },
          { point: 1, description: "Has difficulty applying grammar, punctuation, and spelling rules." }
        ]
      },
      {
        name: "Reading Comprehension",
        Criteria: [
          { point: 5, description: "Asks and answers questions to demonstrate comprehension of texts." },
          { point: 4, description: "Identifies character traits and story elements independently." },
          { point: 3, description: "Summarizes main ideas and supporting details." },
          { point: 2, description: "Needs support to identify key details and themes." },
          { point: 1, description: "Struggles with text comprehension and making inferences." }
        ]
      },
      {
        name: "Writing Skills",
        Criteria: [
          { point: 5, description: "Writes structured opinion, informative, and narrative essays with clear development." },
          { point: 4, description: "Includes supporting evidence and logical organization." },
          { point: 3, description: "Uses paragraphs but needs improvement in cohesion and transitions." },
          { point: 2, description: "Writes simple sentences but lacks organization and detail." },
          { point: 1, description: "Has difficulty organizing and expressing ideas in writing." }
        ]
      }
    ]
  },
  {
    Template: "Fourth Grade Standards Rubric",
    values: [
      {
        name: "Language Conventions",
        Criteria: [
          { point: 5, description: "Uses correct grammar, punctuation, and sentence structure consistently." },
          { point: 4, description: "Demonstrates understanding of verb tenses, prepositions, and conjunctions." },
          { point: 3, description: "Recognizes and uses correct pronoun-antecedent agreement." },
          { point: 2, description: "Has some understanding but makes frequent errors." },
          { point: 1, description: "Struggles to use basic grammar and sentence structures correctly." }
        ]
      },
      {
        name: "Reading Comprehension",
        Criteria: [
          { point: 5, description: "Identifies main ideas, themes, and key details in a text independently." },
          { point: 4, description: "Compares and contrasts information across different sources." },
          { point: 3, description: "Uses context clues and illustrations to understand difficult words." },
          { point: 2, description: "Shows some understanding but requires prompting and support." },
          { point: 1, description: "Struggles to comprehend and analyze texts." }
        ]
      },
      {
        name: "Writing Skills",
        Criteria: [
          { point: 5, description: "Writes well-organized opinion, informative, and narrative essays with clear structure." },
          { point: 4, description: "Provides supporting details and logical sequence in writing." },
          { point: 3, description: "Uses paragraphs and transitions but needs improvement in organization." },
          { point: 2, description: "Writes simple sentences with minimal structure and detail." },
          { point: 1, description: "Struggles to express thoughts in a written format." }
        ]
      }
    ]
  },
  {
    Template: "Fifth Grade Standards Rubric",
    values: [
      {
        name: "Language Conventions",
        Criteria: [
          { point: 5, description: "Uses correct grammar, punctuation, and sentence structure consistently with minimal errors." },
          { point: 4, description: "Demonstrates understanding of verb tense consistency and proper sentence structure." },
          { point: 3, description: "Uses correct grammar but makes occasional errors in structure or punctuation." },
          { point: 2, description: "Attempts correct grammar but struggles with sentence structure and punctuation." },
          { point: 1, description: "Struggles to use proper grammar, punctuation, and sentence structure." }
        ]
      },
      {
        name: "Reading Comprehension",
        Criteria: [
          { point: 5, description: "Analyzes themes, key details, and main ideas with textual evidence." },
          { point: 4, description: "Compares and contrasts information across multiple sources with support." },
          { point: 3, description: "Uses context clues and prior knowledge to understand meaning." },
          { point: 2, description: "Identifies key details but struggles with deeper comprehension." },
          { point: 1, description: "Has difficulty comprehending and analyzing texts." }
        ]
      },
      {
        name: "Writing Skills",
        Criteria: [
          { point: 5, description: "Writes detailed, well-structured opinion, informative, and narrative essays." },
          { point: 4, description: "Provides supporting details and organizes writing effectively." },
          { point: 3, description: "Writes clear paragraphs but needs improvement in cohesion and transitions." },
          { point: 2, description: "Writes simple ideas with minimal structure and supporting details." },
          { point: 1, description: "Struggles to express ideas in writing with clarity and organization." }
        ]
      }
    ]
  },
  {
    Template: "Middle and High School Standards Rubric",
    values: [
      {
        name: "Language Conventions",
        Criteria: [
          { point: 5, description: "Consistently applies advanced grammar, punctuation, and sentence structure with sophistication." },
          { point: 4, description: "Demonstrates strong command of grammar and sentence structure with occasional minor errors." },
          { point: 3, description: "Uses correct grammar but needs improvement in sentence complexity and punctuation." },
          { point: 2, description: "Struggles with advanced grammar and sentence variety but demonstrates basic understanding." },
          { point: 1, description: "Frequent grammar, punctuation, and structural issues impede clarity." }
        ]
      },
      {
        name: "Reading Comprehension",
        Criteria: [
          { point: 5, description: "Analyzes themes, author’s purpose, and textual structure with strong textual evidence." },
          { point: 4, description: "Demonstrates ability to compare and contrast arguments across sources with some textual support." },
          { point: 3, description: "Understands key ideas but struggles with deeper inference and analysis." },
          { point: 2, description: "Identifies main ideas but struggles with making connections across texts." },
          { point: 1, description: "Has difficulty understanding and analyzing complex texts." }
        ]
      },
      {
        name: "Writing Skills",
        Criteria: [
          { point: 5, description: "Produces clear, well-structured, and sophisticated writing with strong arguments and analysis." },
          { point: 4, description: "Develops strong thesis statements and supports ideas with well-organized evidence." },
          { point: 3, description: "Writes structured essays but needs improvement in argument development and cohesion." },
          { point: 2, description: "Writes with basic organization but lacks strong supporting evidence and clear structure." },
          { point: 1, description: "Has difficulty organizing and expressing thoughts clearly in writing." }
        ]
      }
    ]
  },

  
  

  // Additional templates can be added here
];

export default PremadeRubrics;
