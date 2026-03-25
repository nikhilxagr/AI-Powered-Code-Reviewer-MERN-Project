const aiService = require("../services/ai.service");

module.exports.getReview = async (req, res) => {
  try {
    const { code } = req.body;

    if (typeof code !== "string" || !code.trim()) {
      return res.status(400).send("Please provide code to review.");
    }

    const review = await aiService(code);
    return res.send(review);
  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).send("AI review failed. Please try again.");
  }
};
