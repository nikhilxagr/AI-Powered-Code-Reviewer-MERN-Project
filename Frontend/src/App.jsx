import { useEffect, useState } from "react";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import "./App.css";
import axios from "axios";
import Markdown from "react-markdown";

function App() {
  const [code, setCode] = useState(`function sum() {
  return 3 + 5;
}`);

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
        { code }
      );

      setReview(response.data.review);
    } catch (error) {
      console.error(error);
      setReview("❌ Failed to get AI review. Check backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="left">
        <div className="code">
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={(code) =>
              prism.highlight(code, prism.languages.js, "js")
            }
            padding={10}
            style={{
              fontFamily: '"Fira Code", monospace',
              fontSize: 16,
              height: "100%",
              width: "100%",
            }}
          />
        </div>

        <div className="review" onClick={reviewCode}>
          {loading ? "Reviewing..." : "Review"}
        </div>
      </div>

      <div className="right">
        <Markdown>{review}</Markdown>
      </div>
    </main>
  );
}

export default App;
