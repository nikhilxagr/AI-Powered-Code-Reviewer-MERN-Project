import Markdown from "react-markdown";

function ReviewResult({ review, loading, errorMessage, statusMessage }) {
  if (loading) {
    return (
      <section className="review-body">
        <div className="review-state review-state--loading">
          <span className="review-state__badge">Reviewing</span>
          <h3 className="review-state__title">Processing code.</h3>
          <p className="review-state__text">{statusMessage}</p>

          <div className="review-terminal" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="review-body">
        <div className="review-state review-state--error">
          <span className="review-state__badge">Error</span>
          <h3 className="review-state__title">Review unavailable.</h3>
          <p className="review-state__text">{errorMessage}</p>
        </div>
      </section>
    );
  }

  if (!review.trim()) {
    return (
      <section className="review-body">
        <div className="review-state">
          <span className="review-state__badge">Ready</span>
          <h3 className="review-state__title">No review yet.</h3>
          <p className="review-state__text">
            Run review to generate findings, fixed code, and next steps.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="review-body">
      <div className="review-markdown">
        <Markdown
          components={{
            h2: ({ children }) => <h2 className="review-heading">{children}</h2>,
            h3: ({ children }) => (
              <h3 className="review-subheading">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="review-paragraph">{children}</p>
            ),
            ul: ({ children }) => <ul className="review-list">{children}</ul>,
            ol: ({ children }) => (
              <ol className="review-ordered-list">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="review-list-item">{children}</li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="review-quote">{children}</blockquote>
            ),
            pre: ({ children }) => <pre className="review-pre">{children}</pre>,
            code({ inline, className, children, ...props }) {
              if (inline) {
                return (
                  <code className="review-inline-code" {...props}>
                    {children}
                  </code>
                );
              }

              return (
                <code
                  className={["review-block-code", className]
                    .filter(Boolean)
                    .join(" ")}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </code>
              );
            },
            a: ({ href, children }) => (
              <a
                className="review-link"
                href={href}
                target="_blank"
                rel="noreferrer"
              >
                {children}
              </a>
            ),
          }}
        >
          {review}
        </Markdown>
      </div>
    </section>
  );
}

export default ReviewResult;
