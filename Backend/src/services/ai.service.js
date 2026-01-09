const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_KEY,
});

async function aiService(code) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: code }],
      },
    ],
    systemInstructions: `
You are a Senior Software Engineer performing a PROFESSIONAL CODE REVIEW.

Rules:
- Respond ONLY in Markdown
- Use clear section headings
- Use severity emojis:
  - 🚨 Critical
  - ❌ High
  - ⚠️ Medium
  - ℹ️ Low
- ALWAYS include a "Fixed Code" section
- Be clear, concise, and professional
- No teaching tone

Format exactly like this:

## 📌 Summary

## 🚨 Issues
- ❌ Issue description

## 🛠️ Fixed Code
\`\`\`js
// corrected code
\`\`\`

## 📚 Recommendations
- Point 1
- Point 2
`,
  });

  return response.text; //  RETURN TEXT ONLY
}

module.exports = aiService;
