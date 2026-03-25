const express = require("express");
const cors = require("cors");
const aiRoutes = require("./routes/ai.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "AI Code Reviewer backend is running." });
});

app.use("/api/ai", aiRoutes);

module.exports = app;
