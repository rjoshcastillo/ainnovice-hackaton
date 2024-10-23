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
