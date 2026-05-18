// Frontend/src/pages/admin/SystemSettings.tsx
import { useState, useEffect } from "react";
import { settingsApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Loader2 } from "lucide-react";

export default function SystemSettings() {
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsApi.get();
        if (res.data) {
          setSessionTimeoutMinutes(res.data.sessionTimeoutMinutes);
        }
      } catch (err) {
        console.error(err);
        showToast("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [showToast]);

  const handleUpdate = async (newTimeout?: number) => {
    try {
      setSaving(true);
      const payload = {
        sessionTimeoutMinutes: newTimeout ?? sessionTimeoutMinutes
      };
      const res = await settingsApi.update(payload);
      if (res.data) {
        setSessionTimeoutMinutes(res.data.sessionTimeoutMinutes);
        showToast("Settings updated successfully", "success");
        // Also update local storage so App can use it
        localStorage.setItem("sessionTimeout", String(res.data.sessionTimeoutMinutes));
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
        {saving && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-gray-900 dark:text-white">Session Timeout</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Auto logout after inactivity</p>
                </div>
                <select 
                  value={sessionTimeoutMinutes}
                  onChange={(e) => handleUpdate(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={saving}
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}