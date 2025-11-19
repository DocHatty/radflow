// constants.ts
import { Type } from '@google/genai';

/**
 * Defines the JSON schema for the AI's response when categorizing clinical input.
 * This structure corresponds to the `ParsedInput` type.
 */
export const CATEGORIZATION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    studyType: {
      type: Type.OBJECT,
      properties: { value: { type: Type.STRING } },
      description: 'The type of study being requested, e.g., "MRI Brain w/wo contrast".',
    },
    examDate: {
      type: Type.OBJECT,
      properties: { value: { type: Type.STRING } },
      description: 'The date the imaging study was performed. Format as YYYY-MM-DD if possible.',
    },
    clinicalHistory: {
      type: Type.OBJECT,
      properties: { value: { type: Type.STRING } },
      description: 'A summary of the patient\'s relevant clinical history.',
    },
    reasonForStudy: {
      type: Type.OBJECT,
      properties: { value: { type: Type.STRING } },
      description: 'The specific reason or indication for the requested study.',
    },
    allergies: {
      type: Type.ARRAY,
      items: { type: Type.OBJECT, properties: { value: { type: Type.STRING } } },
      description: 'A list of patient allergies.',
    },
    medications: {
      type: Type.ARRAY,
      items: { type: Type.OBJECT, properties: { value: { type: Type.STRING } } },
      description: 'A list of current patient medications.',
    },
    surgeries: {
      type: Type.ARRAY,
      items: { type: Type.OBJECT, properties: { value: { type: Type.STRING } } },
      description: 'A list of relevant past surgeries.',
    },
    labs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.STRING },
        },
      },
      description: 'A list of relevant lab results.',
    },
    priors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING },
          date: { type: Type.STRING, description: 'The date of the prior report, if available. Format as YYYY-MM-DD.' },
        },
      },
      description: 'A list of prior findings or reports.',
    },
    unmatchedText: {
        type: Type.ARRAY,
        items: { type: Type.OBJECT, properties: { value: { type: Type.STRING } } },
        description: 'Any text from the input that could not be categorized into the other fields.'
    }
  },
};

/**
 * Defines the JSON schema for the AI's response when generating differential diagnoses.
 * This ensures the AI returns a structured list that the UI can parse and display.
 */
export const DIFFERENTIAL_DIAGNOSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    diagnoses: {
      type: Type.ARRAY,
      description: 'A list of potential differential diagnoses based on the findings.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: 'The name of the potential diagnosis.'
          },
          rationale: {
            type: Type.STRING,
            description: 'A brief rationale explaining why this is a consideration based on the findings.'
          },
          likelihood: {
            type: Type.STRING,
            enum: ['High', 'Medium', 'Low'],
            description: 'The estimated likelihood of this diagnosis.'
          }
        }
      }
    }
  },
  required: ['diagnoses'],
};

/**
 * Defines the JSON schema for the AI's response during the Final Review stage.
 * If no issues are found, the 'recommendations' array will be empty.
 */
export const FINAL_REVIEW_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        recommendations: {
            type: Type.ARRAY,
            description: 'A list of specific, actionable recommendations for improvement. If the report is perfect, this array will be empty.',
            items: {
                type: Type.STRING
            }
        }
    },
    required: ['recommendations'],
};

/**
 * Defines the JSON schema for the AI task that selects relevant guidelines.
 * The AI must return a list of the topics of the guidelines that are relevant
 * to the provided clinical context.
 */
export const GUIDELINE_SELECTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        relevantGuidelineTopics: {
            type: Type.ARRAY,
            description: 'An array of strings, where each string is the exact "topic" of a relevant guideline from the provided list.',
            items: {
                type: Type.STRING
            }
        }
    },
    required: ['relevantGuidelineTopics'],
};