const aiService = require("../services/ai.service");

module.exports.getReview = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || !code.trim()) {
      return res.send("⚠️ Please provide code to review.");
    }

    const review = await aiService(code);
    res.send(review); //  SEND MARKDOWN
  } catch (error) {
    console.error("AI Error:", error.message);
    res.send("❌ AI review failed. Please try again.");
  }
};
