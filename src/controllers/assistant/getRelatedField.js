import { matchedField } from "../../utils/openai.js";

export async function getRelatedMedicalField(payload) {
  try {
    const response = await matchedField(payload);
    return response;
  } catch (error) {
    console.log(error);
  }
}
