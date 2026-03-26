// Just for testing purposes
import { useEffect, useState } from "react";

export default function BackendTest() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("https://localhost:5001/api/test")
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Backend Connection Test</h1>
      <p>{message ? message : "Backend Connected!"}</p>
    </div>
  );
}