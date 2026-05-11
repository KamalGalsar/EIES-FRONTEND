// Frontend/src/components/graph/SimpleGraphDebug.tsx
// This page is just for debugging errors
import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5268";

export default function SimpleGraphDebug() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/entra/graph`)
      .then(res => res.json())
      .then(data => {
        console.log("Graph data:", data);
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4 text-white">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg overflow-auto">
      <h2 className="text-xl font-bold mb-2">Graph Data Debug</h2>
      <div className="mb-4">
        <strong>Nodes ({data?.nodes?.length || 0})</strong>
        <pre className="text-xs bg-gray-800 p-2 mt-1 rounded overflow-auto max-h-40">
          {JSON.stringify(data?.nodes, null, 2)}
        </pre>
      </div>
      <div>
        <strong>Edges ({data?.edges?.length || 0})</strong>
        <pre className="text-xs bg-gray-800 p-2 mt-1 rounded overflow-auto max-h-40">
          {JSON.stringify(data?.edges, null, 2)}
        </pre>
      </div>
    </div>
  );
}