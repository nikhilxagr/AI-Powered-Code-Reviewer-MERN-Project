function ReviewResult({ response }) {
  
  if (!response) {
    return <p>📝 Submit code to see the review.</p>;
  }


  if (!response.issues || !Array.isArray(response.issues)) {
    return <p>⚠️ Invalid review format received from server.</p>;
  }

  return (
    <div className="review-container">
      <h2>📌 Summary</h2>
      <p>{response.summary}</p>

      <h2>⚠️ Issues</h2>
      {response.issues.length === 0 ? (
        <p>✅ No issues found.</p>
      ) : (
        response.issues.map((issue, index) => (
          <div key={index} className={`badge ${issue.severity.toLowerCase()}`}>
            <strong>{issue.severity}</strong> — {issue.title}
          </div>
        ))
      )}

      <h2>🛠️ Fixed Code</h2>
      <pre>
        <code>{response.refactoredCode?.code}</code>
      </pre>

      <h2>📚 Recommendations</h2>
      <ul>
        {response.finalRecommendations?.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    </div>
  );
}

export default ReviewResult;
