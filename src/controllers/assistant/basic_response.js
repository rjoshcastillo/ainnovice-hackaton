import { getBasicResponses } from "../../utils/openai.js";

export async function getBasicResponse(payload) {
  try {
    const response = await getBasicResponses(payload.message);
    console.log(response);
    return response.content;
  } catch (error) {
    console.log(error);
  }
}
