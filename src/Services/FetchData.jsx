import axios from "axios";
import { Api_Key } from "../Helper/Apikey";

const GetAnswer = async (query) => {
  try {
    const response = await axios({
      url: `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${Api_Key}`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json', 
      },
      data: {
        contents: [
          { parts: [{ text: query }] },
        ],
      },
    });

    const candidates = response.data.candidates || [];
    const text = candidates[0]?.content?.parts[0]?.text ;

  
    return text; 

  } catch (error) {
  
    throw error;
  }
};

export default GetAnswer;
