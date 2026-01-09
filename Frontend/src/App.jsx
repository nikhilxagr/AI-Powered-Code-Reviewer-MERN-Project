import { useEffect, useState } from "react";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import axios from "axios";
import Markdown from "react-markdown";
import "./App.css";

function App() {
  const [code, setCode] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    prism.highlightAll();
  }, []);

  async function reviewCode() {
    try {
      setLoading(true);
      setReview("⏳ Reviewing your code...");

      const response = await axios.post(
        "http://localhost:3000/api/ai/get-review",
        { code },
        { headers: { "Content-Type": "application/json" } }
      );

      setReview(response.data);
    } catch (err) {
      setReview("❌ Failed to get review. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyFixedCode() {
    const match = review.match(/```[\s\S]*?```/);
    if (!match) return;

    const codeOnly = match[0].replace(/```/g, "");
    navigator.clipboard.writeText(codeOnly);
    alert("✅ Fixed code copied!");
  }

  return (
    <main className="app">
      <section className="editor-panel">
        <div className="editor-header">
          <h2>Code Editor</h2>
        </div>

        <Editor
          value={code}
          onValueChange={setCode}
          highlight={(code) => prism.highlight(code, prism.languages.js, "js")}
          padding={14}
          placeholder="Paste your code here..."
          className="editor"
        />

        <button className="review-btn" onClick={reviewCode}>
          {loading ? "Reviewing..." : "Review Code"}
        </button>
      </section>

      <section className="review-panel">
        <div className="review-header">
          <h2>AI Review</h2>
          <button onClick={copyFixedCode}>📋 Copy Fixed Code</button>
        </div>

        <div className="review-content">
          <Markdown>{review}</Markdown>
        </div>
      </section>
    </main>
  );
}

export default App;
