import { useEffect, useState } from "react";
import { Card } from "../../Components/Card";
import { Loading } from "../../Components/Loading";
import { backendRequest } from "../../Helpers/backendRequest";
import { notifyResponse } from "../../Helpers/notyf";

interface Setting {
  schedule_call_link: string;
}

export default function AdminGeneralSettings() {
  const [loading, setLoading] = useState(false);
  const [scheduleLink, setScheduleLink] = useState("");

  const fetchDefaultSettings = async () => {
    try {
      setLoading(true);
      const res = await backendRequest<Setting>("GET", "/get-general-settings");

      if (res) {
        setScheduleLink(res.schedule_link || ""); 
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      notifyResponse({ success: false, message: "Failed to load settings." });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const updatedSettings: Setting = {
        schedule_call_link: scheduleLink,
      };

      const res = await backendRequest("PUT", "/general_settings", updatedSettings);
      notifyResponse(res);

      if (res.success) {
        fetchDefaultSettings();
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      notifyResponse({ success: false, message: "Failed to update settings." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaultSettings();
  }, []);

  if (loading) return <Loading />;

  return (
    <Card>
      <div>
        <h1 className="text-2xl md:text-4xl font-bold mb-6">General Settings</h1>
        <p className="text-gray-600 text-sm mb-8">
          Configure the general settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Schedule Link
          </label>
          <input
            type="text"
            value={scheduleLink}
            onChange={(e) => setScheduleLink(e.target.value)}
            placeholder="Enter schedule link"
            className="w-full px-4 py-2 border border-gray-300 rounded-md 
              focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="mt-4 bg-primary text-white px-6 py-3 rounded-lg 
            hover:bg-primary-dark shadow-lg transition duration-300 ease-in-out"
        >
          Save Settings
        </button>
      </div>
    </Card>
  );
}
