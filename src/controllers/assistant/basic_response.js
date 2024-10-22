import { getBasicResponses } from "../../utils/openai.js";
import { webSocketUtils } from "../../utils/websocket.js";
export async function getBasicResponse(payload) {
  try {
    // const response = await getBasicResponses(payload.message);
    // console.log(response);
    webSocketUtils("hello");
    return "";
  } catch (error) {
    console.log(error);
  }
}
