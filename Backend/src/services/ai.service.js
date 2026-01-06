const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_KEY,
});



async function aiService(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    systemInstructions: `You are an expert code reviewer. Provide detailed code reviews highlighting potential issues, improvements, and best practices.
    
    you always try to find the best solution for the developer and also try to make the code more efficient and clean.`
  });

  return response.text;
}

module.exports = aiService;
