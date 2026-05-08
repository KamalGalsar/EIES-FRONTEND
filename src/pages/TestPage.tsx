import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Credentials {
  email?: string;
  isVerified?: boolean;
  clientID: string;
  tenantID: string;
  clientSecret: string;
}

const TestPage: React.FC = () => {
  const [creds, setCreds] = useState<Credentials | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreds = async () => {
      try {
        const response = await axios.get('/api/profile/credentials', {
          withCredentials: true
        });
        setCreds(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCreds();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">Dynamic Credential Test Page</h1>
      
      <div className="bg-slate-800 rounded-xl p-6 shadow-2xl border border-slate-700">
        <h2 className="text-xl font-semibold mb-4 text-blue-400">Current User Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400">Authenticated Email</label>
            <div className="mt-1 text-lg text-white font-mono bg-slate-900 p-2 rounded">{creds?.email}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400">Verification Status</label>
            <div className={`mt-1 text-lg font-bold ${creds?.isVerified ? 'text-green-400' : 'text-yellow-400'}`}>
              {creds?.isVerified ? 'VERIFIED ✅' : 'NOT VERIFIED ❌'}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <h3 className="text-lg font-medium mb-3 text-slate-300">Tenant Settings (Decrypted)</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500">Tenant ID</label>
                <div className="text-white font-mono text-sm bg-slate-900 p-2 rounded select-all">
                  {creds?.tenantID || 'Not set'}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500">Client ID</label>
                <div className="text-white font-mono text-sm bg-slate-900 p-2 rounded select-all">
                  {creds?.clientID || 'Not set'}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500">Client Secret</label>
                <div className="text-white font-mono text-sm bg-slate-900 p-2 rounded blur-sm hover:blur-none transition-all cursor-pointer select-all">
                  {creds?.clientSecret || 'Not set'}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 italic">* Hover to reveal decrypted secret</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>Security Note:</strong> This page is for testing the dynamic migration. 
          In production, client secrets are never exposed to the UI. 
          The backend successfully decrypted this from the database using AES-256.
        </p>
      </div>
    </div>
  );
};

export default TestPage;
