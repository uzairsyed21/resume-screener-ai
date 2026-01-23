import React from "react";
import Home from "./components/Home";

function App() {
  return <Home />;
}

export default App;

    <div style={{ textAlign: "center" }}>
      <img
        width={800}
        height={315}
        alt="GHBanner"
        src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6"
      />
      <h1>Run and deploy your AI Studio app</h1>
      <p>This contains everything you need to run your app locally.</p>
      <p>
        View your app in AI Studio:{" "}
        <a href="https://ai.studio/apps/drive/1VIPQMgruGGpO6KfeRHtBNiK0SMK7nsMt">
          Link
        </a>
      </p>
      <h2>Run Locally</h2>
      <p><strong>Prerequisites:</strong> Node.js</p>
    </div>
  );
}
