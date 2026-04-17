// Frontend/src/pages/users/BackendTest.tsx

// Just for testing purposes
import { useEffect, useState } from "react";

export default function BackendTest() {
  const [message, setMessage] = useState("");
  const BACKEND = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";
  useEffect(() => {
    fetch(`${BACKEND}/api/test`)
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