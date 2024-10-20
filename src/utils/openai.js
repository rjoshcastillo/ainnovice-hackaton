import OpenAI from "openai";
import medicalFields from "../data/medical_fields.json" assert { type: "json" };
const openai = new OpenAI({
  apiKey:
    "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",
});

export async function getBasicResponses(message) {
  let instructions = `
    say hello to the user.
    user message : ${message}.
    create a message base on the language they use.
  `;
  const response = await openAIResponse(instructions);
  return response;
}

export async function matchedField(data) {
  let instructions = `
    list of medical fields : ${medicalFields.fields} as medical_fields.
    ${data.medical_concern}  as medical_concern.
    ${medicalFields}  as medical_fields.
    Base on medical_concern get the best relevant medical needed in medical_fields, ensure to return only and most appropriate, return it as medical_field_needed only.
    return as a json format.
  `;

  const response = await openAIResponse(instructions);
  return JSON.parse(response.content);
}

//// reusable function for OPEN AI REPONSE
async function openAIResponse(instructions) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: instructions,
      },
    ],
    max_tokens: 100,
  });
  return response.choices[0].message;
}
