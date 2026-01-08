const aiService = require("../services/ai.service");

module.exports.getReview = async (req, res) => {
  try {
    const code = req.body.code;

    if (!code) {
      return res.status(400).json({ error: "code is required" });
    }

    const response = await aiService(code);
    res.json({ review: response });
  } catch (error) {
    console.error("Controller Error:", error.message);
    res.status(500).json({ error: "AI review failed" });
  }
};
