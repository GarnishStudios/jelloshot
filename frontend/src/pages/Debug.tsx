import React from "react";

export const Debug: React.FC = () => {
  return (
    <div style={{ padding: "20px", background: "white", color: "black" }}>
      <h1>Debug Page - React is Working!</h1>
      <p>If you see this, React is loading correctly.</p>
      <p>Current URL: {window.location.href}</p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  );
};
