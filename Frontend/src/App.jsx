import { startTransition, useEffect, useState } from "react";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import axios from "axios";
import ReviewResult from "./components/ReviewResult";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
const DEFAULT_STATUS_MESSAGE = "Paste code and run review.";
const LOADING_MESSAGES = [
  "Scanning structure...",
  "Reviewing logic and risk...",
  "Preparing final report...",
];
const EDITOR_GRAMMAR =
  prism.languages.javascript ?? prism.languages.js ?? prism.languages.clike;

function getLineCount(text) {
  return text.trim() ? text.split(/\r?\n/).length : 0;
}

function getSeverityCount(markdown, severity) {
  const regex = new RegExp(`\\[${severity}\\]`, "gi");
  return (markdown.match(regex) ?? []).length;
}

function getIssueCount(markdown) {
  return ["Critical", "High", "Medium", "Low"].reduce(
    (total, severity) => total + getSeverityCount(markdown, severity),
    0
  );
}

function extractFixedCode(markdown) {
  if (!markdown) {
    return "";
  }

  const fixedSectionMatch = markdown.match(
    /##\s*Fixed Code[\s\S]*?```(?:[\w#+-]+)?\n([\s\S]*?)```/i
  );

  if (fixedSectionMatch?.[1]) {
    return fixedSectionMatch[1].trim();
  }

  const fallbackMatch = markdown.match(/```(?:[\w#+-]+)?\n([\s\S]*?)```/);
  return fallbackMatch?.[1]?.trim() ?? "";
}

function formatReviewTime(date) {
  if (!date) {
    return "No review";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function App() {
  const [code, setCode] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(DEFAULT_STATUS_MESSAGE);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedAction, setCopiedAction] = useState("");
  const [lastReviewedAt, setLastReviewedAt] = useState(null);

  const issueCount = getIssueCount(review);
  const fixedCode = extractFixedCode(review);
  const viewState = loading
    ? "loading"
    : errorMessage
      ? "error"
      : review
        ? "ready"
        : "idle";

  useEffect(() => {
    if (!loading) {
      return undefined;
    }

    let messageIndex = 0;
    setStatusMessage(LOADING_MESSAGES[messageIndex]);

    const intervalId = window.setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setStatusMessage(LOADING_MESSAGES[messageIndex]);
    }, 1800);

    return () => window.clearInterval(intervalId);
  }, [loading]);

  function handleCodeChange(nextCode) {
    setCode(nextCode);

    if (errorMessage) {
      setErrorMessage("");
    }
  }

  function clearWorkspace() {
    setCode("");
    setReview("");
    setErrorMessage("");
    setCopiedAction("");
    setStatusMessage(DEFAULT_STATUS_MESSAGE);
  }

  async function copyToClipboard(value, action, successMessage) {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopiedAction(action);
      setStatusMessage(successMessage);

      window.setTimeout(() => {
        setCopiedAction((currentAction) =>
          currentAction === action ? "" : currentAction
        );
      }, 1500);
    } catch {
      setStatusMessage("Clipboard unavailable.");
    }
  }

  async function reviewCode() {
    if (!code.trim()) {
      setErrorMessage("Paste code before starting review.");
      setStatusMessage("Paste code before starting review.");
      return;
    }

    try {
      setLoading(true);
      setReview("");
      setErrorMessage("");
      setCopiedAction("");
      setStatusMessage(LOADING_MESSAGES[0]);

      const response = await axios.post(
        `${API_BASE_URL}/api/ai/get-review`,
        { code },
        { headers: { "Content-Type": "application/json" } }
      );

      const reviewText =
        typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data, null, 2);

      startTransition(() => {
        setReview(reviewText);
        setLastReviewedAt(new Date());
      });

      setStatusMessage("Review complete.");
    } catch (error) {
      const nextError =
        typeof error.response?.data === "string"
          ? error.response.data
          : "Review failed. Try again.";

      setErrorMessage(nextError);
      setStatusMessage(nextError);
    } finally {
      setLoading(false);
    }
  }

  function handleEditorKeyDown(event) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();

      if (!loading) {
        reviewCode();
      }
    }
  }

  return (
    <main className="app-shell">
      <div className="backdrop-glow backdrop-glow--left" />
      <div className="backdrop-glow backdrop-glow--right" />

      <header className="topbar">
        <div className="topbar-copy">
          <span className="app-brand">AI Code Reviewer</span>
          <h1>Structured review for production code.</h1>
        </div>

        <div className="topbar-meta">
          <span className={`meta-pill meta-pill--${viewState}`}>
            {loading
              ? "Reviewing"
              : errorMessage
                ? "Error"
                : review
                  ? "Ready"
                  : "Idle"}
          </span>
          <span className="meta-text">{getLineCount(code)} lines</span>
          <span className="meta-text">
            {review ? `${issueCount} findings` : formatReviewTime(lastReviewedAt)}
          </span>
        </div>
      </header>

      <section className="workspace-grid">
        <article className="panel panel--editor">
          <div className="panel-head">
            <div>
              <span className="section-label">Input</span>
              <h2>Source</h2>
            </div>

            <button className="ghost-btn" onClick={clearWorkspace}>
              Clear
            </button>
          </div>

          <div className={`editor-frame ${loading ? "editor-frame--loading" : ""}`}>
            <div className="editor-frame__top">
              <div className="window-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>

              <div className="editor-meta">
                <span>code-input</span>
                <span>Ctrl/Cmd + Enter</span>
              </div>
            </div>

            <Editor
              value={code}
              onValueChange={handleCodeChange}
              highlight={(input) =>
                prism.highlight(input, EDITOR_GRAMMAR, "javascript")
              }
              padding={20}
              placeholder="Paste the code you want reviewed..."
              className="editor-input"
              textareaClassName="editor-textarea"
              preClassName="editor-pre"
              onKeyDown={handleEditorKeyDown}
            />
          </div>

          <div className="panel-foot">
            <p className="status-line">{statusMessage}</p>

            <button
              className={`primary-btn ${loading ? "primary-btn--loading" : ""}`}
              onClick={reviewCode}
              disabled={loading || !code.trim()}
            >
              {loading && <span className="button-spinner" aria-hidden="true" />}
              <span>{loading ? "Reviewing" : "Review Code"}</span>
            </button>
          </div>
        </article>

        <article className={`panel panel--review ${loading ? "panel--reviewing" : ""}`}>
          <div className="panel-head">
            <div>
              <span className="section-label">Output</span>
              <h2>Review</h2>
            </div>

            <button
              className="ghost-btn"
              onClick={() =>
                copyToClipboard(
                  fixedCode || review,
                  fixedCode ? "fixed" : "review",
                  fixedCode ? "Fixed code copied." : "Review copied."
                )
              }
              disabled={!review || loading}
            >
              {copiedAction === "fixed" || copiedAction === "review"
                ? "Copied"
                : fixedCode
                  ? "Copy Fixed Code"
                  : "Copy Review"}
            </button>
          </div>

          <ReviewResult
            review={review}
            loading={loading}
            errorMessage={errorMessage}
            statusMessage={statusMessage}
          />
        </article>
      </section>

      <footer className="app-footer">
        <p>&copy; Nikhil. All rights reserved.</p>
      </footer>
    </main>
  );
}

export default App;
